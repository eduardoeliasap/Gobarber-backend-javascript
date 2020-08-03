import nodemailer from 'nodemailer';
import { resolve } from 'path';
import exphbs from 'express-handlebars';
import nodemailerhbs from 'nodemailer-express-handlebars';
import mailConfig from '../config/mail';

class Main {
  constructor() {
    const { host, port, secure, auth } = mailConfig;

    // O transporter é usado pelo nodemailer para chamar uma conexão externa
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: auth.user ? auth : null
    });

    this.configureTemplates(); // Para chamar o configureTemplate ja na instanciamento da classe.
  }

  // Caminho onde estará nossos templates
  configureTemplates() {
    const viewPath = resolve(__dirname, '..', 'app', 'views', 'emails');

    // 'Use' para configurar mais uma propriedade no transporter
    // 'Compile' como é formatado nossa mensagem (email)
    this.transporter.use(
      'compile',
      nodemailerhbs({
        viewEngine: exphbs.create({
          layoutsDir: resolve(viewPath, 'layouts'), // Informa onde esta meu arquivo de layout
          partialsDir: resolve(viewPath, 'partials'), // Informa onde esta meu arquivo de partials
          defaultLayout: 'default',
          extname: '.hbs'
        }),
        viewPath,
        extName: '.hbs'
      })
    );
  }

  sendMail(message) {
    return this.transporter.sendMail({
      ...mailConfig.default,
      ...message
    });
  }
}

export default new Main();
