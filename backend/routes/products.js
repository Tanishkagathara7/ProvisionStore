const express = require("express");
const { body, validationResult } = require("express-validator");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products (no authentication required)
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { search, category, page = 1, limit = 50 } = req.query;

    // Build query (no user restriction)
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "all") {
      query.category = category;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get products with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Public
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Product name is required"),
    body("pricePerUnit")
      .isFloat({ min: 0 })
      .withMessage("Price per unit must be a positive number"),
    body("weight")
      .isFloat({ min: 0 })
      .withMessage("Weight must be a positive number"),
    body("weightUnit")
      .isIn(["kg", "gm"])
      .withMessage("Weight unit must be kg or gm"),
    body("category")
      .isIn([
        "Grains",
        "Pulses",
        "Spices",
        "Oil & Ghee",
        "Beverages",
        "Sweeteners",
        "Dairy",
        "Snacks",
        "Others",
      ])
      .withMessage("Invalid category"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { name, pricePerUnit, weight, weightUnit, category } = req.body;

      // Check if product with same name already exists
      const existingProduct = await Product.findOne({
        name: { $regex: `^${name}$`, $options: "i" },
        isActive: true,
      });

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "Product with this name already exists",
        });
      }

      const product = new Product({
        name,
        pricePerUnit,
        weight,
        weightUnit,
        category,
        userId: null, // No user required
      });

      await product.save();

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while creating product",
      });
    }
  },
);

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Public
router.put(
  "/:id",
  [
    body("name").trim().notEmpty().withMessage("Product name is required"),
    body("pricePerUnit")
      .isFloat({ min: 0 })
      .withMessage("Price per unit must be a positive number"),
    body("weight")
      .isFloat({ min: 0 })
      .withMessage("Weight must be a positive number"),
    body("weightUnit")
      .isIn(["kg", "gm"])
      .withMessage("Weight unit must be kg or gm"),
    body("category")
      .isIn([
        "Grains",
        "Pulses",
        "Spices",
        "Oil & Ghee",
        "Beverages",
        "Sweeteners",
        "Dairy",
        "Snacks",
        "Others",
      ])
      .withMessage("Invalid category"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { name, pricePerUnit, weight, weightUnit, category } = req.body;

      // Find product
      const product = await Product.findOne({
        _id: req.params.id,
        isActive: true,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Check if another product with same name exists (excluding current product)
      const existingProduct = await Product.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: `^${name}$`, $options: "i" },
        isActive: true,
      });

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "Another product with this name already exists",
        });
      }

      // Update product
      product.name = name;
      product.pricePerUnit = pricePerUnit;
      product.weight = weight;
      product.weightUnit = weightUnit;
      product.category = category;

      await product.save();

      res.json({
        success: true,
        message: "Product updated successfully",
        data: product,
      });
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating product",
      });
    }
  },
);

// @route   DELETE /api/products/:id
// @desc    Delete a product (soft delete)
// @access  Public
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting product",
    });
  }
});

// @route   GET /api/products/categories
// @desc    Get all categories
// @access  Public
router.get("/categories", async (req, res) => {
  try {
    const categories = [
      "Grains",
      "Pulses",
      "Spices",
      "Oil & Ghee",
      "Beverages",
      "Sweeteners",
      "Dairy",
      "Snacks",
      "Others",
    ];

    // Get category counts
    const categoryCounts = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const categoriesWithCounts = categories.map((category) => {
      const found = categoryCounts.find((item) => item._id === category);
      return {
        name: category,
        count: found ? found.count : 0,
      };
    });

    res.json({
      success: true,
      data: categoriesWithCounts,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
    });
  }
});

module.exports = router;
