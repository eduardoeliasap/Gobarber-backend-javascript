// Realiza a conexão com o banco de dados e carrega os módulos
import Sequelize from 'sequelize';
import mongoose from 'mongoose';

// Importo todos os models da minha aplicação
import User from '../app/models/User';
import File from '../app/models/File';
import Appointment from '../app/models/Appointment';

import databaseConfig from '../config/database';

const models = [User, File, Appointment]; // Array com todos os models da aplicação

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  // Faz a conexão com o banco de dados
  init() {
    this.connection = new Sequelize(databaseConfig);

    // Mapea todos os meus Models e Associações com outras tabelas (Models)
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

  mongo() {
    this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useFindAndModify: true,
      useUnifiedTopology: true
    });
  }
}

export default new Database();
