window.onload = function() {
    
    var canvasWidth = 900;
    var canvasHeight = 600;
    var ctx;
    var delay = 100;
    var initailDelay = delay;
    var mySnake;
    var myApple;
    var blockSize = 30;
    var withInBlock = canvasWidth/blockSize;
    var heightInBlock = canvasHeight/blockSize;
    var score;
    var timeOut;
    var eatenApples = 0;
    
    init();
    
    function init() {
        score = 0;
        var canvas = document.createElement('CanVas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "25px solid #A7D948"; // Border color
        canvas.style.margin = "50px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#ddd";
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        mySnake = new Snake([[6,4], [5,4], [4,4], [3,4], [2,4], [1,4]], "right");
        myApple = new Apple([10,10]);
        refreshCanvas();
    }
    
    function refreshCanvas() {
        mySnake.advance();
        if (mySnake.checkCollision()) {
            clearTimeout(timeOut);
            gameOver();
        }
        else {
            if (mySnake.isEatingApple(myApple)) {
                eatenApples++;
                if (eatenApples % 5 == 0)
                    delay -= 10;
                score++;
                mySnake.ateApple = true;
                do
                {
                    myApple.setNewPosition();   
                }
                while(myApple.isOnSnake(mySnake));
            }
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            displayScore();
            mySnake.draw();
            myApple.draw();
            timeOut = setTimeout(refreshCanvas, delay);
        }
    }
    
    function gameOver() {
        ctx.save();
        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "black"; // Score Color
        var centerX = canvasWidth/2;
        var centerY = canvasHeight/2;
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        ctx.strokeText("Game Over", centerX - 180, centerY - 180);
        ctx.fillText("Game Over", centerX - 180, centerY - 180);
        ctx.font = "bold 30px sans-serif";
        ctx.strokeText("Press 'Space' to Replay", centerX - 150, centerY - 120);
        ctx.fillText("Press 'Space' to Replay", centerX - 150, centerY - 120);
        ctx.restore();
        score = 0;
    }
    
    function restart() {
        eatenApples = 0;
        delay = initailDelay;
        mySnake = new Snake([[6,4], [5,4], [4,4], [3,4], [2,4], [1,4]], "right");
        myApple = new Apple([10,10]);
        clearTimeout(timeOut);
        refreshCanvas();
    }
    
    function displayScore() {
        ctx.save();
        ctx.font = "bold 200px sans-serif";
        ctx.fillStyle = "black"; // Score Color
        var centerX = canvasWidth/2;
        var centerY = canvasHeight/2;
        ctx.textBaseline = "middle";
        ctx.fillText(score.toString(), centerX-50, centerY);
        ctx.restore();
    }
    
    function drawBlock(ctx, position) {
        var x = position[0] * blockSize;
        var y = position[1] * blockSize;
        ctx.fillRect(x, y, blockSize, blockSize);
    }
    
    function Snake(snakeBody, snakeDirection) {
        this.snakeBody = snakeBody;
        this.direction = snakeDirection;
        this.ateApple = false;
        this.draw = function() {
            ctx.save();
            ctx.fillStyle = "#5076F9"; // Snake Color
            for (var i=0; i<this.snakeBody.length; i++) {
                drawBlock(ctx, this.snakeBody[i]);
            }
            ctx.restore();   
        };
        this.advance = function() {
            var nextPosition = this.snakeBody[0].slice();
            switch (this.direction) {
                case "right":
                    nextPosition[0] += 1;
                    break;
                case "left":
                    nextPosition[0] -= 1;
                    break;
                case "up":
                    nextPosition[1] -= 1;
                    break;
                case "down":
                    nextPosition[1] += 1;
                    break;
                default:
                    throw("Invalid Direction");
            }
            this.snakeBody.unshift(nextPosition);
            if (!this.ateApple)
                this.snakeBody.pop();
            else
                this.ateApple = false;
        };
        this.setDirection = function(newDirection) {
            var allowedDirections;
            switch (this.direction) {
                case "right":
                case "left":
                    allowedDirections = ["up", "down"];
                    break;
                case "up":
                case "down":
                    allowedDirections = ["left", "right"];
                    break;
                default:
                    throw("Invalid Direction");
            }
            if (allowedDirections.indexOf(newDirection) > -1) {
                this.direction = newDirection;
            }
        };
        this.checkCollision = function() {
            var wallCollision = false;
            var snakeCollision = false;
            var head = this.snakeBody[0];
            var rest = this.snakeBody.slice(1);
            var snakeX = head[0];
            var snakeY = head[1];
            var minX = 0;
            var minY = 0;
            var maxX = withInBlock-1;
            var maxY = heightInBlock-1;
            var notBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
            var notBetweenVerticalWalls = snakeY < minY || snakeY > maxY;
            
            if (notBetweenHorizontalWalls || notBetweenVerticalWalls) {
                wallCollision = true;
            }
            
            for (var i=0; i<rest.length; i++) {
                if (snakeX === rest[i][0] && snakeY === rest[i][1]) {
                    snakeCollision = true;
                    console.log("collision avec soi!");
                }
            }
            return wallCollision || snakeCollision;  
        };
        this.isEatingApple = function(appleToEat) {
            var head = this.snakeBody[0];
            if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1])
                return true;
            else   
                return false;
        };
    }
    
    function Apple(position) {
        this.position = position;
        this.draw = function() {
            ctx.save();
            ctx.fillStyle = "#F43706";
            ctx.beginPath();
            var radius = blockSize/2;
            var x = this.position[0]*blockSize + radius;
            var y = this.position[1]*blockSize + radius;
            ctx.arc(x, y, radius, 0, Math.PI*2, true);
            ctx.fill();
            
            ctx.restore();
        };
        this.setNewPosition = function() {
            var newX = Math.round(Math.random() * (withInBlock - 1));
            var newY = Math.round(Math.random() * (heightInBlock - 1));
            this.position = [newX, newY];
        };
        this.isOnSnake = function(snakeToCheck) {
            for (var i=0; i<snakeToCheck.snakeBody.length; i++) {
                if (this.position[0] === snakeToCheck.snakeBody[i][0] && this.position[1] === snakeToCheck.snakeBody[i][1])
                    return true;
            }
            return false;
        }
    }

    document.onkeydown = function handleKeyDown(e) {
            var key = e.keyCode;
            var newDirection;
            switch (key) {
                case 37: // left
                    newDirection = "left";
                    break;
                case 38: // up
                    newDirection = "up";
                    break;
                case 39:
                    newDirection = "right";
                    break;
                case 40:
                    newDirection = "down";
                    break;
                case 32:
                    restart();
                    return;
                default:
                    return;
            }
            mySnake.setDirection(newDirection);
    }
}