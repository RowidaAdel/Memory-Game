const gridContainer = document.querySelector(".grid-container");
let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let moves = 0;
let score = 0;

// Timer Variables
let timerInterval;
let seconds = 0;
let timerStarted = false;

// Sounds 
const matchSound = new Audio('sounds/match.mp3');
const wrongSound = new Audio('sounds/wrong.mp3');

// Show initial moves, timer, and score
document.querySelector(".moves").textContent = moves;
document.querySelector(".timer").textContent = "0s";
document.querySelector(".score").textContent = score;

// Fetch cards data
fetch("./data/cards.json")
    .then((res) => res.json())
    .then((data) => {
        cards = [...data, ...data];
        shuffleCards();
    });

// Shuffle cards
function shuffleCards() {
    let currentIndex = cards.length, randomIndex, temporaryValue;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        temporaryValue = cards[currentIndex];
        cards[currentIndex] = cards[randomIndex];
        cards[randomIndex] = temporaryValue;
    }
    generateCards();
}

// Generate cards
function generateCards() {
    for (let card of cards) {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.setAttribute("data-name", card.name);
        cardElement.innerHTML = `
            <div class="front">
                <i class="${card.icon} front-image"></i>
            </div>
            <div class="back"></div>
        `;
        gridContainer.appendChild(cardElement);
        cardElement.addEventListener("click", flipCard);
    }
}

// Flip card
function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    if (!timerStarted) {
        startTimer();
        timerStarted = true;
    }

    this.classList.add("flipped");

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    moves++;
    document.querySelector(".moves").textContent = moves;
    lockBoard = true;

    checkForMatch();
}

// Check if two cards match
function checkForMatch() {
    let isMatch = firstCard.dataset.name === secondCard.dataset.name;
    isMatch ? disableCards() : unflipCards();
}

// Disable matched cards
function disableCards() {
    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);

    // Play match sound
    matchSound.play();

    score++;
    document.querySelector(".score").textContent = score;

    resetBoard();
    checkWin();
}

// Unflip cards if not matched
function unflipCards() {
    // Play wrong sound
    wrongSound.play();

    setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        resetBoard();
    }, 1000);
}

// Reset board
function resetBoard() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

// Start timer
function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        document.querySelector(".timer").textContent = seconds + "s";
    }, 1000);
}

// Stop timer
function stopTimer() {
    clearInterval(timerInterval);
}

// Reset timer
function resetTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    document.querySelector(".timer").textContent = "0s";
}

// Check if player won
function checkWin() {
    const allFlipped = document.querySelectorAll(".card.flipped").length === cards.length;
    if (allFlipped) {
        stopTimer();
        setTimeout(() => {
            Swal.fire({
                title: 'Congratulations! 🎉',
                html: `You finished the game in <b>${seconds}</b> seconds with <b>${moves}</b> moves.`,
                icon: 'success',
                confirmButtonText: 'Continue',
                confirmButtonColor: '#3085d6',
                background: '#fff',
            });
        }, 500);

        // Lock all cards (remove click after winning)
        document.querySelectorAll('.card').forEach(card => {
            card.removeEventListener('click', flipCard);
        });
    }
}

// Restart the game
function restart() {
    resetBoard();
    moves = 0;
    score = 0;
    document.querySelector(".moves").textContent = moves;
    document.querySelector(".score").textContent = score;
    gridContainer.innerHTML = "";
    shuffleCards();
    resetTimer();
    timerStarted = false;
}

// Add event listener for Restart button
document.querySelector(".actions button").addEventListener("click", restart);
