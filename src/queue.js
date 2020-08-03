/** Separei a Queue para poder rodar em um servidor diferente
 * Assim a Queue nunca vai atralahar na performance do backend
 * Não vou executar a fila na mesma aplicação que estou rodando o backend.
 * Por que com isso posso rodas a fila em um server separado da minha aplicação (em um Core diferente com menos recursos por exemplo)
 * Assim a fila nunca vai influenciar no restante da aplicação */

import 'dotenv/config'; // Import all global variables
import Queue from './lib/Queue';

Queue.processQueue();
