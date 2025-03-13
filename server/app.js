const express = require("express");
const cors = require("cors");
const songRoutes = require("./routes/songRoute")

const userRoutes = require("./routes/userRoute");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/songs", songRoutes);

app.get("/", (req, res) => {
    res.send("Server is running!");
});

module.exports = app;
