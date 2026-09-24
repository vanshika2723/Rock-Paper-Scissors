/* =========================================================
   RPS ARENA
   COMPLETE GAME LOGIC
========================================================= */

const choices = ["rock", "paper", "scissors"];

const icons = {
    rock: "🪨",
    paper: "📄",
    scissors: "✂️"
};

const names = {
    rock: "Rock",
    paper: "Paper",
    scissors: "Scissors"
};


/* =========================================================
   GAME STATE
========================================================= */

let game = {
    playerScore: 0,
    computerScore: 0,

    wins: 0,
    draws: 0,
    losses: 0,

    streak: 0,
    bestStreak: 0,

    totalGames: 0,

    mode: "endless",

    history: [],

    achievements: {
        first: false,
        streak3: false,
        streak5: false,
        ten: false,
        perfect: false
    }
};

let soundEnabled = true;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const playerScore = document.getElementById("playerScore");
const computerScore = document.getElementById("computerScore");

const roundNumber = document.getElementById("roundNumber");

const playerChoice = document.getElementById("playerChoice");
const computerChoice = document.getElementById("computerChoice");

const playerMoveText = document.getElementById("playerMoveText");
const computerMoveText = document.getElementById("computerMoveText");

const resultBox = document.getElementById("resultBox");
const resultIcon = document.getElementById("resultIcon");
const resultText = document.getElementById("resultText");
const resultMessage = document.getElementById("resultMessage");

const wins = document.getElementById("wins");
const draws = document.getElementById("draws");
const losses = document.getElementById("losses");

const streak = document.getElementById("streak");
const bestStreak = document.getElementById("bestStreak");
const totalGames = document.getElementById("totalGames");

const historyContainer = document.getElementById("history");

const gameModal = document.getElementById("gameModal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");

const finalPlayerScore = document.getElementById("finalPlayerScore");
const finalComputerScore = document.getElementById("finalComputerScore");

const toast = document.getElementById("toast");
const toastText = document.getElementById("toastText");

const achievementCount = document.getElementById("achievementCount");

const modeLabel = document.getElementById("modeLabel");


/* =========================================================
   LOCAL STORAGE
========================================================= */

function saveGame() {
    localStorage.setItem(
        "rpsArenaGame",
        JSON.stringify(game)
    );
}

function loadGame() {

    const saved = localStorage.getItem("rpsArenaGame");

    if (!saved) {
        updateUI();
        return;
    }

    try {

        const data = JSON.parse(saved);

        game = {
            ...game,
            ...data
        };

    } catch (error) {
        console.log("Could not load saved game.");
    }

    updateUI();
}


/* =========================================================
   RANDOM COMPUTER MOVE
========================================================= */

function getComputerChoice() {

    const index = Math.floor(
        Math.random() * choices.length
    );

    return choices[index];
}


/* =========================================================
   DETERMINE WINNER
========================================================= */

function getResult(player, computer) {

    if (player === computer) {
        return "draw";
    }

    if (
        (player === "rock" && computer === "scissors") ||
        (player === "paper" && computer === "rock") ||
        (player === "scissors" && computer === "paper")
    ) {
        return "win";
    }

    return "loss";
}


/* =========================================================
   PLAY GAME
========================================================= */

function playGame(player) {

    if (
        game.mode !== "endless" &&
        game.playerScore >= getTargetScore()
    ) {
        return;
    }

    if (
        game.mode !== "endless" &&
        game.computerScore >= getTargetScore()
    ) {
        return;
    }

    const computer = getComputerChoice();

    showPlayerMove(player);

    animateComputer(computer);

    setTimeout(() => {

        const result = getResult(player, computer);

        updateScores(result);

        updateBattleUI(
            player,
            computer,
            result
        );

        addHistory(
            player,
            computer,
            result
        );

        checkAchievements();

        checkGameOver();

        saveGame();

        updateUI();

    }, 650);

}


/* =========================================================
   SHOW PLAYER MOVE
========================================================= */

function showPlayerMove(choice) {

    playerChoice.innerHTML =
        `<span>${icons[choice]}</span>`;

    playerChoice.classList.remove("shake");

    void playerChoice.offsetWidth;

    playerChoice.classList.add("shake");

    playerMoveText.textContent =
        names[choice];
}


/* =========================================================
   COMPUTER ANIMATION
========================================================= */

