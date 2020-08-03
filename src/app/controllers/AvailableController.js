import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter
} from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';

class AvailableController {
  // Responsavel por listar os horários disponíveis de provider em uma data específica.
  // Obs: providers also can consult providers free schedule.
  async index(req, res) {
    const { date } = req.query; // A data vem no formato Unix Timestamp. Esta formato pode ser simulado com new Date().getTime(); no consolog do Browser

    if (!date) {
      return res.status(400).json({ err: 'Date not informed!' });
    } // Verificar se a data foi informada

    const searchDate = Number(date); // A data informada deve estar em um formato numérico
    if (!searchDate) {
      return res.status(401).json({ err: 'Invalid format date!' });
    } // Verifica se a data informada esta no formato correto.

    // All appointmsnts not provider's canceled_at
    const appointmentsAvaiable = await Appointment.findAll({
      where: {
        provider_id: req.params.providerId, // Retornado via rota
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)]
        }
      }
    });

    if (!appointmentsAvaiable) {
      return res.status(400).json({ err: 'None appointment avaliable' });
    }

    /**
     * All schedule provider available
     */
    const schedule = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00'
    ];

    // Go through schedule array
    const avaliable = schedule.map(time => {
      const [hour, minute] = time.split(':'); // split schedule array in hour and minute

      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minute),
        0
      ); // 2020-03-17 08:00:00 for example

      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        avaliable:
          isAfter(value, new Date()) &&
          !appointmentsAvaiable.find(a => format(a.date, 'HH:mm') === time) // Verify if value is after now and appointments not found of appointments variable
      };
    });

    return res.json(avaliable);
  }
}

export default new AvailableController();
