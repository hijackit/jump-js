console.log('hello jump-js')

document.addEventListener("keydown", onKeydown, false);
document.addEventListener("keyup", onKeyup, false);

let status = document.getElementById('status');

let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d');
canvas.width = window.innerWidth
canvas.height = window.innerHeight

let verticalVelocity = 0;
let horizontalVelocity = 0;
let gravity = 0.006;
let friction = 0.85;
let level = 1;

let holdLeft = false;
let holdRight = false;

const GROUND = 100;

// cube initial position
let x = 200;
let y = GROUND;

// jumps counter (used to implement double-jumps at most)
let jumps = 0;

// the user wants to step down from the current platform
let stepDown = false;

function generatePlatforms() {

  let platforms = [];
  
  // the first platform is the ground
  platforms.push({
    x1: 0,
    x2: canvas.width,
    y: GROUND,
    friction: 0.5,
    thickness: 2,
  });

  // flying platforms
  let lastX = getRandomInt(250, canvas.width-250);
  for (let i = 0; i < 5; i++) {
    let distance = getRandomInt(-500, 500);
    let candidate = lastX + distance;
    let x1 = Math.min(canvas.width - 200, Math.max(0, candidate));
    lastX = x1;
    let width = getRandomInt(100, 250);
    let totalHeight = canvas.height - GROUND - 100;
    let partialHeight = totalHeight / 5;
    let height = getRandomInt(50, partialHeight) + i * partialHeight;
    let iced = getRandomInt(0, 5) < level;
    let lava = getRandomInt(0, 5) < level && !iced;
    let platform = {
      x1: x1,
      x2: x1 + width,
      y: GROUND + height,
      friction: iced ? 0.995 : 0.8,
      iced: iced,
      lava: lava,
      thickness: 4,
    };
    platforms.push(platform);
  }

  // make sure platforms are ordered by height
  platforms.sort((a, b) => a.y - b.y)
  return platforms;
}

let platforms = generatePlatforms();

// the platform currently walking on (null in air)
let currentPlatform = platforms[0];

// the platform under the feet
let targetPlatform = currentPlatform;

platforms.sort((a, b) => a.y - b.y)
console.log("platforms", platforms)

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function onKeydown(e) {

  // UP
  if(e.keyCode  === 38) {
    if (jumps < 2) {
      verticalVelocity = -1.2;
      jumps++;
    }
  } 

  // DOWN
  if(e.keyCode  === 40) {
    stepDown = true;
  } 
  
  // RIGHT
  if(e.keyCode  === 39) {
    holdRight = true;
  } 

  // LEFT
  if(e.keyCode  === 37) {
    holdLeft = true;
  } 
}

function onKeyup(e) {
  // RIGHT
  if(e.keyCode  === 39) {
    holdRight = false;
  } 

  // LEFT
  if(e.keyCode  === 37) {
    holdLeft = false;
  } 
}

let lastTimestamp = 0;
let onPlatform = false;

function render(currentTimestamp) {
  const elapsed = currentTimestamp - lastTimestamp;
  lastTimestamp = currentTimestamp;

  if (y > canvas.height) {
    platforms = generatePlatforms();
    currentPlatform = platforms[0];
    targetPlatform = platforms[0];
    y = currentPlatform.y;
    level++;
  }

  if (holdRight) {
    horizontalVelocity += 0.1;
    horizontalVelocity = Math.min(horizontalVelocity, 0.8);
  }

  if (holdLeft) {
    horizontalVelocity += -0.1;
    horizontalVelocity = Math.max(horizontalVelocity, -0.8);
  }

  if (!holdRight && !holdLeft) {
    if (currentPlatform)
      horizontalVelocity = horizontalVelocity * currentPlatform.friction;
    else
      horizontalVelocity = horizontalVelocity * 0.9;
  }

  x += horizontalVelocity * elapsed;

  // stop if the h-acceleration is under a certain threshold
  if (Math.abs(horizontalVelocity) < 0.001) horizontalVelocity = 0;

  y -= verticalVelocity * elapsed;

  // adjust velocity for gravity
  verticalVelocity += gravity * elapsed;

  // stop if the v-acceleration is under a certain threshold
  if (Math.abs(verticalVelocity) < 0.001) verticalVelocity = 0;

  
  if (stepDown) {
    // step down from current platform
    y -= 2;
    y = Math.max(y, GROUND);
    stepDown = false;
  } else if (y <= targetPlatform.y) {
    // ground collision
    y = targetPlatform.y;
    verticalVelocity = 0;
    jumps = 0;
    currentPlatform = targetPlatform;
  } else {
    currentPlatform = null;
  }

  // find the current ground
  for (const platform of platforms) {
    if (x >= platform.x1 && x <= platform.x2) {
      if (y >= platform.y) {
        targetPlatform = platform;
      }
    }
  }

  // border collisions
  if (x <= 15) {
    x = 15;
    horizontalVelocity = -horizontalVelocity;
  }
  if (x >= canvas.width - 15) {
    x = canvas.width - 15;
    horizontalVelocity = -horizontalVelocity;
  }

  ctx.fillStyle = currentPlatform && currentPlatform.lava ? "#380000" : "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // cube rect
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.rect(x-15, canvas.height-y-30, 30, 30);
  ctx.stroke();

  // fill the cube
  ctx.beginPath();
  ctx.fillStyle = 'green';
  ctx.fillRect(x-14, canvas.height-y-28, 28, 28);

  // draw the platforms
  platforms.forEach((platform) => {
    ctx.beginPath();
    ctx.lineWidth = platform.thickness;
    ctx.strokeStyle = platform.iced ? "#64c9f9" : "white";
    ctx.strokeStyle = platform.lava ? "red" : ctx.strokeStyle;
    ctx.moveTo(platform.x1, canvas.height - platform.y);
    ctx.lineTo(platform.x2, canvas.height - platform.y);
    ctx.stroke();
  });

  // update status panel
  status.innerHTML = 
    "h-velocity: " +Math.round(horizontalVelocity*1000)/1000 + "<br/>" +
    "v-velocity: " +Math.round(verticalVelocity*1000)/1000 + "<br/>" +
    "x: " + Math.round(x) + "<br/> " + 
    "y: " + Math.round(y) + "<br/> " +
    "LEVEL: " + level + "<br/> ";

  window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render)