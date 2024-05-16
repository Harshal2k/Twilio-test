'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'phone_mappings',
      'meeting_id',
      {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('phone_mappings', 'meeting_id');
  }
};
