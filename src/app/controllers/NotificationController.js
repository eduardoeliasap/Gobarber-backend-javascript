import Notification from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    const checkIsProvider = await User.findOne({
      where: { id: req.userId, provider: true } // Verifico se o usuário logado é um prestador de serviços
    });

    // return res.json(checkIsProvider);

    if (!checkIsProvider)
      return res.status(400).json({ err: 'You are not a provider' });

    /**
     * Listar notificações
     */
    const notifications = await Notification.find({
      user: req.userId
    })
      // .sort('createdAt')
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }

  async update(req, res) {
    const notification = await Notification.findById(req.params.id);

    if (!notification)
      return res.status(401).json({ err: 'Notification not found' });

    // Opção do Mongoose que acha o registra e ja o atualiza.
    // O req.params.id é o id a ser localizado; read: true estou atribuindo o valor true para o campo read;
    // new: true retorna o documento atualizado. Se não usar new: true o Mongoose vai atualizar o registro mas não vai me retornar nada
    const notificationResult = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true }
      // { new: true }
    );

    const notificationUpdated = await Notification.findById(req.params.id);
    return res.json(notificationUpdated);
  }
}

export default new NotificationController();
