class Car {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.height = h;
    this.width = w;

    this.speed = 0;
    this.accelaration = 0.2;
    this.maxSpeed = 6;
    this.friction = 0.05;
    this.angle = 0;
    this.damge = false;

    this.sensors = new Sensor(this);
    this.controls = new Controls();
  }

  update(borders) {
    this.#move();
    this.polygon = this.#createPolygon();
    this.damge = this.#accessDamage(borders);
    this.sensors.update(borders);
  }

  #accessDamage(borders) {
    for (let i = 0; i < borders.length; i++) {
      if (polyIntersect(this.polygon, borders[i])) return true;
    }
    return false;
  }

  #createPolygon() {
    const points = [];
    const rad = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * rad,
      y: this.y - Math.cos(this.angle - alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * rad,
      y: this.y - Math.cos(this.angle + alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
    });
    return points;
  }

  #move() {
    if (this.controls.forward) {
      this.speed += this.accelaration;
    }
    if (this.controls.reverse) {
      this.speed -= this.accelaration;
    }
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }
    if (this.speed > 0) {
      this.speed -= this.friction;
    }
    if (this.speed < 0) {
      this.speed += this.friction;
    }
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    if (this.speed != 0) {
      const flip = this.speed > 0 ? 1 : -1;
      if (this.controls.left) {
        this.angle += 0.03 * flip;
      }
      if (this.controls.right) {
        this.angle -= 0.03 * flip;
      }
    }

    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;

    // console.log(this.y);
  }

  draw(ctx) {
    if (this.damge) ctx.fillStyle = "gray";
    else ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
    for (let i = 1; i < this.polygon.length; i++) {
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
    }
    ctx.fill();
    this.sensors.draw(ctx);
  }
}
