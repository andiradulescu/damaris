import Queue from 'bull';
import { v4 as uuidv4 } from 'uuid';
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
  createdAt: string;
}

export class QueueService {
  static async addJob(type: JobType, data: JobData): Promise<Queue.Job<QueueJobData>> {
    const queue = queues[type];
    if (!queue) {
      throw new Error(`Queue not found for job type: ${type}`);
    }

    return queue.add({
      type,
      data,
      createdAt: new Date(),
    }, {
      jobId: uuidv4(),
    });
  }

  static getQueue(type: JobType): Queue.Queue | undefined {
    return queues[type];
  }

  static async getJobCounts(): Promise<{ [key in JobType]?: Queue.JobCounts }> {
    const counts: { [key in JobType]?: Queue.JobCounts } = {};

    for (const type of Object.values(JobType)) {
      const queue = queues[type];
      if (queue) {
        counts[type] = await queue.getJobCounts();
      }
    }

    return counts;
  }
}

export default QueueService;
