export default {
  development: {
    username: process.env.DB_USER || 'acore',
    password: process.env.DB_PASS || 'acore',
    database: process.env.DB_APP_NAME || process.env.DB_AUTH_NAME || 'acore_auth',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    port: parseInt(process.env.DB_PORT) || 3306,
    operatorsAliases: false,
  },
  production: {
    username: process.env.DB_USER || 'acore',
    password: process.env.DB_PASS || 'acore',
    database: process.env.DB_APP_NAME || process.env.DB_AUTH_NAME || 'acore_auth',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    port: parseInt(process.env.DB_PORT) || 3306,
    operatorsAliases: false,
  },
};
