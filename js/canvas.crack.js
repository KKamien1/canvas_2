//import defaultExport from "helpers.js";

const box2 = document.getElementById("box2");
const dim = ({ clientHeight, clientWidth }) => ({
  width: clientWidth,
  height: clientHeight
});
const distance = (a, b) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)).toFixed(2);

class Cursor {
  constructor({ offsetTop, offsetLeft }, observers = []) {
    Object.assign(this, { offsetTop, offsetLeft, observers });
  }
  addObserver(observer) {
    this.observers.push(observer);
  }
  setPosition({ type, clientX, clientY }) {
    this.mousePosition = {
      clientX: clientX - this.offsetLeft,
      clientY: clientY - this.offsetTop
    };
    if (type === "click") {
      this.clickPosition = this.mousePosition;
    }
  }
  dispatchEvent = e => {
    if (e instanceof Event) {
      this.setPosition(e);
      this.observers.forEach(observer => {
        observer.markDestination(this.clickPosition);
      });
    }
  };
}

function markDestination(destination) {
  Object.assign(this, { destination });
}

const sampleDot = {};

Object.assign(sampleDot, { markDestination });

sampleDot.markDestination({ x: 0, y: 20 });

makecanvas(box2);

function makecanvas(div) {
  size = dim(div);
  ctx = canvas(div);
  ctx.strokeStyle = "rgba(200,69,200,.6)";
  const color = "rgba(216,69,11,.6)";
  const points = generate(20, dotInDiv, size, 5, 5, color);

  const cursor = new Cursor(div, points.slice(0, 10));
  ["click"].forEach(evt =>
    box2.addEventListener(evt, cursor.dispatchEvent, false)
  );
  findClosest(points);
  console.log(points);
  animation(points)();
}

function animation(points, t = 0, time = 0) {
  return function loop(timestamp) {
    ctx.clearRect(0, 0, size.width, size.height);

    points.forEach(point => {
      drawCircle(point);
      drawLine(point, points[point.closest[1].index]);
      drawLine(point, points[point.closest[2].index]);
      drawLine(point, points[point.closest[3].index]);
      update(point);
    });

    findClosest(points);

    t += 1000 / 60;
    time = +timestamp;
    requestAnimationFrame(loop);
  };
}

function update(point) {
  point.x =
    point.destination.clientX > point.x
      ? point.x + point.speed * point.acceleration
      : point.x - point.speed * point.acceleration;
  point.y =
    point.destination.clientY > point.y
      ? point.y + point.speed * point.acceleration
      : point.y - point.speed * point.acceleration;
  return point;
}

function isIn(point, div) {
  point.x = point.x > div.width ? 0 : point.x;
  point.y = point.y < 0 ? div.height : point.y;
  return point;
}

function canvas(div, color = "white") {
  let c = document.createElement("canvas");
  Object.assign(c, dim(div));
  div.style.position = "relative";
  c.style.position = "absolute";
  c.style.top = c.style.left = 0;
  ctx = c.getContext("2d");
  ctx.fillStyle = color;
  div.appendChild(c);
  return ctx;
}

function randomOf(value, start = 0) {
  return Math.floor(Math.random() * (value - start + 1)) + start;
}

function dotInDiv(dimentions, speed, radius, color) {
  const point = randomPoint(dimentions);
  Object.assign(point, { markDestination });

  return {
    ...point,
    speed: randomOf(speed, 1),
    radius: randomOf(radius, 1),
    acceleration: 0.5,
    destination: { clientX: 0, clientY: 0 },
    color
  };
}

function randomPoint(dimentions) {
  return {
    x: Math.floor(randomOf(dimentions.width)),
    y: Math.floor(randomOf(dimentions.height))
  };
}

function generate(n, fn, div, speed, radius, color) {
  const result = [];
  while (n--) {
    result.push(fn(div, speed, radius, color));
  }
  return result;
}

function drawCircle(center, radius = 3, color = "rgba(100,100,100,.8)") {
  defaultColor = ctx.fillStyle;
  ctx.fillStyle = color || ctx.fillStyle;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = defaultColor;
}

function drawLine(a, b) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function findClosest(points) {
  const distances = points.map(point => {
    let distanceValues = [];
    points.forEach(pointB => distanceValues.push(distance(point, pointB)));
    return distanceValues;
  });

  const closest = distances.map(distanceArr =>
    distanceArr
      .map((distance, index) => {
        return {
          distance,
          index
        };
      })
      .sort((a, b) => a.distance - b.distance)
  );

  return points.reduce((aggregator, point, index) => {
    const updatedPoint = Object.assign(point, {
      distances: distances[index],
      closest: closest[index]
    });
    aggregator.push(updatedPoint);
    return aggregator;
  }, []);
}

function drawLineOfClosest(points) {
  points.forEach((point, index) => {
    ctx.beginPath();
    point.closest.forEach(closePoint => {
      let { x, y } = points[closePoint.index];
      !index ? ctx.moveTo(point.x, point.y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  });
}
