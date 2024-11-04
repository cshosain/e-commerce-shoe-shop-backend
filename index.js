const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Shoe = require("./models/shoes.model.js");
require("dotenv").config();
const myCunnectionString = process.env.MONGODB_CONNECTION_STRING;
console.log(myCunnectionString);
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
    const page = parseInt(req.query.page) || 1; // default to the first page

    // Calculate how many items to skip
    const skip = (page - 1) * limit;

    // Fetch the shoes with pagination
    const shoes = await Shoe.find({}).limit(limit).skip(skip);

    // Optional: Get total count for pagination metadata (e.g., total pages)
    const totalItems = await Shoe.countDocuments();
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
