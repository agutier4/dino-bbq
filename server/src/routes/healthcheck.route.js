import { healthcheck } from '../controllers/healthcheck.controller';
import catchAsync from '../utils/catchAsync';
import { Router } from 'express';

const router = Router();

router.get('/healthcheck', catchAsync(healthcheck));

export default router;
