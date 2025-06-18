const express = require("express");
const { body, validationResult } = require("express-validator");
const Bill = require("../models/Bill");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/bills
// @desc    Get all bills for authenticated user
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, startDate, endDate } = req.query;

    // Build query
    const query = { userId: req.user._id };

    if (status && status !== "all") {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get bills with pagination
    const bills = await Bill.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("items.productId", "name category");

    // Get total count and sum for pagination and stats
    const [totalDocs, totalStats] = await Promise.all([
      Bill.countDocuments(query),
      Bill.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" },
            totalBills: { $sum: 1 },
          },
        },
      ]),
    ]);

    const stats = totalStats[0] || { totalAmount: 0, totalBills: 0 };

    res.json({
      success: true,
      data: bills,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(totalDocs / parseInt(limit)),
        total: totalDocs,
      },
      stats: {
        totalAmount: stats.totalAmount,
        totalBills: stats.totalBills,
        averageAmount:
          stats.totalBills > 0 ? stats.totalAmount / stats.totalBills : 0,
      },
    });
  } catch (error) {
    console.error("Get bills error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bills",
    });
  }
});

// @route   POST /api/bills
// @desc    Create a new bill
// @access  Private
router.post(
  "/",
  [
    auth,
    body("items")
      .isArray({ min: 1 })
      .withMessage("Bill must have at least one item"),
    body("items.*.productId")
      .notEmpty()
      .withMessage("Product ID is required for each item"),
    body("items.*.quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("items.*.weight")
      .isFloat({ min: 0 })
      .withMessage("Weight must be positive"),
    body("items.*.pricePerUnit")
      .isFloat({ min: 0 })
      .withMessage("Price per unit must be positive"),
    body("totalAmount")
      .isFloat({ min: 0 })
      .withMessage("Total amount must be positive"),
    body("customerName").optional().trim(),
    body("paymentMethod").optional().isIn(["cash", "card", "upi", "other"]),
    body("notes").optional().trim(),
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

      const { items, totalAmount, customerName, paymentMethod, notes } =
        req.body;

      // Verify all products exist and belong to the user
      const productIds = items.map((item) => item.productId);
      const products = await Product.find({
        _id: { $in: productIds },
        userId: req.user._id,
        isActive: true,
      });

      if (products.length !== productIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more products not found or not accessible",
        });
      }

      // Calculate item totals and validate
      const processedItems = items.map((item) => {
        const product = products.find(
          (p) => p._id.toString() === item.productId,
        );

        let itemTotal;
        if (item.weightUnit === "gm") {
          itemTotal = (item.pricePerUnit * item.weight) / 1000;
        } else {
          itemTotal = item.pricePerUnit * item.weight;
        }
        itemTotal *= item.quantity;

        return {
          productId: item.productId,
          name: product.name,
          pricePerUnit: item.pricePerUnit,
          weight: item.weight,
          weightUnit: item.weightUnit,
          quantity: item.quantity,
          itemTotal: parseFloat(itemTotal.toFixed(2)),
        };
      });

      // Verify total amount
      const calculatedTotal = processedItems.reduce(
        (sum, item) => sum + item.itemTotal,
        0,
      );
      const totalDifference = Math.abs(calculatedTotal - totalAmount);

      if (totalDifference > 0.01) {
        // Allow for small rounding differences
        return res.status(400).json({
          success: false,
          message: `Total amount mismatch. Calculated: ₹${calculatedTotal.toFixed(2)}, Provided: ₹${totalAmount}`,
        });
      }

      // Create bill
      const bill = new Bill({
        userId: req.user._id,
        items: processedItems,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        customerName,
        paymentMethod: paymentMethod || "cash",
        notes,
      });

      await bill.save();

      // Populate product details for response
      await bill.populate("items.productId", "name category");

      res.status(201).json({
        success: true,
        message: "Bill created successfully",
        data: bill,
      });
    } catch (error) {
      console.error("Create bill error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while creating bill",
      });
    }
  },
);

// @route   GET /api/bills/:id
// @desc    Get a specific bill
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("items.productId", "name category");

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    res.json({
      success: true,
      data: bill,
    });
  } catch (error) {
    console.error("Get bill error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bill",
    });
  }
});

// @route   PUT /api/bills/:id/status
// @desc    Update bill status
// @access  Private
router.put(
  "/:id/status",
  [
    auth,
    body("status")
      .isIn(["draft", "completed", "cancelled"])
      .withMessage("Invalid status"),
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

      const bill = await Bill.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!bill) {
        return res.status(404).json({
          success: false,
          message: "Bill not found",
        });
      }

      bill.status = req.body.status;
      await bill.save();

      res.json({
        success: true,
        message: "Bill status updated successfully",
        data: bill,
      });
    } catch (error) {
      console.error("Update bill status error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating bill status",
      });
    }
  },
);

// @route   GET /api/bills/stats/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get("/stats/dashboard", auth, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const [dailyStats, monthlyStats, yearlyStats, recentBills] =
      await Promise.all([
        // Today's stats
        Bill.aggregate([
          {
            $match: {
              userId: req.user._id,
              status: "completed",
              createdAt: { $gte: startOfDay },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$totalAmount" },
              totalBills: { $sum: 1 },
            },
          },
        ]),

        // This month's stats
        Bill.aggregate([
          {
            $match: {
              userId: req.user._id,
              status: "completed",
              createdAt: { $gte: startOfMonth },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$totalAmount" },
              totalBills: { $sum: 1 },
            },
          },
        ]),

        // This year's stats
        Bill.aggregate([
          {
            $match: {
              userId: req.user._id,
              status: "completed",
              createdAt: { $gte: startOfYear },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$totalAmount" },
              totalBills: { $sum: 1 },
            },
          },
        ]),

        // Recent bills
        Bill.find({
          userId: req.user._id,
          status: "completed",
        })
          .sort({ createdAt: -1 })
          .limit(5)
          .select("billNumber totalAmount createdAt"),
      ]);

    res.json({
      success: true,
      data: {
        daily: dailyStats[0] || { totalAmount: 0, totalBills: 0 },
        monthly: monthlyStats[0] || { totalAmount: 0, totalBills: 0 },
        yearly: yearlyStats[0] || { totalAmount: 0, totalBills: 0 },
        recentBills,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard statistics",
    });
  }
});

module.exports = router;
