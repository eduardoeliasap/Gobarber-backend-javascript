import User from '../models/User';
import File from '../models/File';

class ProviderController {
  async index(req, res) {
    // Retorna todos os usuários que são providers
    const providers = await User.findAll({
      where: { provider: true },
      attributes: ['id', 'name', 'email', 'avatar_id'], // Retorna apenas os campos desejados (de dentro da tabela User no caso)
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'] // Retorna apenas os campos desejados (de dentro da tabela da tabela File no caso)
        }
      ]
    });

    return res.json(providers);
  }
}

export default new ProviderController();
