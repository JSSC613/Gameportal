// games/match3.js

const gameContainer = document.getElementById("game-container");

if (!gameContainer) {
    console.error("錯誤: 找不到ID為 'game-container' 的元素!消消樂遊戲無法啟動。");
} else {
    // 注入遊戲 HTML 和 CSS
    gameContainer.innerHTML = `
    <style>
        /* 消消樂遊戲容器樣式 */
        
        .match3-game-wrapper {
            text-align: center;
            padding: 30px; /* 與其他遊戲一致 */
            background-color: #ffffff; /* 亮白色容器背景 */
            border-radius: 15px; /* 圓角 */
            box-shadow: 0 8px 16px rgba(0,0,0,0.2); /* 柔和陰影 */
            max-width: 800px; /* 根據棋盤和說明調整最大寬度 */
            width: 95%; /* 響應式寬度 */
            margin: 50px auto; /* 置中並增加上下間距 */
            border: 1px solid #e0e0e0; /* 輕微邊框 */
            box-sizing: border-box;
             font-family: 'Cubic-11','FusionPixel','Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* 統一字體 */
            color: #333; /* 預設文字顏色 */
        }

        h2 { /* 遊戲標題樣式 */
            font-size: 2.8em;
            color: #3f51b5; /* 藍色標題 */
            margin-bottom: 25px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
             font-family: 'Cubic-11','FusionPixel','Arial Black', sans-serif;
        }

        /* 遊戲主佈局 - 使用 Grid 將棋盤和說明並排 */
        .match3-layout {
            display: grid;
            grid-template-columns: 1fr 2fr; /* 左側說明佔 1 份，棋盤佔 2 份 */
            gap: 20px; /* 說明和棋盤之間的間距 */
            align-items: start; /* 頂部對齊 */
        }

        /* 玩法說明樣式 */
        .instructions {
            text-align: left;
            padding: 15px;
            background-color: #f8f9fa; /* 淺灰色背景 */
            border-radius: 10px;
            border: 1px solid #e9ecef;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
            font-size: 0.95em;
            line-height: 1.6;
            color: #555;
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


        /* 遊戲棋盤樣式 */
        .match3-board {
            display: grid; /* 啟用 Grid 佈局 */
            /* grid-template-columns 會由 JS 動態設定 */
            gap: 5px; /* 格子間的間距 */
            justify-content: center; /* 棋盤水平居中 */
            margin: 0 auto; /* 移除額外 margin，由 .match3-layout 控制 */
            border: 5px solid #a3b1c6; /* 淺藍色邊框，與其他遊戲棋盤邊框風格一致 */
            border-radius: 10px;
            padding: 5px;
            background-color: #c7d2e2; /* 淺藍灰色背景，與其他遊戲棋盤背景風格一致 */
            box-shadow: inset 0 0 10px rgba(0,0,0,0.15); /* 輕微內陰影 */
            max-width: fit-content; /* 讓棋盤寬度適應其內容 */
        }

        /* 單個方塊 (tile) 樣式 */
        .tile {
            width: 50px; /* 方塊寬度 */
            height: 50px; /* 方塊高度 */
            background-color: #e6e9ee; /* 未選中的亮灰色，與其他遊戲未選中/未翻開的元素一致 */
            border-radius: 8px; /* 方塊圓角 */
            cursor: pointer; /* 鼠標變為手型 */
            font-size: 1.8em; /* 文字大小 */
            display: flex; /* 使用 Flex 居中文本 */
            align-items: center; /* 垂直居中 */
            justify-content: center; /* 水平居中 */
            user-select: none; /* 禁止選中文字 */
            border: 2px outset #f0f2f5; /* 3D 立體按鈕效果 */
            box-shadow: 0 4px 8px rgba(0,0,0,0.1); /* 柔和陰影 */

            /* 過渡動畫 */
            transition: transform 0.1s ease-out,
                        background-color 0.2s ease,
                        box-shadow 0.2s ease,
                        border 0.2s ease,
                        opacity 0.3s ease-out; /* 為動畫新增 opacity */
        }

        .tile:hover {
            transform: translateY(-3px); /* 鼠標懸停時輕微上浮 */
            background-color: #f0f3f6; /* 懸停時顏色變亮 */
            box-shadow: 0 6px 12px rgba(0,0,0,0.15); /* 懸停陰影更明顯 */
        }

        .tile.selected {
            border-color: #ff3399; /* 選中時亮粉色邊框 */
            box-shadow: 0 0 0 3px #ff3399, 0 4px 8px rgba(0,0,0,0.1); /* 加上外發光效果 */
            transform: scale(0.95); /* 選中時輕微縮小 */
            background-color: #fff0f5; /* 選中時背景色變淺 */
        }

        /* 方塊掉落動畫 */
        .tile.dropping {
            /* 初始狀態，在 JS 中動態添加 transform 值 */
            transition: transform 0.3s ease-in-out; /* 掉落動畫 */
        }

        /* 方塊消除動畫 */
        .tile.removing {
            opacity: 0;
            transform: scale(0.1) rotate(180deg); /* 縮小並旋轉消失 */
            transition: opacity 0.3s ease-out, transform 0.3s ease-out; /* 消除動畫 */
        }

        /* 分數顯示樣式 */
        #score {
            margin-top: 15px;
            font-size: 1.5em;
            color: #546e7a; /* 與其他遊戲的輔助文字顏色一致 */
            font-weight: bold;
            margin-bottom: 20px;
        }

        /* 重新開始按鈕樣式 */
        #restart-btn {
            font-family: 'Cubic-11','FusionPixel','Comic Sans MS', 'ZCOOL KuaiLe', 'Noto Sans TC', cursive, sans-serif;
            padding: 12px 22px; /* 與其他遊戲按鈕一致 */
            border-radius: 10px; /* 與其他遊戲按鈕一致 */
            border: none;
            font-size: 1.2em; /* 與其他遊戲按鈕一致 */
            cursor: pointer;
            transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1); /* 柔和陰影 */
            background-color: #4CAF50; /* 統一使用綠色按鈕 */
            color: white;
            margin-top: 25px; /* 添加上邊距 */
        }

        #restart-btn:hover {
            background-color: #43A047; /* 懸停時顏色變深 */
            transform: translateY(-3px); /* 輕微上浮 */
            box-shadow: 0 6px 12px rgba(0,0,0,0.2); /* 懸停陰影更明顯 */
        }

        #restart-btn:active {
            background-color: #388E3C;
            transform: translateY(0); /* 點擊時下沉 */
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
    </style>

    <div class="match3-game-wrapper">
        <h2>💎</h2>
        <div id="score">分數:0</div>
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
        <button id="restart-btn">🔁 重新開始</button>
    </div>
    `;

    // 遊戲狀態變數
    const boardSize = 9; // 棋盤大小 9x9
    const tileTypes = ["🍔", "🍟", "🥤", "🌭", "🍕", "🧆", "🍿", "🍨"]; // 方塊圖案
    const specialTileType = "🥠"; // 特殊方塊 
    let board = []; // 儲存棋盤狀態的陣列
    let score = 0;
    let firstTile = null; // 儲存第一次點擊的方塊索引
    let isProcessing = false; // 標記遊戲是否正在處理消除/下落

    // 取得 DOM 元素 (在 innerHTML 設定後才能取得)
    const boardEl = document.getElementById("game-board");
    const scoreEl = document.getElementById("score");
    const restartBtn = document.getElementById("restart-btn");

    // 設定棋盤的 CSS Grid 樣式，使用 boardSize 變數
    boardEl.style.gridTemplateColumns = `repeat(${boardSize}, 50px)`;

    // 載入音效
    // 請確保 'eating-effect-254996.mp3' 文件在正確的路徑
    // 如果音效文件與 HTML 文件在同一目錄下，則路徑可以直接寫文件名。
    // 如果在子目錄，例如 'assets/sounds/eating-effect-254996.mp3'，則路徑需修改。
    const popSound = new Audio('assets/eating-effect-254996.mp3'); 

    // 初始化遊戲:創建棋盤、設置監聽器
    function init() {
        // 確認所有必要的 DOM 元素都已經取得
        if (!boardEl || !scoreEl || !restartBtn) {
            console.error("消消樂遊戲:內部 DOM 元素未找到!");
            return;
        }

        restartBtn.addEventListener("click", startGame);
        startGame(); // 開始遊戲
    }

    // 開始新遊戲
    function startGame() {
        score = 0;
        scoreEl.textContent = `分數:${score}`;
        firstTile = null;
        isProcessing = false;
        createBoard(); // 創建並渲染棋盤
    }

    // 創建初始棋盤
    function createBoard() {
        board = [];
        boardEl.innerHTML = ''; // 清空舊棋盤

        for (let i = 0; i < boardSize * boardSize; i++) {
            let randomType;
            // 隨機生成方塊，有一定機率生成幸運餅乾(例如 2%)
            if (Math.random() < 0.02) { // 2% 的機率生成幸運餅乾
                randomType = specialTileType;
            } else {
                randomType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
            }
            board.push(randomType);

            const tileEl = document.createElement("div");
            tileEl.classList.add("tile");
            tileEl.textContent = randomType;
            tileEl.dataset.index = i; // 儲存索引
            tileEl.addEventListener("click", () => handleTileClick(i));
            boardEl.appendChild(tileEl);
        }

        // 確保初始棋盤沒有任何配對
        let initialMatches = findMatches();
        let attempts = 0;
        while (initialMatches.length > 0 && attempts < 100) { // 避免無限迴圈
            shuffleBoard(); // 打亂棋盤直到沒有初始配對
            initialMatches = findMatches();
            attempts++;
        }
        renderBoard(); // 渲染初始棋盤
    }

    // 隨機打亂棋盤（用於處理初始配對）
    function shuffleBoard() {
        board.sort(() => Math.random() - 0.5);
        renderBoard();
    }


    // 更新棋盤的視覺顯示
    function renderBoard() {
        const tiles = boardEl.children;
        for (let i = 0; i < board.length; i++) {
            const tileEl = tiles[i];
            // 重置動畫相關的CSS屬性，確保下次動畫能正確觸發
            tileEl.classList.remove("selected", "dropping", "removing");
            tileEl.style.transform = '';
            tileEl.style.transition = '';

            // 更新內容和可見性
            tileEl.textContent = board[i] || "";
            tileEl.style.visibility = board[i] === null ? 'hidden' : 'visible';
        }
    }

    // 處理方塊點擊事件
    async function handleTileClick(index) {
        if (isProcessing) return; // 如果正在處理中,忽略點擊

        const tileEl = boardEl.children[index];

        if (!firstTile && board[index] !== null) { // 確保點擊的不是空位
            // 第一次點擊
            firstTile = index;
            tileEl.classList.add("selected");
        } else if (firstTile !== null) { // 第二次點擊
            const secondTile = index;

            // 如果點擊了相同的方塊，取消選中
            if (firstTile === secondTile) {
                boardEl.children[firstTile].classList.remove("selected");
                firstTile = null;
                return;
            }

            // 檢查是否為相鄰方塊
            const isAdjacent = (
                (Math.abs(firstTile - secondTile) === 1 && Math.floor(firstTile / boardSize) === Math.floor(secondTile / boardSize)) || // 水平相鄰且在同一行
                Math.abs(firstTile - secondTile) === boardSize // 垂直相鄰
            );

            if (isAdjacent) {
                isProcessing = true; // 標記正在處理

                // 移除選中狀態
                boardEl.children[firstTile].classList.remove("selected");
                if (secondTile !== firstTile) { // 確保secondTile不是firstTile自身
                    boardEl.children[secondTile].classList.remove("selected");
                }

                // 如果包含幸運餅乾，執行特殊消除
                if (board[firstTile] === specialTileType || board[secondTile] === specialTileType) {
                    const specialTileIdx = (board[firstTile] === specialTileType) ? firstTile : secondTile;
                    const otherTileIdx = (specialTileIdx === firstTile) ? secondTile : firstTile;
                    const targetType = board[otherTileIdx]; // 取得非幸運餅乾的類型

                    const indicesToEliminate = new Set(); // 使用 Set 避免重複索引
                    
                    // Add the two clicked tiles to the elimination list
                    indicesToEliminate.add(firstTile);
                    indicesToEliminate.add(secondTile);

                    // Collect all tiles of the target type
                    for (let i = 0; i < board.length; i++) {
                        if (board[i] === targetType && board[i] !== null) {
                            indicesToEliminate.add(i);
                        }
                    }
                    
                    // Mark the special tile and the swapped tile as null immediately in the board data model
                    // This is important for findMatches and subsequent steps to correctly identify empty spots.
                    board[specialTileIdx] = null;
                    board[otherTileIdx] = null;


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
                        // 如果沒有其他目標方塊可消除 (雖然不太可能發生)，則彈回並重置
                        setTimeout(() => { // 給一點點時間，讓初始的兩個方塊消失效果出現
                            swapTiles(firstTile, secondTile); // 換回
                            renderBoard(); // 更新顯示
                            firstTile = null; // 重置
                            isProcessing = false; // 解鎖
                        }, 300);
                    }

                } else {
                    // 一般交換
                    swapTiles(firstTile, secondTile); // 交換方塊
                    renderBoard(); // 更新顯示 (視覺上的交換)

                    // 檢查交換後是否有匹配
                    const newMatches = findMatches();
                    if (newMatches.length > 0) {
                        firstTile = null; // 重置第一次點擊的狀態
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
                // 不是相鄰方塊，取消第一次選中，重新選擇
                boardEl.children[firstTile].classList.remove("selected");
                firstTile = index;
                tileEl.classList.add("selected");
            }
        }
    }

    // 交換兩個方塊
    function swapTiles(index1, index2) {
        const temp = board[index1];
        board[index1] = board[index2];
        board[index2] = temp;
    }

    // 尋找所有配對 (水平和垂直 >= 3 個連續相同的方塊)
    function findMatches() {
        const matches = new Set(); // 使用 Set 避免重複索引

        // 檢查水平配對
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize - 2; col++) {
                const i = row * boardSize + col;
                const tile1 = board[i];
                const tile2 = board[i + 1];
                const tile3 = board[i + 2];

                // 確保不是 null 並且三者相同，且不是特殊方塊本身（特殊方塊不參與普通匹配）
                if (tile1 && tile1 !== specialTileType && tile1 === tile2 && tile1 === tile3) {
                    matches.add(i);
                    matches.add(i + 1);
                    matches.add(i + 2);
                    // 檢查更長的配對 (4連、5連...)
                    let k = 3;
                    while (col + k < boardSize && board[i + k] === tile1) {
                        matches.add(i + k);
                        k++;
                    }
                }
            }
        }

        // 檢查垂直配對
        for (let col = 0; col < boardSize; col++) {
            for (let row = 0; row < boardSize - 2; row++) {
                const i = row * boardSize + col;
                const tile1 = board[i];
                const tile2 = board[i + boardSize];
                const tile3 = board[i + 2 * boardSize];

                // 確保不是 null 並且三者相同，且不是特殊方塊本身
                if (tile1 && tile1 !== specialTileType && tile1 === tile2 && tile1 === tile3) {
                    matches.add(i);
                    matches.add(i + boardSize);
                    matches.add(i + 2 * boardSize);
                    // 檢查更長的配對
                    let k = 3;
                    while (row + k < boardSize && board[i + k * boardSize] === tile1) {
                        matches.add(i + k * boardSize);
                        k++;
                    }
                }
            }
        }

        return Array.from(matches); // 返回配對的索引陣列
    }

    // 移除配對的方塊並播放消除動畫，返回 Promise
    function removeTilesAnimated(indices) {
        if (indices.length === 0) return Promise.resolve(); // 沒有需要移除的，直接解決

        // 播放音效
        try {
            popSound.currentTime = 0; // 重置音效到開頭，允許快速連續播放
            popSound.play().catch(e => console.error("Error playing pop sound:", e));
        } catch (e) {
            console.error("Failed to play pop sound:", e);
        }

        // 收集所有動畫 Promise
        const animationPromises = indices.map(index => {
            return new Promise(resolve => {
                const tileEl = boardEl.children[index];
                if (tileEl && board[index] !== null) { // 確保元素存在且尚未為空，防止重複消除
                    tileEl.classList.add("removing"); // 添加消除動畫類別
                    score += 10; // 每個被消除的方塊加 10 分
                    scoreEl.textContent = `分數:${score}`; // 更新分數顯示

                    // 等待動畫結束
                    tileEl.addEventListener('transitionend', function handler() {
                        tileEl.removeEventListener('transitionend', handler);
                        board[index] = null; // 在動畫結束後將方塊設為 null
                        renderBoard(); // 立即更新顯示，使該方塊消失
                        resolve();
                    }, { once: true }); // 使用 once 確保事件只觸發一次
                } else if (tileEl && board[index] === null) {
                    // 如果方塊已經是null (例如幸運餅乾或其交換的目標在之前已被標記為null)
                    // 確保視覺上消失，並立即解決 Promise
                    tileEl.style.visibility = 'hidden';
                    tileEl.classList.remove("removing"); // 確保移除 class 以便下次使用
                    tileEl.style.transform = '';
                    tileEl.style.transition = '';
                    resolve();
                } else {
                    // 如果元素不存在，直接解決
                    resolve();
                }
            });
        });
        return Promise.all(animationPromises); // 等待所有消除動畫完成
    }

    // 使方塊下落填補空位並播放掉落動畫，返回 Promise
    async function dropTilesAnimated() {
        let tilesMoved = false;
        const animationPromises = [];

        for (let col = 0; col < boardSize; col++) {
            let emptySpots = []; // 紀錄當前列的空位索引
            for (let row = boardSize - 1; row >= 0; row--) {
                const currentIndex = row * boardSize + col;
                if (board[currentIndex] === null) {
                    emptySpots.push(currentIndex);
                } else if (emptySpots.length > 0) {
                    // 找到有方塊的格子，且下方有空位
                    const dropToIndex = emptySpots.shift(); // 取出最下面的空位

                    // 在數據模型中交換方塊，將實際方塊移動到新的位置
                    board[dropToIndex] = board[currentIndex];
                    board[currentIndex] = null;

                    // 準備視覺動畫
                    const tileEl = boardEl.children[currentIndex];
                    const targetTileEl = boardEl.children[dropToIndex];

                    // 確保視覺上目標位置的方塊是正確的
                    targetTileEl.textContent = board[dropToIndex];
                    targetTileEl.style.visibility = 'visible';
                    targetTileEl.classList.remove("removing"); // 清除可能殘留的移除類別

                    // 隱藏原始位置的方塊，因為它實際上已經移動了
                    tileEl.style.visibility = 'hidden';
                    tileEl.textContent = ''; // 清空內容

                    // 將動畫應用到移動後的方塊上，使其從舊位置“掉落”到新位置
                    const distance = (dropToIndex - currentIndex) / boardSize * 55; // 50px tile + 5px gap
                    
                    // 先將新位置的元素“提升”到舊位置的高度，然後再讓它“掉落”
                    // 這是因為我們已經在數據模型中將方塊移動了，現在只是讓視覺跟上
                    targetTileEl.style.transition = 'none'; // 暫時移除過渡，以便立即設定起始位置
                    targetTileEl.style.transform = `translateY(-${distance}px)`; // 提升到舊位置的高度
                    void targetTileEl.offsetWidth; // 觸發reflow

                    targetTileEl.classList.add("dropping");
                    targetTileEl.style.transition = 'transform 0.3s ease-in-out'; // 設定掉落動畫
                    targetTileEl.style.transform = `translateY(0px)`; // 掉落到實際位置

                    tilesMoved = true;

                    // 等待動畫完成
                    animationPromises.push(new Promise(resolve => {
                        targetTileEl.addEventListener('transitionend', function handler() {
                            targetTileEl.removeEventListener('transitionend', handler);
                            targetTileEl.classList.remove("dropping");
                            targetTileEl.style.transform = ''; // 清除 transform
                            targetTileEl.style.transition = ''; // 清除 transition
                            resolve();
                        }, { once: true });
                    }));
                    
                    // 把舊的位置加回空位列表，因為這個位置現在空了
                    emptySpots.push(currentIndex);
                }
            }
        }
        
        await Promise.all(animationPromises); // 等待所有下落動畫完成
        renderBoard(); // 確保最終狀態正確
        return tilesMoved; // 返回是否有方塊移動
    }

    // 補充新的方塊填滿頂部的空位
    function refillBoard() {
        let tilesRefilled = false;
        for (let col = 0; col < boardSize; col++) {
            for (let row = 0; row < boardSize; row++) {
                const index = row * boardSize + col;
                if (board[index] === null) {
                    let randomType;
                    if (Math.random() < 0.02) { // 2% 的機率生成幸運餅乾
                        randomType = specialTileType;
                    } else {
                        randomType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
                    }
                    board[index] = randomType;
                    tilesRefilled = true;

                    // 視覺上讓新方塊從頂部掉落
                    const tileEl = boardEl.children[index];
                    tileEl.textContent = randomType;
                    tileEl.style.visibility = 'visible'; // 確保可見
                    
                    // 設定初始位置在棋盤上方，然後掉落
                    tileEl.style.transition = 'none'; // 暫時移除過渡
                    tileEl.style.transform = `translateY(-${(boardSize - row) * 55}px)`; // 設置在棋盤上方，距離根據行數調整
                    void tileEl.offsetWidth; // 觸發reflow
                    
                    tileEl.classList.add("dropping");
                    tileEl.style.transition = 'transform 0.3s ease-out'; // 更快的掉落動畫
                    tileEl.style.transform = `translateY(0px)`;
                }
            }
        }
        // 不需要等待新方塊的掉落動畫，因為它們不會阻礙下一次的 findMatches
        return tilesRefilled;
    }

    // 處理配對、下落、補充的完整流程 (使用 async/await 管理動畫順序)
    async function processMatches() {
        isProcessing = true; // 鎖定操作

        let hasMoreMatches = true; // 標記是否需要繼續連鎖處理

        while (hasMoreMatches) {
            let matchesFound = findMatches();
            if (matchesFound.length > 0) {
                await removeTilesAnimated(matchesFound); // 移除配對的方塊並等待動畫完成
            }

            // 確保所有已標記為 null 的方塊在視覺上都被隱藏
            renderBoard(); 
            
            const tilesMoved = await dropTilesAnimated(); // 使上方方塊下落並等待動畫完成

            const tilesRefilled = refillBoard(); // 補充新方塊 (視覺效果已在函數內處理)

            // 再次渲染以顯示下落後的方塊和新補充的方塊的最終狀態
            renderBoard(); 

            // 在等待短暫時間後，再次檢查是否產生新的配對
            await new Promise(resolve => setTimeout(resolve, 100)); // 給予瀏覽器渲染和準備的時間

            const newMatchesAfterRefill = findMatches();
            if (newMatchesAfterRefill.length === 0 && !tilesMoved && !tilesRefilled) {
                // 如果沒有新的匹配，沒有方塊移動，也沒有方塊補充，則結束連鎖處理
                hasMoreMatches = false;
            } else if (newMatchesAfterRefill.length === 0 && tilesMoved && !tilesRefilled) {
                // 這個條件處理了當下落後，沒有直接產生新配對但也不是完全靜止的狀態
                hasMoreMatches = false;
            }
            // 如果有新的匹配 (newMatchesAfterRefill.length > 0)，
            // 或者有方塊移動 (tilesMoved)，
            // 或者有新方塊補充 (tilesRefilled)，
            // 則繼續下一輪循環 (hasMoreMatches 保持 true)
        }

        // 所有連鎖消除和下落都處理完畢
        isProcessing = false; // 解鎖遊戲,允許玩家再次點擊
        renderBoard(); // 最終確保顯示正確
    }

    // === 啟動遊戲 ===
    // 因為這個腳本是通過 type="module" 動態載入的,
    // 並且在載入時 gameContainer 和其內容都已經在 DOM 中,
    // 所以可以直接呼叫 init() 來啟動遊戲,不需要再等待 DOMContentLoaded 事件。
    init();

} // === if/else 塊結束 ===