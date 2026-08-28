import { Router, type Request, type Response } from 'express';

const healthRouter: Router = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

export { healthRouter };

