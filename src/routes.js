import { Router } from 'express'; // Required to separate the routing portion from other files
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentsController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);
routes.post('/users', UserController.store);

/**
 * I can use authentication for each route (routes.put('/users', authMiddleware, UserController.update);)
 * or I can use it with global middleware.
 */

/**
 * The authentication middleware defined at this point will only work for routes after this declaration.
 * The routes defined above will not go through authentication.
 */
routes.use(authMiddleware);

// Below are the routes that come after authMiddleware, that is, they will go through authentication
routes.put('/users', UserController.update);

// upload.sigle('file) is middleware within the route responsible for sending only one file. File is the name of the field I want to send within the request
routes.post('/files', upload.single('file'), FileController.store);

routes.get('/providers', ProviderController.index);
routes.get('/providers/:providerId/available', AvailableController.index);

routes.get('/appointments', AppointmentsController.index);
routes.post('/appointments', AppointmentsController.store);
routes.delete('/appointments/:id', AppointmentsController.delete);

routes.get('/schedule', ScheduleController.index);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

// routes.get('/', async (req, res) => {
//   const user = await User.create({
//     name: 'Eduardo Elias',
//     email: 'eduardo.eliasap@gmail.com',
//     password_hash: '12345678'
//   });
//   return res.json(user);
//   // res.json({ Message: 'Olá' });
// });

// module.exports = routes;
export default routes; // I am using this syntax due to the installation of sucrase
