import { Model, Sequelize } from 'sequelize';

class File extends Model {
  // Contem todos os tipos de valores que o File pode mecher
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `${process.env.APP_URL}/files/${this.path}`; // Retornaria o texto caso fosse consultado
          }
        }
      },
      {
        sequelize
      }
    );

    return this;
  }
}

export default File;
