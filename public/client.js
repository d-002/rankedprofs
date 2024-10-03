let socket = io();

let currentTeacher; // if in the teacher view

let dom = {
    "votePopup": null,
    "username": null,
    "password": null,
    "loginText": null,
    "loginToggle": null,
    "loginSubmit": null
};

// main window teacher tile template
const template = `
<div class="tileDISABLED">
    <div class="left">
        <div class="img">
            <img src="/images/TEACHER/pfp.jpg" alt="" />
        </div>
        <div class="rank RANK"></div>
    </div>
    <div class="right">
        <strong>NAME</strong>
        <div class="stars-list">
            <span style="--percent: PERCENT0%" class="stars">
                Enseignement
                <div></div>
            </span>
            <span style="--percent: PERCENT1%" class="stars">
                Rythme de cours
                <div></div>
            </span>
            <span style="--percent: PERCENT2%" class="stars">
                Personne
                <div></div>
            </span>
        </div>

        <p class="button" onclick="javascript:openVotePopup('TEACHER')">BUTTONTEXT</p>
    </div>
</div>
`;

// make it so that at the start loginState is 0
let loginState = -1;

function resized() {
    document.body.className = window.innerWidth < window.innerHeight ? "mobile" : "";
}

function emptyCredentials() {
    dom.username.value = "";
    dom.password.value = "";
}

function loginToggle() {
    loginState = loginState ? 0 : 1;

    dom.loginText.innerHTML = loginState ? "Créer un compte" : "Se connecter";
    dom.loginToggle.innerHTML = loginState ? "Déjà un compte ?" : "Pas encore de compte ?";
    dom.loginSubmit.innerHTML = loginState ? "Se connecter" : "Créer un compte";

    emptyCredentials();
}

function calculateStats(votes) {
    if (votes == null) return [[0, 0, 0], "unranked"];

    return [[votes.goodTeacher*100, 100, 100], "s"];
}

function clickToHide(evt) {
    if (evt.target == dom.votePopup) closeVotePopup();
}

function openVotePopup(teacher) {
    currentTeacher = teacher;
    dom.votePopup.className = "";
    dom.votePopup.offsetWidth;
    dom.votePopup.className = "show";
    dom.votePopup.addEventListener("click", clickToHide);
}

function closeVotePopup() {
    currentTeacher = null;
    dom.votePopup.className = "";
    dom.votePopup.offsetWidth;
    dom.votePopup.className = "hide";
    dom.votePopup.removeEventListener("click", clickToHide);
}

function parseVote() {
    return {};
}

function vote() {
    socket.emit("sendVote", [currentTeacher, parseVote()]);
    closeVotePopup();
}

socket.on("receiveAll", teachers => {
    list.innerHTML = "";

    const keys = Object.keys(teachers);
    // remove problematic input
    Array.from(keys).forEach(t => {
        if (teachers[t] == null) {
            delete teachers[t];
            keys.remove(t);
        }
    });

    // put pending votes at the top, then sort by last name
    // slow but does not need to be fast
    keys.sort((key1, key2) => {
        let [name1, vote1] = teachers[key1];
        let [name2, vote2] = teachers[key2];

        const diff = (vote2 == null ? 1 : 0) - (vote1 == null ? 1 : 0);
        if (diff) return diff;

        name1 = name1.name || "";
        name2 = name2.name || "";
        name1 = name1.substring(name1.indexOf(" ")+1);
        name2 = name2.substring(name2.indexOf(" ")+1);
        return name1 < name2 ? -1 : name1 > name2 ? 1 : 0;
    });

    keys.forEach(key => {
        const teacher = teachers[key];
        const [info, votes] = [teacher[0], teacher[1]];

        const [percents, rank] = calculateStats(votes);
        const nl = votes == null;

        let html = template.replace("DISABLED", nl ? " disabled" : "");
        html = html.replaceAll("TEACHER", key);
        html = html.replace("NAME", info.name);
        for (let i = 0; i < 3; i++) {
            html = html.replace("PERCENT"+i, nl ? 0 : percents[i]);
        }
        html = html.replace("RANK", rank);
        html = html.replace("BUTTONTEXT", nl ? "Voter et voir les stats" : "Modifier le vote");

        list.innerHTML += html;
    });
});

socket.on("voteSucceeded", () => {
    socket.emit("requireAll");
    closeVotePopup();
});

socket.on("voteFailed", () => {
    console.error("Voting failed");
    closeVotePopup();
});

socket.on("disconnect", () => console.warn("Disconnected"));

window.addEventListener("resize", resized);

window.onload = () => {
    Object.keys(dom).forEach(key => dom[key] = document.getElementById(key));

    resized();

    loginToggle();
    socket.emit("requireAll");
};
