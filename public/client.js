let socket = io();

socket.on("disconnect", () => console.warn("Disconnected"));

window.onload = () => {
};
