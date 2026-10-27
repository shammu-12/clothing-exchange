const Clothing = require("../models/Clothing");

const BASE_VALUE = { Men: 700, Women: 800, Kids: 450, Unisex: 650 };
const CONDITION_MULTIPLIER = { New: 1, "Like New": 0.85, Good: 0.65, Used: 0.45 };

const normalizeLocationPoint = (point) => {
  const coordinates = point?.coordinates;
  if (point?.type !== "Point" || !Array.isArray(coordinates) || coordinates.length !== 2) return null;
  const [longitude, latitude] = coordinates.map(Number);
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude) || Math.abs(longitude) > 180 || Math.abs(latitude) > 90) return null;
  return { type: "Point", coordinates: [Number(longitude.toFixed(2)), Number(latitude.toFixed(2))] };
};

const calculateSwapValue = ({ category, condition, brand }) => {
  const base = BASE_VALUE[category] || 600;
  const multiplier = CONDITION_MULTIPLIER[condition] || 0.6;
  return Math.round((base * multiplier * (brand?.trim() ? 1.15 : 1)) / 50) * 50;
};

const includeEstimatedValue = (item) => {
  const listing = item.toObject ? item.toObject() : item;
  if (!listing.estimatedValue) listing.estimatedValue = calculateSwapValue(listing);
  return listing;
};

// ==========================================
// ADD CLOTHING
// ==========================================

const addClothing = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      size,
      condition,
      brand,
      color,
      location,
      locationPoint,
      image,
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !type ||
      !size ||
      !condition
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const normalizedLocationPoint = locationPoint ? normalizeLocationPoint(locationPoint) : undefined;
    if (locationPoint && !normalizedLocationPoint) {
      return res.status(400).json({ message: "Provide valid approximate location coordinates" });
    }

    const clothing = await Clothing.create({
      title,
      description,
      category,
      type,
      size,
      condition,
      brand,
      color,
      location,
      locationPoint: normalizedLocationPoint,
      image,
      estimatedValue: calculateSwapValue({ category, condition, brand }),
      owner: req.user.id,
      status: "Available",
    });

    res.status(201).json({
      message: "Clothing added successfully",
      clothing: includeEstimatedValue(clothing),
    });
  } catch (error) {
    console.error(
      "Add Clothing Error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// GET ALL CLOTHING
// ==========================================

const getAllClothing = async (req, res) => {
  try {
    const { search, category, type, size, condition, location, available, lat, lng, radiusKm } = req.query;
    const filters = {};
    let nearbySearch = false;
    if (category) filters.category = category;
    if (type) filters.type = new RegExp(type, "i");
    if (size) filters.size = size;
    if (condition) filters.condition = condition;
    if (location) filters.location = new RegExp(location, "i");
    if (available === "true") filters.status = "Available";
    if (lat !== undefined || lng !== undefined || radiusKm !== undefined) {
      const latitude = Number(lat);
      const longitude = Number(lng);
      const radius = Number(radiusKm);
      if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 || !Number.isFinite(longitude) || Math.abs(longitude) > 180 || !Number.isFinite(radius) || radius < 1 || radius > 100) {
        return res.status(400).json({ message: "Provide valid coordinates and a radius from 1 to 100 km" });
      }
      filters.locationPoint = { $near: { $geometry: { type: "Point", coordinates: [longitude, latitude] }, $maxDistance: radius * 1000 } };
      nearbySearch = true;
    }
    if (search) {
      const query = new RegExp(search, "i");
      filters.$or = [{ title: query }, { brand: query }, { type: query }, { description: query }];
    }

    let listingQuery = Clothing.find(filters).populate(
        "owner",
        "name location profileImage"
      );
    if (!nearbySearch) listingQuery = listingQuery.sort({ createdAt: -1 });
    const clothing = await listingQuery;

    res.status(200).json({
      count: clothing.length,
      clothing: clothing.map(includeEstimatedValue),
    });
  } catch (error) {
    console.error(
      "Get All Clothing Error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// GET MY CLOTHING
// ==========================================

const getMyClothing = async (req, res) => {
  try {
    const clothing = await Clothing.find({
      owner: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      count: clothing.length,
      clothing: clothing.map(includeEstimatedValue),
    });
  } catch (error) {
    console.error(
      "Get My Clothing Error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// GET SINGLE CLOTHING
// ==========================================

const getClothingById = async (req, res) => {
  try {
    const clothing =
      await Clothing.findById(req.params.id)
        .populate(
          "owner",
          "name location profileImage"
        );

    if (!clothing) {
      return res.status(404).json({
        message: "Clothing item not found",
      });
    }

    res.status(200).json({
      clothing: includeEstimatedValue(clothing),
    });
  } catch (error) {
    console.error(
      "Get Clothing Details Error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateClothing = async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id);
    if (!clothing) return res.status(404).json({ message: "Clothing item not found" });
    if (clothing.owner.toString() !== req.user.id) return res.status(403).json({ message: "You can only edit your own listings" });

    const allowedFields = ["title", "description", "category", "type", "size", "condition", "brand", "color", "location", "image", "status"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) clothing[field] = req.body[field];
    });
    if (req.body.locationPoint !== undefined) {
      if (req.body.locationPoint === null) clothing.locationPoint = undefined;
      else {
        const normalizedPoint = normalizeLocationPoint(req.body.locationPoint);
        if (!normalizedPoint) return res.status(400).json({ message: "Provide valid approximate location coordinates" });
        clothing.locationPoint = normalizedPoint;
      }
    }
    clothing.estimatedValue = calculateSwapValue(clothing);
    await clothing.save();
    res.json({ message: "Listing updated", clothing });
  } catch (error) {
    res.status(500).json({ message: "Unable to update listing" });
  }
};

const deleteClothing = async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id);
    if (!clothing) return res.status(404).json({ message: "Clothing item not found" });
    if (clothing.owner.toString() !== req.user.id) return res.status(403).json({ message: "You can only remove your own listings" });
    await clothing.deleteOne();
    res.json({ message: "Listing removed" });
  } catch (error) {
    res.status(500).json({ message: "Unable to remove listing" });
  }
};

// ==========================================
// MODULE EXPORTS
// ==========================================

module.exports = {
  addClothing,
  getAllClothing,
  getMyClothing,
  getClothingById,
  updateClothing,
  deleteClothing,
};
