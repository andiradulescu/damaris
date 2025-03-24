import express, { Request, Response , Application } from 'express';
import QueueService from './jobs/queue';
import { JobType } from './jobs/types';
import { JobStatus } from 'bull';
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

    const job = await QueueService.addJob(type as JobType, data);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: {
        jobId: job.id,
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
      if (!queue) {
        continue;
      }

      // Try to get the job by ID from this queue
      const job = await queue.getJob(jobId);

      if (job) {
        foundJob = job;
        break;
      }
    }

    if (!foundJob) {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      });
      return;
    }

    // Get job state
    const state = await foundJob.getState();

    // Return job details
    res.json({
      success: true,
      data: {
        jobId: foundJob.id,
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
  try {
    const { type, status, limit = '10', offset = '0' } = req.query;
    const parsedLimit = parseInt(limit as string);
    const parsedOffset = parseInt(offset as string);

    if (isNaN(parsedLimit) || isNaN(parsedOffset)) {
      res.status(400).json({
        success: false,
        message: 'Invalid limit or offset parameters'
      });
      return;
    }

    let jobs = [];
    const jobTypes = type ? [type as JobType] : Object.values(JobType);

    for (const jobType of jobTypes) {
      const queue = QueueService.getQueue(jobType);
      if (!queue) {
        continue;
      }

      const queueJobs = await queue.getJobs([status as JobStatus], parsedOffset, parsedOffset + parsedLimit - 1);
      jobs = jobs.concat(queueJobs);
    }

    const formattedJobs = jobs.map(job => ({
      jobId: job.id,
      type: job.data.type,
      status: job.data.data.status,
      data: job.data.data,
      createdAt: job.data.data.createdAt,
      completedAt: job.data.data.completedAt
    }));

    res.json({
      success: true,
      data: formattedJobs,
      pagination: {
        limit: parsedLimit,
        offset: parsedOffset,
        total: jobs.length
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs'
    });
  }
});

app.delete('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
      return;
    }

    // Try to find and remove the job from any of the queues
    let removed = false;
    for (const type of Object.values(JobType)) {
      const queue = QueueService.getQueue(type);
      if (!queue) {
        continue;
      }

      const job = await queue.getJob(jobId);
      if (job) {
        await job.remove();
        removed = true;
        break;
      }
    }

    if (!removed) {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job'
    });
  }
});

app.listen(config.server.port, () => {
  console.log(`Server at https://localhost:${config.server.port}`);
});
