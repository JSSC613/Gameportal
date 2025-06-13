// games/match3.js
const gameContainer = document.getElementById("game-container");

if (!gameContainer) {
    console.error("錯誤: 找不到ID為 'game-container' 的元素!消消樂遊戲無法啟動。");
} else {
    gameContainer.innerHTML = `
    <style>
        /* 消消樂遊戲容器樣式 */
        .match3-game-wrapper {
            text-align: center;
            padding: 40px;
            background-color: #ffffff;
            border-radius: 15px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            max-width: 700px; /* 根據需要調整寬度 */
            width: 90%;
            margin: 50px auto;
            border: 1px solid #e0e0e0;
            box-sizing: border-box;
            font-family: 'Cubic-11','FusionPixel', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            position: relative;
        }

        h2 {
            font-size: 2.8em;
            color: #ff5722; /* 橘紅色標題 */
            margin-bottom: 25px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            font-family: 'Cubic-11','FusionPixel','Arial Black', sans-serif;
        }

        #score {
            font-size: 1.6em;
            margin-bottom: 20px;
            color: #880e4f; /* 深紫紅色 */
            font-weight: bold;
        }

        #timer {
            font-size: 1.4em;
            margin-bottom: 20px;
            color: #00796b; /* 青綠色 */
            font-weight: bold;
        }

        .match3-layout {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            gap: 20px;
            margin-top: 20px;
            flex-wrap: wrap; /* 讓內容在小螢幕上換行 */
        }

        .instructions {
            background-color:#c7d2e2; /* 淺粉色背景 */
            border: 1px solid #f8bbd0;
            border-radius: 10px;
            padding: 15px;
            text-align: left;
            flex: 1;
            min-width: 250px; /* 最小寬度 */
            max-width: 350px;
            box-shadow: inset 0 0 5px rgba(0,0,0,0.05);
        }

        .instructions h3 {
            color: #e91e63; /* 亮粉色標題 */
            margin-top: 0;
            font-size: 1.4em;
            border-bottom: 1px dashed #f48fb1;
            padding-bottom: 8px;
            margin-bottom: 10px;
        }

        .instructions ul {
            list-style: none;
            padding: 0;
            margin: 0;
            font-size: 0.95em;
            line-height: 1.6;
        }

        .instructions li {
            margin-bottom: 8px;
            color: #4a148c; /* 深紫色文字 */
        }

        .match3-board {
            display: grid;
            border: 3px solid #a3b1c6; 
            border-radius: 8px;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.15);
            background-color: #c7d2e2; 
            flex-shrink: 0;
            padding: 8px;
            width: fit-content;
        }

        .tile {
            width: 50px;
            height: 50px;
            background-color:#e6e9ee; /* 橘色方塊 */
            border-radius: 8px;
            margin: 0px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            cursor: pointer;
            user-select: none;
            transition: transform 0.1s ease-out, background-color 0.2s ease;
            box-shadow: 0 3px 6px rgba(0,0,0,0.1);
            border: 2px outset #a3b1c6;
        }

        .tile:hover:not(.selected):not(.removing):not(.dropping) {
            transform: scale(1.05);
            box-shadow: 0 5px 10px rgba(0,0,0,0.15);
        }

        .tile.selected {
            border: 3px solid rgba(255, 238, 88, 0.76); /* 選擇時亮黃色邊框 */
            box-shadow: 0 0 0 4px rgba(255, 235, 59, 0.76), 0 0 15px rgba(255,235,59,0.76);
            transform: scale(0.95); /* 選擇時輕微縮小 */
            z-index: 2;
        }

        .tile.removing {
            opacity: 0;
            transform: scale(0.1) rotate(360deg);
            transition: all 0.4s ease-out;
            pointer-events: none;
        }

        .tile.dropping {
            transition: transform 0.3s ease-in-out;
        }

        #restart-btn, #submit-score-btn {
            font-family: 'Cubic-11','FusionPixel','Comic Sans MS', 'ZCOOL KuaiLe', 'Noto Sans TC', cursive, sans-serif;
            padding: 12px 22px;
            border-radius: 10px;
            border: none;
            font-size: 1.2em;
            cursor: pointer;
            transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            background-color: #ff7043; /* 亮橘色按鈕 */
            color: white;
            margin: 25px 10px 0 10px;
        }

        #restart-btn:hover, #submit-score-btn:hover {
            background-color: #f4511e; /* 懸停時顏色變深 */
            transform: translateY(-3px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.2);
        }

        #restart-btn:active, #submit-score-btn:active {
            background-color: #bf360c;
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        #submit-score-btn {
            background-color: #4CAF50; /* 綠色上傳按鈕 */
        }
        #submit-score-btn:hover {
            background-color: #43A047;
        }
        #submit-score-btn:active {
            background-color: #388E3C;
        }

        /* 排行榜樣式 */
        .leaderboard-container {
            margin-top: 30px;
            background-color: #fff3e0; /* 淺橘色背景 */
            border-radius: 10px;
            padding: 20px;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid #ffccbc;
        }

        .leaderboard-container h3 {
            color: #e64a19; /* 深橘色標題 */
            margin-bottom: 15px;
            font-size: 1.5em;
            border-bottom: 2px solid #ffab91;
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
            border-bottom: 1px dashed #ff9800; /* 橘色虛線 */
            font-size: 1.1em;
            color: #555;
        }

        .leaderboard-list li:last-child {
            border-bottom: none;
        }

        .leaderboard-list li .rank {
            font-weight: bold;
            color: #d84315; /* 紅橘色 */
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
            color: #e65100; /* 深橘色 */
            width: 80px;
            text-align: right;
        }
    </style>

    <div class="match3-game-wrapper">
        <h2>💎 消消樂遊戲</h2>
        
        <div class="match3-layout">
            <div class="instructions">
                <h3>玩法說明</h3>
                <ul>
                    <li>點擊相鄰的兩個方塊來交換它們的位置。</li>
                    <li>當水平或垂直方向有 <strong>3 個或更多</strong>相同圖案的方塊連成一線時，即可消除並得分。</li>
                    <li>消除後，上方的方塊會向下掉落填補空缺，並從頂部補充新的方塊。</li>
                    <li>如果交換方塊後沒有產生任何消除，方塊會自動彈回原位。</li>
                    <li>特殊方塊：<strong style="font-size:1.2em;">🥠幸運餅乾</strong> - 點擊幸運餅乾並與其他方塊交換，會消除棋盤上所有與被交換方塊相同類型的方塊<strong>！</strong></li>
                </ul>
            </div>
            <div class="match3-board" id="game-board"></div>
        </div>
        <div id="score">分數: 0</div>
        <div id="timer">剩餘時間: 5:00</div>
        <button id="restart-btn">🔁 重新開始</button>
        <button id="submit-score-btn" style="display:none;">⬆️ 上傳分數</button>
        <div class="leaderboard-container">
            <h3>🏆 排行榜</h3>
            <ul id="leaderboard-list" class="leaderboard-list">
                <li>載入中...</li>
            </ul>
        </div>
    </div>
    `;

 (async () => {
        const boardSize = 9;
        const tileTypes = ["🍔", "🍟", "🥤", "🌭", "🍕", "🧆", "🍿", "🍨"];
        const specialTileType = "🥠";
        let board = [];
        let score = 0;
        let firstTile = null;
        let isProcessing = false;
        const boardEl = document.getElementById("game-board");
        const scoreEl = document.getElementById("score");
        const restartBtn = document.getElementById("restart-btn");
        const timerEl = document.getElementById("timer");
        const submitScoreBtn = document.getElementById("submit-score-btn");
        const leaderboardListEl = document.getElementById("leaderboard-list"); // Updated ID
        let timeLeft = 300; // 5 分鐘 * 60 秒
        let timerInterval;

        boardEl.style.gridTemplateColumns = `repeat(${boardSize}, 50px)`;

        const popSound = new Audio('assets/eating-effect-254996.mp3');

        
        let db; // 將在 init 或第一次需要時載入
        let collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs;

        // 初始化遊戲
        async function init() {
            if (!boardEl || !scoreEl || !restartBtn || !timerEl || !submitScoreBtn || !leaderboardListEl) {
                console.error("消消樂遊戲: 部分內部 DOM 元素未找到!遊戲無法啟動。");
                return;
            }

            restartBtn.addEventListener("click", startGame);
            submitScoreBtn.addEventListener("click", submitScore);
            startGame();
            await fetchLeaderboard(); // 初始載入排行榜
        }

        function startGame() {
            score = 0;
            scoreEl.textContent = `分數:${score}`;
            firstTile = null;
            isProcessing = false;
            createBoard();
            timeLeft = 300;
            timerEl.textContent = "剩餘時間: 5:00";
            submitScoreBtn.style.display = 'none'; // 隱藏上傳按鈕
            submitScoreBtn.disabled = false; // 啟用按鈕
            submitScoreBtn.textContent = "⬆️ 上傳分數"; // 重置按鈕文字
            startTimer();
        }

        function startTimer() {
            clearInterval(timerInterval); // 清除之前的計時器
            timerInterval = setInterval(() => {
                timeLeft--;
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                timerEl.textContent = `剩餘時間: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    timerEl.textContent = "時間到!";
                    submitScoreBtn.style.display = 'block'; // 顯示上傳按鈕
                }
            }, 1000);
        }

        async function submitScore() {
            // 動態載入 Firebase 模組
            // 檢查 db 或 serverTimestamp 是否尚未載入，避免重複載入
            if (!db || typeof serverTimestamp !== 'function') {
                try {
                    // 1. 從 '../js/firebase.js' 載入 db
                    const firebaseAppModule = await import("../js/firebase.js");
                    db = firebaseAppModule.db;

                    // 2. 從 CDN 載入 Firestore 相關函數
                    const firestoreFunctionsModule = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
                    
                    // 明確地賦值所有需要的 Firestore 函數
                    collection = firestoreFunctionsModule.collection;
                    addDoc = firestoreFunctionsModule.addDoc;
                    serverTimestamp = firestoreFunctionsModule.serverTimestamp; // 確保 serverTimestamp 正確賦值

                    // 如果需要，也可以在這裡載入 fetchLeaderboard 中會用到的函數
                    query = firestoreFunctionsModule.query;
                    orderBy = firestoreFunctionsModule.orderBy;
                    limit = firestoreFunctionsModule.limit;
                    getDocs = firestoreFunctionsModule.getDocs;

                    // 額外檢查：確保 serverTimestamp 確實是一個函數
                    if (typeof serverTimestamp !== 'function') {
                        console.error("錯誤: serverTimestamp 載入後仍不是一個函數。CDN 連結可能不提供此導出或版本問題。");
                        alert("Firebase 時間戳服務載入失敗，無法上傳分數。");
                        submitScoreBtn.disabled = false;
                        submitScoreBtn.textContent = "⬆️ 上傳分數";
                        return; // 阻止繼續執行
                    }

                } catch (error) {
                    console.error("載入 Firebase 模組失敗:", error);
                    alert("載入 Firebase 服務失敗，無法上傳分數。");
                    return;
                }
            }

            submitScoreBtn.disabled = true; // 禁用按鈕防止重複點擊
            submitScoreBtn.textContent = "上傳中...";

            const playerName = localStorage.getItem("nickname") || prompt("請輸入你的名字:", "匿名玩家");

            if (playerName) {
                localStorage.setItem("nickname", playerName); // 保存暱稱
                try {
                    await addDoc(collection(db, "match3_scores"), {
                        name: playerName,
                        score: score,
                        timestamp: serverTimestamp()
                    });
                    alert("✅ 分數已成功上傳!");
                    submitScoreBtn.textContent = "已上傳";
                    await fetchLeaderboard(); // 上傳成功後重新載入排行榜
                } catch (error) {
                    console.error("上傳分數失敗:", error);
                    alert("❌ 上傳分數失敗，請稍後再試。");
                    submitScoreBtn.disabled = false; // 重新啟用按鈕
                    submitScoreBtn.textContent = "⬆️ 上傳分數"; // 重置按鈕文字
                }
            } else {
                submitScoreBtn.disabled = false;
                submitScoreBtn.textContent = "⬆️ 上傳分數";
            }
        }

        async function fetchLeaderboard() {
            leaderboardListEl.innerHTML = '<li>載入中...</li>';
            // 動態載入 Firebase 模組
            // 檢查 db 或 query 是否尚未載入，避免重複載入
            if (!db || typeof query !== 'function') { // 這裡檢查 query 也可以，確保 Firestore 相關函數已載入
                try {
                    const firebaseAppModule = await import("../js/firebase.js");
                    db = firebaseAppModule.db;

                    const firestoreFunctionsModule = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
                    
                    // 明確地賦值所有需要的 Firestore 函數
                    collection = firestoreFunctionsModule.collection;
                    query = firestoreFunctionsModule.query;
                    orderBy = firestoreFunctionsModule.orderBy;
                    limit = firestoreFunctionsModule.limit;
                    getDocs = firestoreFunctionsModule.getDocs;
                    
                    // 雖然 fetchLeaderboard 不直接使用 addDoc 和 serverTimestamp，
                    // 但由於它們是同一個模組，也可以在這裡一併載入，確保所有變數都可用
                    addDoc = firestoreFunctionsModule.addDoc;
                    serverTimestamp = firestoreFunctionsModule.serverTimestamp;

                } catch (error) {
                    console.error("載入 Firebase 模組失敗:", error);
                    leaderboardListEl.innerHTML = '<li>載入排行榜失敗。</li>';
                    return;
                }
            }

            try {
                const q = query(
                    collection(db, "match3_scores"),
                    orderBy("score", "desc"), // 按分數降序排列
                    orderBy("timestamp", "desc"), // 分數相同時，按最新時間排列
                    limit(10) // 只顯示前 10 名
                );
                const querySnapshot = await getDocs(q);
                leaderboardListEl.innerHTML = ''; // 清空載入狀態

                if (querySnapshot.empty) {
                    leaderboardListEl.innerHTML = '<li>目前沒有分數。快來挑戰！</li>';
                    return;
                }

                let rank = 1;
                querySnapshot.forEach(doc => {
                    const scoreData = doc.data();
                    const listItem = document.createElement("li");
                    listItem.innerHTML = `
                        <span class="rank">${rank}.</span>
                        <span class="nickname">${scoreData.name}</span>
                        <span class="score">${scoreData.score} 分</span>
                    `;
                    leaderboardListEl.appendChild(listItem);
                    rank++;
                });
            } catch (error) {
                console.error("載入排行榜失敗:", error);
                leaderboardListEl.innerHTML = '<li>載入排行榜失敗。</li>';
            }
        }

        function createBoard() {
            board = [];
            boardEl.innerHTML = '';

            for (let i = 0; i < boardSize * boardSize; i++) {
                let randomType;

                if (Math.random() < 0.02) { // 2% 機率生成特殊方塊
                    randomType = specialTileType;
                } else {
                    randomType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
                }
                board.push(randomType);

                const tileEl = document.createElement("div");
                tileEl.classList.add("tile");
                tileEl.textContent = randomType;
                tileEl.dataset.index = i;
                tileEl.addEventListener("click", () => handleTileClick(i));
                boardEl.appendChild(tileEl);
            }

          
            let initialMatches = findMatches();
            let attempts = 0;
            while (initialMatches.length > 0 && attempts < 100) {
                shuffleBoard(); // 隨機打亂棋盤
                initialMatches = findMatches();
                attempts++;
            }
            renderBoard();
        }

        function shuffleBoard() {
            board.sort(() => Math.random() - 0.5);
            renderBoard();
        }


        function renderBoard() {
            const tiles = boardEl.children;
            for (let i = 0; i < board.length; i++) {
                const tileEl = tiles[i];

                tileEl.classList.remove("selected", "dropping", "removing");
                tileEl.style.transform = '';
                tileEl.style.transition = '';

                tileEl.textContent = board[i] || "";
                tileEl.style.visibility = board[i] === null ? 'hidden' : 'visible';
            }
        }

        async function handleTileClick(index) {
            if (isProcessing || timeLeft <= 0) return; // 時間到或正在處理中，禁止點擊

            const tileEl = boardEl.children[index];

            if (!firstTile && board[index] !== null) {
                firstTile = index;
                tileEl.classList.add("selected");
            } else if (firstTile !== null) {
                const secondTile = index;

                if (firstTile === secondTile) { // 點擊同一個方塊，取消選擇
                    boardEl.children[firstTile].classList.remove("selected");
                    firstTile = null;
                    return;
                }

                
                const isAdjacent = (
                    (Math.abs(firstTile - secondTile) === 1 && Math.floor(firstTile / boardSize) === Math.floor(secondTile / boardSize)) || // 水平相鄰且在同一行
                    Math.abs(firstTile - secondTile) === boardSize // 垂直相鄰
                );

                if (isAdjacent) {
                    isProcessing = true; // 鎖定棋盤
                    boardEl.children[firstTile].classList.remove("selected");
                    if (secondTile !== firstTile) {
                        boardEl.children[secondTile].classList.remove("selected");
                    }

                    if (board[firstTile] === specialTileType || board[secondTile] === specialTileType) {
                        const specialTileIdx = (board[firstTile] === specialTileType) ? firstTile : secondTile;
                        const otherTileIdx = (specialTileIdx === firstTile) ? secondTile : firstTile;
                        const targetType = board[otherTileIdx];

                        const indicesToEliminate = new Set();

                        indicesToEliminate.add(firstTile);
                        indicesToEliminate.add(secondTile);

                        for (let i = 0; i < board.length; i++) {
                            if (board[i] === targetType && board[i] !== null) {
                                indicesToEliminate.add(i);
                            }
                        }
                        board[specialTileIdx] = null; // 移除特殊方塊
                        board[otherTileIdx] = null; // 移除被交換的方塊

                        if (indicesToEliminate.size > 0) {
                            try {
                                popSound.currentTime = 0;
                                popSound.play().catch(e => console.error("Error playing pop sound:", e));
                            } catch (e) {
                                console.error("Failed to play pop sound:", e);
                            }

                            await removeTilesAnimated(Array.from(indicesToEliminate)); // 執行消除動畫並等待完成
                            firstTile = null; // 重置第一次點擊的狀態
                            await processMatches(); // 觸發後續的掉落、補充、連鎖消除流程
                        } else {
                            
                            setTimeout(() => { // 給一點點時間，讓初始的兩個方塊消失效果出現
                                swapTiles(firstTile, secondTile); // 換回
                                renderBoard(); // 更新顯示
                                firstTile = null; // 重置
                                isProcessing = false; // 解鎖
                            }, 300);
                        }

                    } else {
                    
                        swapTiles(firstTile, secondTile); // 交換方塊
                        renderBoard(); 
                        const newMatches = findMatches();
                        if (newMatches.length > 0) {
                            firstTile = null; 
                            await new Promise(resolve => setTimeout(resolve, 300)); // 延遲處理配對,留給動畫時間
                            await processMatches(); // 觸發後續流程
                        } else {
                            // 如果交換後沒有配對，則換回去並重置狀態
                            await new Promise(resolve => setTimeout(resolve, 500)); // 等待一下，讓玩家看到交換
                            swapTiles(firstTile, secondTile); // 換回
                            renderBoard(); // 更新顯示
                            firstTile = null; // 重置
                            isProcessing = false; // 解鎖
                        }
                    }
                } else {
                    // 如果點擊的不是相鄰方塊，則重新選擇
                    boardEl.children[firstTile].classList.remove("selected");
                    firstTile = index;
                    tileEl.classList.add("selected");
                }
            }
        }

        function swapTiles(index1, index2) {
            const temp = board[index1];
            board[index1] = board[index2];
            board[index2] = temp;
        }

        function findMatches() {
            const matches = new Set();

            // 檢查水平匹配
            for (let row = 0; row < boardSize; row++) {
                for (let col = 0; col < boardSize - 2; col++) {
                    const i = row * boardSize + col;
                    const tile1 = board[i];
                    const tile2 = board[i + 1];
                    const tile3 = board[i + 2];

                    if (tile1 && tile1 !== specialTileType && tile1 === tile2 && tile1 === tile3) {
                        matches.add(i);
                        matches.add(i + 1);
                        matches.add(i + 2);
                        // 檢查更長的鏈
                        let k = 3;
                        while (col + k < boardSize && board[i + k] === tile1) {
                            matches.add(i + k);
                            k++;
                        }
                    }
                }
            }

            // 檢查垂直匹配
            for (let col = 0; col < boardSize; col++) {
                for (let row = 0; row < boardSize - 2; row++) {
                    const i = row * boardSize + col;
                    const tile1 = board[i];
                    const tile2 = board[i + boardSize];
                    const tile3 = board[i + 2 * boardSize];

                    if (tile1 && tile1 !== specialTileType && tile1 === tile2 && tile1 === tile3) {
                        matches.add(i);
                        matches.add(i + boardSize);
                        matches.add(i + 2 * boardSize);
                        // 檢查更長的鏈
                        let k = 3;
                        while (row + k < boardSize && board[i + k * boardSize] === tile1) {
                            matches.add(i + k * boardSize);
                            k++;
                        }
                    }
                }
            }

            return Array.from(matches);
        }

        function removeTilesAnimated(indices) {
            if (indices.length === 0) return Promise.resolve();
            try {
                popSound.currentTime = 0;
                popSound.play().catch(e => console.error("Error playing pop sound:", e));
            } catch (e) {
                console.error("Failed to play pop sound:", e);
            }

            const animationPromises = indices.map(index => {
                return new Promise(resolve => {
                    const tileEl = boardEl.children[index];
                    if (tileEl && board[index] !== null) { // 確保元素存在且不是已經為空
                        tileEl.classList.add("removing");
                        score += 10; // 每個消除的方塊加10分
                        scoreEl.textContent = `分數:${score}`;
                        tileEl.addEventListener('transitionend', function handler() {
                            tileEl.removeEventListener('transitionend', handler);
                            board[index] = null; // 設置為 null 表示空位
                            renderBoard(); // 更新顯示為空
                            resolve();
                        }, { once: true });
                    } else if (tileEl && board[index] === null) {
                        
                        tileEl.style.visibility = 'hidden';
                        tileEl.classList.remove("removing");
                        tileEl.style.transform = '';
                        tileEl.style.transition = '';
                        resolve();
                    } else {
                        // 如果元素不存在，直接 resolve
                        resolve();
                    }
                });
            });
            return Promise.all(animationPromises);
        }

        async function dropTilesAnimated() {
            let tilesMoved = false;
            const animationPromises = [];

            for (let col = 0; col < boardSize; col++) {
                let emptySpots = []; 
                for (let row = boardSize - 1; row >= 0; row--) {
                    const currentIndex = row * boardSize + col;
                    if (board[currentIndex] === null) {
                        emptySpots.push(currentIndex); // 找到空位
                    } else if (emptySpots.length > 0) { // 找到非空方塊且有空位可填充
                        const dropToIndex = emptySpots.shift(); 
                        board[dropToIndex] = board[currentIndex];
                        board[currentIndex] = null;

                        const tileEl = boardEl.children[currentIndex]; // 被移動的方塊的舊位置元素
                        const targetTileEl = boardEl.children[dropToIndex]; 
                        targetTileEl.textContent = board[dropToIndex];
                        targetTileEl.style.visibility = 'visible';
                        targetTileEl.classList.remove("removing"); // 移除可能存在的移除類
                        
                        // 將舊位置的元素隱藏
                        tileEl.style.visibility = 'hidden';
                        tileEl.textContent = ''; // 清除舊位置的內容

                        // 計算掉落距離並應用動畫
                        const distance = (dropToIndex - currentIndex) / boardSize * 55; // 55px 是方塊高度 + margin
                        
                        // 瞬移到上方起始位置
                        targetTileEl.style.transition = 'none'; // 暫停過渡
                        targetTileEl.style.transform = `translateY(-${distance}px)`;
                        void targetTileEl.offsetWidth; // 強制瀏覽器重繪

                        // 啟動掉落動畫
                        targetTileEl.classList.add("dropping");
                        targetTileEl.style.transition = 'transform 0.3s ease-in-out';
                        targetTileEl.style.transform = `translateY(0px)`;

                        tilesMoved = true;

                        animationPromises.push(new Promise(resolve => {
                            targetTileEl.addEventListener('transitionend', function handler() {
                                targetTileEl.removeEventListener('transitionend', handler);
                                targetTileEl.classList.remove("dropping");
                                targetTileEl.style.transform = ''; // 清除 transform
                                targetTileEl.style.transition = ''; // 清除 transition
                                resolve();
                            }, { once: true });
                        }));

                        emptySpots.push(currentIndex); 
                    }
                }
            }
            await Promise.all(animationPromises); // 等待所有掉落動畫完成
            renderBoard(); // 確保最終狀態正確
            return tilesMoved; // 返回是否有方塊移動
        }

        function refillBoard() {
            let tilesRefilled = false;
            for (let col = 0; col < boardSize; col++) {
                for (let row = 0; row < boardSize; row++) {
                    const index = row * boardSize + col;
                    if (board[index] === null) {
                        let randomType;
                        if (Math.random() < 0.02) { // 2% 機率生成特殊方塊
                            randomType = specialTileType;
                        } else {
                            randomType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
                        }
                        board[index] = randomType;
                        tilesRefilled = true;

                        // 視覺上讓新方塊從頂部掉落
                        const tileEl = boardEl.children[index];
                        tileEl.textContent = randomType;
                        tileEl.style.visibility = 'visible';
                        
                        // 瞬移到上方 (棋盤外)
                        tileEl.style.transition = 'none';
                        tileEl.style.transform = `translateY(-${(boardSize - row) * 55}px)`; // 根據行數計算從多高掉下來
                        void tileEl.offsetWidth; // 強制重繪

                        // 啟動掉落動畫
                        tileEl.classList.add("dropping");
                        tileEl.style.transition = 'transform 0.3s ease-out';
                        tileEl.style.transform = `translateY(0px)`;
                    }
                }
            }
            return tilesRefilled;
        }

        async function processMatches() {
            isProcessing = true; // 鎖定操作

            let hasMoreMatches = true;

            while (hasMoreMatches) {
                let matchesFound = findMatches();
                if (matchesFound.length > 0) {
                    await removeTilesAnimated(matchesFound); 
                }

                renderBoard();

                const tilesMoved = await dropTilesAnimated(); 

                const tilesRefilled = refillBoard(); 

                renderBoard(); 
                await new Promise(resolve => setTimeout(resolve, 100));

                const newMatchesAfterRefill = findMatches();
                if (newMatchesAfterRefill.length === 0 && !tilesMoved && !tilesRefilled) {
            
                    hasMoreMatches = false;
                }
            }
            isProcessing = false; 
            renderBoard(); 
        }

        init();
    })(); 
}
