const CommunityPost = require("../models/CommunityPost");
const Clothing = require("../models/Clothing");
const SwapRequest = require("../models/SwapRequest");
const User = require("../models/User");

const getCommunity = async (req, res) => {
  try {
    const filter = req.query.topic && req.query.topic !== "All" ? { topic: req.query.topic } : {};
    const [posts, members, piecesShared, completedSwaps] = await Promise.all([
      CommunityPost.find(filter).populate("author", "name profileImage location").sort({ createdAt: -1 }).limit(50),
      User.countDocuments(),
      Clothing.countDocuments({ status: "Swapped" }),
      SwapRequest.countDocuments({ status: "Completed" }),
    ]);
    res.json({ posts, impact: { members, piecesShared, completedSwaps } });
  } catch (error) {
    res.status(500).json({ message: "Unable to load the community" });
  }
};

const createCommunityPost = async (req, res) => {
  try {
    const { topic, body } = req.body;
    const topics = ["Swap story", "Care & repair", "Slow fashion"];
    const cleanBody = typeof body === "string" ? body.trim() : "";
    if (!topics.includes(topic)) return res.status(400).json({ message: "Choose a community topic" });
    if (cleanBody.length < 8 || cleanBody.length > 1000) return res.status(400).json({ message: "Write between 8 and 1,000 characters" });
    const post = await CommunityPost.create({ author: req.user.id, topic, body: cleanBody });
    await post.populate("author", "name profileImage location");
    res.status(201).json({ post });
  } catch (error) {
    res.status(500).json({ message: "Unable to share your post" });
  }
};

const toggleLike = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Community post not found" });
    const alreadyLiked = post.likes.some((id) => id.toString() === req.user.id);
    await CommunityPost.updateOne({ _id: post._id }, alreadyLiked ? { $pull: { likes: req.user.id } } : { $addToSet: { likes: req.user.id } });
    const updated = await CommunityPost.findById(post._id).populate("author", "name profileImage location");
    res.json({ post: updated });
  } catch (error) {
    res.status(500).json({ message: "Unable to update your reaction" });
  }
};

const deleteCommunityPost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Community post not found" });
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") return res.status(403).json({ message: "You can only remove your own post" });
    await post.deleteOne();
    res.json({ message: "Community post removed" });
  } catch (error) {
    res.status(500).json({ message: "Unable to remove the post" });
  }
};

module.exports = { getCommunity, createCommunityPost, toggleLike, deleteCommunityPost };
