/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('account', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: '',
      unique: true,
    },
    salt: {
      type: DataTypes.BLOB('tiny'),
      allowNull: false,
      graphql: {exclude: true},
    },
    verifier: {
      type: DataTypes.BLOB('tiny'),
      allowNull: false,
      graphql: {exclude: true},
    },
    session_key: {
      type: DataTypes.BLOB('tiny'),
      allowNull: true,
      graphql: {exclude: true},
    },
    totp_secret: {
      type: DataTypes.BLOB,
      allowNull: true,
      graphql: {exclude: true},
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    reg_mail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    joindate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    last_ip: {
      type: DataTypes.STRING(15),
      allowNull: false,
      defaultValue: '127.0.0.1',
    },
    last_attempt_ip: {
      type: DataTypes.STRING(15),
      allowNull: false,
      defaultValue: '127.0.0.1',
    },
    failed_logins: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    locked: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    lock_country: {
      type: DataTypes.STRING(2),
      allowNull: false,
      defaultValue: '00',
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    online: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    expansion: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '2',
    },
    Flags: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    mutetime: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0',
    },
    mutereason: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    muteby: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
    },
    locale: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    os: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: '',
    },
    recruiter: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    totaltime: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
  }, {
    tableName: 'account',
    timestamps: false,
  });
};
