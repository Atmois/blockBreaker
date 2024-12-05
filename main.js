// Canvas Specs
const screenBlock = 25;
const rows = 20;
const columns = 26.6;
let board;
let ctx;

// Platform Position
let platformX = ((columns * screenBlock) / 2) - (2.5 * screenBlock);
const platformY = ((rows - 1) * screenBlock);

// Platform Velocity
let platformVelo = 0;

// Ball Position
let ballX = ((columns * screenBlock) / 2);
let ballY = ((rows - 1) * screenBlock) - (0.5 * screenBlock);

// Ball Velocity
let ballVeloX;
let ballVeloY;
let ballVeloMag;
let ballAngle;

// Block Specs
const colours = ["red", "orange", "yellow", "green", "blue", "purple"];
const blockWidth = screenBlock * 1.2;
const blockSpacing = screenBlock * 0.1;
let blocks = [];

// Misc
let score = 0;
let alive = true;

window.onload = function () {
    const blockBreaker = document.getElementById("blockBreaker");
    const toggleViewModeButton = document.getElementById("toggleViewMode");

    resizeCanvas();
    ballVeloCalc(Math.random() * 360 - 180);
    ctx = blockBreaker.getContext("2d");

    createBlocks();

    document.addEventListener("keydown", movePlatform);
    document.addEventListener("keyup", stopPlatform);
    window.addEventListener("resize", resizeCanvas);
    toggleViewModeButton.addEventListener("click", toggleViewModeHandler);

    setInterval(redraw, 10);
};

// Toggle View Mode
function toggleViewModeHandler() {
    const bodyClassList = document.body.classList;
    bodyClassList.toggle("dark-mode");
}

// Resize for Screen Size
function resizeCanvas() {
    const maxWidth = columns * screenBlock;
    const maxHeight = rows * screenBlock;

    blockBreaker.width = Math.min(window.innerWidth, maxWidth);
    blockBreaker.height = Math.min(window.innerHeight, maxHeight);
}

function redraw() {
    if (!alive) return;

    ctx.clearRect(0, 0, blockBreaker.width, blockBreaker.height);

    platformController()
    ballController()
    blockController()
    gameEndController()
    ballVeloCalc(0)
}

function platformController() {
    // Render Platform
    ctx.fillStyle = "deeppink";
    ctx.fillRect(platformX, platformY, screenBlock * 5, screenBlock * 0.5);

    // Platform Movement
    const isMovingLeft = platformX > 0 && platformVelo == -0.25;
    const isMovingRight = platformX + screenBlock * 5 < blockBreaker.width && platformVelo == 0.25;

    if (isMovingLeft || isMovingRight) {
        platformX += platformVelo * screenBlock
    }
}

function gameEndController() {
    if (ballY > blockBreaker.height || blocks.length === 0) {
        alive = false
        displayGameEnd(blocks.length === 0 ? 1 : 0)
    }
}

function ballController() {
    // Draw the Ball
    ctx.fillStyle = document.body.classList.contains("dark-mode") ? "azure" : "lightslategrey";
    ctx.fillRect(ballX, ballY, screenBlock * 0.5, screenBlock * 0.5);

    ctx.fillRect(ballX, ballY, screenBlock * 0.5, screenBlock * 0.5);

    // Ball Movement
    ballX += ballVeloX * screenBlock;
    ballY += ballVeloY * screenBlock;

    // Collision of Ball and Platform
    if (ballX < platformX + screenBlock * 5 && ballX + screenBlock * 0.5 > platformX && ballY < platformY + screenBlock * 0.5 && ballY + screenBlock * 0.5 > platformY) {

        // Calculate Relative Position of Ball and Platform
        const intersecX = (platformX + (screenBlock * 2.5)) - (ballX + (screenBlock * 0.25));
        const normalIntersectX = (intersecX / (screenBlock * 2.5));
        const bounceAngle = -1 * normalIntersectX * (Math.PI / 3);

        // Update Ball Velocity
        ballVeloX = ballVeloMag * Math.sin(bounceAngle);
        ballVeloY = -ballVeloMag * Math.cos(bounceAngle);
        ballY = platformY - screenBlock * 0.5;

        // Lowers Score on Collision
        if (score > 25) {
            const decreaseScore = Math.ceil(score / 250)
            score -= decreaseScore
            scoreTxt.innerText = "Score: " + score;
        }
    }

    // Reflect off Ceiling and Walls
    if (ballY <= 0) {
        ballVeloY = -ballVeloY;
    } else if (ballX <= 0 || ballX >= (blockBreaker.width - 0.75 * screenBlock)) {
        ballVeloX = -ballVeloX;
    }
}

