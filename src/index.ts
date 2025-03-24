import express, { Request, Response , Application } from 'express';
import { v4 as uuidv4 } from 'uuid';
import QueueService from './jobs/queue';
import { JobType } from './jobs/types';
import config from './config';

const app: Application = express();

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
      jobId: uuidv4,
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
});

app.get('/jobs', async (req, res) => {
});

app.delete('/jobs/:jobId', async (req, res) => {
});

app.listen(config.server.port, () => {
  console.log(`Server at https://localhost:${config.server.port}`);
});
