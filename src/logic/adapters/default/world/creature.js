import Sequelize from 'sequelize';

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
  const creature = models[dbId]['creature'];
  const creatureTemplate = models[dbId]['creature_template'];

  // Only set up associations on creatureTemplate to avoid duplicates
  // Guard against multiple calls
  if (!creatureTemplate._associationsInitialized) {
    creatureTemplate._associationsInitialized = true;
    creatureTemplate.associate = () => {
      if (creatureTemplate._associationsDone) return;
      creatureTemplate._associationsDone = true;

      creatureTemplate.hasMany(creature, {
        as: 'spawns',
        foreignKey: 'id1',
        sourceKey: 'entry',
      });

      creature.belongsTo(creatureTemplate, {
        as: 'template',
        foreignKey: 'id1',
        targetKey: 'entry',
      });
    };
  }

  creatureTemplate.graphql = {
    types: {
      searchNpcsInput: {
        name: 'String!',
        limit: 'Int',
        offset: 'Int',
      },
      getNpcLocationsInput: {
        entry: 'Int!',
      },
      npcLocation: {
        guid: 'Int',
        map: 'Int',
        zoneId: 'Int',
        areaId: 'Int',
        position_x: 'Float',
        position_y: 'Float',
        position_z: 'Float',
        orientation: 'Float',
      },
      npcSearchResult: {
        entry: 'Int',
        name: 'String',
        subname: 'String',
        minlevel: 'Int',
        maxlevel: 'Int',
        rank: 'Int',
        type: 'Int',
        locations: '[npcLocation]',
      },
    },
    excludeMutations: ['delete', 'create', 'update'],
    queries: {
      searchNpcs: {
        input: 'searchNpcsInput',
        output: '[npcSearchResult]',
        resolver: async (obj, data, context, info) => {
          const input = data.searchNpcsInput;
          const limit = input.limit || 25;
          const offset = input.offset || 0;

          const npcs = await creatureTemplate.findAll({
            where: {
              name: {
                [Op.like]: `%${input.name}%`,
              },
            },
            limit: limit,
            offset: offset,
            order: [['name', 'ASC']],
            include: [{
              model: creature,
              as: 'spawns',
              attributes: ['guid', 'map', 'zoneId', 'areaId', 'position_x', 'position_y', 'position_z', 'orientation'],
              required: false,
            }],
          });

          return npcs.map((npc) => ({
            entry: npc.entry,
            name: npc.name,
            subname: npc.subname,
            minlevel: npc.minlevel,
            maxlevel: npc.maxlevel,
            rank: npc.rank,
            type: npc.type,
            locations: npc.spawns ? npc.spawns.map((spawn) => ({
              guid: spawn.guid,
              map: spawn.map,
              zoneId: spawn.zoneId,
              areaId: spawn.areaId,
              position_x: spawn.position_x,
              position_y: spawn.position_y,
              position_z: spawn.position_z,
              orientation: spawn.orientation,
            })) : [],
          }));
        },
      },
      getNpcLocations: {
        input: 'getNpcLocationsInput',
        output: '[npcLocation]',
        resolver: async (obj, data, context, info) => {
          const entry = data.getNpcLocationsInput.entry;

          const spawns = await creature.findAll({
            where: {
              id1: entry,
            },
            attributes: ['guid', 'map', 'zoneId', 'areaId', 'position_x', 'position_y', 'position_z', 'orientation'],
          });

          return spawns.map((spawn) => ({
            guid: spawn.guid,
            map: spawn.map,
            zoneId: spawn.zoneId,
            areaId: spawn.areaId,
            position_x: spawn.position_x,
            position_y: spawn.position_y,
            position_z: spawn.position_z,
            orientation: spawn.orientation,
          }));
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
