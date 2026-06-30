const Message = require("../models/Message");

// POST /api/messages  (public - the Contact page)
const createMessage = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email and message are required." });
    }

    const newMessage = await Message.create({ name, email, message });

    res.status(201).json({
      status: "✨ Your message has been sent to the Hub. We'll be in touch soon!",
      data: newMessage,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/messages  (admin only)
const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

module.exports = { createMessage, getMessages };
