import express, { Request, Response , Application } from 'express';
import config from './config';

const app: Application = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});

app.post('/jobs', async (req, res) => {
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
