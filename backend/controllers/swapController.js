const SwapRequest = require("../models/SwapRequest");
const Clothing = require("../models/Clothing");

// ==========================================
// SEND SWAP REQUEST
// ==========================================

const createSwapRequest = async (req, res) => {
  try {
    const { clothingId, offeredClothingId, message } = req.body;

    if (!clothingId) {
      return res.status(400).json({
        message: "Clothing ID is required",
      });
    }

    const clothing = await Clothing.findById(
      clothingId
    );

    if (!clothing) {
      return res.status(404).json({
        message: "Clothing item not found",
      });
    }

    if (clothing.status !== "Available") {
      return res.status(409).json({ message: "This clothing item is no longer available" });
    }

    if (!offeredClothingId || offeredClothingId === clothingId) {
      return res.status(400).json({ message: "Choose a different clothing item from your wardrobe to offer" });
    }

    const offeredClothing = await Clothing.findById(offeredClothingId);
    if (!offeredClothing || offeredClothing.owner.toString() !== req.user.id) {
      return res.status(404).json({ message: "The clothing item you selected was not found in your wardrobe" });
    }
    if (offeredClothing.status !== "Available") {
      return res.status(409).json({ message: "Your offered clothing item is no longer available" });
    }

    // Cannot request your own clothing
    if (
      clothing.owner.toString() ===
      req.user.id
    ) {
      return res.status(400).json({
        message:
          "You cannot send a swap request for your own item",
      });
    }

    // Check existing request
    const existingRequest =
      await SwapRequest.findOne({
        clothing: clothingId,
        requester: req.user.id,
        status: "Pending",
      });

    if (existingRequest) {
      return res.status(400).json({
        message:
          "You already have a pending request for this item",
      });
    }

    const request = await SwapRequest.create({
      clothing: clothingId,
      offeredClothing: offeredClothingId,
      requester: req.user.id,
      owner: clothing.owner,
      message: message || "",
    });

    const populatedRequest =
      await SwapRequest.findById(
        request._id
      )
        .populate(
          "clothing",
          "title image category size condition brand type estimatedValue"
        )
        .populate(
          "offeredClothing",
          "title image category size condition brand type estimatedValue"
        )
        .populate(
          "requester",
          "name location profileImage"
        )
        .populate(
          "owner",
          "name location profileImage"
        );

    res.status(201).json({
      message:
        "Swap request sent successfully",
      request: populatedRequest,
    });
  } catch (error) {
    console.error(
      "Create Swap Request Error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// MY SENT REQUESTS
// ==========================================

const getMySentRequests = async (
  req,
  res
) => {
  try {
    const requests =
      await SwapRequest.find({
        requester: req.user.id,
      })
        .populate(
          "clothing",
          "title image category size condition status brand type estimatedValue"
        )
        .populate(
          "offeredClothing",
          "title image category size condition status brand type estimatedValue"
        )
        .populate(
          "owner",
          "name location profileImage"
        )
        .sort({ createdAt: -1 });

    res.status(200).json({
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error(
      "Sent Requests Error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// REQUESTS RECEIVED BY ME
// ==========================================

const getReceivedRequests = async (
  req,
  res
) => {
  try {
    const requests =
      await SwapRequest.find({
        owner: req.user.id,
      })
        .populate(
          "clothing",
          "title image category size condition status brand type estimatedValue"
        )
        .populate(
          "offeredClothing",
          "title image category size condition status brand type estimatedValue"
        )
        .populate(
          "requester",
          "name location profileImage"
        )
        .sort({ createdAt: -1 });

    res.status(200).json({
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error(
      "Received Requests Error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getSwapDetails = async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id)
      .populate("clothing", "title image location estimatedValue")
      .populate("offeredClothing", "title image location estimatedValue")
      .populate("requester", "name location profileImage")
      .populate("owner", "name location profileImage")
      .populate("shipments.sender", "name");
    if (!request) return res.status(404).json({ message: "Swap request not found" });
    if (request.requester._id.toString() !== req.user.id && request.owner._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "You cannot view this swap" });
    }
    res.json({ request });
  } catch (error) {
    res.status(500).json({ message: "Unable to load swap details" });
  }
};

const updateSwapShipping = async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Swap request not found" });
    const userId = req.user.id;
    if (request.requester.toString() !== userId && request.owner.toString() !== userId) {
      return res.status(403).json({ message: "Only swap participants can update delivery details" });
    }
    if (request.status !== "Accepted") {
      return res.status(409).json({ message: "Delivery details are available after a swap is accepted" });
    }

    const { deliveryMode, carrier, trackingNumber, trackingUrl, status } = req.body;
    if (deliveryMode !== undefined && !["Local", "Remote"].includes(deliveryMode)) {
      return res.status(400).json({ message: "Delivery mode must be Local or Remote" });
    }
    if (deliveryMode) request.deliveryMode = deliveryMode;
    if (request.deliveryMode === "Remote" && [carrier, trackingNumber, trackingUrl, status].some((value) => value !== undefined)) {
      let shipment = request.shipments.find((item) => item.sender.toString() === userId);
      if (!shipment) {
        if (!carrier?.trim()) return res.status(400).json({ message: "Choose a courier before saving shipment details" });
        request.shipments.push({ sender: userId, carrier: carrier.trim(), trackingNumber: trackingNumber?.trim() || "" });
        shipment = request.shipments[request.shipments.length - 1];
      }
      if (carrier !== undefined) {
        if (!carrier.trim()) return res.status(400).json({ message: "Courier name cannot be empty" });
        shipment.carrier = carrier.trim().slice(0, 80);
      }
      if (trackingNumber !== undefined) shipment.trackingNumber = trackingNumber.trim().slice(0, 120);
      if (trackingUrl !== undefined) {
        const cleanUrl = trackingUrl.trim();
        if (cleanUrl) {
          try {
            const parsedUrl = new URL(cleanUrl);
            if (parsedUrl.protocol !== "https:" || parsedUrl.username || parsedUrl.password) throw new Error("https");
          }
          catch { return res.status(400).json({ message: "Tracking links must be valid HTTPS URLs" }); }
        }
        shipment.trackingUrl = cleanUrl.slice(0, 500);
      }
      if (status !== undefined) {
        const states = ["Preparing", "Label created", "In transit", "Delivered"];
        if (!states.includes(status)) return res.status(400).json({ message: "Choose a valid shipment status" });
        shipment.status = status;
      }
    }
    await request.save();
    await request.populate("shipments.sender", "name");
    res.json({ message: "Delivery details updated", request });
  } catch (error) {
    res.status(500).json({ message: "Unable to update delivery details" });
  }
};

// ==========================================
// UPDATE REQUEST STATUS
// ==========================================

const updateSwapRequest = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Accepted or Rejected",
      });
    }

    const request =
      await SwapRequest.findById(
        req.params.id
      );

    if (!request) {
      return res.status(404).json({
        message: "Swap request not found",
      });
    }

    // Only the owner can accept or reject a pending request.
    if (request.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message:
          "You are not authorized to update this request",
      });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({ message: "This request has already been decided" });
    }

    if (status === "Accepted") {
      if (request.offeredClothing) {
        const offeredReserved = await Clothing.findOneAndUpdate(
          { _id: request.offeredClothing, owner: req.user.id, status: "Available" },
          { status: "Reserved" },
          { new: true }
        );
        if (!offeredReserved) return res.status(409).json({ message: "The offered item is no longer available" });
      }
      const reserved = await Clothing.findOneAndUpdate(
        { _id: request.clothing, status: "Available" },
        { status: "Reserved" },
        { new: true }
      );
      if (!reserved) {
        if (request.offeredClothing) {
          await Clothing.findOneAndUpdate({ _id: request.offeredClothing, status: "Reserved" }, { status: "Available" });
        }
        return res.status(409).json({ message: "This item is no longer available to swap" });
      }
    }

    request.status = status;
    await request.save();

    if (status === "Accepted") {
      await SwapRequest.updateMany(
        { $or: [{ clothing: request.clothing }, { offeredClothing: request.clothing }, ...(request.offeredClothing ? [{ clothing: request.offeredClothing }, { offeredClothing: request.offeredClothing }] : [])], _id: { $ne: request._id }, status: "Pending" },
        { status: "Rejected" }
      );
    }

    res.status(200).json({
      message:
        `Swap request ${status.toLowerCase()} successfully`,
      request,
    });
  } catch (error) {
    console.error(
      "Update Swap Request Error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

const confirmSwapCompletion = async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Swap request not found" });
    const userId = req.user.id;
    if (request.requester.toString() !== userId && request.owner.toString() !== userId) {
      return res.status(403).json({ message: "Only swap participants can confirm completion" });
    }
    if (request.status !== "Accepted") return res.status(409).json({ message: "Only an accepted swap can be confirmed" });
    if (!request.completionConfirmations.some((id) => id.toString() === userId)) {
      request.completionConfirmations.push(userId);
    }

    if (request.completionConfirmations.length >= 2) {
      const listingIds = [request.clothing, request.offeredClothing].filter(Boolean);
      const reservedCount = await Clothing.countDocuments({ _id: { $in: listingIds }, status: "Reserved" });
      if (reservedCount !== listingIds.length) {
        return res.status(409).json({ message: "A listing is no longer reserved for this swap. Contact support." });
      }
      const result = await Clothing.updateMany({ _id: { $in: listingIds }, status: "Reserved" }, { $set: { status: "Swapped" } });
      if (result.modifiedCount !== listingIds.length) {
        return res.status(409).json({ message: "A listing is no longer reserved for this swap. Contact support." });
      }
      request.status = "Completed";
      request.completedAt = new Date();
    }
    await request.save();
    res.json({ message: request.status === "Completed" ? "Both members confirmed. Swap completed." : "Your confirmation is recorded. The swap will complete when the other member confirms.", request });
  } catch (error) {
    console.error("Confirm Swap Completion Error:", error);
    res.status(500).json({ message: "Unable to confirm swap completion" });
  }
};

module.exports = {
  createSwapRequest,
  getMySentRequests,
  getReceivedRequests,
  updateSwapRequest,
  getSwapDetails,
  updateSwapShipping,
  confirmSwapCompletion,
};
