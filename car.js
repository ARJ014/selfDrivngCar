class Car {
  constructor(x, y, w, h, type, maxSpeed = 4) {
    this.x = x;
    this.y = y;
    this.height = h;
    this.width = w;

    this.speed = 0;
    this.accelaration = 0.2;
    this.maxSpeed = maxSpeed;
    this.friction = 0.05;
    this.angle = 0;
    this.damge = false;

    this.useBrain = type == "AI";

    this.controler = type;
    if (type != "Dummy") {
      this.sensors = new Sensor(this);
      this.brain = new Neural([this.sensors.rayCount, 6, 4]);
    }
    this.controls = new Controls(type);
  }

  update(borders, traffic) {
    if (!this.damge) {
      this.#move();
      this.polygon = this.#createPolygon();
      this.damge = this.#accessDamage(borders, traffic);
    }
    if (this.sensors) {
      this.sensors.update(borders, traffic);
      const offsets = this.sensors.readings.map((e) =>
        e == null ? 0 : 1 - e.offset
      );
      const outputs = Neural.feedForward(offsets, this.brain);

      if (this.brain) {
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
      }
    }
  }

  #accessDamage(borders, traffic) {
    for (let i = 0; i < borders.length; i++) {
      if (polyIntersect(this.polygon, borders[i])) return true;
    }
    for (let i = 0; i < traffic.length; i++) {
      if (polyIntersect(this.polygon, traffic[i].polygon)) return true;
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

  draw(ctx, color, drawSensor) {
    if (this.damge) ctx.fillStyle = "gray";
    else ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
    for (let i = 1; i < this.polygon.length; i++) {
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
    }
    ctx.fill();
    if (this.sensors && drawSensor) {
      this.sensors.draw(ctx);
    }
  }
}
