// games/ooxx.js

const gameContainer = document.getElementById("game-container");

if (!gameContainer) {
    console.error("錯誤: 找不到ID為 'game-container' 的元素! OOXX遊戲無法啟動。");
} else {
    gameContainer.innerHTML = `
    <style>
        /* ooxx 遊戲特定樣式 */
        .ooxx-wrapper {
            text-align: center;
            padding: 30px;
            background-color: #ffffff;
            border-radius: 15px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            max-width: 450px;
            width: 90%;
            margin: 50px auto;
            border: 1px solid #e0e0e0;
            box-sizing: border-box;
            font-family: 'Cubic-11','FusionPixel','Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
        }

        h2 {
            font-size: 2.8em;
            color: #3f51b5;
            margin-bottom: 25px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            font-family:'Cubic-11','FusionPixel', 'Arial Black', sans-serif;
        }

        .board {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            justify-content: center;
            margin: 40px auto 20px auto;
            background-color: #c7d2e2;
            border: 3px solid #a3b1c6;
            border-radius: 8px;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.15);
            width: calc(100% - 20px);
            max-width: 350px;
            box-sizing: border-box;
            padding: 10px;
        }

        .cell {
            aspect-ratio: 1 / 1;
            background-color: #e6e9ee;
            border: 2px outset #f0f2f5;
            font-size: 3.5em;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: 15px;
            transition: transform 0.1s, background-color 0.2s, box-shadow 0.2s, border 0.2s;
            user-select: none;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .cell:hover:not([data-player]) {
            transform: translateY(-3px);
            background-color: #f0f3f6;
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }

        .cell[data-player] {
            cursor: default;
            background-color: #ffffff;
            box-shadow: inset 0 0 4px rgba(0,0,0,0.1);
            border: 1px solid #b0bec5;
            transform: none;
        }

        .cell[data-player]::before {
            content: attr(data-player);
            line-height: 1;
        }
        .cell[data-player="O"]::before {
            color: #ff3399;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        .cell[data-player="X"]::before {
            color: #3f51b5;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }

        #result {
            margin-top: 25px;
            font-size: 1.8em;
            color: #3f51b5;
            text-align: center;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }

        /* 統一按鈕樣式 */
        #ooxx-restart-btn { /* Changed ID to make it specific to OOXX game's HTML */
            margin: 10px;
            padding: 12px 22px;
            border-radius: 10px;
            border: none;
            font-size: 1.2em;
            cursor: pointer;
            transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            background-color: #4CAF50; /* 統一使用綠色按鈕 */
            color: white;
            font-family:'Cubic-11', 'FusionPixel','Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        #ooxx-restart-btn:hover {
            background-color: #43A047;
            transform: translateY(-3px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.2);
        }

        #ooxx-restart-btn:active {
            background-color: #388E3C;
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
    </style>
    <div class="ooxx-wrapper">
        <h2>⭕⭕❌❌</h2>
        <div class="board" id="board"></div>
        <div id="result"></div>
        <button id="ooxx-restart-btn">🔁 重新開始</button> </div>
    `;

    // Use an IIFE (Immediately Invoked Function Expression) to encapsulate the game logic
    const ooxxGame = (() => {
        // Game state variables
        let cells = Array(9).fill(null);
        let currentPlayer = "O";
        let gameOver = false;

        // Load sound effects
        const failureSound = new Audio('assets/falled-sound-effect-278635.mp3');

        // Get DOM elements (these are specific to the OOXX game's injected HTML)
        const board = document.getElementById("board");
        const result = document.getElementById("result");
        // Get the local restart button for this game
        const restartBtn = document.getElementById("ooxx-restart-btn"); // Changed ID here

        // Note: scoreDiv and uploadBtn are expected to be in the main game.html
        // and are handled by the main gameLoader or game.html itself.
        // We will assume they exist globally for score submission.
        const scoreDiv = document.getElementById("current-score");
        const uploadBtn = document.getElementById("upload-score");


        function init() {
            // Check for necessary DOM elements, both local to OOXX.js and global
            if (!board || !result || !restartBtn || !scoreDiv || !uploadBtn) {
                console.error("ooxx遊戲: 部分內部或必要外部 DOM 元素未找到, 遊戲無法完全啟動! 請檢查HTML結構和ID。");
                return; // Stop initialization if critical elements are missing
            }

            // Bind restart button event
            restartBtn.addEventListener("click", resetGame);

            // Initial render
            renderBoard();
        }

        // Render board to DOM
        function renderBoard() {
            board.innerHTML = "";
            cells.forEach((value, index) => {
                const cell = document.createElement("div");
                cell.className = "cell";
                if (value) {
                    cell.dataset.player = value;
                }
                cell.onclick = () => handleClick(index);
                board.appendChild(cell);
            });
        }

        // Handle player (O) click
        function handleClick(index) {
            if (cells[index] || gameOver || currentPlayer !== "O") return;

            cells[index] = "O";
            renderBoard();
            checkResult("O");

            if (!gameOver) {
                currentPlayer = "X";
                result.innerText = "電腦思考中...";
                setTimeout(aiMove, 500);
            } else if (result.innerText === "電腦思考中...") {
                result.innerText = "";
            }
        }

        // AI (X) move (using Minimax)
        function aiMove() {
            const bestMove = getBestMove(cells, "X");

            if (bestMove !== -1) {
                cells[bestMove] = "X";
                renderBoard();
                checkResult("X");
            }

            if (!gameOver) {
                currentPlayer = "O";
                result.innerText = "";
            }
        }

        // Check game result (win, loss, tie)
        function checkResult(player) {
            const winPatterns = [
                [0,1,2],[3,4,5],[6,7,8],
                [0,3,6],[1,4,7],[2,5,8],
                [0,4,8],[2,4,6]
            ];

            for (let pattern of winPatterns) {
                const [a,b,c] = pattern;
                if (cells[a] === player && cells[b] === player && cells[c] === player) {
                    gameOver = true;
                    if (player === "O") {
                        result.innerText = "🎉 你贏了！";
                        showScore(1);
                    } else {
                        result.innerText = "💀 電腦贏了...";
                        showScore(0);
                        if (failureSound.readyState >= 2) {
                            failureSound.currentTime = 0;
                            failureSound.play().catch(e => console.error("失敗音效播放失敗:", e));
                        } else {
                            console.warn("失敗音效尚未載入完成，無法播放。");
                        }
                    }
                    return;
                }
            }

            if (!cells.includes(null)) {
                gameOver = true;
                result.innerText = "🤝 平手！";
                showScore(0);
                if (failureSound.readyState >= 2) {
                    failureSound.currentTime = 0;
                    failureSound.play().catch(e => console.error("失敗音效播放失敗:", e));
                } else {
                    console.warn("失敗音效尚未載入完成，無法播放。");
                }
            }
        }

        // Display score and prepare upload button
        function showScore(score) {
            scoreDiv.innerText = `你得到 ${score} 分`;
            uploadBtn.style.display = "inline-block";

            uploadBtn.onclick = async () => {
                try {
                    const { db } = await import("../js/firebase.js");
                    const { collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

                    const nickname = localStorage.getItem("nickname") || "匿名玩家";
                    const gameId = "ooxx";

                    await addDoc(collection(db, "scores"), {
                        nickname: nickname,
                        game: gameId,
                        score: score,
                        time: serverTimestamp()
                    });

                    alert("✅ 分數已上傳！");
                    uploadBtn.disabled = true;
                    uploadBtn.innerText = "已上傳";

                } catch (error) {
                    console.error("上傳分數失敗:", error);
                    alert("❌ 分數上傳失敗。");
                }
            };
        }

        // Minimax helper: check winner on a given board
        function checkWinner(b) {
            const wins = [
                [0,1,2],[3,4,5],[6,7,8],
                [0,3,6],[1,4,7],[2,5,8],
                [0,4,8],[2,4,6]
            ];
            for (const [a,b1,c] of wins) {
                if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
            }
            return null;
        }

        // Minimax recursive function
        function minimax(newBoard, currentPlayer) {
            const winner = checkWinner(newBoard);
            if (winner === "X") return { score: 1 };
            if (winner === "O") return { score: -1 };
            if (!newBoard.includes(null)) return { score: 0 };

            const moves = [];

            newBoard.forEach((val, idx) => {
                if (val === null) {
                    const move = {};
                    move.index = idx;
                    newBoard[idx] = currentPlayer;

                    const result = minimax(newBoard, currentPlayer === "X" ? "O" : "X");
                    move.score = result.score;

                    newBoard[idx] = null;
                    moves.push(move);
                }
            });

            let bestMove;
            if (currentPlayer === "X") {
                let bestScore = -Infinity;
                moves.forEach((move) => {
                    if (move.score > bestScore) {
                        bestScore = move.score;
                        bestMove = move;
                    }
                });
            } else {
                let bestScore = Infinity;
                moves.forEach((move) => {
                    if (move.score < bestScore) {
                        bestScore = move.score;
                        bestMove = move;
                    }
                });
            }
            return bestMove;
        }

        // Get AI's best move index
        function getBestMove(board, player) {
            const move = minimax([...board], player);
            return move ? move.index : -1;
        }

        // Reset game state and display
        function resetGame() {
            cells = Array(9).fill(null);
            currentPlayer = "O";
            gameOver = false;
            result.innerText = "";
            scoreDiv.innerText = ""; // Clear global score display
            uploadBtn.style.display = "none"; // Hide global upload button
            uploadBtn.disabled = false;
            uploadBtn.innerText = "⬆️ 上傳分數";
            renderBoard();
        }

        // Return the init function to be called from outside
        return {
            init
        };
    })(); // End of IIFE

    // Initialize the game when the script runs
    ooxxGame.init();

} // === if/else 塊結束 ===