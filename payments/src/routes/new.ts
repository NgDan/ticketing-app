import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Order } from '../models/order';
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
} from '@ng-ticketing-app/common';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    res.send({ success: true });
  }
);

export { router as createChargeRouter };
