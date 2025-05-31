// js/main.js
// 這個檔案用於首頁 (index.html) 的邏輯，處理暱稱和顯示遊戲列表

// 取得 DOM 元素
const nicknameDisplayEl = document.getElementById("nickname-display");
const nicknameModal = document.getElementById("nickname-modal");
const nicknameInput = document.getElementById("nickname-input");
const confirmBtn = document.getElementById("confirm-nickname");
const gameListContainer = document.getElementById("game-list");

// 從 localStorage 獲取暱稱
function getNickname() {
    return localStorage.getItem("nickname");
}

// 顯示暱稱輸入彈窗
function askNickname() {
    if (nicknameModal) {
        nicknameModal.style.display = "flex";
        if (nicknameInput) {
            nicknameInput.value = '';
        }
    }
}

// 儲存暱稱到 localStorage 並更新顯示，然後隱藏彈窗
function saveNickname(nickname) {
    localStorage.setItem("nickname", nickname);
    if (nicknameDisplayEl) {
        nicknameDisplayEl.innerText = `👤 : ${nickname}`;
    }
    if (nicknameModal) {
        nicknameModal.style.display = "none";
    }
}

// 頁面載入完成時檢查暱稱
window.onload = () => {
    const nickname = getNickname();
    if (!nickname) {
        askNickname();
    } else {
        if (nicknameDisplayEl) {
            nicknameDisplayEl.innerText = `👤: ${nickname}`;
        }
    }

    generateGameList();
};

// 為確認按鈕添加點擊事件，用於儲存暱稱
if (confirmBtn && nicknameInput) {
    confirmBtn.onclick = () => {
        const name = nicknameInput.value.trim();
        if (name) {
            saveNickname(name);
        } else {
            alert("請輸入暱稱!");
        }
    };
} else {
    console.error("暱稱輸入相關 DOM 元素未找到!");
}

// 遊戲列表數據
const gameList = [
    { id: "snake", name: "🐍 <br/> 貪食蛇" },
    { id: "ooxx", name: "⭕❌ <br/> ooxx" },
    { id: "minesweeper", name: "💣 <br/> 踩地雷" },
    { id: "memory", name: "🧠 <br/> 記憶翻牌" },
    { id: "match3", name: "💎 <br/> 消消樂" },
    { id: "none", name: "🕹️ <br/> 敬請期待..." } // Uncommented this line
];

// 動態生成遊戲列表卡片
function generateGameList() {
    if (!gameListContainer) {
        console.error("遊戲列表容器 DOM 元素未找到!");
        return;
    }

    gameListContainer.innerHTML = '';

    gameList.forEach(game => {
        const card = document.createElement("div");
        card.className = "game-card";
        card.innerHTML = `<h3>${game.name}</h3>`;
        // For the "Coming Soon" card, you might want to disable clicking
        // or redirect to a placeholder page. For now, it will try to go to game.html?game=none
        if (game.id === "none") {
            card.style.cursor = "default"; // Change cursor to indicate it's not clickable
            card.style.opacity = "0.7"; // Slightly dim it
            // You can also remove the onclick event or make it do nothing:
            // card.onclick = () => { /* do nothing or show a message */ };
        } else {
            card.onclick = () => {
                window.location.href = `game.html?game=${game.id}`;
            };
        }
        gameListContainer.appendChild(card);
    });
}
