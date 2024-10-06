const voteKeys = require(__dirname+"/public/voteKeys.js");
const { sendEmail, sendVerifEmail } = require(__dirname+"/mailer.js");

sendVerifEmail("rankedprofs@gmail.com", "hahaaa");

console.log("Importing express...");
const express = require("express");
console.log("Setting up server...");
const app = express();
const http = require("http");
const fs = require("fs");
const server = http.createServer(app);
const helmet = require("helmet");
const bcrypt = require("bcrypt");
const jose = require("jose");

const salt = bcrypt.genSaltSync(10);

const { Server } = require("socket.io");
const io = new Server(server);

const port = process.env.PORT || 3000;

app.use(express.static(__dirname+"/public"));

// landing page
app.get("/", (req, res) => {
    res.sendFile(__dirname+"/index.html");
});

// image files redirection
app.get("/images*", (req, res) => {
    const split = req.url.split("/");
    if (split.length != 4) {
        res.send("haha no");
        return;
    }

    const teacher = split[split.length-2];
    const image = split[split.length-1];

    res.sendFile(getTeacherFolder(teacher)+image);
});

app.use(helmet());

const teachers = fs.readdirSync(__dirname+"/files/teachers");

const getTeacherFolder = teacher => __dirname+"/files/teachers/"+teacher+"/";
const getVoteFolder = teacher => getTeacherFolder(teacher)+"votes/";

function accVotes(acc, file) {
    let data;
    try {
        data = JSON.parse(fs.readFileSync(file));
    }
    catch {
        return 1;
    }

    const keys = Object.keys(data);
    for (let i = 0, I = keys.length; i < I; i++) {
        const key = keys[i];
        const value = data[key];

        if (acc[key] == null) acc[key] = value;
        else acc[key] += value;
    }

    return 0;
}

function allowedToSee(folder, username) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
        console.log("NOTICE: created missing folder "+folder);
        return false;
    }
    return fs.readdirSync(folder).includes(username+".txt");
}

function getTeacherData(teacher, username) {
    if (!teachers.includes(teacher)) return null;

    const path = getTeacherFolder(teacher)+"info.txt";
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, '{"name":"Placeholder name"}');
        console.log("NOTICE: created dummy missing file "+path);
    }
    let info;
    try {
        info = JSON.parse(fs.readFileSync(path));
        info.voters = 0;
    }
    catch {
        console.warn("WARNING: invalid json found in "+path);
        return null;
    }

    const parent = getVoteFolder(teacher);
    if (!allowedToSee(parent, username)) return [info, null];

    const list = fs.readdirSync(parent);
    const I = list.length;
    if (!I) return [info, null];

    let acc = {}; // accumulator, receives votes
    let count = 0;
    for (let i = 0; i < I; i++) {
        if (!accVotes(acc, parent+list[i])) count++;
    }

    if (!count) return [info, null];
    info.voters = count;

    const keys = Object.keys(acc);
    for (let i = 0, I = keys.length; i < I; i++) acc[keys[i]] /= count;

    return [info, acc];
}

function getTeacherVote(teacher, username) {
    if (!teachers.includes(teacher)) return null;

    const parent = getVoteFolder(teacher);
    if (!allowedToSee(parent, username)) return null;

    return JSON.parse(fs.readFileSync(parent+username+".txt"));
}

function userVote(teacher, username, data) {
    // check if the data format is correct
    if (!teachers.includes(teacher)) return false;

    let corrected = {};
    const keys = Object.keys(data);

    const l1 = voteKeys.length, l2 = keys.length;
    if (l1 != l2) return false;

    for (let i = 0; i < l1; i++) {
        if (!voteKeys.includes(keys[i])) return false;
        if (!keys.includes(voteKeys[i])) return false;
    }

    fs.writeFileSync(getVoteFolder(teacher)+username+".txt", JSON.stringify(data));
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
        socket.emit("receiveTeacher", [getTeacherData(teacher, username), getTeacherVote(teacher, username)]);
    });

    socket.on("sendVote", ([teacher, data]) => {
        if (!loggedIn) return;

        if (userVote(teacher, username, data)) {
            socket.emit("voteSucceeded");
        }
        else socket.emit("voteFailed");
    });

    // connections
    socket.on("googleSignin", token => {
        const claims = jose.decodeJwt(token);
        console.log(claims);
    });

    socket.on("emailSignup", ([email, password]) => {
    });

    socket.on("emailSignin", ([email, password]) => {
    });
});

process.on("uncaughtException", err => {
    console.error("Prevented server crash:");
    console.error(err.stack);
});

server.listen(port, () => console.log("Listening on port "+port));