function animateComputer(finalChoice) {

    computerMoveText.textContent =
        "Thinking...";

    let count = 0;

    const interval = setInterval(() => {

        const random =
            choices[Math.floor(Math.random() * 3)];

        computerChoice.innerHTML =
            `<span>${icons[random]}</span>`;

        computerChoice.classList.remove("shake");

        void computerChoice.offsetWidth;

        computerChoice.classList.add("shake");

        count++;

        if (count >= 5) {

            clearInterval(interval);

            computerChoice.innerHTML =
                `<span>${icons[finalChoice]}</span>`;

            computerMoveText.textContent =
                names[finalChoice];

        }

    }, 110);
}


/* =========================================================
   UPDATE SCORES
========================================================= */

function updateScores(result) {

    game.totalGames++;

    if (result === "win") {

        game.playerScore++;
        game.wins++;

        game.streak++;

        if (game.streak > game.bestStreak) {
            game.bestStreak = game.streak;
        }

        playSound("win");

    } else if (result === "loss") {

        game.computerScore++;
        game.losses++;

        game.streak = 0;

        playSound("loss");

    } else {

        game.draws++;

        game.streak = 0;

        playSound("draw");
    }
}


/* =========================================================
   BATTLE UI
========================================================= */

function updateBattleUI(
    player,
    computer,
    result
) {

    if (result === "win") {

        resultIcon.textContent = "🎉";

        resultText.textContent =
            "YOU WIN!";

        resultMessage.textContent =
            `${names[player]} beats ${names[computer]}! 🔥`;

        resultBox.style.borderColor =
            "rgba(34,197,94,.35)";

    }

    else if (result === "loss") {

        resultIcon.textContent = "💥";

        resultText.textContent =
            "COMPUTER WINS";

        resultMessage.textContent =
            `${names[computer]} beats ${names[player]}.`;

        resultBox.style.borderColor =
            "rgba(239,68,68,.35)";

    }

    else {

        resultIcon.textContent = "🤝";

        resultText.textContent =
            "DRAW!";

        resultMessage.textContent =
            "Both players chose the same move.";

        resultBox.style.borderColor =
            "rgba(250,204,21,.35)";
    }

    resultBox.classList.remove("win-animation");

    void resultBox.offsetWidth;

    resultBox.classList.add("win-animation");
}


/* =========================================================
   MODE
========================================================= */

function getTargetScore() {

    if (game.mode === "best3") {
        return 2;
    }

    if (game.mode === "best5") {
        return 3;
    }

    return Infinity;
}


function setMode(mode) {

    game.mode = mode;

    resetRound();

    document
        .querySelectorAll(".mode-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.mode === mode
            );

        });

    if (mode === "endless") {
        modeLabel.textContent =
            "ENDLESS MODE";
    }

    if (mode === "best3") {
        modeLabel.textContent =
            "BEST OF 3";
    }

    if (mode === "best5") {
        modeLabel.textContent =
            "BEST OF 5";
    }

    saveGame();

    updateUI();
}


function resetRound() {

    game.playerScore = 0;
    game.computerScore = 0;

    playerChoice.innerHTML =
        "<span>❔</span>";

    computerChoice.innerHTML =
        "<span>❔</span>";

    playerMoveText.textContent =
        "Choose your move";

    computerMoveText.textContent =
        "Waiting...";

    resultIcon.textContent = "🎯";

    resultText.textContent =
        "Make your move!";

    resultMessage.textContent =
        "The computer is waiting for your challenge.";

    resultBox.style.borderColor =
        "var(--border)";

    updateUI();
}


/* =========================================================
   GAME OVER
========================================================= */

function checkGameOver() {

    if (game.mode === "endless") {
        return;
    }

    const target = getTargetScore();

    if (
        game.playerScore >= target ||
        game.computerScore >= target
    ) {

        setTimeout(() => {

            openGameOverModal();

        }, 850);
    }
}


function openGameOverModal() {

    const playerWon =
        game.playerScore > game.computerScore;

    finalPlayerScore.textContent =
        game.playerScore;

    finalComputerScore.textContent =
        game.computerScore;

    if (playerWon) {

        modalTitle.textContent =
            "YOU WIN!";

        modalMessage.textContent =
            "🏆 Incredible! You dominated the arena.";

        createConfetti();

    } else {

        modalTitle.textContent =
            "COMPUTER WINS";

        modalMessage.textContent =
            "🤖 The computer takes this round. Try again!";
    }

    gameModal.classList.add("show");
}


function closeGameModal() {

    gameModal.classList.remove("show");
}


/* =========================================================
   HISTORY
========================================================= */

function addHistory(
    player,
    computer,
    result
) {

    game.history.unshift({
        player,
        computer,
        result,
        time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
    });

    if (game.history.length > 8) {
        game.history.pop();
    }

    renderHistory();
}


