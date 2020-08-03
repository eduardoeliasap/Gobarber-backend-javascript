// require('dotenv').config(); // Import all global variables
require('../bootstrap');

module.exports = {
  dialect: process.env.DB_DIALECT || 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  storage: './__tests__/database.sqlite',
  define: {
    timestamp: true,
    underscored: true,
    underscoredAll: true
  }
};

// module.exports = {
//   dialect: 'mysql',
//   host: 'sql10.freemysqlhosting.net',
//   username: 'sql10320425',
//   password: '9XWJj5qvJZ',
//   database: 'sql10320425',
//   define: {
//     timestamp: true,
//     underscored: true,
//     underscoredAll: true
//   }
// };
