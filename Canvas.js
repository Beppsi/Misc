var animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60)
    };
var canvas = document.getElementById("canvas");
var width = 600;
var height = 400;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');
var player = new Player();
var computer = new Computer();
var ball = new Ball(300, 200);

var keysDown = {};

var render = function () {
    context.fillStyle = "lightblue";
    context.fillRect(0, 0, width, height);
    player.render();
    computer.render();
    ball.render();
};

var update = function () {
    player.update();
    computer.update(ball);
    ball.update(player.paddle, computer.paddle);
};

var step = function () {
    update();
    render();
    animate(step);
};

function Paddle(x, y, width, height) { //Definerar rörelse för spelare
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.x_speed = 0;
    this.y_speed = 0;
}

Paddle.prototype.render = function () {
    context.fillStyle = "#0000FF";
    context.fillRect(this.x, this.y, this.width, this.height);
};

Paddle.prototype.move = function (x, y) {
    this.x += x;
    this.y += y;
    this.x_speed = x;
    this.y_speed = y;
    if (this.y < 0) {
        this.y = 0;
        this.y_speed = 0;
    } else if (this.y + this.height > 400) {
        this.y = 400 - this.height;
        this.y_speed = 0;
    }
};

function Computer() { //Positionerar datorns spelare
    this.paddle = new Paddle(10, 175, 10, 50);
}

Computer.prototype.render = function () {
    this.paddle.render();
};

Computer.prototype.update = function (ball) {
    var y_pos = ball.y;
    var diff = -((this.paddle.y + (this.paddle.height / 2)) - y_pos);
    if (diff < 0 && diff < -4) {
        diff = -5;
    } else if (diff > 0 && diff > 4) {
        diff = 5;
    }
    this.paddle.move(diff, 0);
    if (this.paddle.y < 0) {
        this.paddle.y = 0;
    } else if (this.paddle.y + this.paddle.height > 400) {
        this.paddle.y = 400 - this.paddle.height;
    }
};

function Player() { //Positionerar användarens spelare
    this.paddle = new Paddle(580, 175, 10, 50);
}

Player.prototype.render = function () {
    this.paddle.render();
};

Player.prototype.update = function () {
    for (var key in keysDown) {
        var value = Number(key);
        if (value == 87) {
            this.paddle.move(0, -4);
        } else if (value == 83) {
            this.paddle.move(0, 4);
        } else {
            this.paddle.move(0, 0);
        }
    }
};

function Ball(x, y) { //Placerar bollen med starthastighet  åt höger
    this.x = x;
    this.y = y;
    this.x_speed = 3;
    this.y_speed = 0;
}

Ball.prototype.render = function () {
    context.beginPath();
    context.arc(this.x, this.y, 5, 2 * Math.PI, false);
    context.fillStyle = "#000000"; //denna kan sättas i en for-loop som ändrar färgen efte en array vid ändring av hastighet (pos till negativ)
    context.fill();
};

Ball.prototype.update = function (paddle1, paddle2) {
    this.x += this.x_speed;
    this.y += this.y_speed;
    var top_y = this.y - 5;
    var top_x = this.x - 5;
    var bottom_x = this.x + 5;
    var bottom_y = this.y + 5;

    if (this.y - 5 < 0) {
        this.y = 5;
        this.y_speed = -this.y_speed;
    } else if (this.y + 5 > 400) {
        this.y = 395;
        this.y_speed = -this.y_speed;
    }

    if (this.x < 0 || this.x > 600) {
        this.y_speed = 0;
        this.x_speed = 3;
        this.y = 200;
        this.x = 200;
    }

    if (top_x > 200) { //Om bollen nuddar en spelare ändras hastiheten
        if (top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x && top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y) { //om bollen befinner sig på samma plats som en spelare
            this.x_speed = -3;
            this.y_speed += (paddle1.y_speed / 2); //låter bollen skickas iväg med en vinkel
            this.x += this.x_speed;
        }
    } else {
        if (top_x < (paddle2.x + paddle2.width) && bottom_x > paddle2.x && top_y < (paddle2.y + paddle2.height) && bottom_y > paddle2.y) {
            this.x_speed = 3;
            this.x_speed += (paddle2.y_speed / 2);
            this.x += this.x_speed;
        }
    }
};

document.body.appendChild(canvas);
animate(step);

window.addEventListener("keydown", function (event) { //Lyssnar efter keydown/key up
    keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function (event) {
    delete keysDown[event.keyCode];
});
