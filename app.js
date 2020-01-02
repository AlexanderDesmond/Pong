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

    //
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

CANVAS.addEventListener("click", event => {
  pong.start();
});
