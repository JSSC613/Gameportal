// games/memory.js
const gameContainer = document.getElementById("game-container");

// 如果找不到遊戲容器，則記錄錯誤並停止後續的遊戲初始化程式碼執行
if (!gameContainer) {
    console.error("錯誤：找不到ID為 'game-container' 的元素！記憶翻牌遊戲無法啟動。");
} else {
    // 找到遊戲容器，注入遊戲的 HTML 結構和內嵌 CSS
    gameContainer.innerHTML = `
    <style>
    /* 記憶翻牌遊戲特定樣式 */
    .memory-container {
        text-align: center;
        padding: 30px; /* 與minesweeper.js一致 */
        background-color: #ffffff; /* 更亮的白色容器背景 */
        border-radius: 15px; /* 與minesweeper.js一致 */
        box-shadow: 0 8px 16px rgba(0,0,0,0.2); /* 柔和的陰影 */
        max-width: 600px; /* 設定最大寬度，防止過寬 */
        width: 90%; /* 響應式寬度 */
        margin: 50px auto; /* 置中並增加上下間距 */
        border: 1px solid #e0e0e0; /* 輕微邊框 */
        box-sizing: border-box; /* 確保 padding 和 border 不會增加元素總寬度 */
        font-family:'Cubic-11','FusionPixel', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* 統一字體 */
        color: #333; /* 預設文字顏色 */
        position: relative; /* 為了讓訊息絕對定位 */
    }

    h2 {
        font-size: 2.8em; /* 標題更大 */
        color: #3f51b5; /* 藍色標題 */
        margin-bottom: 25px;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.1); /* 柔和文字陰影 */
        font-family: 'Cubic-11','FusionPixel','Arial Black', sans-serif; /* 更具衝擊力的字體 */
    }

    #move-count {
        font-size: 1.4em; /* 調整大小 */
        margin-bottom: 20px; /* 增加間距 */
        color: #546e7a; /* 與控制項文字顏色一致 */
        font-weight: bold;
    }

    .game-board {
        display: grid;
        grid-template-columns: repeat(5, 1fr); /* 預設 5 欄，每欄填滿可用空間 */
        gap: 10px; /* 維持卡片之間的間距 */
        justify-content: center;
        margin: 20px auto;
        overflow: hidden;
        background-color: #c7d2e2; /* 淺藍灰色作為間隙背景 */
        border: 3px solid #a3b1c6; /* 淺藍色邊框 */
        border-radius: 8px;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.15); /* 輕微內陰影 */
        width: 100%; /* 讓棋盤填滿容器的寬度 */
        box-sizing: border-box;
        padding: 10px; /* 添加內邊距讓卡片邊緣不緊貼棋盤邊框 */
    }

    .card {
        height: 90px; /* 保持固定高度，寬度將由 grid 佈局自動調整 */
        background-color: #e6e9ee; /* 未翻開的亮灰色，與minesweeper.js一致 */
        border-radius: 10px; /* 稍大一點的圓角 */
        cursor: pointer;
        font-size: 38px; /* 讓表情符號更大 */
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1); /* 柔和陰影 */
        border: 2px outset #f0f2f5; /* 3D 立體按鈕效果，與minesweeper.js一致 */

        transition: background-color 0.3s ease-in-out,
                    transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55), /* 調整 transform 過渡時間 */
                    opacity 0.3s ease-in-out,
                    box-shadow 0.3s ease-in-out,
                    border 0.3s ease-in-out;
    }

    .card:hover:not(.flipped):not(.matched) {
        background-color: #f0f3f6; /* 懸停效果更亮 */
        transform: translateY(-3px); /* 輕微上浮效果 */
        box-shadow: 0 6px 12px rgba(0,0,0,0.15); /* 懸停陰影更明顯 */
    }

    .card.initial {
        transform: translateY(-200px) scale(0.5);
        opacity: 0;
        visibility: hidden;
    }

    .card.deal-animation {
        transform: translateY(0) scale(1);
        opacity: 1;
        visibility: visible;
    }

    .card.flipped {
        background-color: #ffffff; /* 翻開後的純白色背景，與minesweeper.js revealed 相似 */
        color: #333; /* 顯示表情符號 */
        box-shadow: inset 0 0 4px rgba(0,0,0,0.1); /* 輕微內陰影 */
        border: 1px solid #b0bec5; /* 與minesweeper.js revealed 相似 */
    }

    .card.matched {
        background-color: #e8f5e9; /* 淺綠色，表示匹配成功 */
        cursor: default;
        box-shadow: inset 0 0 5px rgba(0,0,0,0.15); /* 更輕的內陰影 */
        border: 1px solid #a5d6a7; /* 淺綠色邊框 */
    }
    .card.matched.hide-content {
        color: transparent; /* 隱藏內容 */
        transition: color 0.5s ease-in-out; /* 添加透明度過渡 */
    }

    #memory-restart-btn, #memory-upload-score { /* Changed ID and added upload button style */
        font-family: 'Cubic-11','FusionPixel','Comic Sans MS', 'ZCOOL KuaiLe', 'Noto Sans TC', cursive, sans-serif;
        padding: 12px 22px; /* 與minesweeper.js按鈕一致 */
        border-radius: 10px; /* 與minesweeper.js按鈕一致 */
        border: none;
        font-size: 1.2em; /* 與minesweeper.js按鈕一致 */
        cursor: pointer;
        transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1); /* 柔和陰影 */
        background-color: #4CAF50; /* 柔和綠色按鈕 */
        color: white;
        margin: 25px 10px 0 10px; /* Added margins to separate buttons */
    }

    #memory-restart-btn:hover, #memory-upload-score:hover {
        background-color: #43A047; /* 懸停時顏色變深 */
        transform: translateY(-3px); /* 輕微上浮 */
        box-shadow: 0 6px 12px rgba(0,0,0,0.2); /* 懸停陰影更明顯 */
    }

    #memory-restart-btn:active, #memory-upload-score:active {
        background-color: #388E3C;
        transform: translateY(0); /* 點擊時下沉 */
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    #memory-upload-score {
        background-color: #2196F3; /* Blue for upload button */
        display: none; /* Hidden by default */
    }
    #memory-upload-score:hover {
        background-color: #1976D2;
    }
    #memory-upload-score:active {
        background-color: #1565C0;
    }


    /* 遊戲完成訊息樣式 */
    #game-message {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%, -100%);
        background-color: #bbdefb;
        color: #1a237e;
        padding: 15px;
        border-radius: 8px;
        font-size: 1em;
        font-weight: bold;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        z-index: 10;
        opacity: 0;
        visibility: hidden;
        transition: all 0.5s ease-in-out;
        border: 2px solid #64b5f6;
        width: fit-content;
        white-space: nowrap;
    }

    #game-message.show {
        transform: translate(-50%, 20px);
        opacity: 1;
        visibility: visible;
    }

    /* 排行榜樣式 */
    .leaderboard-container {
        margin-top: 30px;
        background-color: #f8f9fa;
        border-radius: 10px;
        padding: 20px;
        box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
        max-height: 300px; /* 設定最大高度，讓內容可滾動 */
        overflow-y: auto; /* 超出部分滾動 */
        border: 1px solid #e9ecef;
    }

    .leaderboard-container h3 {
        color: #4CAF50; /* Green heading for leaderboard */
        margin-bottom: 15px;
        font-size: 1.5em;
        border-bottom: 2px solid #a5d6a7;
        padding-bottom: 10px;
    }

    .leaderboard-list {
        list-style: none;
        padding: 0;
    }

    .leaderboard-list li {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px dashed #dee2e6;
        font-size: 1.1em;
        color: #555;
    }

    .leaderboard-list li:last-child {
        border-bottom: none;
    }

    .leaderboard-list li .rank {
        font-weight: bold;
        color: #6c757d;
        width: 30px;
        text-align: left;
    }

    .leaderboard-list li .nickname {
        flex-grow: 1;
        text-align: left;
        margin-left: 10px;
    }

    .leaderboard-list li .score {
        font-weight: bold;
        color: #28a745;
        width: 80px;
        text-align: right;
    }
    </style>
    <div class="memory-container">
        <h2>🧠</h2>
        <div id="move-count" style="font-size: 1.2em; margin-bottom: 15px;">翻牌次數：0</div>
        <div class="game-board" id="game-board"></div>
        <div>
            <button id="memory-restart-btn">🔁 重新開始</button>
            <button id="memory-upload-score">⬆️ 上傳分數</button> </div>
        <div id="game-message"></div>
        <div class="leaderboard-container">
            <h3>🏆 排行榜 (最少翻牌次數)</h3>
            <ul id="leaderboard-list" class="leaderboard-list">
                <li>載入中...</li>
            </ul>
        </div>
    </div>
    `;

    // 使用 IIFE 來封裝遊戲邏輯
    const memoryGame = (() => {
        // 遊戲狀態變數
        const emojis = ["🍎", "🍌", "🍇", "🍓", "🍍", "🥝", "🍈", "🍉", "🍑", "🍒", "🍋", "🥑","🥥"];
        let cards = [];
        let firstCard = null;
        let secondCard = null;
        let lockBoard = false;
        let moveCount = 0;
        let boardSize = 0;

        // 載入音效 (請確保路徑正確)
        const dealSound = new Audio('assets/shuffling_cards.mp3');
        const victorySound = new Audio('assets/level-completed-230568.mp3');
        const flipSound = new Audio('assets/click.ogg');

        // 取得 DOM 元素
        const boardEl = document.getElementById("game-board");
        const moveCountEl = document.getElementById("move-count");
        const restartBtn = document.getElementById("memory-restart-btn"); // Changed ID
        const uploadBtn = document.getElementById("memory-upload-score"); // New upload button
        const gameMessageEl = document.getElementById("game-message");
        const leaderboardListEl = document.getElementById("leaderboard-list"); // New leaderboard element

        // 初始化遊戲
        function init() {
            if (!boardEl || !moveCountEl || !restartBtn || !uploadBtn || !gameMessageEl || !leaderboardListEl) {
                console.error("記憶翻牌遊戲：部分內部或必要外部 DOM 元素未找到！遊戲無法啟動。");
                return;
            }
            restartBtn.addEventListener("click", startGame);
            uploadBtn.addEventListener("click", uploadScore); // Attach event listener for upload
            startGame();
            loadLeaderboard(); // Load leaderboard on init
        }

        // 開始新遊戲
        async function startGame() {
            const totalCards = 25;
            boardSize = Math.sqrt(totalCards);

            if (emojis.length * 2 < totalCards) {
                console.warn(`水果種類 (${emojis.length}) 不足以填滿所有卡片 (${totalCards}張)，將重複使用部分水果。`);
            }

            boardEl.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;

            const gameEmojis = [];
            for (let i = 0; i < Math.floor(totalCards / 2); i++) {
                gameEmojis.push(emojis[i % emojis.length]);
                gameEmojis.push(emojis[i % emojis.length]);
            }
            if (totalCards % 2 !== 0) {
                gameEmojis.push(emojis[Math.floor(Math.random() * emojis.length)]);
            }

            const shuffledEmojis = shuffle(gameEmojis);
            boardEl.innerHTML = '';
            cards = [];
            moveCount = 0;
            moveCountEl.textContent = "翻牌次數：0";
            firstCard = null;
            secondCard = null;
            lockBoard = true;
            gameMessageEl.classList.remove('show');
            gameMessageEl.textContent = '';
            uploadBtn.style.display = "none"; // Hide upload button at start
            uploadBtn.disabled = false;
            uploadBtn.textContent = "⬆️ 上傳分數"; // Reset upload button text

            shuffledEmojis.forEach((emoji, index) => {
                const card = document.createElement("div");
                card.classList.add("card", "initial");
                card.dataset.emoji = emoji;
                card.dataset.index = index;
                card.addEventListener("click", () => handleFlip(card));
                boardEl.appendChild(card);
                cards.push(card);
            });

            await dealCardsAnimation();
            lockBoard = false;
        }

        // ... (dealCardsAnimation, shuffle, handleFlip, checkMatch functions remain unchanged) ...
        function dealCardsAnimation() {
            return new Promise(resolve => {
                let cardsDealt = 0;
                const totalCards = cards.length;
                const animationDelay = 30;
                const soundDurationRatio = 0.2;

                if (dealSound.readyState >= 2) {
                    dealSound.currentTime = 0;
                    dealSound.playbackRate = 4.5;
                    dealSound.play().catch(e => console.error("音效播放失敗:", e));

                    const adjustedSoundDurationRatio = soundDurationRatio / dealSound.playbackRate;
                    const intendedPlayDuration = dealSound.duration * adjustedSoundDurationRatio;

                    if (!isNaN(dealSound.duration) && intendedPlayDuration > 0) {
                        setTimeout(() => {
                            dealSound.pause();
                            dealSound.currentTime = 0;
                        }, intendedPlayDuration * 1000);
                    } else {
                        console.warn("音效持續時間無效或太短，無法設定自動停止。");
                    }
                } else {
                    console.warn("音效尚未載入完成，無法播放。");
                }

                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.remove("initial");
                        card.classList.add("deal-animation");

                        cardsDealt++;
                        if (cardsDealt === totalCards) {
                            setTimeout(() => {
                                cards.forEach(c => c.classList.remove("deal-animation"));
                                resolve();
                            }, 500);
                        }
                    }, index * animationDelay);
                });
            });
        }

        function shuffle(array) {
            let currentIndex = array.length, randomIndex;
            while (currentIndex != 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                [array[currentIndex], array[randomIndex]] = [
                    array[randomIndex], array[currentIndex]];
            }
            return array;
        }

        function handleFlip(card) {
            if (lockBoard || card.classList.contains("flipped") || card.classList.contains("matched")) return;

            if (flipSound.readyState >= 2) {
                flipSound.currentTime = 0;
                flipSound.playbackRate = 1.5;
                flipSound.play().catch(e => console.error("翻牌音效播放失敗:", e));
            } else {
                console.warn("翻牌音效尚未載入完成，無法播放。");
            }

            card.classList.add("flipped");
            card.textContent = card.dataset.emoji;

            if (!firstCard) {
                firstCard = card;
            } else {
                secondCard = card;
                moveCount++;
                moveCountEl.textContent = `翻牌次數：${moveCount}`;
                checkMatch();
            }
        }

        function checkMatch() {
            lockBoard = true;

            const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;

            if (isMatch) {
                firstCard.classList.add("matched");
                secondCard.classList.add("matched");

                setTimeout(() => {
                    firstCard.classList.add("hide-content");
                    secondCard.classList.add("hide-content");
                    firstCard.textContent = "";
                    secondCard.textContent = "";
                    firstCard.removeEventListener("click", () => handleFlip(firstCard));
                    secondCard.removeEventListener("click", () => handleFlip(secondCard));
                    resetTurn();
                }, 500);
            } else {
                setTimeout(() => {
                    firstCard.classList.remove("flipped");
                    secondCard.classList.remove("flipped");
                    firstCard.textContent = "";
                    secondCard.textContent = "";
                    resetTurn();
                }, 1000);
            }
        }

        // 重設翻牌狀態並檢查遊戲是否勝利
        function resetTurn() {
            firstCard = null;
            secondCard = null;
            lockBoard = false;

            const unmatchedCards = cards.filter(card => !card.classList.contains("matched"));
            if (unmatchedCards.length <= 1) {
                setTimeout(() => {
                    let message = `🎉 全部配對完成！總共翻了 ${moveCount} 次`;
                    if (unmatchedCards.length === 1) {
                        message += ` (有一張卡片沒有配對夥伴)`;
                    }
                    gameMessageEl.textContent = message;
                    gameMessageEl.classList.add('show');

                    if (victorySound.readyState >= 2) {
                        victorySound.currentTime = 0;
                        victorySound.playbackRate = 1;
                        victorySound.play().catch(e => console.error("勝利音效播放失敗:", e));
                    } else {
                        console.warn("勝利音效尚未載入完成，無法播放。");
                    }
                    // --- Call showScore here when game is won ---
                    showScore(); // Call showScore after game ends
                }, 300);
            }
        }

        // --- New/Modified Functions for Firebase Integration ---

        // Display score and enable upload button
        function showScore() {
            // Display score (moveCount) to user
            // The game message already shows the moveCount, so we'll just show the upload button.
            uploadBtn.style.display = "inline-block"; // Show the upload button
        }

        // Upload score to Firebase
        async function uploadScore() {
            uploadBtn.disabled = true; // Disable button to prevent multiple uploads
            uploadBtn.textContent = "上傳中...";

            try {
                // Dynamically import Firebase modules
                const { db } = await import("../js/firebase.js"); // Assuming firebase.js is in js/
                const { collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

                const nickname = localStorage.getItem("nickname") || "匿名玩家";
                const gameId = "MemoryGame"; // Unique ID for Memory Game in Firestore

                await addDoc(collection(db, "memory_scores"), { // Use a specific collection for memory game
                    nickname: nickname,
                    moves: moveCount, // Store moveCount as "moves"
                    time: serverTimestamp()
                });

                alert("✅ 分數已上傳！");
                uploadBtn.textContent = "已上傳";
                loadLeaderboard(); // Reload leaderboard after successful upload

            } catch (error) {
                console.error("上傳分數失敗:", error);
                alert("❌ 分數上傳失敗。");
                uploadBtn.disabled = false; // Re-enable if failed
                uploadBtn.textContent = "⬆️ 上傳分數";
            }
        }

        // Load and display leaderboard from Firebase
        async function loadLeaderboard() {
            leaderboardListEl.innerHTML = '<li>載入中...</li>'; // Show loading state

            try {
                const { db } = await import("../js/firebase.js");
                const { collection, query, orderBy, limit, getDocs } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

                // Order by moves (ascending for best score, i.e., fewest moves), then by time
                const q = query(
                    collection(db, "memory_scores"),
                    orderBy("moves", "asc"), // Order by fewest moves first
                    orderBy("time", "desc"), // Then by latest time for ties
                    limit(10) // Get top 10 scores
                );

                const querySnapshot = await getDocs(q);
                leaderboardListEl.innerHTML = ''; // Clear loading state

                if (querySnapshot.empty) {
                    leaderboardListEl.innerHTML = '<li>目前沒有分數。快來挑戰！</li>';
                    return;
                }

                let rank = 1;
                querySnapshot.forEach((doc) => {
                    const scoreData = doc.data();
                    const listItem = document.createElement("li");
                    listItem.innerHTML = `
                        <span class="rank">${rank}.</span>
                        <span class="nickname">${scoreData.nickname}</span>
                        <span class="score">${scoreData.moves} 次</span>
                    `;
                    leaderboardListEl.appendChild(listItem);
                    rank++;
                });

            } catch (error) {
                console.error("載入排行榜失敗:", error);
                leaderboardListEl.innerHTML = '<li>載入排行榜失敗。</li>';
            }
        }

        // IIFE 返回 init 函數
        return {
            init
        };
    })();

    // === 啟動遊戲 ===
    memoryGame.init();

} // === if/else 塊結束 ===
