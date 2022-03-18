function bspline(t, degree, points, knots, weights, result) {
  var i, j, s, l; // function-scoped iteration variables
  var n = points.length; // points count
  var d = points[0].length; // point dimensionality

  if (degree < 1) throw new Error("degree must be at least 1 (linear)");
  if (degree > n - 1)
    throw new Error("degree must be less than or equal to point count - 1");

  if (!weights) {
    // build weight vector of length [n]
    weights = [];
    for (i = 0; i < n; i++) {
      weights[i] = 1;
    }
  }

  if (!knots) {
    // build knot vector of length [n + degree + 1]
    var knots = [];
    for (i = 0; i < n + degree + 1; i++) {
      knots[i] = i;
    }
  } else {
    if (knots.length !== n + degree + 1)
      throw new Error("bad knot vector length");
  }

  var domain = [degree, knots.length - 1 - degree];

  // remap t to the domain where the spline is defined
  var low = knots[domain[0]];
  var high = knots[domain[1]];
  t = t * (high - low) + low;

  if (t < low || t > high) throw new Error("out of bounds");

  // find s (the spline segment) for the [t] value provided
  for (s = domain[0]; s < domain[1]; s++) {
    if (t >= knots[s] && t <= knots[s + 1]) {
      break;
    }
  }

  // convert points to homogeneous coordinates
  var v = [];
  for (i = 0; i < n; i++) {
    v[i] = [];
    for (j = 0; j < d; j++) {
      v[i][j] = points[i][j] * weights[i];
    }
    v[i][d] = weights[i];
  }

  // l (level) goes from 1 to the curve degree + 1
  var alpha;
  for (l = 1; l <= degree + 1; l++) {
    // build level l of the pyramid
    for (i = s; i > s - degree - 1 + l; i--) {
      alpha = (t - knots[i]) / (knots[i + degree + 1 - l] - knots[i]);

      // interpolate each component
      for (j = 0; j < d + 1; j++) {
        v[i][j] = (1 - alpha) * v[i - 1][j] + alpha * v[i][j];
      }
    }
  }

  // convert back to cartesian and return
  var result = result || [];
  for (i = 0; i < d; i++) {
    result[i] = v[s][i] / v[s][d];
  }

  return result;
}

function basis(t, i, degree, knots) {
  if (degree == 0) {
    if (t <= knots[i] || t >= knots[i + 1]) {
      return 0;
    }
    return 1;
  }

  if (knots[i + degree] == knots[i]) {
    b1 = 0;
  } else {
    b1 = (t - knots[i]) / (knots[i + degree] - knots[i]);
  }

  if (knots[i + degree + 1] == knots[i + 1]) {
    b2 = 0;
  } else {
    b2 = (knots[i + degree + 1] - t) / (knots[i + degree + 1] - knots[i + 1]);
  }

  return (
    basis(t, i, degree - 1, knots) * b1 +
    basis(t, i + 1, degree - 1, knots) * b2
  );
}

var colors = [
  "#e6194B",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#42d4f4",
  "#f032e6",
  "#bfef45",
  "#fabed4",
  "#469990",
  "#dcbeff",
  "#9A6324",
  "#fffac8",
  "#800000",
  "#aaffc3",
  "#808000",
  "#ffd8b1",
  "#000075",
];

var curve = [];

var points = [
  [-1.0, 0.0],
  [-0.5, 0.5],
  [0.5, -0.5],
  [1, 0],
];

var points1 = [-1, -0.5, 0.5, 1];
var points2 = [0, 0.5, -0.5, 0];

var degree = 2;
var weights = [1, 1, 1, 1];

var knots = [0, 0, 0, 0.5, 1, 1, 1];

// B-splines with clamped knot vectors pass through
// the two end control points.
//
// A clamped knot vector must have `degree + 1` equal knots
// at both its beginning and end.

var clamped_start = false;
var clamped_end = false;

const xOffset = 400;
const yOffset = 400;

const xScale = 150;
const yScale = -150;

