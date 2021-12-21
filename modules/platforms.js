export const PlatformType = {
  NORMAL: {friction: 0.8, color: "#FFF"},
  ICE: {friction: 0.995, color: "#64c9f9"},
  LAVA: {friction: 0.2, color: "red"},
};

export function generatePlatforms(ground, stageWidth, stageHeight, level=1) {

  let platforms = [];
  
  // the first platform is the ground
  platforms.push({
    x: 0,
    y: ground,
    width: stageWidth,
    type: PlatformType.NORMAL,
    velocity: 0,
  });

  // width decrese with levels
  let width = stageWidth / (3 + level);

  platforms.push({
    x: getRandomInt(0, stageWidth - width),
    y: ((stageHeight - ground) / 4) + ground,
    width: width,
    type: PlatformType.NORMAL,
    velocity: 0.1 * level * getRandomInt(-1,2),
  });

  platforms.push({
    x: getRandomInt(0, stageWidth - width),
    y: ((stageHeight - ground) / 4) * 2 + ground,
    width: width,
    type: PlatformType.ICE,
    velocity: 0.1 * level * getRandomInt(-1,2),
  });

  platforms.push({
    x: getRandomInt(0, stageWidth - width),
    y: ((stageHeight - ground) / 4) * 3 + ground,
    width: width,
    thickness: 3,
    type: PlatformType.LAVA,
    velocity: 0.1 * level * getRandomInt(-1,2),
  });

  // make sure platforms are ordered by height
  platforms.sort((a, b) => a.y - b.y)
  return platforms;
}

export function renderPlatform(platform, ctx) {
  ctx.beginPath();
  ctx.lineWidth = platform.thickness;
  ctx.strokeStyle = platform.type.color;
  ctx.moveTo(platform.x, ctx.canvas.height - platform.y);
  ctx.lineTo(platform.x + platform.width, ctx.canvas.height - platform.y);
  ctx.stroke();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomBoolean() {
  return Math.random() > 0.5;
}