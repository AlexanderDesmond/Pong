// Class to contain coordinates.
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  set length(value) {
    const factor = value / this.length;
    this.x *= factor;
    this.y *= factor;
  }
}

// Class to create a shape.
class Rectangle {
  constructor(width, height) {
    this.position = new Vector();
    this.size = new Vector(width, height);
  }

  get left() {
    return this.position.x - this.size.x / 2;
  }

  get right() {
    return this.position.x + this.size.x / 2;
  }

  get top() {
    return this.position.y - this.size.y / 2;
  }

  get bottom() {
    return this.position.y + this.size.y / 2;
  }
}

// Class to create a ball.
class Ball extends Rectangle {
  constructor() {
    super(10, 10);
    this.velocity = new Vector();
  }
}

class Player extends Rectangle {
  constructor() {
    super(20, 200);
    this.score = 0;
  }
}

class Pong {
  constructor(canvas) {
    this._canvas = canvas;
    this._context = canvas.getContext("2d");
    this._canvas.width = 1200;
    this._canvas.height = 800;

    this.ball = new Ball();

    // Create players.
    this.players = [new Player(), new Player()];
    this.players[0].position.x = 90;
    this.players[1].position.x = this._canvas.width - 90;
    this.players.forEach(player => {
      player.position.y = this._canvas.height / 2;
    });

    let lastTime;
    const callback = miliseconds => {
      if (lastTime) {
        this.update((miliseconds - lastTime) / 1000);
      }

      lastTime = miliseconds;
      requestAnimationFrame(callback);
    };
    callback();

    // Hold the characters for the score.
    this.CHAR_PIXEL = 10;
    this.CHARS = [
      "111101101101111",
      "010010010010010",
      "111001111100111",
      "111001111001111",
      "101101111001001",
      "111100111001111",
      "111100111101111",
      "111001001001001",
      "111101111101111",
      "111101111001111"
    ].map(str => {
      const canvas = document.createElement("canvas");
      canvas.height = this.CHAR_PIXEL * 5;
      canvas.width = this.CHAR_PIXEL * 3;
      const context = canvas.getContext("2d");
      context.fillStyle = "white";
      str.split("").forEach((fill, i) => {
        if (fill === "1") {
          context.fillRect(
            (i % 3) * this.CHAR_PIXEL,
            ((i / 3) | 0) * this.CHAR_PIXEL,
            this.CHAR_PIXEL,
            this.CHAR_PIXEL
          );
        }
      });
      return canvas;
    });

    this.reset();
  }

  // Handle ball / paddle collision.
  collide(player, ball) {
    if (
      player.left < ball.right &&
      player.right > ball.left &&
      player.top < ball.bottom &&
      player.bottom > ball.top
    ) {
      // Whenever ball hits paddle, slightly change y-axis direction and increase speed.
      const length = ball.velocity.length;
      ball.velocity.x = -ball.velocity.x;
      ball.velocity.y += 300 * (Math.random() - 0.5);
      ball.velocity.length = length * 1.05;
    }
  }

  draw() {
    // Draw game screen.
    this._context.fillStyle = "black";
    this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);

    // Draw ball.
    this.drawRectangle(this.ball);

    // Draw players.
    this.players.forEach(player => this.drawRectangle(player));

    this.drawScore();
  }

  drawRectangle(rectangle) {
    this._context.fillStyle = "white";
    this._context.fillRect(
      rectangle.left,
      rectangle.top,
      rectangle.size.x,
      rectangle.size.y
    );
  }

  // Draw the player scores.
  drawScore() {
    const align = this._canvas.width / 3;
    const CHAR_WIDTH = this.CHAR_PIXEL * 4;
    this.players.forEach((player, index) => {
      const chars = player.score.toString().split("");
      const offset =
        align * (index + 1) -
        ((CHAR_WIDTH * chars.length) / 2 + this.CHAR_PIXEL) / 2;
      chars.forEach((char, position) => {
        this._context.drawImage(
          this.CHARS[char | 0],
          offset + position * CHAR_WIDTH,
          20
        );
      });
    });
  }

  // Reset game state.
  reset() {
    // Set initial position of the ball.
    this.ball.position.x = this._canvas.width / 2;
    this.ball.position.y = this._canvas.height / 2;
    // Set the initial velocity of the ball.
    this.ball.velocity.x = 0;
    this.ball.velocity.y = 0;
  }

  // Handle the starting of a round.
  start() {
    if (this.ball.velocity.x === 0 && this.ball.velocity.y === 0) {
      // Randomise the velocity of the ball.
      this.ball.velocity.x = 300 * (Math.random() > 0.5 ? 1 : -1);
      this.ball.velocity.y = 300 * (Math.random() * 2 - 1);
      this.ball.velocity.length = 200;
    }
  }

  update(deltaTime) {
    // Update the ball's position.
    this.ball.position.x += this.ball.velocity.x * deltaTime;
    this.ball.position.y += this.ball.velocity.y * deltaTime;

    if (this.ball.left < 0 || this.ball.right > this._canvas.width) {
      const playerId = (this.ball.velocity.x < 0) | 0;
      this.players[playerId].score++;
      this.reset();
      console.log(playerId);
      //this.ball.velocity.x = -this.ball.velocity.x;
    }
    if (this.ball.top < 0 || this.ball.bottom > this._canvas.height) {
      this.ball.velocity.y = -this.ball.velocity.y;
    }

    // Player 2 (AI) will follow the ball. - Very simple and unfair AI, will look to improve eventually.
    this.players[1].position.y = this.ball.position.y;
    // Handle ball collision with the player's paddles.
    this.players.forEach(player => this.collide(player, this.ball));

    this.draw();
  }
}

const CANVAS = document.querySelector("canvas");
const pong = new Pong(CANVAS);

// Player 1 moves paddle with mouse.
CANVAS.addEventListener("mousemove", event => {
  pong.players[0].position.y = event.offsetY;
});

// Start the round whenever the canvas is clicked.
CANVAS.addEventListener("click", event => {
  pong.start();
});
