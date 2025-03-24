import { v4 as uuidv4 } from 'uuid';
import QueueService, {QueueJobData } from './jobs/queue';
import { JobStatus, JobType } from './jobs/types';

const workerId = uuidv4();

const jobProcessors: { [key in JobType]: (data: any) => Promise<any> } = {
  [JobType.PROCESS_DATA]: async (data) => {
    // Simulate data processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      processed: true,
      result: `Processed data: ${JSON.stringify(data)}`
    };
  },

  [JobType.FILE_PROCESSING]: async (data) => {
    // Simulate file processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
      processed: true,
      originalSize: data.size,
      processedSize: Math.floor(data.size * 0.8)
    };
  },

  [JobType.DATA_ENRICHMENT]: async (data) => {
    // Simulate data enrichment
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      enriched: true,
      originalData: data,
      enrichedData: {
        ...data,
        enrichedAt: new Date(),
        enrichedBy: workerId
      }
    };
  },

  [JobType.TRANSACTION_VERIFICATION]: async (data) => {
    // Simulate transaction verification
    await new Promise(resolve => setTimeout(resolve, 2500));
    const isValid = Math.random() > 0.1; // 90% success rate
    if (!isValid) {
      throw new Error('Transaction verification failed');
    }
    return {
      verified: true,
      transactionId: data.transactionId,
      verificationTime: new Date()
    };
  },

  [JobType.COMPLEX_CALCULATION]: async (data) => {
    // Simulate complex calculation
    await new Promise(resolve => setTimeout(resolve, 4000));
    return {
      calculated: true,
      input: data.input,
      result: Math.pow(data.input, 2) * Math.PI
    };
  }
};

Object.values(JobType).forEach((type) => {
  const queue = QueueService.getQueue(type);
  if (!queue) return;

  queue.process(async (job) => {
    const { jobId, data } = job.data as QueueJobData;
    console.log(`Processing job ${jobId} of type ${type}`);

    // Process the job
    const processor = jobProcessors[type];
    const startTime = Date.now();
    const result = await processor(data);
    const processingTime = Date.now() - startTime;

    // Save the result in the bull queue
    console.log(`Job ${jobId} completed in ${processingTime}ms`);

    // Store the result in the job's return value
    // This will be available in the completed event and when fetching the job
    await job.update({
      ...job.data,
      result: result,
      processingTime: processingTime,
      completedAt: new Date()
    });

    // A custom event with the result can also be emitted if needed
    // queue.emit('job-result', {
    //   jobId,
    //   type,
    //   result,
    //   processingTime
    // });

    return result;
  });

  // Handle failed jobs
  queue.on('failed', async (job, error) => {
    console.error(`Job ${job.data.jobId} failed:`, error);

    // Update the job data in the Bull queue to mark it as failed
    if (job.attemptsMade >= job.opts.attempts) {
      await job.update({
        ...job.data,
        status: JobStatus.FAILED,
        error: `Max retries exceeded: ${error.message}`,
        failedAt: new Date()
      });

      console.log(`Job ${job.data.jobId} marked as failed after ${job.attemptsMade} attempts`);
    }
  });
});

console.log(`Worker ${workerId} started`);
