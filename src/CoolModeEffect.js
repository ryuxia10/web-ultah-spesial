const getContainer = () => {
  const id = "_coolMode_effect_container";
  let existingContainer = document.getElementById(id);

  if (existingContainer) {
    return existingContainer;
  }

  const container = document.createElement("div");
  container.setAttribute("id", id);
  container.setAttribute(
    "style",
    "overflow:hidden; position:fixed; height:100%; top:0; left:0; right:0; bottom:0; pointer-events:none; z-index:2147483647",
  );

  document.body.appendChild(container);
  return container;
};

let particles = [];
let animationFrame;

function refreshParticles() {
  particles.forEach((p) => {
    p.left = p.left - p.speedHorz * p.direction;
    p.top = p.top - p.speedUp;
    p.speedUp = Math.min(p.size, p.speedUp - 1);
    p.spinVal = p.spinVal + p.spinSpeed;

    if (p.top >= Math.max(window.innerHeight, document.body.clientHeight) + p.size) {
      particles = particles.filter((o) => o !== p);
      p.element.remove();
    }

    p.element.setAttribute(
      "style",
      `position:absolute; will-change:transform; top:${p.top}px; left:${p.left}px; transform:rotate(${p.spinVal}deg);`
    );
  });
}

function loop() {
  refreshParticles();
  animationFrame = requestAnimationFrame(loop);
  if (particles.length === 0) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}

const themeColors = ["#fbc2eb", "#a6c1ee", "#ee7752", "#e73c7e"];

function generateParticle(mouseX, mouseY, options) {
  const sizes = [15, 20, 25, 35, 45];
  const size = options?.size || sizes[Math.floor(Math.random() * sizes.length)];
  const speedHorz = options?.speedHorz || Math.random() * 10;
  const speedUp = options?.speedUp || Math.random() * 25;
  const spinVal = Math.random() * 360;
  const spinSpeed = Math.random() * 35 * (Math.random() <= 0.5 ? -1 : 1);
  const top = mouseY - size / 2;
  const left = mouseX - size / 2;
  const direction = Math.random() <= 0.5 ? -1 : 1;

  const particle = document.createElement("div");
  const svgNS = "http://www.w3.org/2000/svg";
  const circleSVG = document.createElementNS(svgNS, "svg");
  const circle = document.createElementNS(svgNS, "circle");
  circle.setAttributeNS(null, "cx", (size / 2).toString());
  circle.setAttributeNS(null, "cy", (size / 2).toString());
  circle.setAttributeNS(null, "r", (size / 2).toString());
  
  const randomColor = themeColors[Math.floor(Math.random() * themeColors.length)];
  circle.setAttributeNS(null, "fill", randomColor);

  circleSVG.appendChild(circle);
  circleSVG.setAttribute("width", size.toString());
  circleSVG.setAttribute("height", size.toString());
  particle.appendChild(circleSVG);

  particle.style.position = "absolute";
  particle.style.transform = `translate3d(${left}px, ${top}px, 0px) rotate(${spinVal}deg)`;

  getContainer().appendChild(particle);

  particles.push({
    direction, element: particle, left, size, speedHorz,
    speedUp, spinSpeed, spinVal, top,
  });
}

export function coolModeClickHandler(event, options) {
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  const particleCount = options?.particleCount || 30;

  for (let i = 0; i < particleCount; i++) {
    generateParticle(mouseX, mouseY, options);
  }

  if (!animationFrame) {
    loop();
  }
}