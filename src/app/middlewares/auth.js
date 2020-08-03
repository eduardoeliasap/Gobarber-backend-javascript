// Verificação se o usuário esta logado.
// Utiliza o token do cliente por toda aplicação.

import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../../config/auth'; // Dentro deste arquivo esta o segredo do token. Necessário para saber se o token informado é válido

// O next é usado para determinar se a nossa aplicação vai continuar a execução do metodo
export default async (req, res, next) => {
  const authHeader = req.headers.authorization; // Essa é a forma de retornar o token do header

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  // console.log(authHeader);

  // Token exemplo: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsImlhdCI6MTU4MDk5NTg3OCwiZXhwIjoxNTgxNjAwNjc4fQ.YIyiNkpu8GTIMICkJW4M3pw84-EcDJrZeBmV8gpqS9E
  // O slit irá retorna uma array com duas possições.
  // A primeira contará a string 'Bearer' (da qual não necessito por isso posso usar apenas uma virgula de desistruturação)
  // O segundo é o token
  const [, token] = authHeader.split(' ');

  try {
    // o verifiy verifica se o token informado é valido utilizando-se do secret que esta dentro de config->auth.js
    // O promisty transforma a função sem a necessidade de callback
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    console.log(decoded);

    req.userId = decoded.id; // Coloco o id do usuário logado em uma variável chamda userId

    return next(); // Necessário para continuar executando o metodo
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid' });
  }
};
