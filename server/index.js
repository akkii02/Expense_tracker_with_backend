const express = require("express");
const app = express();
const cors = require("cors");
const sequelize = require("../server/utils/db");
const UserSequelize = require("../server/models/UserSequelize");
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

        const user = await UserSequelize.create({ name, email, password });
        console.log("Created User:", user);
        res.send("User created successfully");
    } catch (err) {
        console.error('Error registering user:', err.message);
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
        console.error('Unable to sync the database:', err);
    });
