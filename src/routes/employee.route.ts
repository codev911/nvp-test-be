import { Router } from 'express';
import { add, addFromCSV, getDataEmp, remove, update } from '../controllers/employee.controller';

const appRouter = Router();

appRouter.get('/data', getDataEmp);
appRouter.post('/add/csv', addFromCSV);
appRouter.post('/add', add);
appRouter.patch('/update', update);
appRouter.delete('/remove', remove);

export default appRouter;
