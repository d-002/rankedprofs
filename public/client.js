let socket = io();

let dom = {
    "username": null,
    "password": null,
    "loginText": null,
    "loginToggle": null,
    "loginSubmit": null
};

// make it so that at the start loginState is 0
let loginState = -1;

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

socket.on("disconnect", () => console.warn("Disconnected"));

window.onload = () => {
    Object.keys(dom).forEach(key => dom[key] = document.getElementById(key));

    loginToggle();
    socket.emit("requireAll");
};
