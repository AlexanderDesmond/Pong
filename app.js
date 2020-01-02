// Class to contain coordinates.
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
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

class Pong {
  constructor(canvas) {
    this._canvas = canvas;
    this._context = canvas.getContext("2d");
    this._canvas.width = 1200;
    this._canvas.height = 800;

    // Set initial position of the ball.
    this.ball = new Ball();
    this.ball.position.x = 200;
    this.ball.position.y = 100;
    // Set the initial velocity of the ball.
    this.ball.velocity.x = 150;
    this.ball.velocity.y = 150;

    let lastTime;
    const callback = miliseconds => {
      if (lastTime) {
        this.update((miliseconds - lastTime) / 1000);
      }

      lastTime = miliseconds;
      requestAnimationFrame(callback);
    };
    callback();
  }

  draw() {
    // Draw game screen.
    this._context.fillStyle = "black";
    this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);

    // Draw ball.
    this.drawRectangle(this.ball);
  }

  drawRectangle(rectangle) {
    this._context.fillStyle = "white";
    this._context.fillRect(
      rectangle.position.x,
      rectangle.position.y,
      rectangle.size.x,
      rectangle.size.y
    );
  }

  update(deltaTime) {
    // Update the ball's position.
    this.ball.position.x += this.ball.velocity.x * deltaTime;
    this.ball.position.y += this.ball.velocity.y * deltaTime;

    if (this.ball.left < 0 || this.ball.right > this._canvas.width) {
      this.ball.velocity.x = -this.ball.velocity.x;
    }
    if (this.ball.top < 0 || this.ball.bottom > this._canvas.height) {
      this.ball.velocity.y = -this.ball.velocity.y;
    }

    this.draw();
  }
}

const CANVAS = document.querySelector("canvas");
const pong = new Pong(CANVAS);