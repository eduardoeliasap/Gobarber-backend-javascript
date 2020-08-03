module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('users', 'users_name_key');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint('users', 'users_name_key');
  }
};
