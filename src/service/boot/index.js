import {conf} from '@/conf';
import {models} from '@/database/index.js';
import {app} from './express.js';
import {seqHelper} from './sequelize.js';
import {GraphQLSchema} from 'graphql';
import {ApolloServer} from 'apollo-server-express';
import graphcraft from 'graphcraft';
import Mailer from '@/service/utils/mailer/';
import {verifyToken} from '@/service/helpers.js';
import sRealmMgr from '@/logic/realmsMgr';
import {mergeSchemas} from 'graphql-tools';
import gcOptions from '@/service/gcOptions';

/**
 * start sequelize, apolloserver (graphql), express
 */
export async function boot() {
  seqHelper();
  await sRealmMgr.load(models);

  const {generateSchema} = graphcraft(gcOptions);
  const graphqlmodels = await generateSchema(models);

  const schemas = [sRealmMgr.mergedSchema];

  const autogenSchema = new GraphQLSchema(graphqlmodels);
  schemas.push(autogenSchema);
  const mergedSchema = mergeSchemas({
    schemas,
  });

  const server = new ApolloServer({
    schema: mergedSchema,
    context: async ({req}) => {
      const decoded = verifyToken(req, conf.secret);
      if (decoded) {
        // First try to find in local Users table
        let user = await models.User.findOne({
          where: {
            id: decoded.id,
          },
        });

        // If not found in local table, look up from auth database
        // and create a minimal user object from the token
        if (!user) {
          // Try to get account info from realm auth database
          const realmModels = sRealmMgr.models;
          let account = null;

          // Find the account in any auth database
          for (const dbId of Object.keys(realmModels)) {
            if (realmModels[dbId].account) {
              try {
                account = await realmModels[dbId].account.findOne({
                  where: {id: decoded.id},
                  attributes: ['id', 'username', 'email'],
                });
                if (account) break;
              } catch (e) {
                // Continue to next database
              }
            }
          }

          if (account) {
            // Return user-like object from account data
            user = {
              id: account.id,
              username: account.username,
              email: account.email,
            };
          } else {
            // Fallback: just use the decoded token info
            user = {
              id: decoded.id,
            };
          }
        }

        return {
          user,
        };
      }

      return null;
    },
    engine: {
      rewriteError(err) {
        // Return `null` to avoid reporting `AuthenticationError`s
        if (err instanceof Error) {
          return err;
        }
        // All other errors will be reported.
        return err;
      },
    },
    formatError: (error) => {
      // error.message ? console.log("\x1b[31mERROR: " + error.message + "\x1b[0m") : console.log(error)
      // console.log(error);
      // delete error.extensions.exception;
      return error;
    },
  });
  server.applyMiddleware({app});

  app.listen({port: conf.port}, () =>
    console.log(
        `# Apollo Server ready at http://localhost:${conf.port}${server.graphqlPath}`,
    ),
  );

  Mailer.initialize(conf.mailer);
}
