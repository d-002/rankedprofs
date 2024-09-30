const file = "data.txt";

console.log("Importing express...");
const express = require("express");
console.log("Setting up server...");
const app = express();
const http = require("http");
const fs = require("fs");
const server = http.createServer(app);
const helmet = require("helmet");
const bcrypt = require("bcrypt");

const salt = bcrypt.genSaltSync(10);

const { Server } = require("socket.io");
const io = new Server(server);

const port = process.env.PORT || 3000;

app.use(express.static(__dirname+"/public"));

// landing page
app.get("/", (req, res) => {
    res.sendFile(__dirname+"/index.html");
});

app.use(helmet());

server.listen(port, () => console.log("Listening on port "+port));
