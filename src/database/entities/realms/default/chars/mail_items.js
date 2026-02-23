/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mail_items', {
    mail_id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
      primaryKey: true,
    },
    item_guid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
      primaryKey: true,
    },
    receiver: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
  }, {
    tableName: 'mail_items',
    timestamps: false,
  });
};
