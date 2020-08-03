import File from '../models/File';

class FileController {
  async store(req, res) {
    // Desistruturação para pegar alguns dados do req.file
    // Salvo como name e path (que são colunas no banco de dados) associando o originalname (retornado pelo req.file) com o campo name (do banco) por exemplo.
    const { originalname: name, filename: path } = req.file; // o file esta declarado dentro das rotas, no middleware adicional de uploads

    const file = await File.create({
      name,
      path
    });

    return res.json(file);
  }
}

export default new FileController();
