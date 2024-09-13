const express = require("express");
const app = express();
require('dotenv').config();
const cors = require("cors");
const sequelize = require("../server/utils/db");
const UserSequelize = require("../server/models/UserSequelize");
const UserData = require("../server/models/UserData");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Razorpay = require("razorpay");
const port = 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const JWT_SECRET = "JbsQK2q8HyKHn5eKzQ+dqshJF9Gi2LM3+1X1pkkw7eM";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("Access Denied: No Token Provided!");
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send("Invalid Token");
    }
    req.user = user;
    next();
  });
};

// Sign-up Route
app.post("/user/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await UserSequelize.findOne({ where: { email } });
    if (existingUser) {
      return res.status(403).send("User already exists");
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await UserSequelize.create({ name, email, password: hash });
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Error registering user:", err.message);
    res.status(500).send("Internal Server Error");
  }
});

// Login Route
app.post("/user/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserSequelize.findOne({ where: { email } });
    if (!user) {
      return res.status(403).send("User not found");
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({ message: "Login successful", token });
    } else {
      res.status(403).send("Invalid password");
    }
  } catch (err) {
    console.error("Error logging in user:", err.message);
    res.status(500).send("Internal Server Error");
  }
});

// Add Expense Route
app.post("/", authenticateToken, async (req, res) => {
  const { amount, category, description } = req.body;
  const userId = req.user.userId;
  try {
    await UserData.create({ amount, category, description, userId });
    res.status(201).send("Expense added successfully");
  } catch (error) {
    console.error("Error adding expense:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Get Expenses Route
app.get("/", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const expenses = await UserData.findAll({ where: { userId } });
    res.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Delete Expense Route
app.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await UserData.destroy({
      where: {
        id,
        userId: decoded.userId,
      },
    });
    if (result) {
      res.status(200).send("Expense deleted successfully");
    } else {
      res.status(404).send("Expense not found or not authorized");
    }
  } catch (error) {
    console.error("Error deleting expense:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Create Order Route for Razorpay
app.post("/create-order", async (req, res) => {
    const { amount, currency } = req.body; // Amount in INR from frontend
  
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
  
    const options = {
      amount: Math.round(amount*100), // Convert INR to paise (e.g., 500 INR => 50000 paise)
      currency: currency || "INR",
      receipt: `receipt_order_${Math.random() * 100000}`,
      payment_capture: 1,
    };
  
    try {
      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: 'Failed to create order', details: error.message });
    }
  });
  

// Define relationships
UserSequelize.hasMany(UserData, { foreignKey: "userId" });
UserData.belongsTo(UserSequelize, { foreignKey: "userId" });

// Sync Sequelize models and start server
sequelize
  .sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Unable to sync the database:", err);
  });
