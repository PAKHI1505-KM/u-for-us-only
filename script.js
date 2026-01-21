/***********************
 🔥 FIREBASE CONFIG
 ***********************/
// 🔴 REPLACE this with YOUR Firebase config
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_DOMAIN",
  databaseURL: "PASTE_YOUR_DATABASE_URL",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_BUCKET",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/***********************
 🌍 GLOBALS
 ***********************/
let roomRef = null;
let role = null;

/***********************
 🌸 JOIN ROOM
 ***********************/
document.getElementById("startBtn").onclick = () => {
  const roomCode = document.getElementById("roomInput").value.trim();
  role = document.getElementById("role").value;

  if (!roomCode) {
    alert("Please enter a room code 💗");
    return;
  }

  roomRef = db.ref("rooms/" + roomCode);

  document.getElementById("startScreen").style.display = "none";
  document.getElementById("game").style.display = "block";

  listenForDrawing();
  listenForGuess();
  listenForClear();
  listenForMusic();
};

/***********************
 🎨 CANVAS SETUP
 ***********************/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing = false;

canvas.addEventListener("mousedown", () => {
  if (role === "drawer") drawing = true;
});
canvas.addEventListener("mouseup", () => {
  drawing = false;
  ctx.beginPath();
});
canvas.addEventListener("mousemove", draw);

// mobile
canvas.addEventListener("touchstart", () => {
  if (role === "drawer") drawing = true;
});
canvas.addEventListener("touchend", () => {
  drawing = false;
  ctx.beginPath();
});
canvas.addEventListener("touchmove", draw);

function draw(e) {
  if (!drawing || !roomRef) return;

  const rect = canvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

  roomRef.child("drawing").push({ x, y });
}

/***********************
 👂 LISTEN DRAWING
 ***********************/
function listenForDrawing() {
  roomRef.child("drawing").on("child_added", snap => {
    const { x, y } = snap.val();

    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#ff6f91";

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  });
}

/***********************
 💬 GUESS SYNC
 ***********************/
document.getElementById("sendGuess").onclick = () => {
  const guess = document.getElementById("guessInput").value.trim();
  if (!guess || !roomRef) return;

  roomRef.child("guess").set(guess);
  document.getElementById("guessInput").value = "";
};

function listenForGuess() {
  roomRef.child("guess").on("value", snap => {
    if (snap.exists()) {
      document.getElementById("reaction").textContent =
        "Guess: " + snap.val();
    }
  });
}

/***********************
 🧹 CLEAR CANVAS (BOTH)
 ***********************/
document.getElementById("clearCanvas").onclick = () => {
  if (!roomRef) return;
  roomRef.child("drawing").remove();
};

function listenForClear() {
  roomRef.child("drawing").on("value", snap => {
    if (!snap.exists()) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
    }
  });
}

/***********************
 🎵 MUSIC SYNC
 ***********************/
function playMood(mood) {
  if (!roomRef) return;
  roomRef.child("music").set(mood);
}

function listenForMusic() {
  roomRef.child("music").on("value", snap => {
    if (!snap.exists()) return;

    const mood = snap.val();
    const player = document.getElementById("musicPlayer");

    const playlists = {
      soft: "https://www.youtube.com/embed/videoseries?list=PL_SOFT_PLAYLIST",
      cute: "https://www.youtube.com/embed/videoseries?list=PL_CUTE_PLAYLIST",
      lovely: "https://www.youtube.com/embed/videoseries?list=PL_LOVELY_PLAYLIST",
      aesthetic: "https://www.youtube.com/embed/videoseries?list=PL_AESTHETIC_PLAYLIST"
    };

    player.src = playlists[mood] + "&autoplay=1";
  });
}
