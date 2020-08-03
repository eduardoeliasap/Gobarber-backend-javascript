import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  // Contem todos os tipos de valores que o User pode mecher
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN
      },
      {
        sequelize
      }
    );

    // addHooks são executados de forma automática baseados em ações que acontecem no model
    // o user indica o parametro que estou recebendo, ou seja, o User declarado acima

    this.addHook('beforeSave', async user => {
      if (user.password) {
        // eslint-disable-next-line no-param-reassign
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  static associate(models) {
    // belongsTo - Pertence á.
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' }); // o "as: 'avatar'" esta adicionando um apelido ao campo
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
