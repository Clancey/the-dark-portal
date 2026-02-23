// import fs from 'fs';
// import path from 'path';

/**
 * README:
 * If you need to change some configuration in a safe way, please use
 * the .env file
 *
 * However, if you want to need the full control, you can copy this file
 * inside the /conf/ folder. The default export will be merged with
 * values of /conf/dist/conf.js, so you can also directly change the
 * needed variables without copying the entire content of this file.
 */

const conf = {
  port: parseInt(process.env.PORT) || 0, // 0 to automatically assign a port
  // optional, needed for emails (registration/pass recovery)
  clientUrl:
    process.env.NODE_ENV == 'production' ?
      'https://127.0.0.1' :
      'http://127.0.0.1:3000',
  secret: process.env.JWT_SECRET || 'change-me-to-a-random-secret',
  registrationInviteCode: process.env.INVITE_CODE || '',
  realmlistHost: process.env.REALMLIST_HOST || '',
  // optional, for wordpress integration
  wp_secret: process.env.WP_SECRET || 'change-me',
  ssl: {
    enabled: process.env.HTTPS === '1' && process.env.NODE_ENV === 'development',
  },
  express: {
    useCors: true,
    bodyParser: {
      json: {
        limit: '1mb',
      },
    },
  },
  mailer: {
    service: 'gmail',
    port: 993,
    auth: {
      user: '',
      pass: '',
    },
  },
  realm_databases: {
    default_auth: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      name: process.env.DB_AUTH_NAME || 'acore_auth',
      user: process.env.DB_USER || 'acore',
      pass: process.env.DB_PASS || 'acore',
      include: ['account.js', 'account_access.js'],
      exclude: ['version_db_auth.js'],
      entities: 'default/auth',
      adapters: 'default/auth', // can be omitted, default will be used
    },
    default_world: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      name: process.env.DB_WORLD_NAME || 'acore_world',
      user: process.env.DB_USER || 'acore',
      pass: process.env.DB_PASS || 'acore',
      include: [],
      exclude: [
        'version_db_world.js',
        'event_scripts.js',
        'spell_custom_attr.js',
        'spell_scripts.js',
      ],
      entities: 'default/world',
      adapters: 'default/world', // can be omitted, default will be used
    },
    default_chars: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      name: process.env.DB_CHARS_NAME || 'acore_characters',
      user: process.env.DB_USER || 'acore',
      pass: process.env.DB_PASS || 'acore',
      include: [],
      exclude: [
        'version_db_characters.js',
        'account_data.js',
        'character_account_data.js',
        'quest_tracker.js',
      ],
      entities: 'default/chars',
      adapters: 'default/chars', // can be omitted, default will be used
      accountDbId: 'default_auth',
      worldDbId: 'default_world',
    },
  },
  realms: [
    {
      id: 1,
      name: 'default',
      dbconn: {
        auth: 'default_auth',
        world: 'default_world',
        chars: 'default_chars',
      },
    },
  ],
  modules: {
    exclude: [],
  },
};

export default conf;
