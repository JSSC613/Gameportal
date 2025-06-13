// js/game-loader.js
// This file dynamically loads the corresponding game script based on URL parameters

// Get game ID from URL
const params = new URLSearchParams(window.location.search);
const gameId = params.get("game");

// Get nickname from localStorage
const nickname = localStorage.getItem("nickname");

// Get DOM elements
const gameTitleEl = document.getElementById("game-title"); // Updated variable name to avoid confusion with in-game gameTitle
const nicknameDisplayEl = document.getElementById("nickname-display"); // Updated variable name
const gameContainer = document.getElementById("game-container");

// If no nickname, alert and redirect to homepage
if (!nickname) {
  alert("Please enter your nickname first!");
  window.location.href = "index.html";
} else {
  // Display nickname
  nicknameDisplayEl.innerText = `👤: ${nickname}`;
}

// Display game title
const gameNames = {
  snake: "🐍 貪食蛇",
  ooxx: "#️⃣ ooxx",
  minesweeper: "💣 踩地雷",
  memory: "🧠 記憶翻牌",
  match3: "💎 消消樂" ,// Added Match 3
  block:"🧱俄羅斯方塊"
  // none:"🕹️敬請期待"
};

// Set page title based on gameId, show unknown game if not found
if (gameTitleEl) { // Check if element exists
  gameTitleEl.innerText = `🎮 ${gameNames[gameId] || "Unknown Game"}`;
}

// Dynamically load the corresponding game script
if (gameId) {
  // Build game script path
  const gameScriptPath = `./games/${gameId}.js`;

  // Create a new script element
  const script = document.createElement("script");
  script.type = "module"; // Game scripts are ES Modules
  script.src = gameScriptPath;

  // Handle load failure
  script.onerror = () => {
    if (gameContainer) { // Check if element exists
      gameContainer.innerHTML = "<p>❌ Unable to load the game. Please check if the game file exists.</p>";
    } else {
      console.error("Unable to load game script and gameContainer element not found.");
    }
  };

  // Add script element to the page body to start loading and executing
  document.body.appendChild(script);

} else {
  // If no game parameter in URL
  if (gameContainer) { // Check if element exists
    gameContainer.innerHTML = "<p>❌ Please specify the game to load in the URL.</p>";
  } else {
    console.error("No game ID specified in URL and gameContainer element not found.");
  }
}
