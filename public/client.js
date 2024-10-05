let socket = io();

let teachers;
let percents;
let currentVote;
let currentTeacher; // if in the teacher view

let dom = {
    "list": null,

    "votePopup": null,
    "votesContainer": null,

    "banner": null,
    "pfp": null,
    "name": null,
    "voters": null,
    "rank": null,
    "links": null,
    "mainStats": null,

    "largeImage": null,

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
            <div><img src="/images/TEACHER/pfp.jpg" class="CROWN" onclick="javascript:openLargeImage(true, 'TEACHER')" alt="" /></div>
        </div>
        <div class="rank RANK"></div>
    </div>
    <div class="right">
        <strong>NAME</strong>
        TEMPLATESTATS

        <p class="button" onclick="javascript:openVotePopup('TEACHER')">BUTTONTEXT</p>
    </div>
</div>
`;

const templateBars = `
        <div class="stars-list">
            <span style="--percent: PERCENT0%" class="bar">
                Enseignement
                <div></div>
            </span>
            <span style="--percent: PERCENT1%" class="bar">
                Rythme de cours
                <div></div>
            </span>
            <span style="--percent: PERCENT2%" class="bar">
                Personne
                <div></div>
            </span>
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

function calculateRank(teacher) {
    const percent = percents[teacher];
    if (teachers[teacher][1] == null || percent == null) return ["unranked", false];

    const len = percent.length;
    const sum = l => {
        let s = 0;
        for (let i = 0; i < len; i++) s += l[i];
        return s;
    };

    let higher = 0, count = 0;
    Object.values(percents).forEach(p => {
        if (sum(p) > sum(percent)) higher++;
        count++;
    });

    let t = higher/(count-1);
    t = (t+1-sum(percent)/len/100) / 2;
    if (t < 0.02) return ["s", higher == 0];
    return ["abcdef"[parseInt(t*5)], higher == 0];
}

function clickToHide(evt) {
    if (evt.target == dom.votePopup) closeVotePopup();
}

function mouseMoved(state, evt) {
    const isTouch = state&1;

    // need a left click for desktop
    if (!state && !evt.buttons&1) return;

    let elt;
    if (isTouch) elt = evt.touches[0].target;
    else elt = evt.target;
    let id = elt.getAttribute("voteId");

    if (id == null) return;

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
    const pfp = dom.pfp.children[0].children[0];
    pfp.src = "/images/"+teacher+"/pfp.jpg";

    const info = teachers[teacher][0];
    const nl = teachers[teacher][1] == null;
    const [rank, isFirst] = calculateRank(teacher);

    pfp.className = isFirst ? "crown" : "";

    dom.name.innerHTML = info.name;
    dom.voters.innerHTML = info.voters + " vote" + (info.voters == 1 ? "" : "s");
    dom.rank.className = "rank "+rank;

    dom.mainStats.className = nl ? "disabled" : "";
    dom.mainStats.innerHTML = useTemplateStats(nl, percents[teacher]);

    dom.links.innerHTML = "";
    if (info.links != null) {
        Object.keys(info.links).forEach(name => {
            const link = document.createElement("a");
            link.href = info.links[name];
            link.innerHTML = name;

            dom.links.appendChild(link);
        });
    }

    // populate container
    dom.votesContainer.innerHTML = "";

    Object.keys(voteCategories).forEach(category => {
        const h3 = document.createElement("h3");
        h3.innerHTML = category;
        dom.votesContainer.appendChild(h3);

        const list = voteCategories[category];
        Object.keys(list).forEach(id => {
            // comment
            let elt = document.createElement("span");
            elt.innerHTML = list[id];
            dom.votesContainer.appendChild(elt);

            // slider
            elt = document.createElement("div");
            elt.setAttribute("voteId", id);
            elt.className = "slider";
            elt.style = '--percent: 0; --grade: "0"';

            dom.votesContainer.appendChild(elt);
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

function openLargeImage(isPfp, teacher) {
    if (teacher == null) teacher = currentTeacher;
    dom.largeImage.style = 'display: block; --image: url("/images/'+teacher+"/"+(isPfp ? "pfp" : "banner")+'.jpg")';
}

function closeLargeImage() {
    dom.largeImage.style = "display: none";
}

function useTemplateStats(nl, percent) {
    let html = templateBars;
    for (let i = 0; i < 3; i++) {
        html = html.replace("PERCENT"+i, nl ? 0 : percent[i]);
    }

    return html;
}

function useTemplate(key) {
    const teacher = teachers[key];

    const info = teacher[0];
    const percent = percents[key];
    const nl = teacher[1] == null;
    const [rank, isFirst] = calculateRank(key);

    let html = template.replace("DISABLED", nl ? " disabled" : "");
    html = html.replaceAll("TEACHER", key);
    html = html.replace("CROWN", isFirst ? "crown" : "");
    html = html.replace("NAME", info.name);
    html = html.replace("RANK", rank);
    html = html.replace("BUTTONTEXT", nl ? "Voter pour voir les stats" : "Voir plus");
    html = html.replace("TEMPLATESTATS", useTemplateStats(nl, percent));

    return html;
}

socket.on("receiveAll", _teachers => {
    teachers = _teachers;
    dom.list.innerHTML = "";

    const keys = Array.from(Object.keys(teachers));
    // remove problematic input
    for (let i = keys.length-1; i >= 0; i--) {
        const teacher = keys[i];
        if (teachers[teacher] == null) {
            delete teachers[teacher];
            keys.splice(i, 1);
        }
    }

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

    percents = {};
    keys.forEach(teacher => {
        percents[teacher] = calculateScores(teachers[teacher][1]);
    });

    keys.forEach(key => { dom.list.innerHTML += useTemplate(key); });
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

    dom.votesContainer.addEventListener("mousemove", evt => mouseMoved(0, evt));
    dom.votesContainer.addEventListener("touchmove", evt => mouseMoved(1, evt));
    dom.votesContainer.addEventListener("click", evt => mouseMoved(2, evt));

    resized();

    loginToggle();
    socket.emit("requireAll");
};