function blockController() {
    let collisionDetected = false;

    // Collision with Blocks
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        if (ballX < block.x + block.width && ballX + screenBlock * 0.5 > block.x && ballY < block.y + block.height && ballY + screenBlock * 0.5 > block.y) {
            const overlapX = Math.min(ballX + screenBlock * 0.5 - block.x, block.x + block.width - ballX);
            const overlapY = Math.min(ballY + screenBlock * 0.5 - block.y, block.y + block.height - ballY);
            if (overlapX < overlapY) {
                ballVeloX = -ballVeloX;
            } else {
                ballVeloY = -ballVeloY;
            }
            blocks.splice(i, 1);
            scoreCalc(block.colour);
            collisionDetected = true;
            break;
        }
    }

    // Draw the blocks
    for (const block of blocks) {
        ctx.fillStyle = block.colour;
        ctx.fillRect(block.x, block.y, block.width, block.height);
    }
}

// Calculate and Update Score
function scoreCalc(blockColour) {
    const scoreMap = {
        "purple": 1,
        "blue": 2,
        "green": 5,
        "yellow": 10,
        "orange": 25,
        "red": 50
    }
    score += scoreMap[blockColour] || 0
    scoreTxt.innerText = "Score: " + score;
}

// Popup for Game End
function displayGameEnd(condition) {
    ctx.font = "50px AtkinsonHyperlegible";

    if (document.body.classList.contains("dark-mode")) {
        ctx.fillStyle = "azure";
    } else if (!document.body.classList.contains("dark-mode")) {
        ctx.fillStyle = "black"
    }

    let text;
    if (condition == 0) {
        text = "Game Over";
    } else if (condition == 1) {
        text = "You Win!";
    }

    // Game Over Text
    const textWidth = ctx.measureText(text).width;
    const x = (blockBreaker.width - textWidth) / 2;
    const y = blockBreaker.height / 2;
    ctx.fillText(text, x, y);

    // Reset Button
    if (!document.querySelector(".reset-button")) {
        const resetButton = document.createElement("button");
        resetButton.innerText = "Reset";
        resetButton.className = "button reset-button";
        document.body.appendChild(resetButton);
        resetButton.addEventListener("click", resetGame);
    }
}

// Reset the Game
function resetGame() {
    // Reset Specs
    platformX = ((columns * screenBlock) / 2) - (2.5 * screenBlock);
    ballX = ((columns * screenBlock) / 2);
    ballY = ((rows - 1) * screenBlock) - (0.5 * screenBlock);
    ballVeloX = Math.random() - 0.5;
    ballVeloY = -0.25;
    score = 0;
    scoreTxt.innerText = "Score: " + score
    ballVeloCalc(Math.random() * 360 - 180);
    alive = true;

    // Hide Button
    const resetButton = document.querySelector(".reset-button");
    if (resetButton) {
        resetButton.remove();
    }

    // Redraw the Game
    createBlocks();
    redraw();
}

// Move the Platform 
function movePlatform(e) {
    switch (e.code) {
        case "ArrowLeft":
            platformVelo = -0.25;
            break;
        case "ArrowRight":
            platformVelo = 0.25;
            break;
    }
}

// Stop the Platform 
function stopPlatform(e) {
    switch (e.code) {
        case "ArrowLeft":
        case "ArrowRight":
            platformVelo = 0;
            break;
    }
}

// Calculate Ball Velocity
function ballVeloCalc(ballAngle) {
    ballVeloMag = 0.1 + Math.floor(score / 50) * 0.004;
    if (ballAngle == 0) {
        ballAngle = tanh(ballVeloY / ballVeloX);
    }

    if (Math.abs(ballAngle) < 30) {
        ballAngle = 30 * Math.sign(ballAngle);
    }

    ballVeloX = ballVeloMag * Math.cos(ballAngle * Math.PI / 180);
    ballVeloY = ballVeloMag * Math.sin(ballAngle * Math.PI / 180);
}

// Draw the Blocks
function createBlocks() {
    blocks = [];

    for (let i = screenBlock; i < (blockBreaker.width - blockWidth); i += blockWidth + blockSpacing) {
        for (let j = 0; j < 6; j++) {
            blocks.push({
                x: i,
                y: j * (screenBlock + blockSpacing) + 2 * screenBlock,
                width: blockWidth,
                height: screenBlock,
                colour: colours[j % colours.length]
            });
        }
    }
}