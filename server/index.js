const express = require("express");
const app = express();
const cors = require("cors");
const sequelize = require("../server/utils/db");
const UserSequelize = require("../server/models/UserSequelize");
const bcrypt = require("bcrypt");
const port = 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/user/signup", async (req, res) => {
    const { name, email, password } = req.body; 

    try {
        const existingUser = await UserSequelize.findOne({ where: { email } });
        if (existingUser) {
            return res.status(403).send("User already exists");
        }

        bcrypt.hash(password, 10, async (err, hash) => {
            if (err) {
                console.error("Error hashing password:", err);
                return res.status(500).send("Error creating user");
            }

            const user = await UserSequelize.create({ name, email, password: hash });
            console.log("Created User:", user);
            res.status(201).json({ message: "User created successfully" });
        });
    } catch (err) {
        console.error("Error registering user:", err.message);
        res.status(500).send("Internal Server Error"); 
    }
});

app.post("/user/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserSequelize.findOne({ where: { email } });
        if (!user) {
            return res.status(403).send("User not found");
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                console.error("Error comparing passwords:", err);
                return res.status(500).send("Error logging in");
            }

            if (result) {
                res.send("Login successful");
            } else {
                res.status(403).send("Invalid password");
            }
        });
    } catch (err) {
        console.error("Error logging in user:", err.message);
        res.status(500).send("Internal Server Error");
    }
});

sequelize.sync()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch(err => {
        console.error("Unable to sync the database:", err);
    });
