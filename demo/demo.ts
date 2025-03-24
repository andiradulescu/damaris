import axios from 'axios';

interface Job {
  jobId: string;
  type: JobType;
  status: string;
  data: any;
  result?: any;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  workerId?: string;
  processingAttempts: number;
}

enum JobStatus {
  COMPLETED = 'completed',
  FAILED = 'failed'
}

enum JobType {
  PROCESS_DATA = 'process_data',
  FILE_PROCESSING = 'file_processing',
  DATA_ENRICHMENT = 'data_enrichment',
  TRANSACTION_VERIFICATION = 'transaction_verification',
  COMPLEX_CALCULATION = 'complex_calculation'
}

interface JobSubmission {
  type: JobType;
  data: any;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

const sampleJobs: JobSubmission[] = [
  {
    type: JobType.PROCESS_DATA,
    data: {
      input: 'Sample data to process',
      options: {}
    }
  },
  {
    type: JobType.FILE_PROCESSING,
    data: {
      filename: 'large_file.dat',
      size: 1024000,
      format: 'binary'
    }
  },
  {
    type: JobType.DATA_ENRICHMENT,
    data: {
      userId: 'user123',
      profile: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    }
  },
  {
    type: JobType.TRANSACTION_VERIFICATION,
    data: {
      transactionId: 'tx_123456',
      amount: 1000.00,
      currency: 'USD'
    }
  },
  {
    type: JobType.COMPLEX_CALCULATION,
    data: {
      input: 42,
      precision: 'high'
    }
  }
];

const port = process.env.PORT || 3000;

async function submitJob(job: JobSubmission): Promise<Job | null> {
  try {
    const response = await axios.post<ApiResponse<Job>>(`http://localhost:${port}/jobs`, job);
    return response.data.data;
  } catch (error) {
    console.error('Error submitting job:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

async function getJobStatus(jobId: string): Promise<Job | null> {
  try {
    const response = await axios.get<ApiResponse<Job>>(`http://localhost:${port}/jobs/${jobId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error getting job status:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

async function getJobsStats(): Promise<any> {
  try {
    const response = await axios.get<ApiResponse<any>>(`http://localhost:${port}/jobs/stats`);
    return response.data.data;
  } catch (error) {
    console.error('Error getting jobs stats:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

function printJobStatus(job: Job) {
  console.log('\nJob Status Updates:');
  console.log(`\nJob ID: ${job.jobId}`);
  console.log(`Type: ${job.type}`);
  console.log(`Status: ${job.status}`);
  console.log(`Created: ${new Date(job.createdAt).toLocaleString()}`);

  if (job.result) {
    console.log(`Result: ${JSON.stringify(job.result, null, 2)}`);
  }

  if (job.error) {
    console.log(`Error: ${job.error}`);
  }

  console.log('\n');
}

async function runDemo() {
  console.log('Starting DaMariS Demo...\n');

  const submittedJobs: Job[] = [];

  // Submit jobs
  for (const job of sampleJobs) {
    console.log(`Submitting ${job.type} job...`);
    const submittedJob = await submitJob(job);
    if (submittedJob) {
      submittedJobs.push(submittedJob);
    }
  }

  // Monitor job status
  let allJobsCompleted = false;
  while (!allJobsCompleted) {
    allJobsCompleted = true;

    for (const job of submittedJobs) {
      const status = await getJobStatus(job.jobId);
      if (status) {
        printJobStatus(status);
        if (status.status !== JobStatus.COMPLETED && status.status !== JobStatus.FAILED) {
          allJobsCompleted = false;
        }
      }
    }

    if (!allJobsCompleted) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('Demo completed!\n');
}

runDemo();
