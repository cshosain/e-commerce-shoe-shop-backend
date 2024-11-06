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
    const page = parseInt(req.query.page) || 1; // default to the first page
    const filterCriteria = JSON.parse(req.headers.criteria || {});

    // Calculate how many items to skip
    const skip = (page - 1) * limit;

    // Build filter query based on filter criteria
    let filterQuery = {};
    console.log("quer: ", filterCriteria.brand);
    if (filterCriteria.brand && filterCriteria.brand !== "All Products") {
      filterQuery.company = filterCriteria.brand; // Filter by brand if not 'all'
    }

    if (filterCriteria.category && filterCriteria.category !== "all") {
      filterQuery.category = filterCriteria.category.toLowerCase();
    }

    if (filterCriteria.color && filterCriteria.color !== "all") {
      filterQuery.color = filterCriteria.color.toLowerCase();
    }

    let shoes = await Shoe.find(filterQuery).limit(limit).skip(skip);
    console.log("filterQuery: ", filterQuery);

    if (filterCriteria.price && filterCriteria.price !== "all") {
      //format the string from '$100 - 200' to '200' and also the range wheather we should set max range or min
      const slicedPrice = formatPrice(filterCriteria.price);
      console.log("sliced price: ", slicedPrice);
      if (!isNaN(slicedPrice.maxRange) && !isNaN(slicedPrice.minRange)) {
        shoes = shoes.filter((shoe) => {
          const shoePrice = parseFloat(shoe.newPrice);
          return (
            !isNaN(shoePrice) &&
            shoePrice <= slicedPrice.maxRange &&
            shoePrice >= slicedPrice.minRange
          );
        });
      }
      // for option like '$100 - 200' we treat the value as max value and for option like '200 - above' we treated the value '200' as mean value
    }

    // Fetch the shoes with pagination

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
        filterCriteria,
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
