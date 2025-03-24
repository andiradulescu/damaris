import express, { Request, Response , Application } from 'express';
import { v4 as uuidv4 } from 'uuid';
import QueueService from './jobs/queue';
import { JobType } from './jobs/types';
import config from './config';

const app: Application = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});

app.post('/jobs', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (!type || !Object.values(JobType).includes(type)) {
      res.status(400).json({
        success: false,
        message: 'Invalid job type'
      });
      return;
    }

    const job = await QueueService.addJob(type as JobType, {
      jobId: uuidv4(),
      ...data
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: {
        jobId: job.data.jobId,
        type: job.data.type,
        status: job.data.data.status,
        createdAt: job.data.data.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job'
    });
  }
});

app.get('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
      return;
    }

    // Try to find the job in any of the queues
    let foundJob = null;
    for (const type of Object.values(JobType)) {
      const queue = QueueService.getQueue(type);
      if (!queue) continue;

      // Try to get the job by ID from this queue
      const job = await queue.getJob(jobId);

      if (job) {
        // Check if this is the job we're looking for by matching jobId in the data
        if (job.data.jobId === jobId) {
          foundJob = job;
          break;
        }
      }
    }

    if (!foundJob) {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      });
      return
    }

    // Get job state
    const state = await foundJob.getState();

    // Return job details
    res.json({
      success: true,
      data: {
        jobId: foundJob.data.jobId,
        type: foundJob.data.type,
        status: state,
        data: foundJob.data.data,
        result: foundJob.data.result,
        createdAt: foundJob.data.createdAt,
        completedAt: foundJob.data.completedAt,
        processingTime: foundJob.data.processingTime
      }
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job'
    });
  }
});

app.get('/jobs', async (req, res) => {
});

app.delete('/jobs/:jobId', async (req, res) => {
});

app.listen(config.server.port, () => {
  console.log(`Server at https://localhost:${config.server.port}`);
});
