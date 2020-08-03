// Classe responsável pelo upload de arquivos
// Biblioteca que trabalha com o MultiForm Part Data. Unica biblioteca que podemos usar para enviar arquivos
// Realiza o upload isolado
import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path'; // extname para retornar o nome do arquivo

export default {
  // O storage é o objeto de configuração do Multer. Pode-se gravar em CDN (Content Delivery Network)
  // Trabalha com duas variaveis: destination e filename
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);

        return cb(null, res.toString('hex') + extname(file.originalname));
      }); // Recebe um err ou uma resposta (res) caso tenha dado tudo certo
    } // Como vou formartar a imagem do meu cliente. Aqui podemos trabalhar na imagem. O req não esta sendo utilizado mas pode retornar todos os dados da requisição alem da imagem
  })
};
