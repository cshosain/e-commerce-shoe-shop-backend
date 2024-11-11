const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Shoe = require("./models/shoes.model.js");
require("dotenv").config();
const formatPrice = require("./utilities/formatPrice.js");
const myCunnectionString = process.env.MONGODB_CONNECTION_STRING;
const PORT = 3000;
const app = express();

app.use(express.json());
app.use(cors());

//get all data
app.get("/api/shoes", async (req, res) => {
  try {
    const shoes = await Shoe.find({});
    res.status(200).json({ success: true, data: shoes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//get data with pagination
app.get("/api/shoes/paginated", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // default to 10 items per page
    const page = parseInt(req.query.page) || 1; // default to the first

    // Calculate how many items to skip
    const skip = (page - 1) * limit;

    // Build filter query based on filter criteria
    let filterQuery = {};
    if (req.query.brand && req.query.brand !== "All Products") {
      filterQuery.company = req.query.brand; // Filter by brand if not 'all'
    }

    if (req.query.category && req.query.category !== "all") {
      filterQuery.category = req.query.category.toLowerCase();
    }

    if (req.query.color && req.query.color !== "all") {
      filterQuery.color = req.query.color.toLowerCase();
    }

    // Add keyword search for title
    if (req.query.keyword) {
      const keyword = req.query.keyword;
      filterQuery.title = { $regex: keyword, $options: "i" }; // Case-insensitive search on title
    }

    // Add price range filter in MongoDB
    if (req.query.price && req.query.price !== "all") {
      const slicedPrice = formatPrice(req.query.price); // formatPrice should return minRange and maxRange
      console.log("sliced price: ", slicedPrice);

      if (!isNaN(slicedPrice.minRange) && !isNaN(slicedPrice.maxRange)) {
        filterQuery.newPrice = {
          $gte: slicedPrice.minRange,
          $lte: slicedPrice.maxRange,
        };
      } else if (!isNaN(slicedPrice.minRange)) {
        filterQuery.newPrice = { $gte: slicedPrice.minRange }; // For ranges like "200 - above"
      } else if (!isNaN(slicedPrice.maxRange)) {
        filterQuery.newPrice = { $lte: slicedPrice.maxRange }; // For ranges like "up to 200"
      } else {
        return res.status(500).json({
          success: false,
          message: `Invalid price range value! ${req.query.price}. Please provide correct format, e.g. '$100 - 200'`,
        });
      }
    }

    let shoes = await Shoe.find(filterQuery).limit(limit).skip(skip);
    console.log("filterQuery: ", filterQuery);

    // Optional: Get total count for pagination metadata (e.g., total pages)
    const totalItems = await Shoe.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      data: shoes,
      hasMore: totalPages > page,
      page,
      meta: {
        currentPage: page,
        totalPages,
        totalItems,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

mongoose
  .connect(myCunnectionString)
  .then(() => {
    console.log("Connected to database.");
  })
  .catch((error) => {
    console.log(error);
  });

app.listen(PORT, (req, res) => {
  console.log(`server is running at http://localhost:${PORT}`);
});
