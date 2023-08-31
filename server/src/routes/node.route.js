import { getNodeStatus, handleRoarMessage } from '../controllers/node.controller';
import catchAsync from '../utils/catchAsync';
import { Router } from 'express';

const router = Router();

router.get('/nodes/status', catchAsync(getNodeStatus));
router.post('/roar/:id', catchAsync(handleRoarMessage));

export default router;
