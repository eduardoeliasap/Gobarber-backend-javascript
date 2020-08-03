import pt from 'date-fns/locale/pt'; // Idioma portugues do date-fns
import { format, parseISO } from 'date-fns';
import Mail from '../../lib/Mail'; // Minha classe de envio de email

class CancellationMail {
  // Com o uso do get, vou poder acessar o key eu importar essa classe em outros arquivos do projeto.
  // É como se fosse uma variavel. Se importar essa classe em outro lugar do projeto posso acessar essa variável (get nesse caso)
  // Posso importar com import CancellationMail from './CancelationMail'   CamcelationMail.key
  get key() {
    return 'CancellationMail'; // Para cada job vamos precisar de uma chave única
  }

  // Será chamado para cada envio de email. Será chamado para cada envio de email
  async handle({ data }) {
    const { appointment, teste } = data; // O data é onde esta todas as informações sobre o email que será enviado (Esta vindo do AppointmentController.js)
    console.log(teste); // Teste esta vindo
    console.log('A fila executou');

    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento cancelado.',
      // text: 'Um agendamento foi cancelado.'
      template: 'cancellation',
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(
          parseISO(appointment.date), // parseISO para transformar o appointment.date em um objeto. Sem o parseISO o appointment.date fica como string
          "'dia' dd 'de' MMMM', às' H:mm:'h'",
          {
            locale: pt
          }
        )
      }
    });
  }
}

export default new CancellationMail();
