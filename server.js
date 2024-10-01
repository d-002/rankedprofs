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

// list of correct vote keys
const template = [
    "goodTeacher"
];

const teachers = fs.readdirSync(__dirname+"/files/teachers");

let getVoteFolder = teacher => __dirname+"/files/teachers/"+teacher+"/votes/";

function accVotes(acc, file) {
    let data;
    try {
        data = JSON.parse(fs.readFileSync(file));
    }
    catch {
        return 1;
    }

    let keys = Object.keys(data);
    for (let i = 0, I = keys.length; i < I; i++) {
        const key = keys[i];
        const value = data[key];

        if (acc[key] == null) acc[key] = value;
        else acc[key] += value;
    }

    return 0;
}

const allowedToSee = (folder, username) => fs.readdirSync(folder).includes(username+".txt");

function getTeacherData(teacher, username) {
    if (!teachers.includes(teacher)) return null;

    let parent = getVoteFolder(teacher);
    if (!allowedToSee(parent, username)) return null;

    const list = fs.readdirSync(parent);
    let I = list.length;
    if (!I) return null;

    let acc = {}; // accumulator, receives votes
    let count = 0;
    for (let i = 0; i < I; i++) {
        if (!accVotes(acc, parent+list[i])) count++;
    }

    if (!count) return null;

    let keys = Object.keys(acc);
    for (let i = 0, I = keys.length; i < I; i++) acc[keys[i]] /= count;

    return acc;
}

function getTeacherVote(teacher, username) {
    let parent = getVoteFolder(teacher);
    if (!allowedToSee(parent, username)) return null;

    return JSON.parse(fs.readFileSync(parent+username+".txt"));
}

function userVote(teacher, username, data) {
    // check if the data format is correct
    let corrected = {};
    let keys = Object.keys(data);

    const l1 = template.length, l2 = keys.length;
    if (l1 != l2) return false;

    for (let i = 0; i < l1; i++) {
        if (!template.includes(keys[i])) return false;
        if (!keys.includes(template[i])) return false;
    }

    fs.writeFile(getVoteFolder(teacher)+username+".txt", JSON.stringify(data), () => {});
    return true;
}

function getAll(username) {
    let acc = {};
    teachers.forEach(teacher => acc[teacher] = getTeacherData(teacher, username));

    return acc;
}

io.on("connection", socket => {
    let username = "a";
    let loggedIn = true;

    socket.on("requireAll", () => {
        if (!loggedIn) return;

        socket.emit("receiveAll", getAll(username));
    });

    socket.on("requireTeacher", teacher => {
        if (!loggedIn) return;

        // send global teacher data and user vote
        socket.emit("receiveTeacher", [teacher, getTeacherData(teacher, username), getTeacherVote(teacher, username)]);
    });

    socket.on("sendVote", ([teacher, data]) => {
        if (!loggedIn) return;

        if (userVote(teacher, username, data)) {
            socket.emit("operationFailed");
        }
    });
});

server.listen(port, () => console.log("Listening on port "+port));
