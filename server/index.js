const express = require("express");
const app = express();
require('dotenv').config();
const cors = require("cors");
const sequelize = require("../server/utils/db");
const UserSequelize = require("../server/models/UserSequelize");
const UserData = require("../server/models/UserData");
const ForgotPasswordRequests = require('../server/models/ForgotPasswordRequests');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Razorpay = require("razorpay");
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const t = sequelize.transaction()
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
  const { email, password, } = req.body;
  try {
    const user = await UserSequelize.findOne({ where: { email } });
    console.log("userLogin",user)
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
      let receipt = user.premiumUserPaymentReceipt
      // let totalExpense = user.totalExpense
      res.json({ message: "Login successful", token,receipt});
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
  const { amount, category, description,totalExpense } = req.body;
  const userId = req.user.userId;
  const t = await sequelize.transaction();
  try {
    await UserData.create({ amount, category, description, userId }, { transaction: t });
    const user = await UserSequelize.findOne({ where: { id: userId } },{transaction:t});
    const totalExpense = parseFloat(req.body.totalExpense);
    await user.update({ totalExpense },{transaction:t});
    await t.commit();
    res.status(201).send("Expense added successfully");
  } catch (error) {
    await t.rollback()
    console.error("Error adding expense:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Get Expenses Route
app.get("/", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const expenses = await UserData.findAll({ where: { userId } });
    const total = await UserSequelize.findAll({ where: { id:userId } });
    console.log(expenses,"expenses")
    res.json({expenses,total});
  } catch (error) {
    console.error("Error fetching expenses:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Delete Expense Route
app.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  const userId = decoded.userId;
  const t = await sequelize.transaction();

  try {
    const expense = await UserData.findOne({where:{id,userId}},{transaction:t});
    if(!expense){
      return res.status(404).send("Expense not found");
    }
    const expenseAmount = parseFloat(expense.amount);
    const result = await UserData.destroy({ where: {id,userId}},{transaction:t});
    if (result) {
      const user = await UserSequelize.findOne({where:{id:userId}},{transaction:t})
      const updatedTotalExpense = user.totalExpense - expenseAmount;
      await user.update({totalExpense:updatedTotalExpense},{transaction:t})

      await t.commit();
      res.status(200).send("Expense deleted successfully");
    } else {
      await t.rollback();
      res.status(404).send("Expense not found or not authorized");
    }
  } catch (error) {
    await t.rollback();
    console.error("Error deleting expense:", error.message);
    res.status(500).send("Internal Server Error");
  }
});


app.post("/create-order", async (req, res) => {
    const { amount, currency } = req.body; 
  
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
  
    const options = {
      amount: Math.round(amount*100), 
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
  
  app.post("/payment-success", authenticateToken, async (req, res) => {
    const { paymentId, orderId } = req.body;
    const userId = req.user.userId;
  
    try {
      // Find the user by ID
      const user = await UserSequelize.findOne({ where: { id: userId } });
  
      // Check if the user exists
      if (user) {
        // Update the user record with the premium payment receipt
        await user.update({
          premiumUserPaymentReceipt: paymentId, // Update field
        });
  
        res.status(200).json({ message: "Premium status updated successfully" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (err) {
      console.error("Error updating user with receipt ID:", err.message);
      res.status(500).send("Internal Server Error");
    }
  });
  
  app.get("/data", authenticateToken, async (req, res) => {
    try {
      const allUserData = await UserSequelize.findAll({
        include: [{
          model: UserData,
          as: 'UserData',
        }],
      });
      res.json(allUserData);
    } catch (error) {
      console.error(error);  // Correct variable usage
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  app.post("/password/forgotpassword", async (req, res) => {
    const { email } = req.body;
    try {
      const user = await UserSequelize.findOne({ where: { email } });
      if (user) {
        const id = uuidv4();
        const expiresBy = new Date(Date.now() + 3600000); // Link expires in 1 hour
        await ForgotPasswordRequests.create({ id, userId: user.id, active: true, expiresby: expiresBy });
  
        let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'akshayakki01997@gmail.com', // replace with your email
            pass: process.env.EMAIL_PASSWORD, // make sure this is set in your environment
          },
        });
  
        let mailOptions = {
          from: 'akshayakki01997@gmail.com', // replace with your email
          to: email,
          subject: "Password Reset",
          html: `You requested a password reset. Click the following link to reset your password: <a href="http://localhost:3001/password/reset/${id}">Reset password</a>`,
        };
  
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
            return res.status(500).send("Failed to send email");
          } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send("Password reset link sent to your email");
          }
        });
      } else {
        res.status(404).send("User not found");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  });
  
 // Password Reset Route
// Password Reset Route
app.post("/password/reset/:id", async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  // Validate the presence of newPassword
  if (!newPassword) {
    return res.status(400).send("New password is required.");
  }

  // You can add password strength validation here

  try {
    const request = await ForgotPasswordRequests.findOne({ where: { id, active: true } });
    if (!request) {
      return res.status(404).send("Invalid or expired password reset link.");
    }

    // Check if the link has expired
    if (new Date() > new Date(request.expiresby)) {
      return res.status(400).send("Password reset link has expired.");
    }

    const user = await UserSequelize.findByPk(request.userId);
    if (user) {
      const hash = await bcrypt.hash(newPassword, 10);
      await user.update({ password: hash });

      // Deactivate the request after use
      await request.update({ active: false });

      res.status(200).send("Password has been reset successfully.");
    } else {
      res.status(404).send("User not found.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error.");
  }
});

  

// Define relationships
UserSequelize.hasMany(UserData, { foreignKey: "userId" });
UserData.belongsTo(UserSequelize, { foreignKey: "userId" });

// Define relationships
UserSequelize.hasMany(ForgotPasswordRequests, { foreignKey: 'userId', onDelete: 'CASCADE' });
ForgotPasswordRequests.belongsTo(UserSequelize, { foreignKey: 'userId' });

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
