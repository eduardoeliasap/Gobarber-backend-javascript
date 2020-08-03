import Bee from 'bee-queue';
import CancellationMail from '../app/jobs/CancellationMail'; // Jobs que será utilizado para envio de emails
import redisConfig from '../config/redis'; // Configuração do redis

// Sempre que eu tiver um novo Job para ser executado eu declaro neste array para serem processados
const jobs = [CancellationMail]; // Array de jobs. Cada diferente Job deve ser declarado aqui.

// Vamos construir uma fila para cada background job que desejamos na minha aplicação.
class Queue {
  constructor() {
    // Nesta classe, estou pegando todos os meu jobs e armazenando dentro da variável queue
    this.queues = {};

    // Usado para dividir a inicialização (das filas neste caso) em outro mêtodo
    this.init();
  }

  init() {
    // forEach para ler todos os jobs que estão no array
    // key e handle são propriedades dentro do CancellationMail
    jobs.forEach(({ key, handle }) => {
      // O queues deve ser setado com uma chave (a variavel key neste caso). Em seguida deve ser passado o Bee
      this.queues[key] = {
        // O Bee possui dois parâmatros: Chave e como segundo parametro precisso passa algumas configurações (configurações do redis neste caso)
        bee: new Bee(key, {
          redis: redisConfig
        }),
        handle // o handle é quem vai processar os jobs. E quem recebe os dados do appointment neste contexto
      };
    });
  }

  // Mêtodo para adcionar novos trabalhos dentro de cada fila
  // queue refere-se a qual fila eu quero adicionar um novo trabalho
  // job são os dados do job em si.
  // Até este momento não estou processando a fila
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  // Necessário para processar as filas
  // Toda vez que tivermos uma adição de um novo processo, o processQueue irá processa-lo
  processQueue() {
    // Vou percorrer cada um dos jobs e buscar um bee e um handle da fila relacionada com o job
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      // on() para ouvir o evento e ver se retornou alguma falha
      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  // Função que trata as falhas caso ocorram na execução do job
  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();

/** Passo a passo
 * 1 - Pego todos os jobs e armazeno dentro da fila (queue)
 * 2 - No processQueue armazeno nossa fila com as informações do banco não-relacional (redis) e armazeno o handle (metodo que vai processar nosso job)
 * */
