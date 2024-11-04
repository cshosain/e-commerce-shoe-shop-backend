const mongoose = require("mongoose");

const shoesSchema = mongoose.Schema(
  {
    img: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    star: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: false,
    },
    reviews: {
      type: String,
      required: false,
    },
    prevPrice: {
      type: String,
      required: false,
    },
    newPrice: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Shoe = mongoose.model("Shoe", shoesSchema);
module.exports = Shoe;
