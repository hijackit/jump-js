import {generatePlatforms, PlatformType, renderPlatform} from './modules/platforms.js'

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
let level = 1;

let holdLeft = false;
let holdRight = false;

const GROUND = 50;

// cube initial position
let x = 200;
let y = GROUND;

// jumps counter (used to implement double-jumps at most)
let jumps = 0;

// the user wants to step down from the current platform
let stepDown = false;


let platforms = generatePlatforms(GROUND, canvas.width, canvas.height);

// the platform currently walking on (null in air)
let currentPlatform = platforms[0];

// the platform under the feet
let targetPlatform = currentPlatform;

platforms.sort((a, b) => a.y - b.y)
console.log("platforms", platforms)



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
let remainingTime = 10000;

function render(currentTimestamp) {
  const elapsed = currentTimestamp - lastTimestamp;
  lastTimestamp = currentTimestamp;
  remainingTime -= elapsed; 

  if (remainingTime < 0) {
    ctx.font = '100px Verdana';
    ctx.textAlign = "center";
    let textMetrics = ctx.measureText('TIMEOUT!')
    let textHeight = textMetrics.fontBoundingBoxAscent - textMetrics.fontBoundingBoxDescent
    let textWidth = textMetrics.width;
    
    let x = canvas.width/2;
    let y = canvas.height/2;
    
    ctx.fillStyle = "#080808";
    ctx.fillRect(x - textWidth / 2 - 20, y - textHeight - 20,textWidth + 40, textHeight + 40);

    ctx.fillStyle = "#9c1c13";
    ctx.fillText('TIMEOUT!', x, y);

    return;
  }

  if (y > canvas.height) {
    platforms = generatePlatforms(GROUND, canvas.width, canvas.height, ++level);
    currentPlatform = platforms[0];
    targetPlatform = platforms[0];
    y = currentPlatform.y;
    remainingTime = 10000;
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
      horizontalVelocity = horizontalVelocity * currentPlatform.type.friction;
    else
      horizontalVelocity = horizontalVelocity * 0.9;
  }

  x += horizontalVelocity * elapsed;

  // must move along with the moving platform
  if (currentPlatform) 
    x += currentPlatform.velocity * elapsed;

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
    if (x >= platform.x && x <= (platform.x + platform.width)) {
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

  ctx.fillStyle = currentPlatform && currentPlatform.type == PlatformType.LAVA ? "#380000" : "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // render platforms
  platforms.forEach(platform => renderPlatform(platform, ctx));

  platforms.forEach(platform => {
    platform.x = platform.x + (platform.velocity * elapsed);
    if(platform.x + platform.width > canvas.width)
      platform.velocity = -platform.velocity;
    if(platform.x < 0)
      platform.velocity = -platform.velocity;
  })

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

  // update status panel
  status.innerHTML = 
    "h-velocity: " +Math.round(horizontalVelocity*1000)/1000 + "<br/>" +
    "v-velocity: " +Math.round(verticalVelocity*1000)/1000 + "<br/>" +
    "x: " + Math.round(x) + "<br/> " + 
    "y: " + Math.round(y) + "<br/> " +
    "LEVEL: " + level + "<br/> " +
    "TIME: " + Math.round(remainingTime/1000)  + "<br/> ";

  window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render)