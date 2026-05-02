const { ipcRenderer } = require("electron");

let videos = [];
let index = 0;
let player = null;

window.onload = async () => {
  player = document.getElementById("player");
  videos = await ipcRenderer.invoke("getVideos");

  if (videos.length === 0) {
    alert("No videos found.");
    return;
  }

  // AUTO‑PLAY NEXT CLIP WHEN CURRENT ONE ENDS
  player.onended = () => {
    index++;
    if (index >= videos.length) index = 0;
    playCurrent();
  };

  playCurrent();
};

function playCurrent() {
  player.src = videos[index];
  player.play();
}

document.getElementById("fail").onclick = async () => {
  const file = videos[index];
  await ipcRenderer.invoke("deleteVideo", file);

  videos.splice(index, 1);

  if (videos.length === 0) {
    alert("All videos reviewed.");
    window.close();
    return;
  }

  if (index >= videos.length) index = 0;

  playCurrent();
};

document.getElementById("next").onclick = () => {
  index++;
  if (index >= videos.length) index = 0;
  playCurrent();
};

document.getElementById("prev").onclick = () => {
  index--;
  if (index < 0) index = videos.length - 1;
  playCurrent();
};
