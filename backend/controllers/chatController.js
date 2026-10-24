const Message = require("../models/Message");
const SwapRequest = require("../models/SwapRequest");

const canAccessSwap = (swap, userId) =>
  swap.requester.toString() === userId || swap.owner.toString() === userId;

const getMessages = async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.swapId);
    if (!swap) return res.status(404).json({ message: "Swap request not found" });
    if (!canAccessSwap(swap, req.user.id)) return res.status(403).json({ message: "You cannot view this conversation" });

    const messages = await Message.find({ swapRequest: swap._id })
      .populate("sender", "name profileImage")
      .sort({ createdAt: 1 });
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Unable to load messages" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const body = req.body.body?.trim();
    if (!body) return res.status(400).json({ message: "A message is required" });

    const swap = await SwapRequest.findById(req.params.swapId);
    if (!swap) return res.status(404).json({ message: "Swap request not found" });
    if (!canAccessSwap(swap, req.user.id)) return res.status(403).json({ message: "You cannot send messages in this conversation" });

    const message = await Message.create({ swapRequest: swap._id, sender: req.user.id, body });
    await message.populate("sender", "name profileImage");
    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ message: "Unable to send message" });
  }
};

module.exports = { getMessages, sendMessage };
