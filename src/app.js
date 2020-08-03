import './bootstrap';
// import 'dotenv/config'; // Import all global variables

import express from 'express';
import path from 'path';
import cors from 'cors';
import Youch from 'youch';
import * as Sentry from '@sentry/node';
import 'express-async-errors';
import routes from './routes'; // Importação do arquivo de rotas
import sentryConfig from './config/sentry';

import './database'; // Não preciso pegar algum retorno desse arquivo

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.middlewares(); // Chamada da função middlewares
    this.routes(); // Chamada da função routes
    this.exceptionHandler();
  } // Será chamado automaticamente quando instanciarmos a classe

  middlewares() {
    // The request handler must be the first middleware on the app
    // app.use(Sentry.Handlers.requestHandler());
    this.server.use(Sentry.Handlers.requestHandler());
    // this.server.use(cors({ origin: 'https://betablue.com.br' })); // It Needs to host our api. Permit the acces only of betablue.com.br address
    this.server.use(cors()); // It Needs to host our api.
    this.server.use(express.json()); // Capacidade de processar requisições no formato JSON
    // Serviço para servir arquivos estáticos (imagens, css, html), arquivos que podem ser acessados diretamente pelo navegador
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads')) // Estou indicando onde esta a pasta de arquivos;
    );
  }

  routes() {
    this.server.use(routes); // Habilita a utilização do arquivo de rotas

    // The error handler must be before any other error middleware and after all controllers
    this.server.use(Sentry.Handlers.errorHandler());
  }

  // Exception middleware errors
  // When a middleware receive 4 argmments, it is a exception middleware.
  // All errors going to here
  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_DEV === 'development') {
        const errors = await new Youch(err, req).toJSON();

        return res.status(500).json(errors);
      }
      return res.status(500).json({ err: 'Internal server error' });
    });
  }
}

// module.exports = new App().server   // Instancio e exporto apenas o server
export default new App().server; // Estou utilizando essa sintaxe devido a instalação do sucrase
