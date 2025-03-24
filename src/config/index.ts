import dotenv from 'dotenv';

dotenv.config();

interface Config {
  server: {
    port: number;
  };
  redis: {
    host: string;
    port: number;
    db?: number;
    password?: string;
    tls?: any;
  };
  maxJobRetries: number;
}

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000'),
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    db: parseInt(process.env.REDIS_DB || '0')
  },
  maxJobRetries: parseInt(process.env.MAX_JOB_RETRIES || '3'),
};

export default config;
