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
}

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000'),
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  }
};

export default config;
