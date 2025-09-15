// Function to fetch quiz data from a JSON file
async function fetchQuizData() {
    try {
        const response = await fetch('quizData.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

// Global variables
let quizData = [];
let currentQuestion = 0;
let selectedAnswers = [];
let timer;
const TIME_LIMIT = 30; // 30 seconds for each question

// Get elements from the DOM
const startBtn = document.querySelector('.start-btn');
const quizContent = document.querySelector('.quiz-content');
const questionEl = document.querySelector('.question');
const optionsEl = document.querySelector('.options');
const resultEl = document.querySelector('.result');
const scoreEl = document.getElementById('score');
const backBtn = document.querySelector('.back-btn');
const nextBtn = document.querySelector('.next-btn');
const submitBtn = document.querySelector('.submit-btn');
const restartBtn = document.querySelector('.restart-btn');
const timerEl = document.createElement('div');
timerEl.classList.add('timer');

// Initialize the quiz
async function initQuiz() {
    startBtn.style.display = 'none'; // Hide the start button
    quizContent.style.display = 'block'; // Show the quiz content
    document.querySelector('.quiz-content').prepend(timerEl);

    quizData = await fetchQuizData();
    if (quizData && quizData.length > 0) {
        selectedAnswers = new Array(quizData.length).fill(null);
        loadQuestion();
    } else {
        questionEl.textContent = "Error loading quiz data.";
    }
}

// Load the current question
function loadQuestion() {
    if (currentQuestion >= quizData.length) {
        return;
    }
    
    // Clear any existing timer
    clearTimeout(timer);
    startTimer();

    const currentQuiz = quizData[currentQuestion];
    questionEl.textContent = `${currentQuestion + 1}. ${currentQuiz.question}`;
    optionsEl.innerHTML = '';

    currentQuiz.options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('option');
        button.textContent = option;
        button.onclick = () => checkAndSelectAnswer(option, button);
        
        // Highlight previous selection
        if (selectedAnswers[currentQuestion] === option) {
            button.classList.add('selected');
        }

        // If an answer has already been selected, show correct/incorrect colors
        if (selectedAnswers[currentQuestion] !== null) {
            if (option === currentQuiz.answer) {
                button.classList.add('correct');
            } else if (option === selectedAnswers[currentQuestion]) {
                button.classList.add('incorrect');
            }
        }
        optionsEl.appendChild(button);
    });

    // Show/hide navigation buttons
    backBtn.style.display = currentQuestion === 0 ? 'none' : 'block';
    nextBtn.style.display = currentQuestion === quizData.length - 1 ? 'none' : 'block';
    submitBtn.style.display = currentQuestion === quizData.length - 1 ? 'block' : 'none';
}

// Start the timer for the current question
function startTimer() {
    let timeLeft = TIME_LIMIT;
    timerEl.textContent = `Time left: ${timeLeft}s`;

    timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `Time left: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            // Automatically move to the next question if time runs out
            moveToNextQuestion();
        }
    }, 1000);
}

// Check and select the answer, and update colors immediately
function checkAndSelectAnswer(selectedOption, clickedButton) {
    // If an answer is already selected, do nothing
    if (selectedAnswers[currentQuestion] !== null) {
        return;
    }

    // Stop the timer as soon as an answer is selected
    clearInterval(timer);

    selectedAnswers[currentQuestion] = selectedOption;
    
    // Remove 'selected' class from all options
    document.querySelectorAll('.options .option').forEach(btn => {
        btn.classList.remove('selected');
    });

    clickedButton.classList.add('selected');
    
    // Highlight correct and incorrect answers
    const currentQuiz = quizData[currentQuestion];
    
    document.querySelectorAll('.options .option').forEach(btn => {
        if (btn.textContent === currentQuiz.answer) {
            btn.classList.add('correct');
        } else if (btn.textContent === selectedOption) {
            btn.classList.add('incorrect');
        }
    });

    // Move to the next question after a short delay
    setTimeout(moveToNextQuestion, 1000);
}

function moveToNextQuestion() {
    if (currentQuestion < quizData.length - 1) {
        currentQuestion++;
        loadQuestion();
    } else {
        // On the last question, show the submit button
        submitBtn.style.display = 'block';
        nextBtn.style.display = 'none';
    }
}

// Navigate to the next question
nextBtn.addEventListener('click', () => {
    moveToNextQuestion();
});

// Navigate to the previous question
backBtn.addEventListener('click', () => {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
    }
});

// Submit the quiz and calculate the score
submitBtn.addEventListener('click', () => {
    let score = 0;
    for (let i = 0; i < quizData.length; i++) {
        if (selectedAnswers[i] === quizData[i].answer) {
            score++;
        }
    }
    endQuiz(score);
});

// End the quiz and show the results
function endQuiz(finalScore) {
    clearInterval(timer);
    timerEl.style.display = 'none';
    questionEl.style.display = 'none';
    optionsEl.style.display = 'none';
    backBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'none';
    resultEl.style.display = 'block';
    scoreEl.textContent = `${finalScore} out of ${quizData.length}`;
    restartBtn.style.display = 'block';
}

// Restart the quiz
restartBtn.addEventListener('click', () => {
    currentQuestion = 0;
    selectedAnswers = new Array(quizData.length).fill(null);
    timerEl.style.display = 'block';
    questionEl.style.display = 'block';
    optionsEl.style.display = 'flex';
    resultEl.style.display = 'none';
    restartBtn.style.display = 'none';
    loadQuestion();
});

// Event listener for the start button
startBtn.addEventListener('click', initQuiz);