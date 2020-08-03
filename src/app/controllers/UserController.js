// Todo User controller seguirá esse padrão
// class UserController {

// }

// exports default new UserController();
import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';

class UserController {
  // Toda função dentro da classe terá a estrutura dos Middlewares (com req e res e deve retornar algo no formato de JSON).
  async store(req, res) {
    // User Validation using Yup Schema Validation
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6)
    });

    // I passed my req.body and verify if data is valid using Schema declared above
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails!' });
    }

    const nameExists = await User.findOne({
      where: { name: req.body.name }
    });

    // console.log(nameExists);

    if (nameExists) {
      return res.status(400).json({ erro: 'User already exists.' });
    }

    // Verifica se o email informado ja esta cadastrado no banco
    const emailExists = await User.findOne({
      where: { email: req.body.email }
    });

    if (emailExists) {
      // Caso o usuário informado ja existir eu bloqueio o fluxo de processamento do controller com o return res.status()
      return res.status(400).json({ erro: 'Email already exists.' });
    }

    // Não preciso separar todos os campos que vem no req.body pois ja é definido dentro da model User.
    // Caso o req.body retorne outros campos alem dos que estão declarados no model User, serão desconciderados
    // const user = User.create(req.body);

    const { id, name, email } = User.create(req.body);

    // return res.json(user); retorno todos os campos retornados pelo req.body

    // retorno apenas os campos que me interessa, que vieram do req.body.
    return res.json({
      id,
      name,
      email
    });
  }

  // Update Method
  async update(req, res) {
    // console.log(req.userId); // A variável userId esta vindo no metodo auth. É o id do usuário que esta logado.

    // User Validation using Yup Schema Validation
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (confirmPassword, field) =>
        confirmPassword ? field.required().oneOf([Yup.ref('password')]) : field
      )
    });

    // I passed my req.body and verify if data is valid using Schema declared above
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails!' });
    }

    const { oldPassword } = req.body;

    // Find by PrimaryKey
    const user = await User.findOne({
      where: { id: req.userId }
    });

    // return res.json(req.userId);

    // console.log(user);

    // Se o email informado na requisição for diferente do email cadastrado no banco, faço a alteração do email;
    // if (email !== user.email) {
    //   // Verificar se o novo email informado ja não existe no banco
    //   const emailExists = await User.findOne({ where: { email } });
    //   if (emailExists) {
    //     return res.status(401).json({ error: 'Email already exists!' });
    //   }
    // }

    // if (name !== user.name) {
    //   const nameExists = await User.findOne({ where: { name } });

    //   if (nameExists) {
    //     return res.status(401).json({ error: 'Name already exists!' });
    //   }
    // }

    // Verificar se o password informado na requisição confere com o password no banco para este usuário
    // Mas apenas vou trocar a senha se o usuário passou a antiga senha pela requisição
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match!' });
    }

    // return res.json({ Message: 'ok' });

    await user.update(req.body);

    const { id, name, avatar, email } = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url']
        }
      ]
    });

    return res.json({
      id,
      name,
      email,
      avatar
    });
  }
}

export default new UserController();
