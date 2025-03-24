import express, { Request, Response , Application } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

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

app.listen(port, () => {
  console.log(`Server at https://localhost:${port}`);
});
