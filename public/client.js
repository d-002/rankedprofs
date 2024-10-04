let socket = io();

let teachers;
let currentTeacher; // if in the teacher view

let dom = {
    "votePopup": null,
    "banner": null,
    "pfp": null,
    "name": null,
    "voters": null,

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

function calculateScores(votes) {
    if (votes == null) return [0, 0, 0];

    const list = [];
    const keys = Object.values(voteCategories);
    for (let i = 0, I = keys.length; i < I; i++) {
        list.push(0);

        let count = 0;
        Object.keys(keys[i]).forEach(key => {
            list[i] += votes[key] || 0;
            count++;
        });

        list[i] *= 100/count;
    }

    return list;
}

function calculateRank(score, scores) {
    if (score == null) return "unranked";

    let higher = 0, count = 0;
    scores.forEach(s => {
        if (s > score) higher++;
        count++;
    });

    let t = higher/(count-1);
    if (t == 0) return "s";
    return "abcdef"[parseInt(t*5)];
}

function clickToHide(evt) {
    if (evt.target == dom.votePopup) closeVotePopup();
}

function mouseMoved(isTouch, evt, elt, id) {
    // need a click for desktop
    if (!isTouch && !evt.buttons%2) return;

    let t;
    if (isTouch) t = (evt.touches[0].clientX-elt.offsetLeft) / elt.offsetWidth;
    else t = evt.offsetX/elt.offsetWidth;

    // round to only have 20 possible values
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    t = Math.round(t*20);

    elt.style = "--percent: "+parseInt(t*5)+'%; --grade: "'+t+'"';

    currentVote[id] = t/20;
}

function openVotePopup(teacher) {
    // edit banner
    dom.banner.children[0].src = "/images/"+teacher+"/banner.jpg";
    dom.pfp.children[0].src = "/images/"+teacher+"/pfp.jpg";
    const info = teachers[teacher][0];
    dom.name.innerHTML = info.name;
    dom.voters.innerHTML = info.voters + " voter" + (info.voters == 1 ? "" : "s");

    // populate container
    votesContainer.innerHTML = "";

    Object.keys(voteCategories).forEach(category => {
        const h3 = document.createElement("h3");
        h3.innerHTML = category;
        votesContainer.appendChild(h3);

        const list = voteCategories[category];
        Object.keys(list).forEach(id => {
            // comment
            let elt = document.createElement("span");
            elt.innerHTML = list[id];
            votesContainer.appendChild(elt);

            // slider
            elt = document.createElement("div");
            elt.className = "slider";
            elt.style = '--percent: 0; --grade: "0"';

            votesContainer.appendChild(elt);
            elt.addEventListener("mousemove", evt => mouseMoved(false, evt, elt, id));
            elt.addEventListener("touchmove", evt => mouseMoved(true, evt, elt, id));
        });
    });

    currentTeacher = teacher;
    currentVote = {};
    voteKeys.forEach(key => { currentVote[key] = 0; });

    // open popup
    dom.votePopup.className = "";
    dom.votePopup.offsetWidth;
    dom.votePopup.className = "show";
    dom.votePopup.addEventListener("click", clickToHide);

    // get popup stats
    socket.emit("requireTeacher", teacher);
}

function fillPopupData(data, myVote) {
    console.log(data);
    console.log(myVote);
}

function closeVotePopup() {
    currentTeacher = null;
    currentVote = null;

    dom.votePopup.className = "";
    dom.votePopup.offsetWidth;
    dom.votePopup.className = "hide";
    dom.votePopup.removeEventListener("click", clickToHide);
}

function vote() {
    socket.emit("sendVote", [currentTeacher, currentVote]);
    closeVotePopup();
}

socket.on("receiveAll", _teachers => {
    teachers = _teachers;
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

    let percents = {};
    keys.forEach(teacher => {
        percents[teacher] = calculateScores(teachers[teacher][1]);
    });
    const percentsValues = Object.values(percents);

    keys.forEach(key => {
        const teacher = teachers[key];

        const info = teacher[0];
        const percent = percents[key];
        const nl = teacher[1] == null;
        const rank = nl ? "unranked" : calculateRank(percent, percentsValues);

        let html = template.replace("DISABLED", nl ? " disabled" : "");
        html = html.replaceAll("TEACHER", key);
        html = html.replace("NAME", info.name);
        for (let i = 0; i < 3; i++) {
            html = html.replace("PERCENT"+i, nl ? 0 : percent[i]);
        }
        html = html.replace("RANK", rank);
        html = html.replace("BUTTONTEXT", nl ? "Voter pour voir les stats" : "Voir plus");

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

socket.on("receiveTeacher", ([data, myVote]) => fillPopupData(data, myVote));

socket.on("disconnect", () => console.warn("Disconnected"));

window.addEventListener("resize", resized);

window.onload = () => {
    Object.keys(dom).forEach(key => dom[key] = document.getElementById(key));

    resized();

    loginToggle();
    socket.emit("requireAll");
};