function roundOff(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function transform(point, scale = 1) {
  return [
    point[0] * xScale * scale + xOffset / scale,
    point[1] * yScale + yOffset,
  ];
}

function deTransform(point) {
  return [(point[0] - xOffset) / xScale, (point[1] - yOffset) / yScale];
}

var parameterU = 0.5;
var parameterOutput;
var stage;
var line;
var smoothness = 1000;
var SIZE = 50;

function updateClamp(pos) {
  console.log(pos);
  if (pos == "start") {
    clamped_start = !clamped_start;
  } else {
    clamped_end = !clamped_end;
  }
  calcKnots();
  drawBasisCurve();
  addUI();
  calculate();
  draw();
}

function addUI() {
  ctr_points = document.getElementById("controlPoints");

  str = "";
  i = 0;
  points.forEach((point) => {
    str += `${i} <input type='number' value=${roundOff(
      point[0]
    )} id='control0${i}' step='0.1' onchange='updatePointFromUI(${i}, 0, this.value)' />`;
    str += `<input type='number' value=${roundOff(
      point[1]
    )} id='control1${i}' step='0.1' onchange='updatePointFromUI(${i}, 1, this.value)' />`;
    str += `<input type='number' value=${roundOff(
      weights[i]
    )} step='0.1' onchange='updatePointFromUI(${i}, 2, this.value)' />`;
    str += ` <button onClick='removeControlPoint(${i++})'>Remove</button>`;
    str += "<br/>";
  });
  ctr_points.innerHTML = str;

  knots_ui = document.getElementById("knots");
  str = "";
  i = 0;
  knots.forEach((knot) => {
    str += `<input type='number' value=${roundOff(
      knot
    )} step='0.1' onchange='updateKnotFromUI(${i++}, this.value)' />`;
    str += "<br/>";
  });
  knots_ui.innerHTML = str;
}

function updateUI(id) {
  document.getElementById(`control0${id}`).value = roundOff(points[id][0]);
  document.getElementById(`control1${id}`).value = roundOff(points[id][1]);
}

function updatePointFromUI(id, pos, value) {
  if (pos == 2) {
    weights[id] = value;
  } else {
    points[id][pos] = parseFloat(value);
  }
  calculate();
  draw();
}

function updateKnotFromUI(id, value) {
  knots[id] = parseFloat(value);
  calculate();
  drawBasisCurve();
  draw();
}

function calcKnots() {
  var knots_n = points.length + degree - 1;
  if (clamped_start) {
    knots_n -= degree;
  }
  if (clamped_end) {
    knots_n -= degree;
  }
  knots = [];
  knots.push(0);
  if (clamped_start) {
    for (let i = 0; i < degree; i++) {
      knots.push(0);
    }
  }
  var inc = 1 / (knots_n + 1);
  for (var i = 1; i <= knots_n; i++) {
    knots.push(i * inc);
  }
  if (clamped_end) {
    for (let i = 0; i < degree; i++) {
      knots.push(1);
    }
  }
  knots.push(1);
}

function addControlPoint() {
  posX = (Math.random() - 0.5) * 2;
  posY = (Math.random() - 0.5) * 2;
  points.push([posX, posY]);
  weights.push(1);

  calcKnots();
  drawBasisCurve();
  addUI();
  calculate();
  draw();
}

function removeControlPoint(id) {
  points.splice(id, 1);
  weights.splice(id, 1);
  calcKnots();
  drawBasisCurve();
  addUI();
  calculate();
  draw();
}

function init() {
  addUI();
  calculate();

  var slider = document.getElementById("parameterSlider");
  var output = document.getElementById("sliderOutput");
  var sliderOutput = document.getElementById("sliderValues");
  output.innerHTML = `u: ${parameterU}`; // Display the default slider value

  // Update the current slider value (each time you drag the slider handle)
  slider.oninput = function () {
    output.innerHTML = `u: ${this.value / 100}`;
    parameterU = this.value / 100;
    console.log(parameterU);
    sliderOutput.innerHTML = `(x,y): (${roundOff(
      parameterOutput[0]
    )}, ${roundOff(parameterOutput[1])})`;
    drawBasisCurve();
    draw();
  };

  stage = new createjs.Stage("canvas");
  stageBasis = new createjs.Stage("basis");
  drawBasisCurve();
  draw();
}

function draw() {
  stage.removeAllChildren();

  drawPoints();
  drawConnectLine();
  drawCurve();
  drawParameterPoint();

  stage.update();
}

function drawParameterPoint() {
  var point = bspline(parameterU, degree, points, knots, weights);
  parameterOutput = point;
  var transformedPoint = transform(point);
  addPoint(
    transformedPoint[0],
    transformedPoint[1],
    -1,
    10,
    "rgba(0, 220, 0,1)"
  );
}

function drawConnectLine() {
  line = new createjs.Shape();

  stage.addChild(line);

  line.graphics.setStrokeStyle(1).beginStroke("rgba(10,220,10,1)");

  var transformedPoint = transform(points[0]);
  line.graphics.moveTo(transformedPoint[0], transformedPoint[1]);

  points.forEach((point) => {
    transformedPoint = transform(point);
    line.graphics.lineTo(transformedPoint[0], transformedPoint[1]);
  });
  line.graphics.endStroke();
}

function drawPoints() {
  i = 0;
  points.forEach((point) => {
    var transformedPoint = transform(point);
    addPoint(transformedPoint[0], transformedPoint[1], i++);
  });
}

function drawBasisAxes() {
  yAxis = new createjs.Shape();
  stageBasis.addChild(yAxis);
  yAxis.graphics.setStrokeStyle(0.5).beginStroke("rgba(0,0,0,1)");
  transformedOrigin = transform([parameterU, 0], 2);
  transformedY = transform([parameterU, 2], 2);
  yAxis.graphics.moveTo(transformedOrigin[0], transformedOrigin[1]);
  yAxis.graphics.lineTo(transformedY[0], transformedY[1]);

  xAxis = new createjs.Shape();
  stageBasis.addChild(xAxis);
  xAxis.graphics.setStrokeStyle(1).beginStroke("rgba(0,0,0,1)");
  transformedOrigin = transform([-0.2, 0], 2);

  transformedX = transform([1.2, 0], 2);
  xAxis.graphics.moveTo(transformedOrigin[0], transformedOrigin[1]);
  xAxis.graphics.lineTo(transformedX[0], transformedX[1]);
}

function drawBasisCurve() {
  basisCurves = [];
  threshold = 0.0001;
  activeCurves = [];
  for (let i = 0; i < points.length; i++) {
    _basis = [];
    for (var t = 0.001; t <= 1; t += 0.001) {
      _basis.push([t, basis(t, i, degree, knots)]);
    }
    basisCurves.push(_basis);
  }
  basisCurves.forEach((_curve) => {
    let active = false;
    active =
      _curve.find((point) => {
        x = Math.round(point[0] * 100) / 100;
        // console.log(x);
        // console.log(parameterU);
        return x == parameterU;
      })[1] >= threshold;
    if (active) {
      activeCurves.push(true);
    } else {
      activeCurves.push(false);
    }
  });
  console.log(activeCurves);
  stageBasis.removeAllChildren();
  var i = 0;

  basisCurves.forEach((_curve) => {
    var color = colors[i];
    basisLine = new createjs.Shape();
    stageBasis.addChild(basisLine);
    basisLine.graphics
      .setStrokeStyle(activeCurves[i++] ? 5 : 2)
      .beginStroke(color);

    var transformedPoint = transform(_curve[0], 2);
    basisLine.graphics.moveTo(transformedPoint[0], transformedPoint[1]);
    _curve.forEach((point) => {
      transformedPoint = transform(point, 2);
      basisLine.graphics.lineTo(transformedPoint[0], transformedPoint[1]);
    });
    basisLine.graphics.endStroke();
  });
  drawBasisAxes();
  stageBasis.update();
}

function drawCurve() {
  line_ = new createjs.Shape();

  stage.addChild(line_);

  line_.graphics.setStrokeStyle(1.5).beginStroke("rgba(20,20,20,1)");

  var transformedPoint = transform(curve[0]);
  line_.graphics.moveTo(transformedPoint[0], transformedPoint[1]);

  curve.forEach((point) => {
    transformedPoint = transform(point);
    line_.graphics.lineTo(transformedPoint[0], transformedPoint[1]);
  });
  line_.graphics.endStroke();
}

function addPoint(x, y, index, r = 8, fill) {
  var box = new createjs.Container();
  var text = new createjs.Text(`p${index}`);
  if (index == -1) {
    text = new createjs.Text("u");
  }
  text.x = 5;
  text.y = 10;
  var circle = new createjs.Shape();
  if (fill == null) {
    fill = colors[index];
  }
  circle.graphics.beginFill(fill).drawCircle(0, 0, r);
  circle.name = index;
  if (index != -1) circle.on("pressmove", drag);
  box.addChild(text, circle);
  box.x = x;
  box.y = y;
  stage.addChild(box);
}

function drag(evt) {
  evt.target.x = evt.stageX;
  evt.target.y = evt.stageY;

  var point = deTransform([evt.stageX, evt.stageY]);
  points[evt.target.name][0] = point[0];
  points[evt.target.name][1] = point[1];
  calculate();
  updateUI(evt.target.name);
  draw();
}

function calculate() {
  curve = [];
  for (var t = 0; t < 1; t += 1 / smoothness) {
    var point = bspline(t, degree, points, knots, weights);
    curve.push(point);
  }
}
