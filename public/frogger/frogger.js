document.addEventListener('DOMContentLoaded', function () {
    // Initialize variables
    const canvas = document.getElementById('gameCanvas');
    const context = canvas.getContext('2d');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const newGameButton = document.getElementById('newGameButton');
    let isGameOver = false;
    let score = 0; 
    let bestScore = 0; 
    const scoreBoard = document.getElementById('scoreBoard'); 
    const bestScoreBoard = document.getElementById('bestScoreBoard');


    // Game over screen and new game logic below 
    function showGameOverScreen() {
        gameOverScreen.style.display = 'block';
        isGameOver = true;
    }

    function newGame() {
        // Resets game 
        gameOverScreen.style.display = 'none';
        frog.x = 50;
        frog.y = canvas.height - 100;
        isGameOver = false;
        score = 0; 
        scoreBoard.innerText = 'Score: ' + score; 
        // Reset obstacle difficulty and add lambda function to increase speed as score increases
        obstacles.forEach(obstacle => {
            obstacle.speed = 2 + Math.floor(score / 10); 
        });
        // Restart the game loop
        requestAnimationFrame(updateGameArea); 
    }
    newGameButton.addEventListener('click', newGame);


    class Frog {
        // Initalizes frog's position and size
        constructor(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }

        // Creates frog
        draw() {
            context.fillStyle = 'green';
            context.fillRect(this.x, this.y, this.width, this.height);
        }

        // Moves frog
        move(x, y) {
            this.x += x;
            this.y += y;
        }

        // Checks if frog collides with obstacle
        collidesWith(obstacle) {
            return this.x < obstacle.x + obstacle.width &&
                this.x + this.width > obstacle.x &&
                this.y < obstacle.y + obstacle.height &&
                this.y + this.height > obstacle.y;
        }
    }

    class Obstacle {
        // Initializes obstacle's position, size, and speed
        constructor(x, y, width, height, speed) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.speed = speed;
        }

        // Creates obstacle
        draw() {
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
        }
        
        // Moves obstacle based on speed
        update() {
            this.x += this.speed;
            // Reset the position of the obstacle to create a loop
            if (this.x > canvas.width) this.x = -this.width;
        }
    }

    class FinishLine {
        // Initializes finish line's position
        constructor(y) {
            this.y = y;
        }

        // Creates finish line
        draw() {
            context.fillStyle = 'blue';
            context.fillRect(0, this.y, canvas.width, 10); 
        }

        // Checks if frog crosses finish line
        checkCrossed(frog) {
            return frog.y <= this.y;
        }
    }

    // Initialize the frog and obstacles
    const frog = new Frog(50, canvas.height - 100, 50, 50);
    // Creates 3 obstacles with different speeds 100 px apart so the frog can fit between them
    const obstacles = [
        new Obstacle(0, 250, 60, 40, 2),
        new Obstacle(0, 150, 60, 40, 3),
        new Obstacle(0, 50, 60, 40, 1)
    ];
    // Position it 10 pixels from the top of the canvas
    const finishLine = new FinishLine(10);

    function updateGameArea() {
        // check if the game is over
        if (isGameOver) return;

        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw and update the frog and obstacles
        frog.draw();
        obstacles.forEach(obstacle => {
            obstacle.update();
            obstacle.draw();
            if (frog.collidesWith(obstacle)) {
                showGameOverScreen();
                return;
            }
        });

        // Draw the finish line
        finishLine.draw();

        // Check if the frog crosses the finish line
        if (finishLine.checkCrossed(frog)) {
            score += 1; // Increment the score
            scoreBoard.innerText = 'Score: ' + score; // Update the score display
            if (score > bestScore) {
                bestScore = score; // Update best score if current score is higher
                bestScoreBoard.innerText = 'Best Score: ' + bestScore; // Update the best score display
            }
            frog.y = canvas.height - 100; // Reset the frog's position
            // Increase difficulty
            obstacles.forEach(obstacle => {
                obstacle.speed += 0.5; // Increase speed of obstacles, adjust as needed
            });
        }

        // Call updateGameArea every frame
        requestAnimationFrame(updateGameArea);
    }

    // Listen for keydown events to move the frog
    window.addEventListener('keydown', function (e) {
        if (isGameOver) return; // Disable controls when the game is over

        switch (e.key) {
            case 'ArrowUp':
                frog.move(0, -50);
                break;
            case 'ArrowDown':
                frog.move(0, 50);
                break;
            case 'ArrowLeft':
                frog.move(-50, 0);
                break;
            case 'ArrowRight':
                frog.move(50, 0);
                break;
        }
    });

    // Start the game
    updateGameArea();
});
