import express from 'express';
import { deleteMessage, getConversations, getMessages, sendMessage, startConversationByUsername } from '../controllers/messagesController';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware,
    (req, res) => { getMessages(req as any as AuthRequest, res); });
router.post('/', authMiddleware,
    (req, res) => { sendMessage(req as any as AuthRequest, res); });
router.delete('/:messageId', authMiddleware,
    (req, res) => { deleteMessage(req as any as AuthRequest, res); });

router.get('/conversations', authMiddleware,
    (req, res) => { getConversations(req as any as AuthRequest, res); });
router.post('/conversations', authMiddleware,
    (req, res) => { startConversationByUsername(req as any as AuthRequest, res); });

export default router;
