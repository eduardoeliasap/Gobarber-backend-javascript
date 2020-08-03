import Sequelize, { Model } from 'sequelize';
import { isBefore, subHours } from 'date-fns';

class Appointments extends Model {
  // Contem todos os tipos de valores que podemos trabalhar na tabela Appointments
  static init(sequelize) {
    super.init(
      {
        date: Sequelize.DATE,
        canceled_at: Sequelize.DATE,
        provider_id: Sequelize.INTEGER,
        user_id: Sequelize.INTEGER,
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.date, new Date()); // inform if appointment have passed ou not. Inform if date is before the current Date
          }
        },
        cancelable: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(new Date(), subHours(this.date, 2)); // Inform is current Date is before appointments available. If is it cancelable
          }
        }
      },
      {
        sequelize
      }
    );
    return this;
  }

  static associate(models) {
    // belongsTo - Pertence á.
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' }); // ForeingnKey que esta dentro da tabela. Esta sendo chamado de user
    this.belongsTo(models.User, { foreignKey: 'provider_id', as: 'provider' }); // ForeingnKey que esta dentro da tabela. Esta sendo chamado de provider
  }
}

export default Appointments;