function renderHistory() {

    if (!game.history.length) {

        historyContainer.innerHTML = `
            <div class="empty-history">
                <span>🎮</span>
                <p>No battles yet</p>
                <small>Your recent matches will appear here.</small>
            </div>
        `;

        return;
    }

    historyContainer.innerHTML =
        game.history.map((item, index) => {

            const resultLabel =
                item.result === "win"
                    ? "WIN"
                    : item.result === "loss"
                        ? "LOSS"
                        : "DRAW";

            const icon =
                item.result === "win"
                    ? "🏆"
                    : item.result === "loss"
                        ? "💥"
                        : "🤝";

            return `
                <div class="history-item">

                    <div class="history-result ${item.result}">
                        ${icon}
                    </div>

                    <div class="history-info">
                        <strong>
                            ${names[item.player]}
                            &nbsp; vs &nbsp;
                            ${names[item.computer]}
                        </strong>

                        <p>
                            ${icons[item.player]}
                            You
                            &nbsp; • &nbsp;
                            ${icons[item.computer]}
                            Computer
                            &nbsp; • &nbsp;
                            ${item.time}
                        </p>
                    </div>

                    <div class="history-status ${item.result}">
                        ${resultLabel}
                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================================
   ACHIEVEMENTS
========================================================= */

function checkAchievements() {

    if (
        game.wins >= 1 &&
        !game.achievements.first
    ) {

        game.achievements.first = true;

        unlockAchievement(
            "achievement-first",
            "🥇 First Victory"
        );
    }


    if (
        game.streak >= 3 &&
        !game.achievements.streak3
    ) {

        game.achievements.streak3 = true;

        unlockAchievement(
            "achievement-streak3",
            "🔥 On Fire"
        );
    }


    if (
        game.streak >= 5 &&
        !game.achievements.streak5
    ) {

        game.achievements.streak5 = true;

        unlockAchievement(
            "achievement-streak5",
            "⚡ Unstoppable"
        );
    }


    if (
        game.totalGames >= 10 &&
        !game.achievements.ten
    ) {

        game.achievements.ten = true;

        unlockAchievement(
            "achievement-10",
            "🎯 Veteran"
        );
    }


    if (
        game.streak >= 5 &&
        !game.achievements.perfect
    ) {

        game.achievements.perfect = true;

        unlockAchievement(
            "achievement-perfect",
            "👑 Perfect Run"
        );
    }
}


function unlockAchievement(
    id,
    title
) {

    const element =
        document.getElementById(id);

    if (!element) return;

    element.classList.remove("locked");

    element.classList.add("unlocked");

    showToast(
        `${title} unlocked!`
    );
}


function updateAchievements() {

    const achievements =
        Object.values(game.achievements);

    const unlocked =
        achievements.filter(Boolean).length;

    achievementCount.textContent =
        `${unlocked} / ${achievements.length}`;

    Object.keys(game.achievements)
        .forEach(key => {

            const map = {
                first: "achievement-first",
                streak3: "achievement-streak3",
                streak5: "achievement-streak5",
                ten: "achievement-10",
                perfect: "achievement-perfect"
            };

            const element =
                document.getElementById(map[key]);

            if (
                game.achievements[key] &&
                element
            ) {

                element.classList.remove("locked");

                element.classList.add("unlocked");
            }

        });
}


/* =========================================================
   UPDATE UI
========================================================= */

function updateUI() {

    playerScore.textContent =
        game.playerScore;

    computerScore.textContent =
        game.computerScore;

    roundNumber.textContent =
        game.totalGames;

    wins.textContent =
        game.wins;

    draws.textContent =
        game.draws;

    losses.textContent =
        game.losses;

    streak.textContent =
        game.streak;

    bestStreak.textContent =
        game.bestStreak;

    totalGames.textContent =
        game.totalGames;

    updateAchievements();

    renderHistory();
}


/* =========================================================
   RESET COMPLETE GAME
========================================================= */

function resetGame() {

    const confirmed =
        confirm(
            "Are you sure you want to reset all game statistics?"
        );

    if (!confirmed) return;

    game = {
        playerScore: 0,
        computerScore: 0,

        wins: 0,
        draws: 0,
        losses: 0,

        streak: 0,
        bestStreak: 0,

        totalGames: 0,

        mode: "endless",

        history: [],

        achievements: {
            first: false,
            streak3: false,
            streak5: false,
            ten: false,
            perfect: false
        }
    };

    localStorage.removeItem(
        "rpsArenaGame"
    );

    document
        .querySelectorAll(".mode-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.mode === "endless"
            );

        });

    modeLabel.textContent =
        "ENDLESS MODE";

    resetRound();

    updateUI();

    saveGame();
}


/* =========================================================
   CLEAR HISTORY
========================================================= */

function clearHistory() {

    game.history = [];

    saveGame();

    renderHistory();
}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;

function showToast(message) {

    toastText.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2800);
}


/* =========================================================
   SOUND ENGINE
========================================================= */

let audioContext;

function getAudioContext() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
    }

    return audioContext;
}


function playSound(type) {

    if (!soundEnabled) return;

    try {

        const ctx = getAudioContext();

        const oscillator =
            ctx.createOscillator();

        const gain =
            ctx.createGain();

        oscillator.connect(gain);

        gain.connect(ctx.destination);

        let frequency = 400;

        if (type === "win") {
            frequency = 700;
        }

        if (type === "loss") {
            frequency = 220;
        }

        if (type === "draw") {
            frequency = 450;
        }

        oscillator.frequency.value =
            frequency;

        oscillator.type = "sine";

        gain.gain.setValueAtTime(
            0.001,
            ctx.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.08,
            ctx.currentTime + 0.02
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + 0.25
        );

        oscillator.start();

        oscillator.stop(
            ctx.currentTime + 0.25
        );

    } catch (error) {
        console.log("Audio unavailable");
    }
}


/* =========================================================
   THEME
========================================================= */

function toggleTheme() {

    document.body.classList.toggle(
        "light"
    );

    const isLight =
        document.body.classList.contains("light");

    document.getElementById("themeBtn")
        .textContent =
        isLight ? "☀️" : "🌙";

    localStorage.setItem(
        "rpsTheme",
        isLight ? "light" : "dark"
    );
}


function loadTheme() {

    const theme =
        localStorage.getItem("rpsTheme");

    if (theme === "light") {

        document.body.classList.add("light");

        document.getElementById("themeBtn")
            .textContent = "☀️";
    }
}


/* =========================================================
   CONFETTI
========================================================= */

function createConfetti() {

    for (let i = 0; i < 55; i++) {

        const confetti =
            document.createElement("div");

        confetti.textContent =
            ["🎉", "✨", "🏆", "⭐", "🔥"][
                Math.floor(Math.random() * 5)
            ];

        confetti.style.position = "fixed";

        confetti.style.left =
            Math.random() * 100 + "vw";

        confetti.style.top = "-30px";

        confetti.style.fontSize =
            Math.random() * 15 + 12 + "px";

        confetti.style.zIndex = "300";

        confetti.style.pointerEvents =
            "none";

        document.body.appendChild(confetti);

        const duration =
            Math.random() * 1800 + 1500;

        const x =
            (Math.random() - .5) * 300;

        confetti.animate(
            [
                {
                    transform: "translate(0, 0) rotate(0deg)",
                    opacity: 1
                },
                {
                    transform:
                        `translate(${x}px, 110vh) rotate(720deg)`,
                    opacity: 0
                }
            ],
            {
                duration,
                easing: "cubic-bezier(.2,.8,.3,1)"
            }
        );

        setTimeout(() => {
            confetti.remove();
        }, duration);
    }
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

document
    .querySelectorAll(".choice-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                playGame(
                    button.dataset.choice
                );

            }
        );

    });


document
    .querySelectorAll(".mode-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                setMode(
                    button.dataset.mode
                );

            }
        );

    });


document
    .getElementById("resetBtn")
    .addEventListener(
        "click",
        resetGame
    );


document
    .getElementById("clearHistory")
    .addEventListener(
        "click",
        clearHistory
    );


document
    .getElementById("themeBtn")
    .addEventListener(
        "click",
        toggleTheme
    );


document
    .getElementById("soundBtn")
    .addEventListener(
        "click",
        () => {

            soundEnabled =
                !soundEnabled;

            document.getElementById("soundBtn")
                .textContent =
                soundEnabled ? "🔊" : "🔇";

        }
    );


document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeGameModal
    );


document
    .getElementById("playAgain")
    .addEventListener(
        "click",
        () => {

            closeGameModal();

            resetRound();

        }
    );


gameModal.addEventListener(
    "click",
    event => {

        if (
            event.target === gameModal
        ) {
            closeGameModal();
        }

    }
);


/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();

        if (key === "r") {
            playGame("rock");
        }

        if (key === "p") {
            playGame("paper");
        }

        if (key === "s") {
            playGame("scissors");
        }

        if (key === "escape") {
            closeGameModal();
        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

loadTheme();

loadGame();

console.log(
    "🎮 RPS Arena loaded successfully!"
);