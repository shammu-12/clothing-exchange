const mongoose = require("mongoose");

const clothingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Men",
        "Women",
        "Kids",
        "Unisex",
      ],
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    size: {
      type: String,
      required: true,
      trim: true,
    },

    condition: {
      type: String,
      required: true,
      enum: [
        "New",
        "Like New",
        "Good",
        "Used",
      ],
    },

    brand: {
      type: String,
      default: "",
      trim: true,
    },

    color: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    // Coordinates are stored as an approximate GeoJSON point (rounded by the API).
    locationPoint: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: (coordinates) => !coordinates || coordinates.length === 2,
          message: "A location point must contain longitude and latitude",
        },
      },
    },

    image: {
      type: String,
      default: "",
    },

    estimatedValue: {
      type: Number,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "Available",
        "Swapped",
        "Reserved",
        "Removed",
      ],
      default: "Available",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

clothingSchema.index({ locationPoint: "2dsphere" });

module.exports = mongoose.model(
  "Clothing",
  clothingSchema
);
