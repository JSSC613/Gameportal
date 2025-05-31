// games/minesweeper.js
document.body.style.fontFamily = "'ZCOOL KuaiLe', 'Noto Sans TC', sans-serif";

// 嘗試取得遊戲容器元素
const gameContainer = document.getElementById("game-container");

// 如果找不到遊戲容器，則記錄錯誤並停止後續的遊戲初始化程式碼執行
if (!gameContainer) {
    console.error("錯誤：找不到ID為 'game-container' 的元素！踩地雷遊戲無法啟動。");
} else {
    // 找到遊戲容器，注入遊戲的 HTML 結構和內嵌 CSS
    gameContainer.innerHTML = `
    <style>
    /* 全局字體和背景 (可選，通常在主 CSS 檔中設定) */
    /* body {
        font-family:'Cubic-11','FusionPixel', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f0f2f5; // 輕柔淺藍灰色背景
        color: #333; // 深色文字
    } */

    /* 踩地雷遊戲特定樣式 */
    .minesweeper-container {
        text-align: center;
        padding: 30px;
        background-color: #ffffff; /* 更亮的白色容器背景 */
        border-radius: 15px;
        box-shadow: 0 8px 16px rgba(0,0,0,0.2); /* 柔和的陰影 */
        max-width: fit-content; /* 讓容器寬度適應內容，尤其棋盤變大後 */
        width: 90%; /* 響應式寬度 */
        margin: 50px auto;
        border: 1px solid #e0e0e0; /* 輕微邊框 */
        box-sizing: border-box; /* 確保 padding 和 border 不會增加元素總寬度 */
    }

    h2 {
        font-size: 2.8em; /* 標題更大 */
        color: #3f51b5; /* 藍色標題 */
        margin-bottom: 25px;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.1); /* 柔和文字陰影 */
        font-family:'Cubic-11','FusionPixel', 'Arial Black', sans-serif; /* 更具衝擊力的字體 */
    }

    .minesweeper-board {
        font-family: 'Cubic-11','FusionPixel','Comic Sans MS', 'ZCOOL KuaiLe', 'Noto Sans TC', cursive, sans-serif;
        display: grid;
        gap: 3px; /* 增加間距讓格子之間有分隔感，與更大的格子協調 */
        background-color: #c7d2e2; /* 淺藍灰色作為間隙背景 */
        border: 4px solid #a3b1c6; /* 淺藍色邊框，與更大的格子協調 */
        border-radius: 8px;
        margin: 25px auto;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.15); /* 輕微內陰影 */
        overflow: hidden; /* 防止圓角裁剪問題 */
        /* width: 100%; 不需要這個，讓 grid 自己決定寬度 */
        box-sizing: border-box;
    }

    .cell {
        width: 45px; /* 明確設定寬度，讓格子變大 */
        height: 45px; /* 明確設定高度，讓格子變大 */
        background-color: #e6e9ee; /* 未揭開的亮灰色 */
        border: 2px outset #f0f2f5; /* 3D 立體按鈕效果，更亮 */
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.6em; /* 數字更大以配合更大的格子 */
        font-weight: bold;
        cursor: pointer;
        user-select: none;
        color: transparent;
        transition: background-color 0.1s ease, border 0.1s ease, box-shadow 0.1s ease;
    }

    .cell:hover:not(.revealed):not(.flagged) {
        background-color: #f0f3f6; /* 懸停效果更亮 */
    }

    .cell:active:not(.revealed):not(.flagged) {
        border-style: inset; /* 點擊時下沉效果 */
        background-color: #d8dee8; /* 點擊時輕微變暗 */
        /* 移除 transform: translateY(0) 或其他縮放效果 */
    }

    .cell.revealed {
        background-color: #ffffff; /* 揭開後的純白色背景 */
        border: 1px solid #b0bec5; /* 揭開後扁平化，邊框更柔和 */
        color: #333; /* 顯示數字/地雷 */
        cursor: default;
        box-shadow: inset 0 0 4px rgba(0,0,0,0.1); /* 輕微內陰影 */
    }

    /* 數字顏色 - 保持鮮明但與亮色背景協調 */
    .cell[data-mines="1"] { color: #2196f3; } /* Blue */
    .cell[data-mines="2"] { color: #4caf50; } /* Green */
    .cell[data-mines="3"] { color: #f44336; } /* Red */
    .cell[data-mines="4"] { color: #9c27b0; } /* Purple */
    .cell[data-mines="5"] { color: #ff9800; } /* Orange */
    .cell[data-mines="6"] { color: #00bcd4; } /* Cyan */
    .cell[data-mines="7"] { color: #607d8b; } /* Blue Gray */
    .cell[data-mines="8"] { color: #424242; } /* Dark Gray */


    .cell.mine {
        background-color: #ef5350; /* 地雷背景色：柔和紅 */
        color: #fff; /* 地雷文字顏色：白色 */
        font-size: 2em; /* 地雷圖標大一點 */
        border: 1px solid #d32f2f;
    }

    .cell.flagged {
        background-color: #ffc107; /* 旗幟顏色：柔和橘黃色 */
        color: #333; /* 旗幟文字顏色：深色 */
        font-size: 2em; /* 旗幟圖標大一點 */
        border: 2px outset #ffecb3;
    }

    .controls {
        font-family: 'Cubic-11','FusionPixel','Comic Sans MS', 'ZCOOL KuaiLe', 'Noto Sans TC', cursive, sans-serif;
        margin-top: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px; /* 增加間距 */
        color: #546e7a; /* 控制項文字顏色，柔和深灰藍 */
        font-weight: bold;
        font-size: 1.1em;
    }

    #difficulty-select, #new-game-btn {
        padding: 12px 22px; /* 增加 padding */
        border-radius: 10px; /* 更圓的圓角 */
        border: none;
        font-size: 1.2em; /* 增大字體 */
        cursor: pointer;
        transition: background-color 0.2s ease, box-shadow 0.2s ease; /* 移除 transform 過渡 */
        box-shadow: 0 4px 8px rgba(0,0,0,0.1); /* 柔和陰影 */
    }

    #difficulty-select {
        font-family: 'Cubic-11','FusionPixel','Comic Sans MS', 'ZCOOL KuaiLe', 'Noto Sans TC', cursive, sans-serif;
        background-color: #e0e0e0; /* 淺灰色背景 */
        color: #333; /* 深色文字 */
        border: 1px solid #bdbdbd;
    }

    #difficulty-select:hover {
        background-color: #d5d5d5;
    }

    #new-game-btn {
        font-family: 'Cubic-11','FusionPixel','Comic Sans MS', 'ZCOOL KuaiLe', 'Noto Sans TC', cursive, sans-serif;
        background-color: #4CAF50; /* 柔和綠色按鈕 */
        color: white;
    }

    #new-game-btn:hover {
        background-color: #43A047; /* 懸停時顏色變深 */
        transform: translateY(-3px); /* 輕微上浮 */
        box-shadow: 0 6px 12px rgba(0,0,0,0.2); /* 懸停陰影更明顯 */
    }

    #new-game-btn:active {
        background-color: #388E3C;
        transform: translateY(0); /* 點擊時下沉 */
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .status-message {
        margin-top: 30px;
        font-size: 2em; /* 狀態訊息更大 */
        color: #f44336; /* 預設為柔和紅 (用於失敗) */
        font-weight: bold;
        min-height: 2em;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }
    .status-message.win {
        color: #4CAF50; /* 勝利時柔和綠色 */
    }


    /* 隱藏右鍵選單 */
    .minesweeper-board, .cell {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    .mineRule{
        font-size: 1.2em; /* 說明文字稍微大一點 */
        color: #546e7a; /* 柔和深灰藍 */
        margin-top: 20px;
        font-family: 'Cubic-11','FusionPixel','Comic Sans MS', 'ZCOOL KuaiLe', 'Noto Sans TC', cursive, sans-serif;
    }

    </style>
<div class="minesweeper-container">
        <h2>💣 踩地雷</h2>
        <div class="controls">
            難度：
            <select id="difficulty-select">
                <option value="easy">簡單 (9x9, 10地雷)</option>
                <option value="medium">中等 (16x16, 40地雷)</option>
                <option value="hard">困難 (16x24, 77地雷)</option>
            </select>
            <button id="new-game-btn">🔄 新遊戲</button>
        </div>
        <p class="mineRule">左鍵挖掘 <span role="img" aria-label="pickaxe">⛏️</span>，右鍵可放置/取消旗子🚩</p>
        <div class="status-message" id="status-message"></div>
        <div class="minesweeper-board" id="minesweeper-board"></div>
    </div>
    `;

    // 使用 IIFE 封裝遊戲邏輯
    const minesweeperGame = (() => {
        let board = [];
        let rows = 0;
        let cols = 0;
        let minesCount = 0;
        let revealedCells = 0;
        let isGameOver = false;
        let isFirstClick = true;

        const victorySound = new Audio('assets/level-completed-230568.mp3');
        const loseSound = new Audio('assets/creeper-explosion-sound-106759.mp3');
        // --- 新增挖土音效 ---
        const digSound = new Audio('assets/gravel2.ogg'); // 確保您有這個音效檔案
        // -------------------

        // 取得 DOM 元素
        const boardEl = document.getElementById("minesweeper-board");
        const difficultySelect = document.getElementById("difficulty-select");
        const newGameBtn = document.getElementById("new-game-btn");
        const statusMessageEl = document.getElementById("status-message");

        // 初始化遊戲
        function init() {
            if (!boardEl || !difficultySelect || !newGameBtn || !statusMessageEl) {
                console.error("踩地雷遊戲：內部 DOM 元素未找到！");
                return;
            }
            difficultySelect.addEventListener("change", newGame);
            newGameBtn.addEventListener("click", newGame);
            newGame(); // Call newGame initially to set up the board on load
        }

        // 設置遊戲板和地雷
        function newGame() {
            isGameOver = false;
            isFirstClick = true;
            revealedCells = 0;
            statusMessageEl.textContent = ""; // 清空狀態訊息
            statusMessageEl.classList.remove("win"); // 移除勝利樣式

            const difficulty = difficultySelect.value;
            switch (difficulty) {
                case "easy":
                    rows = 9; cols = 9; minesCount = 10;
                    break;
                case "medium":
                    rows = 16; cols = 16; minesCount = 40;
                    break;
                case "hard":
                    rows = 16; cols = 24; minesCount = 77;
                    break;
            }

            // 使用 1fr 讓每個格子在行方向上均勻分佈並填滿空間
            boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            boardEl.innerHTML = '';
            board = Array(rows).fill(0).map(() => Array(cols).fill(0));

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const cell = document.createElement("div");
                    cell.classList.add("cell");
                    cell.dataset.row = r;
                    cell.dataset.col = c;
                    cell.addEventListener("click", handleClick);
                    cell.addEventListener("contextmenu", handleRightClick);
                    boardEl.appendChild(cell);
                }
            }
        }

        // 在第一次點擊時佈置地雷 (確保第一個點擊不會是地雷)
        function placeMines(firstClickRow, firstClickCol) {
            let placedMines = 0;
            while (placedMines < minesCount) {
                const r = Math.floor(Math.random() * rows);
                const c = Math.floor(Math.random() * cols);

                const isNearFirstClick = (
                    r >= firstClickRow - 1 && r <= firstClickRow + 1 &&
                    c >= firstClickCol - 1 && c <= firstClickCol + 1
                );

                if (board[r][c] !== 'mine' && !isNearFirstClick) {
                    board[r][c] = 'mine';
                    placedMines++;
                }
            }
            calculateNumbers();
        }

        // 計算每個非地雷格周圍的地雷數量
        function calculateNumbers() {
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (board[r][c] === 'mine') continue;

                    let count = 0;
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            const nr = r + i;
                            const nc = c + j;

                            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] === 'mine') {
                                count++;
                            }
                        }
                    }
                    board[r][c] = count;
                }
            }
        }

        // 處理左鍵點擊
        function handleClick(event) {
            if (isGameOver) return;

            const cell = event.target;
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);

            if (cell.classList.contains("revealed") || cell.classList.contains("flagged")) return;

            if (isFirstClick) {
                placeMines(r, c);
                isFirstClick = false;
            }

            if (board[r][c] === 'mine') {
                revealMines();
                statusMessageEl.textContent = "💥 遊戲結束！你踩到地雷了！";
                statusMessageEl.classList.remove("win");
                isGameOver = true;
                if (loseSound.readyState >= 2) {
                    loseSound.playbackRate = 2;
                    loseSound.currentTime = 0;
                    loseSound.play().catch(e => console.error("失敗音效播放失敗:", e));
                } else {
                    console.warn("失敗音效尚未載入完成，無法播放。");
                }
                return;
            }

            revealCell(r, c);
            checkWin();
        }

        // 處理右鍵點擊 (插旗/取消插旗)
        function handleRightClick(event) {
            event.preventDefault();
            if (isGameOver) return;

            const cell = event.target;
            if (cell.classList.contains("revealed")) return;

            cell.classList.toggle("flagged");
            cell.textContent = cell.classList.contains("flagged") ? "🚩" : "";
        }

        // 揭開單個方塊
        function revealCell(r, c) {
            if (r < 0 || r >= rows || c < 0 || c >= cols) return;
            const cell = boardEl.children[r * cols + c];
            if (cell.classList.contains("revealed") || cell.classList.contains("flagged")) return;

            // --- 播放挖土音效 ---
            if (digSound.readyState >= 2) {
                digSound.currentTime = 0; // 重置音效到開頭
                digSound.playbackRate = 1.5; // 可以調整播放速度
                digSound.play().catch(e => console.error("挖土音效播放失敗:", e));
            } else {
                console.warn("挖土音效尚未載入完成，無法播放。");
            }
            // -------------------

            cell.classList.add("revealed");
            revealedCells++;

            const value = board[r][c];
            if (value > 0) {
                cell.textContent = value;
                cell.dataset.mines = value;
            } else if (value === 0) {
                cell.textContent = "";
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        revealCell(r + i, c + j);
                    }
                }
            }
        }

        // 揭開所有地雷 (遊戲失敗時)
        function revealMines() {
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const cell = boardEl.children[r * cols + c];
                    if (board[r][c] === 'mine') {
                        cell.classList.add("revealed", "mine");
                        cell.textContent = "💣";
                    }
                    cell.removeEventListener("click", handleClick);
                    cell.removeEventListener("contextmenu", handleRightClick);
                }
            }
        }

        // 檢查是否勝利
        function checkWin() {
            if (revealedCells === (rows * cols) - minesCount) {
                statusMessageEl.textContent = "🎉 恭喜，地雷解除！";
                statusMessageEl.classList.add("win");
                isGameOver = true;

                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const cell = boardEl.children[r * cols + c];
                        if (board[r][c] === 'mine' && !cell.classList.contains('flagged')) {
                            cell.classList.add('flagged');
                            cell.textContent = '🚩';
                        }
                        cell.removeEventListener("click", handleClick);
                        cell.removeEventListener("contextmenu", handleRightClick);
                    }
                }

                if (victorySound.readyState >= 2) {
                    victorySound.currentTime = 0;
                    victorySound.playbackRate = 3;
                    victorySound.play().catch(e => console.error("勝利音效播放失敗:", e));
                } else {
                    console.warn("勝利音效尚未載入完成，無法播放。");
                }
            }
        }

        // IIFE 返回 init 函數
        return {
            init
        };
    })();

    // === 啟動遊戲 ===
    minesweeperGame.init();

} // === if/else 塊結束 ===