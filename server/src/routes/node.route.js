import { getNodeStatus, handleRoarMessage, handleRoarAllMessage } from '../controllers/node.controller';
import catchAsync from '../utils/catchAsync';
import { Router } from 'express';

const router = Router();

router.get('/nodes/status', catchAsync(getNodeStatus));
router.get('/roar/:id', catchAsync(handleRoarMessage));
router.post('/roar/:id', catchAsync(handleRoarMessage));
router.post('/roar-all', catchAsync(handleRoarAllMessage));

export default router;
