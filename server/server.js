const express = require("express")
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors")
const http = require("http");
const { Server } = require("socket.io");

const app = express();
dotenv.config({ path: "./config.env" }); //loading environment variables
const port = process.env.PORT || 3001;
app.use(cors({ origin: "http://localhost:3000" }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.get("/", (req, res) => {
    res.send("Server is running")
});
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB!");
}).catch(err => {
    console.error("MongoDB connection error:", err);
});


server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})