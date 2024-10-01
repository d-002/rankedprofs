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

const teachers = fs.readdirSync(__dirname+"/files/teachers");

function addVotes(acc, file) {
    let data = String(fs.readFileSync(file)).split("\n");

    for (let i = 0, I = data.length; i < I; i++) {
        let [key, value] = data[i].split(":");
        key = key.trim();
        value = Number(value);

        if (acc[key] == null) acc[key] = value;
        else acc[key] += value;
    }
}

function getTeacherData(teacher) {
    if (!teachers.includes(teacher)) return null;

    let parent = __dirname+"/files/teachers/"+teacher+"/votes/";
    const list = fs.readdirSync(parent);
    if (list.length == 0) return null;

    let acc = {}; // accumulator, receives votes
    list.forEach(file => addVotes(acc, parent+file));

    let keys = Object.keys(acc);
    for (let i = 0, count = keys.length; i < count; i++) acc[keys[i]] /= count;

    return acc;
}

function getAll() {
    let acc = {};
    teachers.forEach(teacher => acc[teacher] = getTeacherData(teacher));

    return acc;
}

io.on("connection", socket => {
    socket.on("requireAll", () => {
        socket.emit("receiveAll", getAll());
    });

    socket.on("requireMyVote", teacher => {
        socket.emit("receiveMyVote", [teacher, getTeacherData(teacher)]);
    });
});

server.listen(port, () => console.log("Listening on port "+port));
