import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';

import auth from '../../config/auth';

class SessionController {
  async store(req, res) {
    // Validation Yup Schema Validation
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required()
    });

    if (!(await schema.isType(req.body))) {
      res.status(400).json({ error: 'Validation fails!' });
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url']
        }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    // Caso chegou até aqui é porque o email existe e o password confere.
    const { id, name, avatar, provider } = user; // Estou retornando o id e o nome do usuário que foi autenticado

    return res.json({
      user: {
        id,
        name,
        email,
        provider,
        avatar
      },
      token: jwt.sign({ id }, auth.secret, {
        expiresIn: auth.expiresIn
      }) // Gero token, inserindo o id do usuário no payload do token. Payload são as informações adcionais no token
    });
  }
}

export default new SessionController();
