import Queue from 'bull';
import config from '../config';
import { JobType, JobData } from './types';

const queueConfig = {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    db: config.redis.db
  },
  defaultJobOptions: {
    attempts: config.maxJobRetries,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    // Persist all jobs
    removeOnComplete: false,
    removeOnFail: false
  }
};

const queues: { [key in JobType]?: Queue.Queue } = {};

Object.values(JobType).forEach((type) => {
  queues[type] = new Queue(type, queueConfig);
});

export interface QueueJobData {
  type: JobType;
  data: JobData;
}

export class QueueService {
  static async addJob(type: JobType, data: JobData): Promise<Queue.Job<QueueJobData>> {
    const queue = queues[type];
    if (!queue) {
      throw new Error(`Queue not found for job type: ${type}`);
    }

    return queue.add({
      type,
      data
    });
  }

  static getQueue(type: JobType): Queue.Queue | undefined {
    return queues[type];
  }
}

export default QueueService;
