import express from 'express';
import { getChats, startChat, getMessages, sendMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getChats);
router.post('/', protect, startChat);
router.get('/:id/messages', protect, getMessages);
router.post('/:id/messages', protect, sendMessage);

export default router;
