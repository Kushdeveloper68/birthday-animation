const isMobile = window.innerWidth < 768;
const config = {
  // Reduced particle count for mobile performance
  particleCount: isMobile ? 400 : 800,
  colors: ["#8c2bee", "#ad92c9", "#ffffff", "#ffd700", "#4c1d95"],
  text: {
    intro: "In the beginning, there was only void...",
    spark: "And then, a spark.",
    name: "POOJA",
    gravity: isMobile
      ? "Touch to create gravity."
      : "You are the center of gravity.",
    memories: "Your journey is made of moments.",
    climax: "Feel the energy...",
    final: "Happy Birthday, Pooja",
  },
  messages: [
    { title: "Calm", desc: "A serene heart." },
    { title: "Strength", desc: "Power to rise." },
    { title: "Kindness", desc: "Lighting the way." },
    { title: "Growth", desc: "Always evolving." },
  ],
};
const state = {
  scene: 0, // 0: Void, 1: Explosion/Name, 2: Gravity, 3: Memories, 4: Wave, 5: Final
  width: window.innerWidth,
  height: window.innerHeight,
  mouseX: -9999, // Initial off-screen
  mouseY: -9999,
  orbsCollected: 0,
};
const canvas = document.getElementById("universe");
const ctx = canvas.getContext("2d", { alpha: false }); // Optimization
const mainHeading = document.getElementById("main-heading");
const subText = document.getElementById("sub-text");
const startBtn = document.getElementById("start-btn");
const orbsContainer = document.getElementById("orbs-container");
const easterEggBtn = document.getElementById("easter-egg");
const easterEggMsg = document.getElementById("easter-egg-msg");
let particles = [];
let animationId;
class Particle {
  constructor(x, y, type = "star") {
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.destX = x;
    this.destY = y;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = Math.random() * (isMobile ? 1.5 : 2) + 0.5; // Slightly smaller on mobile
    this.color =
      config.colors[Math.floor(Math.random() * config.colors.length)];
    this.alpha = Math.random();
    this.type = type;
    this.friction = 0.95;
    this.ease = 0.1;
    this.life = 1;
  }
  draw() {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    // Optimized Glow: Only on Desktop or very large particles
    if (!isMobile && this.size > 1.5) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
    } else {
      ctx.shadowBlur = 0;
    }
  }
  update() {
    // Scene 0: Subtle floating
    if (state.scene === 0) {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0) this.x = state.width;
      if (this.x > state.width) this.x = 0;
      if (this.y < 0) this.y = state.height;
      if (this.y > state.height) this.y = 0;
    }
    // Scene 1: Form Name "POOJA"
    else if (state.scene === 1 && this.type === "text") {
      const dx = this.destX - this.x;
      const dy = this.destY - this.y;
      this.x += dx * 0.08;
      this.y += dy * 0.08;
      // Reduced jitter for cleaner text on small screens
      this.x += (Math.random() - 0.5) * (isMobile ? 0.2 : 0.5);
      this.y += (Math.random() - 0.5) * (isMobile ? 0.2 : 0.5);
    }
    // Scene 2: Gravity Well
    else if (state.scene === 2) {
      const dx = state.mouseX - this.x;
      const dy = state.mouseY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      // Larger interaction radius on mobile for easier touch
      const radius = isMobile ? 250 : 300;
      if (distance < radius) {
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const force = (radius - distance) / radius;
        const gravityStrength = 0.8;
        this.vx += forceDirectionX * force * gravityStrength;
        this.vy += forceDirectionY * force * gravityStrength;
      }
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.98;
      this.vy *= 0.98;
      if (this.x < 0 || this.x > state.width) this.vx *= -1;
      if (this.y < 0 || this.y > state.height) this.vy *= -1;
    }
    // Scene 4: Emotion Wave
    else if (state.scene === 4) {
      this.x += this.vx * (isMobile ? 6 : 10); // Slower wave on mobile to prevent chaos
      this.y += this.vy * (isMobile ? 6 : 10);
      if (this.x < 0) this.x = state.width;
      if (this.x > state.width) this.x = 0;
      if (this.y < 0) this.y = state.height;
      if (this.y > state.height) this.y = 0;
      if (Math.random() > 0.9) {
        this.color =
          config.colors[Math.floor(Math.random() * config.colors.length)];
      }
    } else {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > state.width) this.vx *= -1;
      if (this.y < 0 || this.y > state.height) this.vy *= -1;
    }
    if (Math.random() > 0.98) {
      this.alpha = Math.random();
    }
  }
}
function resize() {
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  canvas.width = state.width;
  canvas.height = state.height;
}
function initParticles(mode = "star") {
  particles = [];
  for (let i = 0; i < config.particleCount; i++) {
    particles.push(
      new Particle(Math.random() * state.width, Math.random() * state.height)
    );
  }
}
function generateTextParticles(text) {
  const osCanvas = document.createElement("canvas");
  osCanvas.width = state.width;
  osCanvas.height = state.height;
  const osCtx = osCanvas.getContext("2d");
  osCtx.fillStyle = "white";
  // Responsive font sizing
  const fontSize = isMobile ? "25vw" : "15vw";
  osCtx.font = `bold ${fontSize} "Space Grotesk"`;
  osCtx.textAlign = "center";
  osCtx.textBaseline = "middle";
  osCtx.fillText(text, state.width / 2, state.height / 2);
  const imageData = osCtx.getImageData(0, 0, state.width, state.height).data;
  const newParticles = [];
  // Finer scanning on mobile for better text resolution with fewer pixels
  const step = isMobile ? 4 : 8;
  // Limit max particles for text to prevent mobile crash
  const maxTextParticles = isMobile ? 600 : 1500;
  let count = 0;
  for (let y = 0; y < state.height; y += step) {
    for (let x = 0; x < state.width; x += step) {
      if (count > maxTextParticles) break;
      const index = (y * state.width + x) * 4;
      if (imageData[index] > 128) {
        let p;
        if (particles.length > 0) {
          p = particles.pop();
          p.type = "text";
          p.destX = x;
          p.destY = y;
        } else {
          p = new Particle(
            Math.random() * state.width,
            Math.random() * state.height,
            "text"
          );
          p.destX = x;
          p.destY = y;
        }
        p.vx = (Math.random() - 0.5) * 2;
        p.vy = (Math.random() - 0.5) * 2;
        p.color = "#8c2bee";
        newParticles.push(p);
        count++;
      }
    }
  }
  // Fill remainder with stars
  const starsNeeded = config.particleCount - newParticles.length;
  if (starsNeeded > 0) {
    for (let i = 0; i < starsNeeded; i++) {
      newParticles.push(
        new Particle(
          Math.random() * state.width,
          Math.random() * state.height,
          "star"
        )
      );
    }
  }
  particles = newParticles;
}
function animate() {
  // Optimized trail effect
  ctx.fillStyle = "rgba(25, 16, 34, 0.2)";
  ctx.fillRect(0, 0, state.width, state.height);
  particles.forEach((p) => {
    p.update();
    p.draw();
  });
  animationId = requestAnimationFrame(animate);
}
function typeWriter(element, text, speed = 50, callback) {
  element.innerHTML = "";
  element.classList.add("typewriter");
  let i = 0;
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else {
      element.classList.remove("typewriter");
      if (callback) callback();
    }
  }
  type();
}
function setUI(heading, subheading, showStart = false) {
  mainHeading.style.opacity = "0";
  subText.style.opacity = "0";
  setTimeout(() => {
    mainHeading.innerText = "";
    typeWriter(mainHeading, heading, isMobile ? 40 : 50); // Slightly faster typing on mobile
    subText.innerText = subheading;
    mainHeading.style.opacity = "1";
    subText.style.opacity = "1";
    if (showStart) {
      startBtn.classList.remove("hidden");
      setTimeout(() => {
        startBtn.style.opacity = "1";
      }, 1000);
    } else {
      startBtn.style.opacity = "0";
      setTimeout(() => {
        startBtn.classList.add("hidden");
      }, 500);
    }
  }, 1000);
}
function startExperience() {
  setUI("", config.text.intro, true);
}
startBtn.addEventListener("click", () => {
  startBtn.classList.add("scale-150", "opacity-0");
  setTimeout(() => {
    state.scene = 1;
    generateTextParticles(config.text.name);
    setUI("", "A universe created just for you.");
    setTimeout(() => {
      state.scene = 2;
      particles.forEach((p) => {
        p.vx = (Math.random() - 0.5) * 4;
        p.vy = (Math.random() - 0.5) * 4;
      });
      setUI("Gravity", config.text.gravity);
      setTimeout(() => {
        initMemoryScene();
      }, 8000);
    }, 5000);
  }, 800);
});
function initMemoryScene() {
  state.scene = 3;
  setUI("Memories", config.text.memories);
  orbsContainer.classList.remove("hidden");
  setTimeout(() => {
    orbsContainer.style.opacity = "1";
  }, 100);
  orbsContainer.innerHTML = "";
  config.messages.forEach((msg, idx) => {
    const orb = document.createElement("div");
    // Optimized Positioning for Mobile to prevent overlap
    let top, left;
    if (isMobile) {
      // Vertical Stack on Mobile
      // Distribute vertically between 20% and 80%
      const slice = 60 / config.messages.length;
      top = 20 + idx * slice + Math.random() * (slice - 10);
      // Center horizontally with slight jitter
      left = 30 + Math.random() * 40;
    } else {
      // Random Scatter on Desktop
      top = 20 + Math.random() * 60;
      left = 20 + Math.random() * 60;
    }
    orb.className = `interactive-element absolute w-20 h-20 md:w-32 md:h-32 rounded-full flex items-center justify-center text-center cursor-pointer orb-glow bg-[#1a1122]/50 border border-[#8c2bee]/30 text-white animate-float select-none`;
    orb.style.top = `${top}%`;
    orb.style.left = `${left}%`;
    orb.style.animationDelay = `${idx * 1.5}s`;
    const content = document.createElement("div");
    content.className = "flex flex-col items-center gap-1 pointer-events-none"; // Ensure clicks hit parent
    content.innerHTML = `<span class="font-bold text-xs md:text-base tracking-widest">${msg.title}</span>`;
    orb.appendChild(content);
    const interactHandler = function () {
      // Interaction
      this.classList.add("scale-125", "z-50", "bg-primary/90");
      this.style.animation = "none";
      content.innerHTML = `<span class="font-bold text-sm md:text-lg mb-0 md:mb-1">${msg.title}</span><span class="text-[10px] md:text-xs px-2 leading-tight opacity-90">${msg.desc}</span>`;
      // Prevent double counting
      if (!this.dataset.collected) {
        state.orbsCollected++;
        this.dataset.collected = "true";
        // Haptic feedback if available
        if (navigator.vibrate) navigator.vibrate(50);
        if (state.orbsCollected === config.messages.length) {
          setTimeout(triggerEmotionWave, 2000);
        }
      }
    };
    orb.addEventListener("click", interactHandler);
    orb.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault(); // Prevent ghost clicks
        interactHandler.call(orb);
      },
      { passive: false }
    );
    orbsContainer.appendChild(orb);
  });
}
function triggerEmotionWave() {
  state.scene = 4;
  orbsContainer.style.opacity = "0";
  setTimeout(() => orbsContainer.classList.add("hidden"), 1000);
  setUI("", config.text.climax);
  particles.forEach((p) => {
    p.vx *= 5;
    p.vy *= 5;
  });
  setTimeout(finalReveal, 4000);
}
function finalReveal() {
  state.scene = 5;
  particles = [];
  initParticles();
  setUI("Happy Birthday, Pooja", "A journey through your universe.");
  for (let i = 0; i < 100; i++) {
    let p = new Particle(state.width / 2, state.height / 2, "spark");
    p.color = "#ffd700";
    p.vx = (Math.random() - 0.5) * 5;
    p.vy = (Math.random() - 0.5) * 5;
    particles.push(p);
  }
}
window.addEventListener("resize", () => {
  resize();
  // Re-check mobile state on resize (e.g. orientation change)
  const wasMobile = isMobile;
  // Note: const isMobile is block scoped, we should ideally update a global or state property,
  // but for this simple script, a reload on significant resize might be safer, or we just accept the initial config.
  // For now, we just update canvas dimensions.
});
// Mouse Events
window.addEventListener("mousemove", (e) => {
  state.mouseX = e.clientX;
  state.mouseY = e.clientY;
});
// Touch Events for Gravity Scene
window.addEventListener(
  "touchmove",
  (e) => {
    // Only prevent default if we are in a scene that needs interaction, otherwise scrolling might be needed (though body is overflow:hidden)
    if (state.scene === 2) {
      e.preventDefault();
      state.mouseX = e.touches[0].clientX;
      state.mouseY = e.touches[0].clientY;
    }
  },
  { passive: false }
);
window.addEventListener(
  "touchstart",
  (e) => {
    if (state.scene === 2) {
      state.mouseX = e.touches[0].clientX;
      state.mouseY = e.touches[0].clientY;
    }
  },
  { passive: false }
);
window.addEventListener("touchend", () => {
  // Move gravity center off screen when touch ends
  state.mouseX = -9999;
  state.mouseY = -9999;
});
// Easter Egg Logic
easterEggBtn.addEventListener("click", () => {
  easterEggMsg.classList.remove("opacity-0", "scale-95", "translate-y-4");
  easterEggMsg.classList.add("opacity-100", "scale-100", "translate-y-0");
  for (let i = 0; i < 20; i++) {
    let p = new Particle(state.width - 50, state.height - 50);
    p.color = "#ffd700";
    p.vx = (Math.random() - 0.5) * 10;
    p.vy = (Math.random() - 0.5) * 10 - 5;
    particles.push(p);
  }
  setTimeout(() => {
    easterEggMsg.classList.add("opacity-0", "scale-95", "translate-y-4");
    easterEggMsg.classList.remove("opacity-100", "scale-100", "translate-y-0");
  }, 4000);
});
// Initialize
resize();
initParticles();
animate();
// Start Sequence
window.onload = startExperience;
