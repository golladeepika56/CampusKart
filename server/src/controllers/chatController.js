import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

// GET /api/chats — all chats for the logged-in user
export const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name avatar')
      .populate('listing', 'title images price status')
      .sort({ lastMessageAt: -1 });
    res.json({ chats });
  } catch (err) {
    next(err);
  }
};

// POST /api/chats — start (or get existing) chat with a seller about a listing
export const startChat = async (req, res, next) => {
  try {
    const { listingId, otherUserId } = req.body;

    let chat = await Chat.findOne({
      listing: listingId,
      participants: { $all: [req.user._id, otherUserId] },
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user._id, otherUserId],
        listing: listingId,
      });
    }

    res.status(201).json({ chat });
  } catch (err) {
    next(err);
  }
};

// GET /api/chats/:id/messages
export const getMessages = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (!chat.participants.some((p) => String(p) === String(req.user._id))) {
      return res.status(403).json({ message: 'Not a participant of this chat' });
    }

    const messages = await Message.find({ chat: req.params.id }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

// POST /api/chats/:id/messages — REST fallback (primary path is the socket event)
export const sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (!chat.participants.some((p) => String(p) === String(req.user._id))) {
      return res.status(403).json({ message: 'Not a participant of this chat' });
    }

    const message = await Message.create({ chat: chat._id, sender: req.user._id, text });
    chat.lastMessageAt = new Date();
    await chat.save();

    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
};
