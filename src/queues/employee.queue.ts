import { type Job, Queue, Worker } from 'bullmq';
import { redisClient } from '../database/redis.database';
import {
  EMPLOYEE_QUEUE_AUTORUN,
  EMPLOYEE_QUEUE_CONCURRENCY,
  EMPLOYEE_QUEUE_JOB_NAME,
  EMPLOYEE_QUEUE_NAME,
} from '../utils/consts/static.const';
import logger from '../utils/log.util';

const employeeQueue = new Queue(EMPLOYEE_QUEUE_NAME, {
  connection: redisClient,
});

const employeeWorker = new Worker(
  EMPLOYEE_QUEUE_NAME,
  async (job: Job) => {
    const response = await fetch(`https://api.github.com/users/codev911`);
    const data = await response.json();
    logger.info(`Processing job ${job.id} of type ${job.name}, ${data}`);
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

export async function addEmployeeJob(data: Record<string, unknown>): Promise<void> {
  await employeeQueue.add(EMPLOYEE_QUEUE_JOB_NAME, data, {
    removeOnComplete: true,
    removeOnFail: true,
  });
}
