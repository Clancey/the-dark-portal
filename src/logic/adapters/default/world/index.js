import * as creature from './creature';

/**
 * @param model
 */
function schemaAdapter(model) {
  creature.schemaAdapter(model);
}

/**
 * @param dbId
 * @param dbVal
 * @param sequelize
 * @param models
 * @param appModels
 */
function dbAdapter(dbId, dbVal, sequelize, models, appModels) {
  creature.dbAdapter(dbId, dbVal, sequelize, models, appModels);
}

export {
  schemaAdapter,
  dbAdapter,
};
