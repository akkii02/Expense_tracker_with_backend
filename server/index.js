const express = require("express");
const app = express();
const cors = require("cors");
const sequelize = require("../server/utils/db");
const UserSequelize = require("../server/models/UserSequelize");
const UserData = require("../server/models/UserData");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const port = 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const JWT_SECRET = "JbsQK2q8HyKHn5eKzQ+dqshJF9Gi2LM3+1X1pkkw7eM";

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send("Access Denied: No Token Provided!");
    }

    const token = authHeader.split(" ")[1]; // Extract the token from 'Bearer <token>'
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send("Invalid Token");
        }

        // Store the user information in the request object for future use
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
        console.log("Created User:", user);
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
            // res.send({ message: "Login successful", userId: user.id });
            const token = jwt.sign({userId:user.id,email:user.email},JWT_SECRET,{ expiresIn:'1h'});
            res.json({message: "Login successful", token });
        } else {
            res.status(403).send("Invalid password");
        }
    } catch (err) {
        console.error("Error logging in user:", err.message);
        res.status(500).send("Internal Server Error");
    }
});

// Add Expense Route
app.post("/",authenticateToken, async (req, res) => {
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
app.get("/", authenticateToken,async (req, res) => {
    const userId = req.user.userId;
    try {
        const expenses = await UserData.findAll({ where: { userId } });
        res.json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

app.delete('/:id',async (req,res)=>{
    const {id} = req.params;
    const token = req.headers.authorization?.split(" ")[1];
    try{
        const decode = jwt.verify(token,JWT_SECRET);
        const result =await UserData.destroy({
            where: {
                id,
                userId: decode.userId
            }
        })
        if (result) {
            res.status(200).send("Expense deleted successfully");
        } else {
            res.status(404).send("Expense not found or not authorized");
        }
    }catch(error){
        console.error("Error deleting expense:", error.message);
        res.status(500).send("Internal Server Error");
    }
})
// Define relationships
UserSequelize.hasMany(UserData, { foreignKey: 'userId' });
UserData.belongsTo(UserSequelize, { foreignKey: 'userId' });

// Sync Sequelize models and start server
sequelize.sync()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch(err => {
        console.error("Unable to sync the database:", err);
    });
 