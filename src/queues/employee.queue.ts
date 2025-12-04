import { type Job, Queue, Worker } from 'bullmq';
import { redisClient } from '../database/redis.database';
import { employee } from '../database/schemas/employee.schema';
import {
  EMPLOYEE_QUEUE_AUTORUN,
  EMPLOYEE_QUEUE_CONCURRENCY,
  EMPLOYEE_QUEUE_JOB_NAME,
  EMPLOYEE_QUEUE_NAME,
} from '../utils/consts/static.const';
import { QueueActionEnum } from '../utils/enums/queue-action.enum';
import type { IEmployeeQueue } from '../utils/interfaces/schemas/employee-schema.interface';
import logger from '../utils/log.util';

const employeeQueue = new Queue(EMPLOYEE_QUEUE_NAME, {
  connection: redisClient,
});

const employeeWorker = new Worker(
  EMPLOYEE_QUEUE_NAME,
  async (job: Job) => {
    logger.info(`Start job ID: ${job.id}`);
    const { action, id, name, age, position, salary } = job.data;

    switch (action) {
      case QueueActionEnum.INSERT:
        logger.info(`Processing job ID: ${job.id} - Inserting employee ${name}`);
        await employee.create({ name, age, position, salary });
        break;
      case QueueActionEnum.UPDATE:
        logger.info(`Processing job ID: ${job.id} - Update employee ${id}`);
        await employee.findByIdAndUpdate(id, {
          ...(name && { name }),
          ...(age && { age }),
          ...(position && { position }),
          ...(salary && { salary }),
        });
        break;
      case QueueActionEnum.DELETE:
        logger.info(`Processing job ID: ${job.id} - Delete employee ${id}`);
        await employee.findByIdAndDelete(id);
        break;
    }
  },
  {
    connection: redisClient,
    concurrency: EMPLOYEE_QUEUE_CONCURRENCY,
    autorun: EMPLOYEE_QUEUE_AUTORUN,
  },
);
employeeWorker.on('completed', (job: Job) => {
  logger.info(`Job ${job.id} has been completed`);
});
employeeWorker.on('failed', (job: Job | undefined, err: Error, _prev: string) => {
  logger.error(`Job ${job?.id} has failed with error ${err.message}`);
});

export async function addEmployeeJob(data: IEmployeeQueue): Promise<void> {
  await employeeQueue.add(EMPLOYEE_QUEUE_JOB_NAME, data, {
    removeOnComplete: true,
    removeOnFail: true,
  });
}
