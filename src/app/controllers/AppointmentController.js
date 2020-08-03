import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointments from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';

import CancellatioMail from '../jobs/CancellationMail';

// Não estou mais importando a mail por que estou importando a fila
// import Mail from '../../lib/Mail';
import Queue from '../../lib/Queue';

class AppointmentController {
  async index(req, res) {
    const { page } = req.query; // Esta me retornando a pagina desejada para exibir de 20 em 20 registros
    console.log(page);

    // console.log(req.userId);

    const appointments = await Appointments.findAll({
      where: { user_id: req.userId, canceled_at: null },
      attributes: [
        'id',
        'date',
        'created_at',
        'provider_id',
        'past',
        'cancelable'
      ],
      // PENDENCIA: Não esta retornando todos os agendamentos.
      // PENDENCIA: Esta retornando os agendamentos antigos.
      // limit: page,
      // offset: (page - 1) * 20, // Limita a pagina a listar os registros de 20 em 20
      order: ['date'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url']
            }
          ]
        }
      ]
    });

    return res.json(appointments);
  }

  async store(req, res) {
    // Schema validation usinf Yup
    const schema = Yup.object().shape({
      date: Yup.date().required(),
      provider_id: Yup.number().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ err: 'Validation fails!' });
    }

    const { provider_id, date } = req.body;

    /**
     * VERIFICAR se é realmente necessário
     * O provider_id não pode fazer agendamentos para ele mesmo.
     * Dica: o provider_id não pode ser o mesmo que esta logado no momento, ou seja, tem que ser diferente de req.userId
     */
    if (provider_id === res.userId) {
      return res
        .status(400)
        .json({ err: 'A Provider does not do appointments to thenself' });
    }

    // console.log(req.userId);

    const checkIfProvider = await User.findOne({
      where: { id: req.userId, provider: true }
    });
    if (checkIfProvider)
      // Se encontrou é porque o usuário logado é um provedor de serviços (provider), logo, não pode realisar agendamentos
      return res
        .status(401)
        .json({ err: 'Providers does not do appointments!' });

    // console.log(provider_id);
    // console.log(req.userId);

    /**
     * Check if provider_id has informed is a provider
     */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true }
    });

    if (!isProvider) {
      return res.status(401).json({ err: 'Provider not found' });
    }

    const hourStart = startOfHour(parseISO(date)); // Transforma em json e retorna somente a Hora (desconsiderando minutos e segundos na string)

    // Verifica se a data informada na requisição esta antes da data atual
    if (isBefore(hourStart, new Date())) {
      return res.status(401).json({ err: 'Past date not permitted' });
    }

    /**
     * Checar se o agendamento é possivel. Verifica se o prestador de serviço e horario ja não estão reservados
     */
    const isAppointmentsAvaliable = await Appointments.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart
      }
    });
    // Se encontrou o agendamento, então o prestador de serviços não esta disponivel no momento
    if (isAppointmentsAvaliable) {
      return res.status(400).json({ err: 'Date or provider is not avaliable' });
    }

    const insert = await Appointments.create({
      user_id: req.userId, // Retornado automaticamente do middleware de autenticação quando um usuário faz login
      date: hourStart,
      provider_id
    });

    /**
     * Notificar nosso prestador de serviços
     */
    const userNameProvider = await User.findByPk(req.userId);
    const formatedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm:'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo agendamento para ${userNameProvider.name} para ${formatedDate}`,
      user: provider_id
    });

    if (insert) {
      return res.json(insert);
    }

    return res.status(400).json({ err: 'Create error' });
  }

  async delete(req, res) {
    const appointment = await Appointments.findByPk(req.params.id, {
      include: [
        // Alem dos dados do appointment estou acrescentando os dados do prestador de serviços
        {
          model: User,
          as: 'provider', // Nome do relacionamento. Retorna os dados do provider (prestador de serviço)
          attributes: ['name', 'email']
        },
        {
          model: User,
          as: 'user', // Nome do relacionamento. Retorna os dados do usuário (que esta tentando cancelar o agendamento)
          attributes: ['name']
        }
      ]
    });

    if (!appointment)
      // Verifico se o Appointment informado existe
      return res.status(400).json({ err: 'Appointment not found' });

    /**
     * Rotina para deletar um agendamento ao menos duas horas do atendiemnto
     */
    // Verifico se o usuário logado é o dono do agendamento
    if (req.userId !== appointment.user_id)
      return res
        .status(401)
        .json({ err: "This appointment is not yours! You can't cancel it" });

    // return res.json(req.params.id);

    // Verificação de data
    // Para o cancelamento do Appointment, o pedido de cancelamento deve estar ao menos 2 horas antes do agendando
    const dateWithSub = subHours(appointment.date, 2); // Removo duas horas do horário que esta marcado o agendamento

    // Se o horário atual vier antes da data - 2 horas, significa que o horario limite para cancelar um agendamento ja passado, então não posso mais cancelar o agendamento
    if (isBefore(dateWithSub, new Date())) {
      return res
        .status(401)
        .json({ err: "You can't cancel this appointment. Date limit expired" });
    }

    appointment.canceled_at = new Date(); // Seta a hora atual dentro do campo canceled_at da tabela Appointments

    await appointment.save(); // Salva as alterações que foram setadas no ultimo comando acima (appointment.canceled_at = new Date();)

    /**
     * Envio de email notificando o cancelamento do Appointment para o prestador de serviços
     */
    await Queue.add(CancellatioMail.key, {
      appointment,
      teste: 'teste'
    }); // Chama a fila de para envio de confirmação de cancelamento de um appointment

    // await Mail.sendMail({
    //   to: `${appointment.provider.name} <${appointment.provider.email}>`,
    //   subject: 'Agendamento cancelado.',
    //   // text: 'Um agendamento foi cancelado.'
    //   template: 'cancellation',
    //   context: {
    //     provider: appointment.provider.name,
    //     user: appointment.user.name,
    //     date: format(appointment.date, "'dia' dd 'de' MMMM', às' H:mm:'h'", {
    //       locale: pt
    //     })
    //   }
    // });

    return res.json(appointment);
  }
}

export default new AppointmentController();
