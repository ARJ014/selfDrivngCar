const canvas = document.getElementById("myCanvas");
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 600;
canvas.width = 400;

const ctx = canvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(canvas.width / 2, canvas.width * 0.9);
const cars = generateCars(100);
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
  bestCar.brain = JSON.parse(localStorage.getItem("bestBrain"));
}
const traffic = [new Car(road.getLaneCenter(1), -100, 30, 50, "Dummy", 2)];

animate();

function generateCars(N) {
  const cars = [];
  for (let i = 1; i <= N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
  }
  return cars;
}

function save() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
  localStorage.removeItem("bestBrain");
}

function animate() {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }

  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic);
  }

  canvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;
  ctx.save();
  bestCar = cars.find((c) => c.y == Math.min(...cars.map((c) => c.y)));
  ctx.translate(0, -bestCar.y + canvas.height * 0.8);

  road.draw(ctx);
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(ctx, "red");
  }
  ctx.globalAlpha = 0.2;
  for (let i = 1; i < cars.length; i++) {
    cars[i].draw(ctx, "blue", false);
  }
  ctx.globalAlpha = 1;
  bestCar.draw(ctx, "blue", true);

  ctx.restore();
  Visualizer.drawNetwork(networkCtx, bestCar.brain);
  requestAnimationFrame(animate);
}
