/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('creature_template', {
    entry: {
      type: DataTypes.INTEGER(8).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
      primaryKey: true,
    },
    difficulty_entry_1: {
      type: DataTypes.INTEGER(8).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    difficulty_entry_2: {
      type: DataTypes.INTEGER(8).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    difficulty_entry_3: {
      type: DataTypes.INTEGER(8).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    KillCredit1: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    KillCredit2: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: '',
    },
    subname: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    IconName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gossip_menu_id: {
      type: DataTypes.INTEGER(8).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    minlevel: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '1',
    },
    maxlevel: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '1',
    },
    exp: {
      type: DataTypes.INTEGER(5),
      allowNull: false,
      defaultValue: '0',
    },
    faction: {
      type: DataTypes.INTEGER(5).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    npcflag: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    speed_walk: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '1',
    },
    speed_run: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '1.14286',
    },
    speed_swim: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '1',
    },
    speed_flight: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '1',
    },
    detection_range: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '20',
    },
    scale: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '1',
    },
    rank: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    dmgschool: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
    },
    DamageModifier: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '1',
    },
    BaseAttackTime: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '2000',
    },
    RangeAttackTime: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '2000',
    },
    BaseVariance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '1',
    },
    RangeVariance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '1',
    },
    unit_class: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    unit_flags: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    unit_flags2: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    dynamicflags: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    family: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
    },
    type: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    type_flags: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    lootid: {
      type: DataTypes.INTEGER(8).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    pickpocketloot: {
      type: DataTypes.INTEGER(8).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    skinloot: {
      type: DataTypes.INTEGER(8).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    PetSpellDataId: {
      type: DataTypes.INTEGER(8).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    VehicleId: {
      type: DataTypes.INTEGER(8).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    mingold: {
      type: DataTypes.INTEGER(8).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    maxgold: {
      type: DataTypes.INTEGER(8).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    AIName: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: '',
    },
    MovementType: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    HoverHeight: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '1',
    },
    HealthModifier: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '1',
    },
    ManaModifier: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '1',
    },
    ArmorModifier: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '1',
    },
    ExperienceModifier: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: '1',
    },
    RacialLeader: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    movementId: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    RegenHealth: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '1',
    },
    mechanic_immune_mask: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    spell_school_immune_mask: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    flags_extra: {
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
    tableName: 'creature_template',
    timestamps: false,
  });
};
