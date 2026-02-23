/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mail', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    messageType: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    stationery: {
      type: DataTypes.INTEGER(3),
      allowNull: false,
      defaultValue: '41',
    },
    mailTemplateId: {
      type: DataTypes.INTEGER(5).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    sender: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    receiver: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    subject: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    body: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    has_items: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    expire_time: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    deliver_time: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    money: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    cod: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    checked: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
  }, {
    tableName: 'mail',
    timestamps: false,
  });
};
