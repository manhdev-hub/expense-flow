import { app } from './app.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

app.listen(PORT, () => {
  console.log(`[ExpenseFlow API] Server listening on http://localhost:${PORT}`);
});

