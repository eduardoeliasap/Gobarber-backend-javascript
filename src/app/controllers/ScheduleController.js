import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';
import User from '../models/User';

class ScheduleController {
  async index(req, res) {
    // Verifica se o provider logado é realmente um provider
    const checkUserProvider = await User.findOne({
      where: { id: req.userId, provider: true }
    });

    if (!checkUserProvider) {
      return res.status(401).json({ err: 'It is not a provider' });
    }

    const { date } = req.query;
    const parserdDate = parseISO(date);

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parserdDate), endOfDay(parserdDate)]
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attibuites: ['name']
        }
      ],
      order: ['date']
    });

    if (!appointments) {
      return res.status(401).json({ err: 'No one appointments found!' });
    }

    return res.json(appointments);
  }
}

export default new ScheduleController();
