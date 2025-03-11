const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoute");
const app = express();

// app.use(cors({ origin: "http://localhost:5174" }));
app.use(cors());
app.use(express.json());


app.use("/users", userRoutes);
app.get("/", (req, res) => {
    res.send("🚀 Server is running!");
});

module.exports = app;
