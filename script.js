const canvas = document.getElementById('rainCanvas');
const ctx = canvas.getContext('2d');
const scene = document.querySelector('.scene');
const lightning = document.querySelector('.lightning');
const weatherButtons = document.querySelectorAll('[data-weather-button]');
const weatherEyebrow = document.getElementById('weatherEyebrow');
const weatherTitle = document.getElementById('weatherTitle');
const weatherDescription = document.getElementById('weatherDescription');

let width = 0;
let height = 0;
let particles = [];
let animationFrame = null;
let currentWeather = 'rain';
let lightningTimeout = null;

const weatherSettings = {
  sunny: {
    eyebrow: 'GOLDEN HOUR',
    title: '晴日暖阳',
    description: '阳光正好，适合出门走走',
    count: 0,
    speed: [0, 0],
    length: [0, 0],
  },
  cloudy: {
    eyebrow: 'SOFT CLOUDS',
    title: '云间漫步',
    description: '云层缓缓移动，风也轻柔',
    count: 0,
    speed: [0, 0],
    length: [0, 0],
  },
  rain: {
    eyebrow: 'MOONLIT RAIN',
    title: '静夜微雨',
    description: '让雨声，替夜晚慢下来',
    count: 260,
    speed: [8, 14],
    length: [10, 18],
  },
  storm: {
    eyebrow: 'THUNDERSTORM',
    title: '风雨欲来',
    description: '雷声渐近，雨势正在加大',
    count: 480,
    speed: [14, 22],
    length: [18, 28],
  },
};

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  setWeather(currentWeather);
}

function renderRain() {
  ctx.clearRect(0, 0, width, height);

  for (const drop of particles) {
    drop.y += drop.speed;
    drop.x -= 0.12;

    if (drop.y > height + 20) {
      drop.y = -20;
      drop.x = Math.random() * width;
    }

    if (drop.x < -10) {
      drop.x = width + 10;
      drop.y = Math.random() * height;
    }

    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(drop.x - 0.6, drop.y - drop.length);
    const rainColor = currentWeather === 'storm' ? '198, 211, 255' : '170, 220, 255';
    ctx.strokeStyle = `rgba(${rainColor}, ${drop.opacity})`;
    ctx.lineWidth = drop.width;
    ctx.stroke();
  }

  animationFrame = requestAnimationFrame(renderRain);
}

function setWeather(weather) {
  const settings = weatherSettings[weather];
  if (!settings) {
    return;
  }

  currentWeather = weather;
  scene.dataset.weather = weather;
  weatherEyebrow.textContent = settings.eyebrow;
  weatherTitle.textContent = settings.title;
  weatherDescription.textContent = settings.description;

  weatherButtons.forEach((button) => {
    const isActive = button.dataset.weatherButton === weather;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  const multiplier = Math.min(1, Math.max(0.55, width / 1200));
  const count = Math.round(settings.count * multiplier);
  const [minSpeed, speedRange] = settings.speed;
  const [minLength, lengthRange] = settings.length;
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    length: minLength + Math.random() * lengthRange,
    speed: minSpeed + Math.random() * speedRange,
    width: 1 + Math.random() * (weather === 'storm' ? 2 : 1.5),
    opacity: 0.2 + Math.random() * 0.8,
  }));

  if (weather !== 'storm') {
    window.clearTimeout(lightningTimeout);
    lightning.classList.remove('is-flashing');
  }
}

function scheduleLightning() {
  if (currentWeather !== 'storm') {
    return;
  }

  const delay = 2500 + Math.random() * 5000;
  lightningTimeout = window.setTimeout(() => {
    lightning.classList.remove('is-flashing');
    void lightning.offsetWidth;
    lightning.classList.add('is-flashing');
    scheduleLightning();
  }, delay);
}

weatherButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setWeather(button.dataset.weatherButton);
    if (currentWeather === 'storm') {
      scheduleLightning();
    }
  });
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
renderRain();

window.addEventListener('beforeunload', () => {
  cancelAnimationFrame(animationFrame);
  window.clearTimeout(lightningTimeout);
});
