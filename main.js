// Canvas Specs
const screenBlock = 25;
const rows = 20;
const columns = 26.6;
var board;
var ctx;

// Platform Position
var platformX = ((columns * screenBlock) / 2) - (2.5 * screenBlock);
var platformY = ((rows - 1) * screenBlock);

// Platform Velocity
var platformVeloX = 0;
var platformVeloY = 0;

// Ball Position
var ballX = ((columns * screenBlock) / 2);
var ballY = ((rows - 1) * screenBlock) - (0.5 * screenBlock);

// Ball Velocity
var ballVeloX;
var ballVeloY;
var ballVeloMag;
var ballAngle;

// Misc
var score = 0;
var alive = true;
var blocks = [];

window.onload = function () {
    blockBreaker = document.getElementById("blockBreaker");
    scoreTxt = document.getElementById("scoreTxt");
    toggleViewModeButton = document.getElementById("toggleViewMode");

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
    document.body.classList.toggle("dark-mode");
}

// Resize for Screen Size
function resizeCanvas() {
    blockBreaker.width = Math.min(window.innerWidth, columns * screenBlock);
    blockBreaker.height = Math.min(window.innerHeight, rows * screenBlock);
}

function redraw() {
    if (!alive) return;

    ctx.clearRect(0, 0, blockBreaker.width, blockBreaker.height);

    // Draw the Platform
    ctx.fillStyle = "deeppink";
    ctx.fillRect(platformX, platformY, screenBlock * 5, screenBlock * 0.5);

    // Platform Movement
    if ((platformX > 0 && platformVeloX == -0.25) || (platformX + screenBlock * 5 < blockBreaker.width && platformVeloX == 0.25)) {
        platformX += platformVeloX * screenBlock;
    }

    // Draw the Ball
    if (document.body.classList.contains("dark-mode")) {
        ctx.fillStyle = "azure";
    } else if (!document.body.classList.contains("dark-mode")) {
        ctx.fillStyle = "lightslategrey"
    }

    ctx.fillRect(ballX, ballY, screenBlock * 0.5, screenBlock * 0.5);

    // Ball Movement
    ballX += ballVeloX * screenBlock;
    ballY += ballVeloY * screenBlock;

    // Collision of Ball and Platform
    if (ballX < platformX + screenBlock * 5 && ballX + screenBlock * 0.5 > platformX && ballY < platformY + screenBlock * 0.5 && ballY + screenBlock * 0.5 > platformY) {

        // Calculate Relative Position of Ball and Platform
        let intersecX = (platformX + (screenBlock * 2.5)) - (ballX + (screenBlock * 0.25));
        let normalIntersectX = (intersecX / (screenBlock * 2.5));
        let bounceAngle = -1 * normalIntersectX * (Math.PI / 3);

        // Update Ball Velocity
        ballVeloX = ballVeloMag * Math.sin(bounceAngle);
        ballVeloY = -ballVeloMag * Math.cos(bounceAngle);
        ballY = platformY - screenBlock * 0.5;
    }

    // Reflect off Ceiling and Walls
    if (ballY <= 0) {
        ballVeloY = -ballVeloY;
    } else if (ballX <= 0 || ballX >= (blockBreaker.width - 0.75 * screenBlock)) {
        ballVeloX = -ballVeloX;
    }

    // Collision with Blocks
    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        if (ballX < block.x + block.width && ballX + screenBlock * 0.5 > block.x && ballY < block.y + block.height && ballY + screenBlock * 0.5 > block.y) {
            ballVeloY = -ballVeloY;
            ballVeloX = -ballVeloX
            blocks.splice(i, 1);
            switch (block.colour) {
                case "purple":
                    score += 1
                    break
                case "blue":
                    score += 2
                    break
                case "green":
                    score += 5
                    breakk
                case "yellow":
                    score += 10
                    break
                case "orange":
                    score += 25
                    break
                case "red":
                    score += 50
                    break
            }
            scoreTxt.innerText = "Score: " + score;
            ballVeloCalc(Math.random() * 360 - 180);
            break;
        }
    }

    // Draw the blocks
    for (let block of blocks) {
        ctx.fillStyle = block.colour;
        ctx.fillRect(block.x, block.y, block.width, block.height);
    }

    // Death by Out of Bounds
    if (ballY > blockBreaker.height) {
        alive = false;
        displayGameEnd(0);
        return;
    }

    // Win Condition
    if (blocks.length === 0) {
        alive = false
        displayGameEnd(1)
        return
    }
}

// Popup for Game End
function displayGameEnd(condition) {
    ctx.clearRect(0, 0, blockBreaker.width, blockBreaker.height);

    ctx.fillStyle = "black";
    ctx.font = "50px AtkinsonHyperlegible";

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
        var resetButton = document.createElement("button");
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
    platformY = ((rows - 1) * screenBlock);
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
            platformVeloX = -0.25;
            break;
        case "ArrowRight":
            platformVeloX = 0.25;
            break;
    }
}

// Stop the Platform 
function stopPlatform(e) {
    switch (e.code) {
        case "ArrowLeft":
        case "ArrowRight":
            platformVeloX = 0;
            break;
    }
}

// Calculate Ball Velocity
function ballVeloCalc(ballAngle) {
    ballVeloMag = 0.1 + Math.floor(score / 50) * 0.0045;
    ballVeloX = ballVeloMag * Math.cos(ballAngle * Math.PI / 180);
    ballVeloY = ballVeloMag * Math.sin(ballAngle * Math.PI / 180);
}

// Draw the Blocks
function createBlocks() {
    const colours = ["red", "orange", "yellow", "green", "blue", "purple"];
    const blockWidth = screenBlock * 1.8;
    const blockSpacing = screenBlock * 0.1;

    blocks = [];

    for (let i = screenBlock; i < (blockBreaker.width - blockWidth); i += blockWidth + blockSpacing) {
        for (let j = 0; j < 6; j++) {
            blocks.push({
                x: i,
                y: j * (screenBlock + blockSpacing) + 2 * screenBlock, // Adjusted y position
                width: blockWidth,
                height: screenBlock,
                colour: colours[j % colours.length]
            });
        }
    }
}