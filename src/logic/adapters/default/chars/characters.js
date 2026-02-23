import Sequelize from 'sequelize';
import ACL from '@/logic/ACL';
import {applyMiddlewares} from '@/service/helpers';
import {CustomErrors} from '@/logic/CustomErrors';
import {
  CLASS_NAMES,
  RACE_NAMES,
  CLASS_SPECS,
  getBaseStats,
  getFaction,
} from './levelBoostData';
import {findBoostGear, findMount} from './gearFinder';

const RECOVER_CHAR_ACCOUNT = 5;
const VALID_BOOST_LEVELS = [60, 70, 80];

const Op = Sequelize.Op;

/**
 * @instance
 * @param dbId
 * @param dbVal
 * @param {Sequelize} sequelize
 * @param {any} models
 * @param {Object.<string, Sequelize.Model>} appModels
 */
function dbAdapter(dbId, dbVal, sequelize, models, appModels) {
  const characters = models[dbId]['characters'];
  const accountDbId = dbVal['accountDbId'];

  characters.associate = () => {
    models[dbId].guild_member.belongsTo(models[dbId].characters, {
      foreignKey: 'guid',
      sourceKey: 'guid',
    });

    models[dbId].characters.hasOne(models[dbId].guild_member, {
      foreignKey: 'guid',
      targetKey: 'guid',
    });

    // Ship.belongsTo(Captain, { targetKey: 'name', foreignKey: 'captainName' });
    characters.belongsTo(models[accountDbId].account, {
      as: 'charAccount',
      foreignKey: 'account',
      targetKey: 'id',
    });

    models[accountDbId].account.hasMany(characters, {
      foreignKey: 'account',
      sourceKey: 'id',
    });
  };

  characters.graphql = {
    types: {
      debugCharacterOutput: {
        result: 'Boolean',
      },
      debugCharacterInput: {
        name: 'String!', // is it found by name?
      },
      recoveryCharacterInput: {
        id: 'Int!', // Character.guid
      },
      recoveryCharacterOutput: {
        account: 'Int',
      },
      retreiveCharsInput: {
        id: 'Int!',
      },
      retreiveDisposedCharsInput: {
        id: 'Int!',
      },
      countPlayerInput: {
        searchFor: 'String',
      },
      countPlayerOutput: {
        count: 'Int',
      },
      getPlayersInput: {
        limit: 'Int',
        offset: 'Int',
        searchFor: 'String',
      },
      getPlayerOutput: {
        character: 'String',
      },
      // Level boost types
      levelBoostInput: {
        characterGuid: 'Int!',
        targetLevel: 'Int!', // 60, 70, or 80
        specId: 'String!', // Spec identifier (e.g., 'arms', 'holy', 'frost')
      },
      levelBoostOutput: {
        success: 'Boolean',
        message: 'String',
        newLevel: 'Int',
        characterName: 'String',
        specName: 'String',
      },
      // Spec types
      classSpecOutput: {
        id: 'String',
        name: 'String',
        role: 'String',
      },
      getClassSpecsInput: {
        classId: 'Int!',
      },
      myCharactersOutput: {
        guid: 'Int',
        name: 'String',
        level: 'Int',
        race: 'Int',
        class: 'Int',
        raceName: 'String',
        className: 'String',
        gender: 'Int',
        money: 'Int',
        totaltime: 'Int',
        online: 'Int',
      },
    },
    excludeMutations: ['delete', 'create'],
    before: {
      update: ACL.isAllowed(
          ACL.roles.ROLE_USER,
          ACL.sameUser('characters', 'account'),
      ),
      fetch: applyMiddlewares(
          ACL.handleHierarchy({
            [ACL.roles.ROLE_USER]: {
              public: {
                fields: ['guid', 'account', 'name', 'gender'],
                inclusive: true,
              },
              private: {
                isSameUser: {model: 'characters', field: 'account'}, // also grants access if you're admin
                fields: ['level'],
                inclusive: true,
              },
            },
          }),
          ACL.setLimit(100),
      ),
    },
    queries: {
      retreiveDisposedChars: {
        input: 'retreiveDisposedCharsInput',
        output: '[characters]',
        resolver: async (obj, data, context, info) => {
          await ACL.sameUser('retreiveDisposedCharsInput', 'id')(
              obj,
              data,
              context,
              info,
          );

          const chars = await characters.findAll({
            where: {
              deleteInfos_Account: data.retreiveDisposedCharsInput.id,
              account: RECOVER_CHAR_ACCOUNT,
            },
          });

          return chars;
        },
      },
      retreiveChars: {
        input: 'retreiveCharsInput',
        output: '[characters]',
        resolver: async (obj, data, context, info) => {
          await ACL.sameUser('retreiveCharsInput', 'id')(
              obj,
              data,
              context,
              info,
          );

          const chars = await characters.findAll({
            where: {
              account: data.retreiveCharsInput.id,
            },
          });

          return chars;
        },
      },
      countPlayer: {
        input: 'countPlayerInput',
        output: 'countPlayerOutput',
        resolver: async (obj, data, context, info) => {
          const charsCount = await characters.count({
            where: {
              name: Sequelize.where(
                  Sequelize.fn('lower', Sequelize.col('name')),
                  {
                    [Op.like]: '%' + data.countPlayerInput.searchFor + '%',
                  },
              ),
            },
          });

          return {
            count: charsCount,
          };
        },
      },
      getPlayers: {
        input: 'getPlayersInput',
        output: '[characters]',
        resolver: async (obj, data, context, info) => {
          if (!data.getPlayersInput.limit) data.getPlayersInput.limit = 0;
          if (!data.getPlayersInput.offset) data.getPlayersInput.offset = 0;
          const chars = await characters.findAll({
            where: {
              name: Sequelize.where(
                  Sequelize.fn('lower', Sequelize.col('name')),
                  {
                    [Op.like]: data.getPlayersInput.searchFor,
                  },
              ),
            },
            limit: data.getPlayersInput.limit,
            offset: data.getPlayersInput.offset,
            order: [
              ['totalKills', 'DESC'],
              ['level', 'DESC'],
              ['name', 'ASC'],
            ],
          });

          return chars;
        },
      },
      // Get available specs for a class
      getClassSpecs: {
        input: 'getClassSpecsInput',
        output: '[classSpecOutput]',
        description: 'Get available specs for a class',
        resolver: async (obj, data, context, info) => {
          const classId = data.getClassSpecsInput.classId;
          const specs = CLASS_SPECS[classId];
          if (!specs) return [];
          return specs.map((s) => ({
            id: s.id,
            name: s.name,
            role: s.role,
          }));
        },
      },
      // Get current user's characters with class/race names
      myCharacters: {
        output: '[myCharactersOutput]',
        description: 'Get all characters for the logged-in user',
        resolver: async (obj, data, context, info) => {
          const user = context.user;
          if (!user) throw Error(CustomErrors.notSignedIn);

          const chars = await characters.findAll({
            where: {
              account: user.id,
            },
            attributes: [
              'guid', 'name', 'level', 'race', 'class',
              'gender', 'money', 'totaltime', 'online',
            ],
            order: [['level', 'DESC'], ['name', 'ASC']],
          });

          return chars.map((char) => ({
            guid: char.guid,
            name: char.name,
            level: char.level,
            race: char.race,
            class: char.class,
            raceName: RACE_NAMES[char.race] || 'Unknown',
            className: CLASS_NAMES[char.class] || 'Unknown',
            gender: char.gender,
            money: char.money,
            totaltime: char.totaltime,
            online: char.online,
          }));
        },
      },
    },
    mutations: {
      debugCharacter: {
        output: 'debugCharacterOutput',
        input: 'debugCharacterInput',
        resolver: async (obj, data, context, info) => {
          // TODO: debug character
          if (data.debugCharacterInput.name) {
            return {
              result: true,
            };
          }

          return {
            result: false,
          };
        },
      },

      recoveryCharacter: {
        output: 'recoveryCharacterOutput',
        description: 'Recover your character',
        input: 'recoveryCharacterInput',
        resolver: async (source, data, context, info) => {
          const user = context.user;

          if (!user) {
            // throw new Error(Errors.notSignedIn);
          }

          const charData = data.recoveryCharacterInput;

          const numAcc = await characters.count({
            where: {
              account: user.id,
            },
          });

          // if (numAcc === 10) throw new Error(Errors.tooManyAccounts);
          if (numAcc > 10) {
            throw new Error(
                'CRITICAL ERROR! TOO MANY ACCOUNT FOR USER-ID: ' + user.id,
            );
          }

          const charRes = await characters.findOne({
            where: {
              deleteInfos_Account: user.id,
              guid: charData.id,
              account: RECOVER_CHAR_ACCOUNT,
            },
          });

          if (!charRes) {
            // throw new Error(Errors.noCharSelected);
          }

          await charRes.update({
            account: charRes.deleteInfos_Account,
            deleteInfos_Account: null,
          });

          return {
            account: charRes.account,
          };
        },
      },

      // Level boost mutation
      levelBoost: {
        output: 'levelBoostOutput',
        description: 'Boost a character to level 60, 70, or 80',
        input: 'levelBoostInput',
        resolver: async (source, data, context, info) => {
          const user = context.user;
          if (!user) throw Error(CustomErrors.notSignedIn);

          const {characterGuid, targetLevel, specId} = data.levelBoostInput;

          // Validate target level
          if (!VALID_BOOST_LEVELS.includes(targetLevel)) {
            return {
              success: false,
              message: `Invalid target level. Must be one of: ${VALID_BOOST_LEVELS.join(', ')}`,
              newLevel: null,
              characterName: null,
            };
          }

          // Find the character and verify ownership
          const char = await characters.findOne({
            where: {
              guid: characterGuid,
              account: user.id,
            },
          });

          if (!char) {
            return {
              success: false,
              message: 'Character not found or does not belong to your account',
              newLevel: null,
              characterName: null,
            };
          }

          // Check if character is already at or above target level
          if (char.level >= targetLevel) {
            return {
              success: false,
              message: `Character is already level ${char.level}`,
              newLevel: char.level,
              characterName: char.name,
            };
          }

          // Check if character is online
          if (char.online === 1) {
            return {
              success: false,
              message: 'Character must be offline to apply level boost',
              newLevel: char.level,
              characterName: char.name,
            };
          }

          // Validate spec
          const classSpecs = CLASS_SPECS[char.class];
          if (!classSpecs) {
            return {
              success: false,
              message: 'Invalid class',
              newLevel: null,
              characterName: char.name,
              specName: null,
            };
          }

          const selectedSpec = classSpecs.find((s) => s.id === specId);
          if (!selectedSpec) {
            return {
              success: false,
              message: `Invalid spec "${specId}" for ${CLASS_NAMES[char.class]}. Valid specs: ${classSpecs.map((s) => s.id).join(', ')}`,
              newLevel: null,
              characterName: char.name,
              specName: null,
            };
          }

          // Get boost gear data from database
          const worldDbId = dbVal['worldDbId'] || 'default_world';
          const worldSequelize = models[worldDbId]?.creature_template?.sequelize || sequelize;

          // Find appropriate gear from world database
          let boostItems = [];
          try {
            boostItems = await findBoostGear(
                worldSequelize,
                char.class,
                targetLevel,
                selectedSpec.role,
            );
          } catch (gearError) {
            console.error('Error finding boost gear:', gearError);
          }

          // Get mount
          const faction = getFaction(char.race);
          const mountItem = await findMount(worldSequelize, faction, targetLevel);
          if (mountItem) {
            boostItems.push(mountItem);
          }

          // Gold amounts
          const BOOST_GOLD = {
            60: 1000 * 100 * 100, // 1000 gold in copper
            70: 2500 * 100 * 100, // 2500 gold
            80: 5000 * 100 * 100, // 5000 gold
          };

          const baseStats = getBaseStats(char.class, targetLevel);

          // Update character level and stats
          await characters.update(
              {
                level: targetLevel,
                xp: 0,
                money: char.money + (BOOST_GOLD[targetLevel] || 0),
                health: baseStats.health,
                power1: baseStats.mana, // Mana
              },
              {
                where: {
                  guid: characterGuid,
                },
              },
          );

          // Send mail with starter gear
          const mail = models[dbId]['mail'];
          const mailItems = models[dbId]['mail_items'];
          const itemInstance = models[dbId]['item_instance'];

          if (mail && mailItems && itemInstance && boostItems.length > 0) {
            try {
              const currentTime = Math.floor(Date.now() / 1000);
              const expireTime = currentTime + (30 * 24 * 60 * 60); // 30 days

              // Create mail entry
              const mailEntry = await mail.create({
                messageType: 0,
                stationery: 41,
                sender: 0, // System mail
                receiver: characterGuid,
                subject: `Level ${targetLevel} ${selectedSpec.name} Boost Package`,
                body: `Congratulations on your level boost to ${targetLevel} as ${selectedSpec.name}! ` +
                      `Here is your ${selectedSpec.name} starter gear package. Good luck on your adventures!`,
                has_items: 1,
                expire_time: expireTime,
                deliver_time: currentTime,
                money: 0,
                cod: 0,
                checked: 0,
              });

              // Create item instances and mail_items
              for (const itemEntry of boostItems) {
                const item = await itemInstance.create({
                  itemEntry: itemEntry,
                  owner_guid: characterGuid,
                  creatorGuid: 0,
                  giftCreatorGuid: 0,
                  count: 1,
                  duration: 0,
                  charges: '0 0 0 0 0',
                  flags: 0,
                  enchantments: '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0',
                  randomPropertyId: 0,
                  durability: 100,
                  playedTime: 0,
                });

                await mailItems.create({
                  mail_id: mailEntry.id,
                  item_guid: item.guid,
                  receiver: characterGuid,
                });
              }

              // Mount is already included in boostItems array
            } catch (mailError) {
              console.error('Error sending boost mail:', mailError);
              // Level boost still succeeded even if mail failed
            }
          }

          return {
            success: true,
            message: `Successfully boosted ${char.name} to level ${targetLevel} as ${selectedSpec.name}! ` +
                     `Check your mailbox for ${selectedSpec.name} starter gear!`,
            newLevel: targetLevel,
            characterName: char.name,
            specName: selectedSpec.name,
          };
        },
      },
    },
  };
}

/**
 * @param model
 */
function schemaAdapter(model) {
  return null;
}

export {dbAdapter, schemaAdapter};
