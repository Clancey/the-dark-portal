import Sequelize from 'sequelize';
import Mailer from '@/service/utils/mailer';
import {applyMiddlewares, validateEmail} from '@/service/helpers';
import bcrypt from 'bcryptjs';
import sha1 from 'sha1';
import jsonwebtoken from 'jsonwebtoken';
import {conf} from '@/conf';
import {
  syncWithGame,
  isPasswordValid,
  isUsernameValid,
  isEmailValid,
  normalizeCredentials,
} from '../Utils';
import {generateSaltVerifier, verifyPassword} from '../srp6';
import {app} from '@/service/boot/express';
import ACL from '@/logic/ACL';
import {CustomErrors} from '@/logic/CustomErrors';

/**
 * @instance
 * @param dbId
 * @param dbVal
 * @param {Sequelize} sequelize
 * @param {Object.<string, Sequelize.Model>} models
 * @param {any} appModels heck fiex
 */
function dbAdapter(dbId, dbVal, sequelize, models, appModels) {
  const account = models[dbId]['account'];

  account.graphql = {
    attributes: {
      exclude: ['salt', 'verifier', 'session_key', 'totp_secret'],
    },
    excludeMutations: ['create', 'destroy', 'update'],
    types: {
      newAccountOutput: {
        token: 'String',
        id: 'Int',
      },
      newAccountInput: {
        username: 'String!',
        email: 'String!',
        password: 'String!',
        inviteCode: 'String!',
      },
      login: {
        wpToken: 'String',
        token: 'String',
        id: 'Int',
        gmlevel: 'Int',
        email: 'String',
        username: 'String',
      },
      loginInput: {
        username: 'String!',
        password: 'String!',
      },
      recovery: {
        message: 'String',
      },
      recoveryInput: {
        email: 'String!',
      },
      changePsw: {
        message: 'String',
      },
      changePswInput: {
        oldPass: 'String!',
        newPass: 'String!',
      },
      changeEmail: {
        message: 'String',
      },
      changeEmailInput: {
        newEmail: 'String!',
      },
      resendConf: {
        message: 'String',
      },
      resendConfInput: {
        email: 'String!',
      },
      getUsernameOutput: {
        username: 'String',
      },
      getUsernameInput: {
        id: 'Int!',
      },
    },
    before: {
      fetch: applyMiddlewares(
          ACL.isAllowed(ACL.roles.ROLE_USER, ACL.sameUser(null, 'id')),
      ),
    },
    queries: {
      getUsername: {
        output: 'getUsernameOutput',
        description: 'Get user name from id',
        input: 'getUsernameInput',
        resolver: async (obj, data, context /* , info*/) => {
          const user = context.user;
          if (!user) throw Error(CustomErrors.notSignedIn);

          return {
            username: user.username,
          };
        },
      },
    },
    mutations: {
      newAccount: {
        output: 'newAccountOutput',
        description: 'Create a new account',
        input: 'newAccountInput',
        resolver: async (obj, data, context, info) => {
          const signup = data.newAccountInput;

          // Verify invite code
          const expectedCode = process.env.INVITE_CODE || conf.registrationInviteCode;
          if (!expectedCode || signup.inviteCode !== expectedCode) {
            throw Error(CustomErrors.invalidInviteCode);
          }

          // normalize Username and Password
          signup.username = normalizeCredentials(signup.username);
          signup.password = normalizeCredentials(signup.password);

          // check lengths
          isPasswordValid(signup.password);
          isUsernameValid(signup.username);
          isEmailValid(signup.email);

          // check if it's an email and from listed domains.
          // Relaxed email validation - allow any domain
          if (!signup.email.includes('@')) {
            throw Error(CustomErrors.invalidEmail);
          }

          const existingUsername = await models[dbId]['account'].findOne({
            where: {
              username: signup.username,
            },
          });
          if (existingUsername) throw Error(CustomErrors.invalidUsername);

          const existingEmail = await models[dbId]['account'].findOne({
            where: {
              email: signup.email,
            },
          });
          if (existingEmail) throw Error(CustomErrors.invalidEmail);

          // Generate SRP6 salt and verifier
          const {salt, verifier} = generateSaltVerifier(signup.username, signup.password);

          const acc = await account.create({
            username: signup.username,
            salt: salt,
            verifier: verifier,
            email: signup.email,
            reg_mail: signup.email,
            joindate: new Date(),
            last_login: new Date(),
            locked: 0,
            last_ip: '127.0.0.1',
          });

          const activationToken = await sha1(acc.id + ':' + acc.email).replace(
              /[/.]/g,
              '',
          );

          syncWithGame(appModels, acc.id, '', activationToken);

          const _token = jsonwebtoken.sign(
              {
                id: acc.id,
              },
              conf.secret,
              {
                expiresIn: '30d',
              },
          );

          // Skip email confirmation for now
          // const email = new Mailer(conf.mailer);
          // email.sendConfirmation(activationToken, acc.email, acc.id);

          return {
            id: acc.id,
            token: _token,
          };
        },
      },
      authorize: {
        output: 'login',
        description: 'Authorize an account',
        input: 'loginInput',
        resolver: async (source, data, context) => {
          const login = data.loginInput;
          const _wpToken = jsonwebtoken.sign(
              {
                username: data.loginInput.username,
                password: data.loginInput.password,
              },
              conf.wp_secret,
              {
                expiresIn: '30d',
              },
          );
          // normalize Username and Password
          login.username = normalizeCredentials(login.username);
          login.password = normalizeCredentials(login.password);

          // First find the account by username
          const acc = await models[dbId]['account'].findOne({
            attributes: ['id', 'email', 'username', 'salt', 'verifier'],
            where: {
              username: login.username,
            },
          });

          if (!acc) {
            const isEmail = login.username.match(
                /^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i,
            );
            if (isEmail) {
              throw Error(CustomErrors.invalidLoginIsEmail);
            } else {
              throw Error(CustomErrors.invalidLoginBadUsername);
            }
          }

          // Verify password using SRP6
          const isValid = verifyPassword(
              login.username,
              login.password,
              acc.salt,
              acc.verifier,
          );

          if (!isValid) {
            throw Error(CustomErrors.invalidLoginBadPassword);
          }

          // Get gmlevel
          let gmlevel = 0;
          try {
            const accessEntry = await models[dbId]['account_access'].findOne({
              attributes: ['gmlevel'],
              where: {
                id: acc.id,
                [Sequelize.Op.or]: [
                  {RealmID: 1},
                  {RealmID: -1},
                ],
              },
            });
            if (accessEntry) {
              gmlevel = accessEntry.gmlevel;
            }
          } catch (e) {
            // account_access might not exist or have different structure
          }

          const _token = jsonwebtoken.sign(
              {
                id: acc.id,
              },
              conf.secret,
              {
                expiresIn: '30d',
              },
          );

          return {
            id: acc.id,
            gmlevel: gmlevel,
            token: _token,
            wpToken: _wpToken,
            email: acc.email,
            username: acc.username,
          };
        },
      },
      recoverPassword: {
        output: 'recovery',
        description: 'Recover user password from email',
        input: 'recoveryInput',
        resolver: async (obj, data, context, info) => {
          if (data.recoveryInput.email.length === 0) {
            throw Error(CustomErrors.invalidEmail);
          }
          const saltRounds = 8;

          const user = await account.findOne({
            where: {
              email: data.recoveryInput.email,
            },
            attributes: ['email', 'id'],
          });
          if (!user) throw Error(CustomErrors.invalidEmail);

          let userApp = await appModels.User.findOne({
            where: {
              id: user.id,
            },
            attributes: ['recoveryToken'],
          });

          if (!userApp) {
            userApp = syncWithGame(appModels, user.id, '', '');
          }

          userApp.recoveryToken = await bcrypt.hash(user.email, saltRounds);
          userApp.recoveryToken = userApp.recoveryToken
              .replace(/[/.]/g, '')
              .substring(0, 60);
          await appModels.User.update(
              {
                recoveryToken: userApp.recoveryToken,
              },
              {
                where: {
                  id: user.id,
                },
              },
          );

          const email = new Mailer(conf.mailer);
          email.sendRecovery(userApp.recoveryToken, user.email);

          return {
            message: 'Done',
          };
        },
      },
      changePassword: {
        output: 'changePsw',
        description: 'Change Password',
        input: 'changePswInput',
        resolver: async (obj, data, context /* , info*/) => {
          const user = context.user;
          if (!user) throw Error(CustomErrors.notSignedIn);

          const change = data.changePswInput;

          // normalize
          change.newPass = normalizeCredentials(change.newPass);
          change.oldPass = normalizeCredentials(change.oldPass);

          isPasswordValid(change.newPass);

          // Get current account data
          const acc = await account.findOne({
            where: {id: user.id},
            attributes: ['username', 'salt', 'verifier'],
          });

          if (!acc) {
            throw Error(CustomErrors.userNotFound);
          }

          // Verify old password
          const isValid = verifyPassword(
              acc.username,
              change.oldPass,
              acc.salt,
              acc.verifier,
          );

          if (!isValid) {
            throw Error(CustomErrors.wrongOldPass);
          }

          // Generate new SRP6 credentials
          const {salt, verifier} = generateSaltVerifier(acc.username, change.newPass);

          await account.update(
              {
                salt: salt,
                verifier: verifier,
              },
              {
                where: {
                  id: user.id,
                },
              },
          );
          return {
            message: 'Done',
          };
        },
      },
      changeEmail: {
        output: 'changeEmail',
        description: 'Change Email',
        input: 'changeEmailInput',
        resolver: async (obj, data, context, info) => {
          const user = context.user;
          if (!user) throw Error(CustomErrors.notSignedIn);

          const change = data.changeEmailInput;

          isEmailValid(change.newEmail);
          if (!change.newEmail.includes('@')) {
            throw Error(CustomErrors.invalidEmail);
          }

          await account.update(
              {
                email: change.newEmail,
                locked: 1,
              },
              {
                where: {
                  id: user.id,
                },
              },
          );

          const appUser = await appModels.User.findOne({
            where: {
              id: user.id,
            },
            attributes: ['recoveryToken'],
          });

          const activationToken = await sha1(
              user.id + ':' + change.newEmail,
          ).replace(/[/.]/g, '');

          if (appUser) {
            syncWithGame(
                appModels,
                user.id,
                appUser.recoveryToken,
                activationToken,
            );
          } else syncWithGame(appModels, user.id, '', activationToken);

          const email = new Mailer(conf.mailer);
          email.sendConfirmation(activationToken, change.newEmail, user.id);

          return {
            message: 'Done',
          };
        },
      },
      resendConfirmation: {
        output: 'resendConf',
        description: 'Resend Confirmation',
        input: 'resendConfInput',
        resolver: async (obj, data, context, info) => {
          const user = context.user;
          if (!user) throw Error(CustomErrors.notSignedIn);

          const resend = data.resendConfInput;

          const userServer = await account.findOne({
            where: {
              id: user.id,
            },
            attributes: ['locked'],
          });
          if (!userServer) throw Error(CustomErrors.userNotFound);

          const appUser = await appModels.User.findOne({
            where: {
              id: user.id,
            },
            attributes: ['recoveryToken'],
          });

          const activationToken = await sha1(
              user.id + ':' + resend.email,
          ).replace(/[/.]/g, '');
          if (appUser) {
            syncWithGame(
                appModels,
                user.id,
                appUser.recoveryToken,
                activationToken,
            );
          } else syncWithGame(appModels, user.id, '', activationToken);

          const emailer = new Mailer(conf.mailer);
          emailer.sendConfirmation(activationToken, resend.email, user.id);

          return {
            message: 'Done',
          };
        },
      },
    },
  };

  app.get('/pass_recover/:email/:token', async (req, res) => {
    let user;
    let newPass;
    try {
      user = await account.findOne({
        where: {
          email: req.params.email,
        },
        attributes: ['id', 'username', 'email'],
      });

      const recovery = await appModels.User.findOne({
        where: {
          id: user.id,
        },
        attributes: ['recoveryToken'],
      });

      if (!user) return res.send('Error 700');
      if (!recovery) return res.send('Error 701');
      if (req.params.token != recovery.recoveryToken) {
        return res.send('Error 702');
      }
      newPass = Math.random()
          .toString(36)
          .replace(/[^a-z]+/g, '')
          .substr(0, 9);

      newPass = normalizeCredentials(newPass);

      // Generate new SRP6 credentials
      const {salt, verifier} = generateSaltVerifier(user.username, newPass);

      await account.update(
          {
            salt: salt,
            verifier: verifier,
          },
          {
            where: {
              id: user.id,
            },
          },
      );

      await appModels.User.update(
          {
            recoveryToken: '',
          },
          {
            where: {
              id: user.id,
            },
          },
      );
    } catch (error) {
      console.log(error);
    }
    const email = new Mailer(conf.mailer);
    email.sendPassword(newPass, user.email);
    return res.send('A new temporary password has been sent to your email');
  });

  app.get('/activation/:id/:token', async (req, res) => {
    try {
      const user = await appModels.User.findOne({
        where: {
          id: req.params.id,
        },
        attributes: ['activationToken'],
      });
      if (!user) return res.send('Error 703');
      if (!user.activationToken) return res.send('Already actived!');
      if (req.params.token != user.activationToken) {
        return res.send('Error 704');
      }
      await appModels.User.update(
          {
            activationToken: '',
          },
          {
            where: {
              id: req.params.id,
            },
          },
      );
      // activate wow account too
      await account.update(
          {
            locked: 0,
          },
          {
            where: {
              id: req.params.id,
            },
          },
      );
    } catch (error) {
      console.log(error);
    }
    return res.send('User activated successfully');
  });
}

/**
 * @param model
 */
function schemaAdapter(model) {
}

export {dbAdapter, schemaAdapter};
