// games/block.js - 俄羅斯方塊

const gameContainer = document.getElementById("game-container");

if (!gameContainer) {
    console.error("錯誤: 找不到ID為 'game-container' 的元素!俄羅斯方塊遊戲無法啟動。");
} else {
    gameContainer.innerHTML = `
    <style>
        /* 俄羅斯方塊遊戲容器樣式 */
        .tetris-game-wrapper {
            text-align: center;
            padding: 40px;
            background-color: #ffffff;
            border-radius: 15px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            max-width: 800px; /* 調整寬度以適應俄羅斯方塊 */
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
            color: #6200ea; /* 紫色標題 */
            margin-bottom: 25px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            font-family: 'Cubic-11','FusionPixel','Arial Black', sans-serif;
        }

        #score {
            font-size: 1.6em;
            margin-bottom: 20px;
            color: #d81b60; /* 深粉色 */
            font-weight: bold;
        }

        #timer {
            font-size: 1.4em;
            margin-bottom: 20px;
            color: #00796b; /* 青綠色 */
            font-weight: bold;
        }

        .tetris-layout {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            gap: 20px;
            margin-top: 20px;
            flex-wrap: wrap; /* 讓內容在小螢幕上換行 */
        }

        .game-info {
            background-color: #e3f2fd; /* 淺藍色背景 */
            border: 1px solid #bbdefb;
            border-radius: 10px;
            padding: 15px;
            text-align: left;
            flex: 1;
            min-width: 180px; /* 最小寬度 */
            max-width: 250px;
            box-shadow: inset 0 0 5px rgba(0,0,0,0.05);
        }

        .game-info h3 {
            color: #1976d2; /* 深藍色標題 */
            margin-top: 0;
            font-size: 1.4em;
            border-bottom: 1px dashed #90caf9;
            padding-bottom: 8px;
            margin-bottom: 10px;
        }

        .game-info p {
            margin-bottom: 8px;
            color: #424242;
            font-size: 0.95em;
            line-height: 1.6;
        }
        .game-info ul {
            list-style: none;
            padding: 0;
            margin: 0;
            font-size: 0.95em;
            line-height: 1.6;
        }
        .game-info li {
            margin-bottom: 5px;
            color: #424242;
        }


        #next-piece-display {
            background-color: #fce4ec; /* 淺粉色背景 */
            border: 1px solid #f8bbd0;
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 15px;
            text-align: center;
            min-height: 100px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        #next-piece-display h4 {
            color: #e91e63;
            margin: 0 0 10px 0;
        }
        .next-piece-grid {
            display: grid;
            grid-template-columns: repeat(4, 20px); /* 為預覽區設置較小的網格 */
            gap: 1px;
            border: 1px solid #f06292;
            background-color: #f8bbd0;
            padding: 3px;
            border-radius: 5px;
        }
        .next-piece-tile {
            width: 20px;
            height: 20px;
            background-color: #ffffff; /* 預覽方塊背景 */
            border: 1px solid #f06292;
            box-sizing: border-box;
            border-radius: 3px;
        }


        .tetris-board {
            display: grid;
            border: 3px solid #673ab7; /* 深紫色邊框 */
            border-radius: 8px;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.15);
            background-color: #ede7f6; /* 淺紫色背景 */
            flex-shrink: 0;
            padding: 5px;
            width: fit-content;
        }

        .tetris-cell {
            width: 25px; /* 俄羅斯方塊標準方塊大小 */
            height: 25px;
            background-color: transparent;
            border: 1px solid rgba(0,0,0,0.1);
            box-sizing: border-box;
            border-radius: 2px;
        }

        /* 俄羅斯方塊顏色定義 (你可以調整這些顏色) */
        .color-0 { background-color: #00bcd4; border: 1px solid #0097a7; box-shadow: inset 0 0 5px #00838f; } /* Cyan - I */
        .color-1 { background-color: #3f51b5; border: 1px solid #303f9f; box-shadow: inset 0 0 5px #283593; } /* Blue - J */
        .color-2 { background-color: #ff9800; border: 1px solid #f57c00; box-shadow: inset 0 0 5px #ef6c00; } /* Orange - L */
        .color-3 { background-color: #ffeb3b; border: 1px solid #fbc02d; box-shadow: inset 0 0 5px #f9a825; } /* Yellow - O */
        .color-4 { background-color: #4caf50; border: 1px solid #388e3c; box-shadow: inset 0 0 5px #2e7d32; } /* Green - S */
        .color-5 { background-color: #9c27b0; border: 1px solid #7b1fa2; box-shadow: inset 0 0 5px #6a1b9a; } /* Purple - T */
        .color-6 { background-color: #f44336; border: 1px solid #d32f2f; box-shadow: inset 0 0 5px #c62828; } /* Red - Z */
        .solid { /* 已固定的方塊 */
            border: 1px solid rgba(0,0,0,0.2);
            box-shadow: inset 0 0 3px rgba(0,0,0,0.1);
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
            background-color: #7e57c2; /* 紫色按鈕 */
            color: white;
            margin: 25px 10px 0 10px;
        }

        #restart-btn:hover, #submit-score-btn:hover {
            background-color: #5e35b1; /* 懸停時顏色變深 */
            transform: translateY(-3px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.2);
        }

        #restart-btn:active, #submit-score-btn:active {
            background-color: #4527a0;
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
            background-color: #f3e5f5; /* 淺紫色背景 */
            border-radius: 10px;
            padding: 20px;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid #e1bee7;
        }

        .leaderboard-container h3 {
            color: #8e24aa; /* 深紫色標題 */
            margin-bottom: 15px;
            font-size: 1.5em;
            border-bottom: 2px solid #ce93d8;
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
            border-bottom: 1px dashed #ab47bc; /* 紫色虛線 */
            font-size: 1.1em;
            color: #555;
        }

        .leaderboard-list li:last-child {
            border-bottom: none;
        }

        .leaderboard-list li .rank {
            font-weight: bold;
            color: #673ab7; /* 紫色 */
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
            color: #4a148c; /* 深紫色 */
            width: 80px;
            text-align: right;
        }
    </style>

    <div class="tetris-game-wrapper">
        <h2>🧱</h2>
        
        <div class="tetris-layout">
            <div class="game-info">
                <h3>遊戲說明</h3>
                <ul>
                    <li>左右箭頭: 移動方塊</li>
                    <li>上箭頭: 旋轉方塊</li>
                    <li>下箭頭: 加速下落</li>
                    <li>空格鍵: 直接掉落</li>
                </ul>
                <p>消除一行得分，連續消除更多行可獲得額外分數。</p>
                <div id="next-piece-display">
                    <h4>下一塊</h4>
                    <div class="next-piece-grid" id="next-piece-grid"></div>
                </div>
            </div>
            <div class="tetris-board" id="game-board"></div>
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
        // --- 遊戲設定 ---
        const COLS = 10;
        const ROWS = 20;
        const CELL_SIZE = 25; // 與 CSS 中的 .tetris-cell 寬高一致

        // 方塊形狀定義
        // 每個方塊由4個方塊組成，定義為一個4x4的網格，1表示佔據，0表示空
        // 陣列中的每個子陣列代表一個旋轉狀態
        const TETROMINOES = [
            [ // I
                [0,0,0,0],
                [1,1,1,1],
                [0,0,0,0],
                [0,0,0,0]
            ],
            [ // J
                [1,0,0],
                [1,1,1],
                [0,0,0]
            ],
            [ // L
                [0,0,1],
                [1,1,1],
                [0,0,0]
            ],
            [ // O
                [1,1],
                [1,1]
            ],
            [ // S
                [0,1,1],
                [1,1,0],
                [0,0,0]
            ],
            [ // T
                [0,1,0],
                [1,1,1],
                [0,0,0]
            ],
            [ // Z
                [1,1,0],
                [0,1,1],
                [0,0,0]
            ]
        ];

        // 方塊顏色 (對應 TETROMINOES 索引)
        const COLORS = [
            'color-0', // I (Cyan)
            'color-1', // J (Blue)
            'color-2', // L (Orange)
            'color-3', // O (Yellow)
            'color-4', // S (Green)
            'color-5', // T (Purple)
            'color-6'  // Z (Red)
        ];

        // --- DOM 元素引用 ---
        const boardEl = document.getElementById("game-board");
        const scoreEl = document.getElementById("score");
        const timerEl = document.getElementById("timer");
        const restartBtn = document.getElementById("restart-btn");
        const submitScoreBtn = document.getElementById("submit-score-btn");
        const leaderboardListEl = document.getElementById("leaderboard-list");
        const nextPieceGridEl = document.getElementById("next-piece-grid");

        // --- 遊戲狀態變數 ---
        let grid = []; // 遊戲板狀態，儲存方塊顏色索引或 null
        let currentPiece = null;
        let nextPiece = null;
        let score = 0;
        let level = 1; // 暫時不需要等級邏輯，但可以保留
        let gameOver = true;
        let gameLoop; // requestAnimationFrame ID
        let dropInterval = 1000; // 方塊下落間隔 (毫秒)
        let lastDropTime = 0;

        let timeLeft = 300; // 5 分鐘 * 60 秒
        let timerInterval;

        // 音效 (請替換為適合俄羅斯方塊的音效)
        const dropSound = new Audio('assets/click.ogg'); // 方塊落下的聲音
        const clearSound = new Audio('assets/break.ogg'); // 消除行的聲音
        const gameOverSound = new Audio('assets/falled-sound-effect-278635.mp3'); // 遊戲結束的聲音

        // --- Firebase 相關變數 ---
        let db;
        let collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, onSnapshot; // 新增 onSnapshot
        let firebaseModulesLoaded = false; // 新增旗標以追蹤 Firebase 模組載入狀態

        // --- 初始化遊戲 ---
        async function init() {
            // 確保所有 DOM 元素都已載入
            if (!boardEl || !scoreEl || !timerEl || !restartBtn || !submitScoreBtn || !leaderboardListEl || !nextPieceGridEl) {
                console.error("俄羅斯方塊遊戲: 部分內部 DOM 元素未找到!遊戲無法啟動。");
                return;
            }

            boardEl.style.gridTemplateColumns = `repeat(${COLS}, ${CELL_SIZE}px)`;
            boardEl.style.gridTemplateRows = `repeat(${ROWS}, ${CELL_SIZE}px)`;

            restartBtn.addEventListener("click", startGame);
            submitScoreBtn.addEventListener("click", submitScore);

            // 首次載入 Firebase 相關函數和排行榜
            await loadFirebaseModules();
            // 在模組載入後，無論是否成功，都嘗試獲取排行榜
            fetchLeaderboard(); 

            startGame(); // 遊戲啟動時自動開始
        }

        // --- Firebase 模組動態載入函數 ---
        async function loadFirebaseModules() {
            if (firebaseModulesLoaded) { // 如果已經載入就不重複載入
                return;
            }
            try {
                const firebaseAppModule = await import("../js/firebase.js");
                db = firebaseAppModule.db;

                const firestoreFunctionsModule = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
                collection = firestoreFunctionsModule.collection;
                addDoc = firestoreFunctionsModule.addDoc;
                serverTimestamp = firestoreFunctionsModule.serverTimestamp;
                query = firestoreFunctionsModule.query;
                orderBy = firestoreFunctionsModule.orderBy;
                limit = firestoreFunctionsModule.limit;
                getDocs = firestoreFunctionsModule.getDocs;
                onSnapshot = firestoreFunctionsModule.onSnapshot; // 載入 onSnapshot

                if (typeof serverTimestamp !== 'function') {
                    console.error("錯誤: serverTimestamp 載入後仍不是一個函數。CDN 連結可能不提供此導出或版本問題。");
                    alert("Firebase 時間戳服務載入失敗，部分功能受限。");
                    firebaseModulesLoaded = false; // 標記為載入失敗
                } else {
                    firebaseModulesLoaded = true; // 標記為成功載入
                }
            } catch (error) {
                console.error("載入 Firebase 模組失敗:", error);
                alert("載入 Firebase 服務失敗，排行榜與分數上傳功能可能無法使用。詳情請查看控制台錯誤。");
                firebaseModulesLoaded = false; // 標記為載入失敗
            }
        }

        // --- 遊戲核心邏輯 ---

        function createEmptyGrid() {
            return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
        }

        function generateRandomPiece() {
            const typeIndex = Math.floor(Math.random() * TETROMINOES.length);
            return {
                shape: TETROMINOES[typeIndex],
                color: COLORS[typeIndex],
                x: Math.floor(COLS / 2) - Math.floor(TETROMINOES[typeIndex][0].length / 2),
                y: 0,
                typeIndex: typeIndex // 保存類型索引用於顏色
            };
        }

        function draw() {
            boardEl.innerHTML = '';
            // 繪製遊戲板上的已固定方塊
            grid.forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    const cellEl = document.createElement('div');
                    cellEl.classList.add('tetris-cell');
                    if (cell !== null) {
                        cellEl.classList.add(COLORS[cell], 'solid');
                    }
                    boardEl.appendChild(cellEl);
                });
            });

            // 繪製當前下落的方塊
            if (currentPiece) {
                currentPiece.shape.forEach((row, r) => {
                    row.forEach((value, c) => {
                        if (value === 1) {
                            const gridX = currentPiece.x + c;
                            const gridY = currentPiece.y + r;
                            if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
                                const cellIndex = gridY * COLS + gridX;
                                if (boardEl.children[cellIndex]) { // 確保元素存在
                                    boardEl.children[cellIndex].classList.add(currentPiece.color);
                                }
                            }
                        }
                    });
                });
            }
        }

        function drawNextPiece() {
            nextPieceGridEl.innerHTML = '';
            // 為確保預覽區塊能容納所有方塊的旋轉狀態，通常設置為4x4
            nextPieceGridEl.style.gridTemplateColumns = `repeat(4, 20px)`; 
            
            for (let r = 0; r < 4; r++) { // 預覽區通常是4x4
                for (let c = 0; c < 4; c++) {
                    const cellEl = document.createElement('div');
                    cellEl.classList.add('next-piece-tile');
                    // 檢查當前方塊形狀是否在預覽網格的範圍內
                    if (nextPiece && nextPiece.shape[r] && nextPiece.shape[r][c] === 1) { // 確保 nextPiece 存在
                        cellEl.classList.add(nextPiece.color);
                    }
                    nextPieceGridEl.appendChild(cellEl);
                }
            }
        }

        function checkCollision(piece, offsetX = 0, offsetY = 0) {
            for (let r = 0; r < piece.shape.length; r++) {
                for (let c = 0; c < piece.shape[r].length; c++) {
                    if (piece.shape[r][c] === 1) {
                        const newX = piece.x + c + offsetX;
                        const newY = piece.y + r + offsetY;

                        // 檢查邊界
                        if (newX < 0 || newX >= COLS || newY >= ROWS) {
                            return true;
                        }
                        // 檢查是否超出頂部 (遊戲開始時方塊生成在Y=0或負數，此時不應視為碰撞)
                        if (newY < 0) continue; 
                        
                        // 檢查是否與已固定的方塊碰撞
                        if (grid[newY] && grid[newY][newX] !== null) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        function mergePiece() {
            currentPiece.shape.forEach((row, r) => {
                row.forEach((value, c) => {
                    if (value === 1) {
                        const gridX = currentPiece.x + c;
                        const gridY = currentPiece.y + r;
                        if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
                            grid[gridY][gridX] = currentPiece.typeIndex; // 使用類型索引儲存顏色
                        }
                    }
                });
            });
            // 嘗試播放音效
            try {
                dropSound.currentTime = 0;
                dropSound.play().catch(e => console.warn("Error playing drop sound:", e)); // 使用 warn 避免中斷
            } catch (e) {
                console.warn("Failed to play drop sound (caught error):", e);
            }
        }

        function rotate(piece) {
            const originalShape = piece.shape;
            const newShape = [];
            for (let c = 0; c < originalShape[0].length; c++) {
                newShape.push([]);
                for (let r = originalShape.length - 1; r >= 0; r--) {
                    newShape[c].push(originalShape[r][c]);
                }
            }
            // 嘗試旋轉並檢查碰撞，如果碰撞則回溯
            const oldShape = piece.shape;
            piece.shape = newShape;
            if (checkCollision(piece)) {
                piece.shape = oldShape; // 旋轉失敗，回溯
            }
        }

        function clearLines() {
            let linesCleared = 0;
            for (let r = ROWS - 1; r >= 0; r--) {
                if (grid[r].every(cell => cell !== null)) {
                    // 該行已滿，消除
                    grid.splice(r, 1); // 移除該行
                    grid.unshift(Array(COLS).fill(null)); // 在頂部添加新行
                    linesCleared++;
                    r++; // 重新檢查當前行，因為新的行已經掉落下來
                }
            }
            if (linesCleared > 0) {
                score += linesCleared * 100 * linesCleared; // 消除多行有額外加分
                scoreEl.textContent = `分數: ${score}`;
                // 嘗試播放音效
                try {
                    clearSound.currentTime = 0;
                    clearSound.play().catch(e => console.warn("Error playing clear sound:", e)); // 使用 warn 避免中斷
                } catch (e) {
                    console.warn("Failed to play clear sound (caught error):", e);
                }
            }
        }

        function updateGame(time) {
            if (gameOver || timeLeft <= 0) {
                return;
            }

            if (!lastDropTime) {
                lastDropTime = time;
            }

            const deltaTime = time - lastDropTime;

            if (deltaTime > dropInterval) {
                movePiece(0, 1); // 自動下落
                lastDropTime = time;
            }
            
            draw();
            gameLoop = requestAnimationFrame(updateGame);
        }

        function movePiece(dx, dy) {
            if (gameOver || timeLeft <= 0) return;

            const newPiece = { ...currentPiece, x: currentPiece.x + dx, y: currentPiece.y + dy };
            if (!checkCollision(newPiece)) {
                currentPiece = newPiece;
            } else if (dy > 0) { // 如果是向下移動時發生碰撞
                mergePiece();
                clearLines();
                spawnNewPiece();
            }
        }

        function spawnNewPiece() {
            currentPiece = nextPiece;
            if (!currentPiece) { // 遊戲第一次開始時
                 currentPiece = generateRandomPiece();
            }
            nextPiece = generateRandomPiece(); // 準備下一塊
            drawNextPiece();

            // 檢查新的方塊是否在生成時就碰撞，如果是，則遊戲結束
            if (checkCollision(currentPiece)) {
                endGame();
            }
        }

        function handleKeyPress(e) {
            if (gameOver || timeLeft <= 0) return;

            switch (e.key) {
                case 'ArrowLeft':
                    movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault(); // 阻止頁面滾動
                    movePiece(0, 1); // 加速下落
                    break;
                case 'ArrowUp':
                    e.preventDefault(); // 阻止頁面滾動
                    rotate(currentPiece);
                    break;
                case ' ': // Spacebar for hard drop
                    e.preventDefault(); // 防止滾動頁面
                    hardDrop();
                    break;
            }
            draw(); // 每次操作後重新繪製
        }

        function hardDrop() {
            while (!checkCollision(currentPiece, 0, 1)) {
                currentPiece.y++;
            }
            mergePiece();
            clearLines();
            spawnNewPiece();
        }

        // 優化音效初始化，在用戶首次互動後嘗試播放靜音音效，以規避瀏覽器自動播放策略
        function initializeAudio() {
            const sounds = [dropSound, clearSound, gameOverSound];
            sounds.forEach(sound => {
                sound.volume = 0; // 靜音
                sound.play().then(() => {
                    sound.pause(); // 播放後立即暫停
                    sound.volume = 1; // 恢復音量
                    sound.currentTime = 0; // 重置到開始
                }).catch(e => {
                    console.warn(`音效初始化失敗（可能是瀏覽器自動播放限制）: ${sound.src}`, e);
                    // 如果用戶沒有互動，這裡可能會捕獲到錯誤
                    // 可以考慮添加一個提示，引導用戶點擊螢幕任意位置
                });
            });
        }

        function startGame() {
            gameOver = false;
            score = 0;
            scoreEl.textContent = `分數: ${score}`;
            grid = createEmptyGrid(); // 初始化空白遊戲板
            currentPiece = null; // 清空當前方塊
            nextPiece = null; // 清空下一塊方塊
            
            submitScoreBtn.style.display = 'none'; // 隱藏上傳按鈕
            submitScoreBtn.disabled = false; // 啟用按鈕
            submitScoreBtn.textContent = "⬆️ 上傳分數"; // 重置按鈕文字

            clearInterval(timerInterval); // 清除之前的計時器
            timeLeft = 300; // 重置時間
            startTimer(); // 啟動計時器

            spawnNewPiece(); // 生成第一個方塊
            draw(); // 繪製初始狀態
            
            cancelAnimationFrame(gameLoop); // 清除之前的遊戲循環
            gameLoop = requestAnimationFrame(updateGame); // 啟動遊戲循環
            document.addEventListener('keydown', handleKeyPress); // 綁定鍵盤事件
            
            // 在遊戲開始時（用戶點擊了重新開始），嘗試初始化音效
            initializeAudio(); 
        }

        function endGame() {
            if (gameOver) return; // 避免重複觸發
            gameOver = true;
            cancelAnimationFrame(gameLoop);
            clearInterval(timerInterval);
            timerEl.textContent = "遊戲結束!";
            submitScoreBtn.style.display = 'block'; // 顯示上傳按鈕
            alert(`遊戲結束！你的分數是: ${score}`);
            // 嘗試播放音效
            try {
                gameOverSound.currentTime = 0;
                gameOverSound.play().catch(e => console.warn("Error playing game over sound:", e)); // 使用 warn 避免中斷
            } catch (e) {
                console.warn("Failed to play game over sound (caught error):", e);
            }
            document.removeEventListener('keydown', handleKeyPress); // 解除鍵盤事件
        }

        function startTimer() {
            timerInterval = setInterval(() => {
                timeLeft--;
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                timerEl.textContent = `剩餘時間: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

                if (timeLeft <= 0) {
                    endGame(); // 時間到，遊戲結束
                }
            }, 1000);
        }

        // --- Firebase 分數上傳與排行榜 ---

        async function submitScore() {
            if (!firebaseModulesLoaded) { // 檢查 Firebase 模組是否成功載入
                alert("Firebase 服務未正確載入，無法上傳分數。請檢查網絡或瀏覽器控制台錯誤。");
                return;
            }
            if (!db || typeof addDoc !== 'function' || typeof serverTimestamp !== 'function') {
                alert("Firebase 服務未正確載入，無法上傳分數。");
                return;
            }

            submitScoreBtn.disabled = true;
            submitScoreBtn.textContent = "上傳中...";

            const playerName = localStorage.getItem("nickname") || prompt("請輸入你的名字:", "匿名玩家");

            if (playerName) {
                localStorage.setItem("nickname", playerName);
                try {
                    await addDoc(collection(db, "tetris_scores"), { // 改為 "tetris_scores"
                        name: playerName,
                        score: score,
                        timestamp: serverTimestamp()
                    });
                    alert("✅ 分數已成功上傳!");
                    submitScoreBtn.textContent = "已上傳";
                    // 因為我們現在使用 onSnapshot，所以不需要手動調用 fetchLeaderboard
                    // fetchLeaderboard(); 
                } catch (error) {
                    console.error("上傳分數失敗:", error);
                    alert("❌ 上傳分數失敗，請稍後再試。錯誤訊息: " + error.message); // 顯示具體錯誤訊息
                    submitScoreBtn.disabled = false;
                    submitScoreBtn.textContent = "⬆️ 上傳分數";
                }
            } else {
                submitScoreBtn.disabled = false;
                submitScoreBtn.textContent = "⬆️ 上傳分數";
            }
        }

        async function fetchLeaderboard() {
            // 不再等待 loadFirebaseModules，因為它在 init() 中已先行載入
            if (!firebaseModulesLoaded) {
                 leaderboardListEl.innerHTML = '<li>Firebase 服務未成功載入，無法顯示排行榜。</li>';
                 return;
            }
            if (!db || typeof query !== 'function' || typeof onSnapshot !== 'function') {
                leaderboardListEl.innerHTML = '<li>Firebase 服務未正確載入，無法顯示排行榜。</li>';
                return;
            }

            leaderboardListEl.innerHTML = '<li>載入中...</li>';

            try {
                const q = query(
                    collection(db, "tetris_scores"), // 改為 "tetris_scores"
                    orderBy("score", "desc"),
                    orderBy("timestamp", "desc"), // 確保這個 order by 存在，否則會出現索引錯誤
                    limit(10)
                );

                // 使用 onSnapshot 監聽實時更新
                onSnapshot(q, (querySnapshot) => {
                    leaderboardListEl.innerHTML = ''; // 清空列表
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
                }, (error) => {
                    console.error("實時監聽排行榜失敗:", error);
                    let errorMessage = '載入排行榜失敗。';
                    // 如果錯誤是關於索引的，提供更具體的提示
                    if (error.code === 'failed-precondition' && error.message.includes('The query requires an index')) {
                        const indexUrlMatch = error.message.match(/https:\/\/console\.firebase\.google\.com\/v\d\/r\/project\/[^\s]+/);
                        let indexLink = '';
                        if (indexUrlMatch && indexUrlMatch[0]) {
                            indexLink = `<a href="${indexUrlMatch[0]}" target="_blank" style="color: #6200ea;">點擊這裡建立索引</a>`;
                        }
                        errorMessage = `排行榜載入需要一個 **Firestore 索引**。請到 Firebase 控制台建立。${indexLink}`;
                    }
                    leaderboardListEl.innerHTML = `<li>${errorMessage}</li>`;
                });

            } catch (error) {
                console.error("嘗試設定排行榜監聽失敗:", error);
                leaderboardListEl.innerHTML = '<li>載入排行榜失敗。請檢查控制台錯誤。</li>';
            }
        }

        // 啟動遊戲和排行榜
        init();
    })(); 
}
