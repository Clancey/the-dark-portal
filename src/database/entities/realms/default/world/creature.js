/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('creature', {
    guid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    id1: {
      type: DataTypes.INTEGER(8).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    id2: {
      type: DataTypes.INTEGER(8).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    id3: {
      type: DataTypes.INTEGER(8).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    map: {
      type: DataTypes.INTEGER(5).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    zoneId: {
      type: DataTypes.INTEGER(5).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    areaId: {
      type: DataTypes.INTEGER(5).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    spawnMask: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '1',
    },
    phaseMask: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '1',
    },
    equipment_id: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
    },
    position_x: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0',
    },
    position_y: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0',
    },
    position_z: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0',
    },
    orientation: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0',
    },
    spawntimesecs: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '120',
    },
    wander_distance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '0',
    },
    currentwaypoint: {
      type: DataTypes.INTEGER(8).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    curhealth: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '1',
    },
    curmana: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    MovementType: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    npcflag: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    unit_flags: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    dynamicflags: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    ScriptName: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: '',
    },
    VerifiedBuild: {
      type: DataTypes.INTEGER(5),
      allowNull: true,
      defaultValue: '0',
    },
  }, {
    tableName: 'creature',
    timestamps: false,
  });
};
