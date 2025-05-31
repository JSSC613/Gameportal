// games/snake.js
import { rtdb } from '../js/firebase.js';

// Realtime Database 相關函數
import { ref, push, set, onValue, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
const gameContainer = document.getElementById("game-container");

if (!gameContainer) {
    console.error("錯誤: 找不到ID為 'game-container' 的元素!貪食蛇遊戲無法啟動。");
} else {
    // 注入遊戲 HTML 和 CSS
    gameContainer.innerHTML = `
    <style>
        /* 貪食蛇遊戲容器樣式 */
        .snake-game-wrapper {
            text-align: center;
            padding: 30px;
            background-color: #ffffff; /* 亮白色容器背景 */
            border-radius: 15px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            max-width: 900px; /* 增加最大寬度以容納說明和更大的棋盤 */
            width: 95%;
            margin: 50px auto;
            border: 1px solid #e0e0e0;
            box-sizing: border-box;
            font-family:'Cubic-11', 'FusionPixel','Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
        }

        h2 {
            font-size: 2.8em;
            color: #3f51b5;
            margin-bottom: 25px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            font-family: 'Cubic-11','FusionPixel','Arial Black', sans-serif;
        }

        /* 新增佈局容器，用於並排顯示說明和遊戲板 */
        .snake-layout {
            display: flex; /* 使用 Flexbox */
            justify-content: center; /* 水平居中 */
            align-items: flex-start; /* 頂部對齊 */
            gap: 30px; /* 說明和遊戲板之間的間距 */
            flex-wrap: wrap; /* 讓內容在小螢幕上換行 */
        }

        /* 玩法說明樣式 */
        .instructions {
            flex: 0 0 250px; /* 固定寬度，不放大不縮小 */
            text-align: left;
            padding: 15px;
            background-color: #f8f9fa; /* 淺灰色背景 */
            border-radius: 10px;
            border: 1px solid #e9ecef;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
            font-size: 0.95em;
            line-height: 1.6;
            color: #555;
            margin-bottom: 20px; /* 小螢幕換行時的下邊距 */
        }
        .instructions h3 {
            color: #3f51b5;
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 1.5em;
        }
        .instructions ul {
            list-style-type: disc;
            padding-left: 20px;
            margin-bottom: 10px;
        }
        .instructions li {
            margin-bottom: 5px;
        }
        .instructions strong {
            color: #ff3399; /* 強調顏色 */
        }


        /* 遊戲板樣式 */
        #game-board {
            width: 450px; /* 固定遊戲板寬度，比原先的 400px 略大 */
            height: 450px; /* 固定遊戲板高度，比原先的 400px 略大 */
            background-color: #e0e6ed; /* 淺藍灰色背景 */
            border: 5px solid #a3b1c6; /* 淺藍色邊框 */
            border-radius: 10px;
            display: grid;
            grid-template-columns: repeat(var(--grid-cols), 1fr); /* 由 JS 動態設定 */
            margin: 0 auto; /* 在 flex 容器內也確保居中 */
            box-shadow: inset 0 0 10px rgba(0,0,0,0.15);
            overflow: hidden; /* 防止蛇身或食物超出邊界 */
        }

        .grid-cell {
            width: 100%; /* 確保填充父容器 */
            height: 100%; /* 確保填充父容器 */
            box-sizing: border-box;
            /* 輕微的邊框來分隔每個單元格 */
            border: 1px solid rgba(199, 210, 226, 0.5); /* 與 board 背景色協調的透明邊框 */
        }

        .snake-head {
            background-color: #4CAF50; /* 綠色蛇頭 */
            border: 1px solid #388E3C;
            border-radius: 50%; /* 圓形蛇頭 */
            box-shadow: 0 0 8px rgba(76, 175, 80, 0.7);
        }

        .snake-body {
            background-color: #8BC34A; /* 淺綠色蛇身 */
            border: 1px solid #689F38;
            border-radius: 20%; /* 圓角方塊蛇身 */
        }

        .food {
            background-color: #FF5722; /* 橘紅色食物 */
            border: 1px solid #E64A19;
            border-radius: 50%; /* 圓形食物 */
            box-shadow: 0 0 8px rgba(255, 87, 34, 0.7);
            /* animation: pulse 1s infinite alternate; */ /* 食物脈衝動畫 - 已移除 */
        }

        /* 毒藥樣式 */
        .poison {
            background-color: #9C27B0; /* 紫色毒藥 */
            border: 1px solid #7B1FA2;
            border-radius: 50%;
            box-shadow: 0 0 8px rgba(156, 39, 176, 0.7);
            animation: rotate 2s infinite linear; /* 毒藥旋轉動畫 */
        }

        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        /* 特殊區域樣式 */
        .special-area {
            background-color: rgba(33, 150, 243, 0.3); /* 淺藍色半透明區域 */
            border: 1px dashed #2196F3; /* 虛線邊框 */
        }
        .special-area.speed-boost {
            background-color: rgba(0, 188, 212, 0.3); /* 藍綠色加速區 */
            border: 1px dashed #00BCD4;
        }
        .special-area.slow-down {
            background-color: rgba(139, 69, 19, 0.5); /* 深咖啡色半透明 */
            border: 1px dashed #8B4513; /* 深咖啡色虛線 */
        }
        .special-area.teleport {
            background-color: rgba(103, 58, 183, 0.3); /* 深紫色傳送門 */
            border: 1px dashed #673AB7;
        }


        /* 遊戲狀態訊息 */
        #score, #game-message {
            margin-top: 15px;
            font-size: 1.5em;
            color: #546e7a; /* 與其他遊戲的輔助文字顏色一致 */
            font-weight: bold;
            margin-bottom: 20px;
        }

        #game-message.game-over {
            color: #f44336; /* 遊戲結束時紅色 */
            font-size: 2em;
        }

        #game-message.game-win {
            color: #4CAF50; /* 遊戲勝利時綠色 (雖然貪食蛇通常沒有勝利) */
            font-size: 2em;
        }


        /* 按鈕樣式 */
        #start-btn, #restart-btn {
            padding: 12px 22px;
            border-radius: 10px;
            border: none;
            font-size: 1.2em;
            cursor: pointer;
            transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            background-color: #2196F3; /* 藍色按鈕 */
            color: white;
            margin: 10px;
            font-family: 'Cubic-11','FusionPixel','Comic Sans MS', 'ZCOOL KuaiLe', 'Noto Sans TC', cursive, sans-serif;
        }

        #start-btn:hover, #restart-btn:hover {
            background-color: #1976D2;
            transform: translateY(-3px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.2);
        }

        #start-btn:active, #restart-btn:active {
            background-color: #1565C0;
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        /* 小螢幕響應式調整 */
        @media (max-width: 768px) {
            .snake-layout {
                flex-direction: column; /* 小螢幕時堆疊顯示 */
                align-items: center; /* 堆疊時居中 */
            }
            .instructions {
                flex: none; /* 取消固定寬度 */
                width: 90%; /* 佔據大部分寬度 */
                margin-bottom: 20px;
            }
            #game-board {
                width: 90vw; /* 佔據視窗寬度的 90% */
                height: 90vw; /* 高度與寬度相同，保持正方形 */
                max-width: 450px; /* 但不超過原本的最大值 */
                max-height: 450px;
            }
                 /* 排行榜樣式 */
    /* 貪食蛇排行榜容器樣式 */
.snake-leaderboard {
    margin-top: 30px;
    background-color: #f8f9fa;
    border-radius: 10px;
    padding: 20px;
    box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
    max-height: 300px; /* 設定最大高度，讓內容可滾動 */
    overflow-y: auto; /* 超出部分滾動 */
    border: 1px solid #e9ecef;
}

/* 排行榜標題樣式 */
.snake-leaderboard h3 {
    color: #4CAF50; /* Green heading for leaderboard */
    margin-bottom: 15px;
    font-size: 1.5em;
    border-bottom: 2px solid #a5d6a7;
    padding-bottom: 10px;
}

/* 排行榜列表 (<ul>) 樣式 */
.snake-leaderboard ul { /* <--- **重要：應該是 ul** */
    list-style: none; /* 移除預設的點 */
    padding: 0; /* 移除預設的內邊距 */
    margin: 0; /* 移除預設的外邊距 */
}

/* 排行榜列表項 (<li>) 樣式 */
.snake-leaderboard li {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px dashed #dee2e6;
    font-size: 1.1em;
    color: #555;
}

.snake-leaderboard li:last-child {
    border-bottom: none; /* 最後一個列表項沒有下邊框 */
}

/* 排行榜名次樣式 */
.snake-leaderboard li .rank {
    font-weight: bold;
    color: #6c757d;
    width: 30px;
    text-align: left;
}

/* 排行榜暱稱樣式 */
.snake-leaderboard li .nickname {
    flex-grow: 1;
    text-align: left;
    margin-left: 10px;
}

/* 排行榜分數樣式 */
.snake-leaderboard li .score {
    font-weight: bold;
    color: #28a745;
    width: 80px;
    text-align: right;
}
        }
    </style>

    <div class="snake-game-wrapper">
        <h2>🐍</h2>
        <div id="score">分數: 0</div>
        <div id="game-message">點擊「開始遊戲」開始</div>

        <div class="snake-layout">
            <div class="instructions">
                <h3>玩法說明</h3>
                <ul>
                    <li>使用鍵盤的 <strong>W, A, S, D</strong> 鍵 或 <strong>方向鍵</strong> 控制蛇的移動方向。</li>
                    <li>按住 <strong>空白鍵</strong> 可讓蛇暫時加速。</li>
                    <li>吃到 🍎 (食物) 可得分並讓蛇身變長。</li>
                    <li>吃到 🧪 (毒藥) 會讓蛇身變短，且毒藥一段時間後會消失！</li>
                    <li>進入 🔵 (特殊區域) 會觸發不同效果。</li>
                    <li>請注意：蛇不能碰到自己的身體或遊戲邊界，否則遊戲會結束！</li>
                    <li>點擊「開始遊戲」或「重新開始」按鈕，即可開始新遊戲。</li>
                </ul>
            </div>
            <div id="game-board"></div>
        </div>
        <button id="start-btn">▶️ 開始遊戲</button>
        <button id="restart-btn" style="display:none;">🔄 重新開始</button>
        <div id="snake-leaderboard" class="snake-leaderboard"></div>
    </div>
    `;

    // 遊戲狀態變數
    const boardSize = 20; // 遊戲板大小 (20x20 個單元格)
    let initialSnakeSpeed = 150; // 蛇的初始移動速度 (毫秒)
    let acceleratedSnakeSpeed = 50; // 加速時的移動速度
    let baseGameSpeed = 150; // 遊戲的基礎速度，會隨時間逐漸變快
    const speedIncreaseInterval = 10000; // 每 10 秒加速一次 (毫秒)
    const speedIncreaseAmount = 5; // 每次加速減少 5ms
    const minSpeed = 30; // 最快速度 (最低毫秒數)

    const specialAreaChance = 0.15; // 生成特殊區域的機率 (15%) - 提高機率
    const maxSpecialAreas = 5; // 遊戲中最多同時存在的特殊區域數量
    const poisonChance = 0.25; // 食物生成毒藥的機率 (25%)
    const maxFoodItems = 4; // 遊戲中最多同時存在的食物/毒藥數量
    const poisonDuration = 5000; // 毒藥存在時間 (毫秒)


    let snake = [{ x: 10, y: 10 }]; // 蛇的初始位置 (頭部在中央)
    let food = []; // 食物位置 (現在是一個陣列)
    let direction = 'right'; // 蛇的初始移動方向
    let score = 0;
    let gameInterval; // 遊戲計時器
    let currentSnakeSpeed = initialSnakeSpeed; // 蛇的當前移動速度
    let isGameOver = false;
    let gameStarted = false; // 標記遊戲是否已經開始
    let isAccelerating = false; // 標記是否正在加速
    let lastSpeedIncreaseTime = 0; // 上次速度提升的時間

    // 特殊區域的儲存 (用於渲染和效果判斷)
    let specialAreas = []; // [{x:int, y:int, type: 'speed-boost'|'slow-down'|'teleport'}]


    // 取得 DOM 元素 (在 innerHTML 設定後才能取得)
    const boardEl = gameContainer.querySelector("#game-board"); // 修改此處
    const scoreEl = gameContainer.querySelector("#score"); // 修改此處
    const gameMessageEl = gameContainer.querySelector("#game-message"); // 修改此處
    const startBtn = gameContainer.querySelector("#start-btn"); // 修改此處
    const restartBtn = gameContainer.querySelector("#restart-btn"); // 修改此處
    const leaderboardEl = gameContainer.querySelector("#snake-leaderboard"); // 修改此處

    // 設定 CSS 變數來控制 Grid 佈局
    boardEl.style.setProperty('--grid-cols', boardSize);

    // 載入音效 (假設 assets 資料夾與 games 資料夾同層級)
    // 請根據你的實際檔案路徑調整以下路徑
    const eatSound = new Audio('assets/eating-effect-254996.mp3');
    const poisonSound = new Audio('assets/classic_hurt.mp3');
    const gameOverSound = new Audio('assets/falled-sound-effect-278635.mp3');
    const specialAreaSound = new Audio('assets/minecraft-cave-sound-332982.mp3');
    
    // 預載音效，避免第一次播放延遲
    eatSound.load();
    poisonSound.load();
    gameOverSound.load();
    specialAreaSound.load();


    // 初始化遊戲
    function init() {
        if (!boardEl || !scoreEl || !gameMessageEl || !startBtn || !restartBtn) {
            console.error("貪食蛇遊戲：內部 DOM 元素未找到！");
            return;
        }
        startBtn.addEventListener("click", startGame);
        restartBtn.addEventListener("click", startGame);
        document.addEventListener("keydown", handleKeyDown); // 使用新的鍵盤處理函數
        document.addEventListener("keyup", handleKeyUp);     // 處理空白鍵釋放

        drawBoard(); // 初始繪製空棋盤
    }

    // 繪製遊戲板
    function drawBoard() {
        boardEl.innerHTML = '';
        for (let i = 0; i < boardSize * boardSize; i++) {
            const cell = document.createElement("div");
            cell.classList.add("grid-cell");
            boardEl.appendChild(cell);
        }
    }

    // 繪製蛇、食物和特殊區域
    function drawGame() {
        // 清空所有蛇、食物、毒藥和特殊區域相關的 class
        const cells = boardEl.children;
        for (let i = 0; i < cells.length; i++) {
            // 使用 cells.item(i) 更安全地訪問元素，因為 cells 是一個 HTMLCollection
            cells.item(i)?.classList.remove("snake-head", "snake-body", "food", "poison", "special-area", "speed-boost", "slow-down", "teleport");
        }

        // 繪製特殊區域
        specialAreas.forEach(area => {
            const cellIndex = area.y * boardSize + area.x;
            cells.item(cellIndex)?.classList.add("special-area", area.type);
        });

        // 繪製蛇
        snake.forEach((segment, index) => {
            const cellIndex = segment.y * boardSize + segment.x;
            cells.item(cellIndex)?.classList.add(index === 0 ? "snake-head" : "snake-body");
        });

        // 繪製食物或毒藥 (現在是陣列)
        food.forEach(item => {
            const itemIndex = item.y * boardSize + item.x;
            cells.item(itemIndex)?.classList.add(item.type);
        });
    }

    // 檢查給定位置是否被佔用 (蛇身、食物、特殊區域)
    // 傳入 excludeSnakeHead = true 時，將不檢查蛇頭是否佔用，用於傳送門尋找新位置
    function isPositionOccupied(x, y, excludeSnakeHead = false) {
        // 檢查蛇身 (如果 excludeSnakeHead 為 true，則不檢查第一個元素即蛇頭)
        if (snake.some((segment, index) => (excludeSnakeHead && index === 0) ? false : (segment.x === x && segment.y === y))) {
            return true;
        }
        // 檢查食物/毒藥
        if (food.some(item => item.x === x && item.y === y)) {
            return true;
        }
        // 檢查特殊區域
        if (specialAreas.some(area => area.x === x && area.y === y)) {
            return true;
        }
        return false;
    }


    // 生成食物或毒藥，並有機會生成特殊區域
    function generateFood() {
        // 每次最多生成一個，直到達到上限
        if (food.length >= maxFoodItems) {
            return; // 達到上限，不生成新的
        }

        let newPos;
        let attempts = 0;
        const maxAttempts = boardSize * boardSize; // 防止無限循環
        do {
            newPos = {
                x: Math.floor(Math.random() * boardSize),
                y: Math.floor(Math.random() * boardSize),
                type: (Math.random() < poisonChance) ? 'poison' : 'food'
            };
            attempts++;
            if (attempts > maxAttempts) { // 如果嘗試多次仍找不到位置，則跳出
                console.warn("無法找到生成食物/毒藥的位置。");
                return;
            }
        } while (isPositionOccupied(newPos.x, newPos.y));

        // 如果是毒藥，設定過期時間
        if (newPos.type === 'poison') {
            newPos.expiration = Date.now() + poisonDuration;
        }
        food.push(newPos);
    }

    // 生成特殊區域
    function generateSpecialArea() {
        if (specialAreas.length >= maxSpecialAreas) {
            return; // 達到上限，不生成新的
        }

        let newAreaPos;
        let attempts = 0;
        const maxAttempts = boardSize * boardSize;
        const types = ['speed-boost', 'slow-down', 'teleport'];
        const randomType = types[Math.floor(Math.random() * types.length)];

        do {
            newAreaPos = {
                x: Math.floor(Math.random() * boardSize),
                y: Math.floor(Math.random() * boardSize),
                type: randomType
            };
            attempts++;
            if (attempts > maxAttempts) {
                console.warn("無法找到生成特殊區域的位置。");
                return;
            }
        } while (isPositionOccupied(newAreaPos.x, newAreaPos.y));
        specialAreas.push(newAreaPos);
    }


    // 鍵盤按下事件處理
    function handleKeyDown(event) {
        if (!gameStarted || isGameOver) return;

        // 阻止方向鍵和空白鍵預設滾動行為
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(event.key)) {
            event.preventDefault();
        }

        // 處理方向鍵
        const keyPressed = event.key;
        if ((keyPressed === 'ArrowUp' || keyPressed === 'w') && direction !== 'down') direction = 'up';
        if ((keyPressed === 'ArrowDown' || keyPressed === 's') && direction !== 'up') direction = 'down';
        if ((keyPressed === 'ArrowLeft' || keyPressed === 'a') && direction !== 'right') direction = 'left';
        if ((keyPressed === 'ArrowRight' || keyPressed === 'd') && direction !== 'left') direction = 'right';

        // 處理空白鍵加速
        if (keyPressed === ' ' && !isAccelerating) {
            isAccelerating = true;
            updateGameSpeed(); // 觸發加速
        }
    }

    // 鍵盤鬆開事件處理
    function handleKeyUp(event) {
        if (!gameStarted || isGameOver) return;

        if (event.key === ' ' && isAccelerating) {
            isAccelerating = false;
            updateGameSpeed(); // 恢復正常速度
        }
    }

    // 更新遊戲速度
    function updateGameSpeed() {
        clearInterval(gameInterval); // 清除現有的計時器
        let speedToSet = baseGameSpeed; // 基礎速度隨遊戲時間變化

        if (isAccelerating) {
            speedToSet = acceleratedSnakeSpeed; // 如果正在按空白鍵，則使用加速速度
        }
        
        // 重新設定遊戲間隔
        gameInterval = setInterval(moveSnake, speedToSet);
        currentSnakeSpeed = speedToSet; // 更新 currentSnakeSpeed 變數以反映實際速度
    }


    // 移動蛇
    function moveSnake() {
        if (isGameOver) return;

        // 遊戲時間加速
        const now = Date.now();
        if (now - lastSpeedIncreaseTime > speedIncreaseInterval) {
            baseGameSpeed = Math.max(minSpeed, baseGameSpeed - speedIncreaseAmount);
            // 當基礎速度改變時，如果沒有按空白鍵，則更新 currentSnakeSpeed 並重新設定 interval
            if (!isAccelerating) {
                updateGameSpeed(); // 這會使用新的 baseGameSpeed
            }
            lastSpeedIncreaseTime = now;
        }


        const head = { ...snake[0] }; // 複製蛇頭

        // 根據方向更新蛇頭位置
        switch (direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }

        // 檢查遊戲結束條件
        // 1. 碰到邊界
        if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
            endGame("撞到牆壁了！");
            return;
        }
        // 2. 碰到自己
        // 注意：這裡的 some 函數會檢查除了頭部之外的每個節點
        if (snake.some((segment, index) => index !== 0 && segment.x === head.x && segment.y === head.y)) {
            endGame("咬到自己了！");
            return;
        }

        // 將新蛇頭加入蛇的開頭
        snake.unshift(head);

        // 檢查是否吃到食物或毒藥
        const foodEatenIndex = food.findIndex(item => item.x === head.x && item.y === head.y);
        if (foodEatenIndex !== -1) {
            const eatenItem = food.splice(foodEatenIndex, 1)[0]; // 移除吃掉的食物/毒藥
            if (eatenItem.type === 'food') {
                score += 10;
                // 播放吃到食物音效
                if (eatSound.readyState >= 2) {
                    eatSound.currentTime = 0;
                    eatSound.play().catch(e => console.error("吃到食物音效播放失敗:", e));
                }
                
                baseGameSpeed = Math.max(minSpeed, baseGameSpeed - 5); // 吃到食物也讓基礎速度加快一點
                acceleratedSnakeSpeed = Math.max(minSpeed, acceleratedSnakeSpeed - 2); // 加速速度也快一點

            } else if (eatenItem.type === 'poison') {
                score = Math.max(0, score - 20); // 吃到毒藥扣分
                // 蛇身縮短 (至少保留頭部)
                if (snake.length > 1) {
                    snake.pop(); // 移除一個身體節點
                }
                if (snake.length > 1) { // 再次檢查，如果還有身體則再移除一個
                    snake.pop();
                }
                // 播放毒藥音效
                if (poisonSound.readyState >= 2) {
                    poisonSound.currentTime = 0;
                    poisonSound.play().catch(e => console.error("毒藥音效播放失敗:", e));
                }
            }
            scoreEl.textContent = `分數: ${score}`;
            generateFood(); // 補足新的食物/毒藥
            updateGameSpeed(); // 因為 baseGameSpeed 或 acceleratedSnakeSpeed 可能改變，所以需要更新
        } else {
            // 如果沒吃到食物，移除蛇尾
            snake.pop();
        }

        // 檢查毒藥是否過期
        const currentTime = Date.now();
        food = food.filter(item => {
            if (item.type === 'poison' && item.expiration && currentTime > item.expiration) {
                console.log('毒藥過期消失:', item);
                return false; // 移除過期的毒藥
            }
            return true;
        });

        // 確保食物/毒藥數量保持在上限內
        while (food.length < maxFoodItems) {
            generateFood();
        }


        // 檢查是否進入特殊區域
        const currentHeadArea = specialAreas.find(area => area.x === head.x && area.y === head.y);
        if (currentHeadArea) {
            if (specialAreaSound.readyState >= 2) {
                specialAreaSound.currentTime = 0;
                specialAreaSound.play().catch(e => console.error("特殊區域音效播放失敗:", e));
            }

            switch (currentHeadArea.type) {
                case 'speed-boost':
                    // 暫時提高速度
                    currentSnakeSpeed = Math.max(minSpeed, currentSnakeSpeed - 50); // 更明顯的加速
                    break;
                case 'slow-down':
                    // 暫時降低速度
                    currentSnakeSpeed = Math.min(300, currentSnakeSpeed + 80); // 更明顯的減速
                    break;
                case 'teleport':
                    teleportSnake(); // 執行傳送邏輯
                    // 傳送後，速度會回到正常遊戲邏輯控制的速度 (baseGameSpeed 或 acceleratedSnakeSpeed)
                    // 所以這裡不直接修改 currentSnakeSpeed，而是讓 updateGameSpeed 根據 isAccelerating 決定
                    break;
            }
            // 移除被觸發的特殊區域
            specialAreas = specialAreas.filter(area => !(area.x === head.x && area.y === head.y));
            // 立即重新設定 interval，讓新的 currentSnakeSpeed 生效
            updateGameSpeed();
        }

        // 隨機生成新的特殊區域 (確保遊戲中會有)
        if (Math.random() < specialAreaChance / 2 && specialAreas.length < maxSpecialAreas) { // 降低每次刷新的機率，防止生成過多
             generateSpecialArea();
        }

        drawGame(); // 重新繪製遊戲
    }

    // 傳送蛇到隨機位置
    function teleportSnake() {
        let newX, newY;
        let attempts = 0;
        const maxAttempts = boardSize * boardSize * 2; // 增加嘗試次數，以找到更安全的位置
        const originalSnakeLength = snake.length;

        // 步驟 1: 尋找一個新的、安全的蛇頭位置
        // 傳送點必須是空的，不能有食物、毒藥或特殊區域
        do {
            newX = Math.floor(Math.random() * boardSize);
            newY = Math.floor(Math.random() * boardSize);
            attempts++;
            if (attempts > maxAttempts) {
                console.warn("傳送失敗：無法找到安全位置，蛇將維持原位。");
                return; // 找不到安全位置，不進行傳送
            }
        } while (isPositionOccupied(newX, newY, true)); // 尋找位置時，忽略當前的蛇頭

        let foundSafePath = false;
        // 定義八個方向的位移，考慮斜向，增加尋找路徑的可能性
        const potentialDirections = [
            {dx: 0, dy: -1}, // 上
            {dx: 0, dy: 1},  // 下
            {dx: -1, dy: 0}, // 左
            {dx: 1, dy: 0},  // 右
            {dx: -1, dy: -1}, // 左上
            {dx: 1, dy: -1},  // 右上
            {dx: -1, dy: 1},  // 左下
            {dx: 1, dy: 1}   // 右下
        ];

        // 隨機打亂方向，讓每次嘗試路徑的順序不同
        potentialDirections.sort(() => Math.random() - 0.5);

        // 步驟 2: 嘗試沿著多個方向生成蛇身，以保持原有長度
        for (const dir of potentialDirections) {
            let tempSnakePath = [{ x: newX, y: newY }];
            let pathIsSafe = true;

            // 嘗試沿著這個方向生成蛇身，長度從 1 到 originalSnakeLength - 1
            for (let j = 1; j < originalSnakeLength; j++) {
                const nextX = newX + dir.dx * j;
                const nextY = newY + dir.dy * j;

                // 檢查新位置是否在邊界內，並且沒有被其他物體佔用 (排除傳送後的蛇頭)
                if (nextX < 0 || nextX >= boardSize || nextY < 0 || nextY >= boardSize || isPositionOccupied(nextX, nextY, true)) {
                    pathIsSafe = false; // 路徑不安全
                    break;
                }
                tempSnakePath.push({ x: nextX, y: nextY });
            }

            if (pathIsSafe) {
                snake = tempSnakePath; // 設置新的蛇身
                foundSafePath = true;
                break; // 找到安全路徑，跳出循環
            }
        }

        // 步驟 3: 如果沒有找到保持原長度的安全路徑，則縮短蛇身
        if (!foundSafePath) {
            console.warn("傳送後無法保持原有蛇身長度，縮短蛇身。");
            let smallSnake = [{ x: newX, y: newY }]; // 至少保留頭部

            // 嘗試放置少量身體（最多 2 節，避免立即碰撞）
            let addedBody = 0;
            // 再次隨機打亂方向
            potentialDirections.sort(() => Math.random() - 0.5);

            for (const dir of potentialDirections) {
                if (addedBody >= 1) break; // 最多只嘗試添加一節身體

                const nextX = newX + dir.dx;
                const nextY = newY + dir.dy;

                // 檢查新位置是否有效且沒有被其他物體佔用 (排除新的蛇頭)
                if (nextX >= 0 && nextX < boardSize && nextY >= 0 && nextY < boardSize && !isPositionOccupied(nextX, nextY, true)) {
                    smallSnake.push({ x: nextX, y: nextY });
                    addedBody++;
                }
            }
            snake = smallSnake; // 最多兩節身體 (頭部 + 1節身體)
        }
        // 注意：這裡不再呼叫 updateGameSpeed()，因為它會在 moveSnake() 的結尾統一呼叫
    }
            // 啟動遊戲循環
        function startGameLoop() {
            clearInterval(gameInterval); // 清除任何現有的循環
            gameInterval = setInterval(moveSnake, gameSpeed);
        }
    // 開始遊戲
    function startGame() {
        // 重置遊戲狀態
        snake = [{ x: 10, y: 10 }];
        direction = 'right';
        score = 0;
        
        // 重置所有速度相關變數
        baseGameSpeed = 150; // 確保每次開始都從基礎速度開始
        initialSnakeSpeed = 150; // 重置為原始初始速度
        acceleratedSnakeSpeed = 50; // 重置為原始加速速度
        currentSnakeSpeed = baseGameSpeed; // 初始速度設定為基礎速度
        
        isGameOver = false;
        gameStarted = true; // 標記遊戲已開始
        isAccelerating = false; // 重置加速狀態
        food = []; // 清空食物
        specialAreas = []; // 清空特殊區域
        lastSpeedIncreaseTime = Date.now(); // 重置速度提升時間

        scoreEl.textContent = `分數: ${score}`;
        gameMessageEl.textContent = "";
        gameMessageEl.classList.remove("game-over", "game-win"); // 清除舊的狀態樣式

        // 隱藏開始按鈕，顯示重新開始按鈕
        startBtn.style.display = 'none';
        restartBtn.style.display = 'inline-block';

        // 初始時生成一定數量的食物/毒藥
        for(let i = 0; i < maxFoodItems; i++) {
            generateFood();
        }
        // 初始時生成一些特殊區域
        for(let i = 0; i < 3; i++) { // 初始生成3個特殊區域
            generateSpecialArea();
        }

        drawGame(); // 繪製初始遊戲狀態

        clearInterval(gameInterval); // 清除舊的計時器
        gameInterval = setInterval(moveSnake, currentSnakeSpeed); // 啟動遊戲計時器
    }

    // 遊戲結束
