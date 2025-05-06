const express = require("express");
const app = express();
const mongoose = require("mongoose");

const userRoute = require("./Routes/Client-routes")

require("dotenv").config();

app.use(express.json());

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;



mongoose.connect(MONGO_URI)
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`)
    });
    console.log("Database connected");
})
.catch((err) => {
    console.log("Failed to connect!")
    console.log(err.message)
})