function endGame(message) {
        isGameOver = true;
        clearInterval(gameInterval);
        gameMessageEl.textContent = `遊戲結束！${message} 你的分數是: ${score}`;
        gameMessageEl.classList.add("game-over");
        restartBtn.textContent = "🔄 重新開始";
        restartBtn.style.display = 'inline-block';

        // 播放遊戲結束音效
        if (gameOverSound.readyState >= 2) {
            gameOverSound.currentTime = 0;
            gameOverSound.play().catch(e => console.error("遊戲結束音效播放失敗:", e));
        } else {
            console.warn("遊戲結束音效尚未載入完成，無法播放。");
        }

        // === 新增：儲存分數到 Realtime Database ===
        // 從 localStorage 獲取暱稱
        const nickname = localStorage.getItem("nickname") || "匿名玩家"; // 如果沒有暱稱，使用匿名玩家

        if (rtdb) { // 確保 rtdb 實例已成功載入
            const scoresRef = ref(rtdb, 'snake_scores'); // 指向 snake_scores 節點
            const newScoreRef = push(scoresRef); // 產生一個新的唯一 ID

            set(newScoreRef, {
                nickname: nickname,
                score: score,
                timestamp: Date.now() // 記錄時間戳，用於排序
            }).then(() => {
                console.log("貪食蛇分數已成功儲存到 Realtime Database");
                displayLeaderboard(); // 分數儲存成功後，立即顯示排行榜
            }).catch((error) => {
                console.error("儲存貪食蛇分數失敗:", error);
            });
        } else {
            console.error("Realtime Database 未初始化，無法儲存分數。");
        }
    }


    // === 新增：顯示排行榜 ===
    function displayLeaderboard() {
        if (!leaderboardEl) {
            console.error("找不到 ID 為 'snake-leaderboard' 的元素，無法顯示排行榜。");
            return;
        }

        if (!rtdb) {
            console.error("Realtime Database 未初始化，無法載入排行榜。");
            return;
        }

        const scoresRef = ref(rtdb, 'snake_scores');
        // 查詢：按分數降序排序，限制顯示前 10 名
        // Realtime Database 的 orderByChild 是升序，limitToLast 會取最後N個
        const topScoresQuery = query(scoresRef, orderByChild('score'), limitToLast(10));

        onValue(topScoresQuery, (snapshot) => {
            const scores = [];
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                scores.push(data);
            });

            // 反轉陣列才能得到降序的「前N名」
            scores.reverse();

            leaderboardEl.innerHTML = '<h3>排行榜 (前 10 名)</h3>';
            if (scores.length === 0) {
                leaderboardEl.innerHTML += '<p>目前沒有分數。</p>';
                return;
            }

            const ul = document.createElement('ul');
            scores.forEach((entry, index) => {
                const li = document.createElement('li');
                li.textContent = `${index + 1}. ${entry.nickname}: ${entry.score} 分`;
                ul.appendChild(li);
            });
            leaderboardEl.appendChild(ul);
            console.log("貪食蛇排行榜已載入並顯示。");
        }, (error) => {
            console.error("載入貪食蛇排行榜失敗:", error);
            leaderboardEl.innerHTML = '<p>載入排行榜失敗。</p>';
        });
    }

    // === 啟動遊戲 ===
    init();

} // === if/else 塊結束 ===
