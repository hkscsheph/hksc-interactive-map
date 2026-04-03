const FLOOR_FILES = [
  { id: "5", file: "5_F.svg", label: "5F" },
  { id: "4", file: "4_F.svg", label: "4F" },
  { id: "3", file: "3_F.svg", label: "3F" },
  { id: "2", file: "2_F.svg", label: "2F" },
  { id: "1", file: "1_F.svg", label: "1F" },
  { id: "G", file: "G_F.svg", label: "G / Ground" }
];

const state = {
  spacing: 120,
  zoom: -420,
  rotX: 58,
  rotZ: -18,
  activeFloor: null,
  autoRotate: false,
  drag: {
    active: false,
    pointerId: null,
    moved: false,
    suppressClick: false,
    x: 0,
    y: 0
  }
};

const stackEl = document.getElementById("stack");
const floorButtonsEl = document.getElementById("floorButtons");
const viewerEl = document.getElementById("viewer");
const autoRotateBtn = document.getElementById("autoRotateBtn");
const spacingRange = document.getElementById("spacingRange");
const tiltRange = document.getElementById("tiltRange");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const directoryListEl = document.getElementById("directoryList");
const ZOOM_MIN = -1200;
const ZOOM_MAX = 260;
const FLAT_ZOOM_MAX_SCALE = 3;

const setSceneTransform = () => {
  const shouldUseFlatZoom = state.activeFloor !== null;
  stackEl.classList.toggle("flat-zoom", shouldUseFlatZoom);

  if (shouldUseFlatZoom) {
    const t = (state.zoom - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN || 1);
    const flatScale = 1 + Math.max(0, Math.min(1, t)) * (FLAT_ZOOM_MAX_SCALE - 1);
    stackEl.style.setProperty("--flat-scale", `${flatScale}`);
  }

  stackEl.style.setProperty("--zoom", `${state.zoom}px`);
  stackEl.style.setProperty("--rx", `${state.rotX}deg`);
  stackEl.style.setProperty("--rz", `${state.rotZ}deg`);
};

const setIsometricView = () => {
  state.rotX = 58;
  state.rotZ = -18;
  state.zoom = -420;
  tiltRange.value = "58";
  setSceneTransform();
};

const setFrontView = () => {
  state.rotX = 12;
  state.rotZ = 0;
  state.zoom = -290;
  tiltRange.value = "12";
  setSceneTransform();
};

const parseSvgMarkup = (raw) => {
  const holder = document.createElement("div");
  holder.innerHTML = raw;
  const svg = holder.querySelector("svg");
  if (!svg) return null;
  return svg;
};

const sanitizeSvgMarkup = (svg) => {
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.style.display = "block";
  svg.style.width = "100%";
  svg.style.height = "100%";
  return svg;
};

const placeFloors = () => {
  const floors = [...stackEl.querySelectorAll(".floor")];
  const total = floors.length;
  const showOnlyActive = state.activeFloor !== null;

  floors.forEach((el, i) => {
    const z = (total - 1 - i) * state.spacing;
    const wobbleX = (i - (total - 1) / 2) * 1.2;
    const wobbleY = (i - (total - 1) / 2) * -1;
    el.style.transform = `translate3d(-50%, -50%, ${z}px) translate(${wobbleX}px, ${wobbleY}px)`;

    const isActive = state.activeFloor ? el.dataset.floorId === state.activeFloor : true;
    el.style.display = showOnlyActive && !isActive ? "none" : "";
    el.classList.toggle("active", isActive);
    el.classList.toggle("muted", false);
  });

  const floorBtns = [...floorButtonsEl.querySelectorAll("button")];
  floorBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.floorId === state.activeFloor || (state.activeFloor === null && btn.dataset.floorId === "ALL"));
  });
};

const createFloorButton = ({ id, label }) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "floor-btn";
  btn.dataset.floorId = id;
  btn.textContent = label;
  btn.addEventListener("click", () => {
    if (id === "ALL") {
      state.activeFloor = null;
      setIsometricView();
    } else {
      state.activeFloor = id;
      setFrontView();
    }
    placeFloors();
  });
  return btn;
};

const buildFloorButtons = () => {
  floorButtonsEl.append(createFloorButton({ id: "ALL", label: "All" }));
  FLOOR_FILES.forEach((floor) => floorButtonsEl.append(createFloorButton(floor)));
};

const buildDirectory = () => {
  if (!directoryListEl) return;
  directoryListEl.innerHTML = "";
  FLOOR_FILES.forEach((floor) => {
    const item = document.createElement("li");
    item.textContent = `${floor.label} - ${floor.file}`;
    directoryListEl.append(item);
  });
};

const buildFloorCard = (svg, floor) => {
  const floorEl = document.createElement("article");
  floorEl.className = "floor";
  floorEl.dataset.floorId = floor.id;

  const shell = document.createElement("div");
  shell.className = "floor-shell";

  const prism = document.createElement("div");
  prism.className = "floor-prism";

  const top = document.createElement("div");
  top.className = "floor-face floor-top";
  top.append(svg);

  const bottom = document.createElement("div");
  bottom.className = "floor-face floor-bottom";

  const wallFront = document.createElement("div");
  wallFront.className = "floor-wall wall-front";

  const wallBack = document.createElement("div");
  wallBack.className = "floor-wall wall-back";

  const wallLeft = document.createElement("div");
  wallLeft.className = "floor-wall wall-left";

  const wallRight = document.createElement("div");
  wallRight.className = "floor-wall wall-right";

  prism.append(top, bottom, wallFront, wallBack, wallLeft, wallRight);
  shell.append(prism);

  const badge = document.createElement("div");
  badge.className = "floor-label";
  badge.textContent = floor.label;

  floorEl.append(shell, badge);
  floorEl.addEventListener("click", (event) => {
    event.stopPropagation();
    state.activeFloor = floor.id;
    setFrontView();
    placeFloors();
  });

  return floorEl;
};

const showErrorCard = (floor, reason) => {
  const floorEl = document.createElement("article");
  floorEl.className = "floor muted";
  floorEl.dataset.floorId = floor.id;

  const shell = document.createElement("div");
  shell.className = "floor-shell";
  shell.innerHTML = `<div style="padding:22px;font-family:'Chakra Petch',sans-serif;color:#ffd0c7">Failed to load ${floor.file}<br /><small>${reason}</small></div>`;

  const badge = document.createElement("div");
  badge.className = "floor-label";
  badge.textContent = floor.label;

  floorEl.append(shell, badge);
  stackEl.append(floorEl);
};

const loadFloors = async () => {
  for (const floor of FLOOR_FILES) {
    try {
      const response = await fetch(floor.file);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = await response.text();
      const rawSvg = parseSvgMarkup(raw);
      if (!rawSvg) throw new Error(`No SVG root in ${floor.file}`);
      const svg = sanitizeSvgMarkup(rawSvg);
      if (!svg) throw new Error("No <svg> element found");
      stackEl.append(buildFloorCard(svg, floor));
    } catch (error) {
      showErrorCard(floor, error.message);
    }
  }
  placeFloors();
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const onPointerDown = (event) => {
  state.drag.active = true;
  state.drag.pointerId = event.pointerId;
  state.drag.moved = false;
  state.drag.x = event.clientX;
  state.drag.y = event.clientY;
  viewerEl.setPointerCapture(event.pointerId);
};

const onPointerMove = (event) => {
  if (!state.drag.active || state.drag.pointerId !== event.pointerId) return;

  const dx = event.clientX - state.drag.x;
  const dy = event.clientY - state.drag.y;
  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
    state.drag.moved = true;
  }
  state.drag.x = event.clientX;
  state.drag.y = event.clientY;

  if (stackEl.classList.contains("flat-zoom")) {
    return;
  }

  state.rotZ = clamp(state.rotZ + dx * 0.18, -80, 80);
  state.rotX = clamp(state.rotX - dy * 0.15, 5, 82);

  tiltRange.value = String(Math.round(state.rotX));
  setSceneTransform();
};

const onPointerUp = (event) => {
  if (state.drag.pointerId === event.pointerId) {
    if (state.drag.moved) {
      state.drag.suppressClick = true;
    }
    state.drag.active = false;
    state.drag.pointerId = null;
  }
};

viewerEl.addEventListener("pointerdown", onPointerDown);
viewerEl.addEventListener("pointermove", onPointerMove);
viewerEl.addEventListener("pointerup", onPointerUp);
viewerEl.addEventListener("pointercancel", onPointerUp);

viewerEl.addEventListener("wheel", (event) => {
  event.preventDefault();
  state.zoom = clamp(state.zoom + event.deltaY * 0.6, ZOOM_MIN, ZOOM_MAX);
  setSceneTransform();
}, { passive: false });

if (zoomInBtn) {
  zoomInBtn.addEventListener("click", () => {
    state.zoom = clamp(state.zoom + 80, ZOOM_MIN, ZOOM_MAX);
    setSceneTransform();
  });
}

if (zoomOutBtn) {
  zoomOutBtn.addEventListener("click", () => {
    state.zoom = clamp(state.zoom - 80, ZOOM_MIN, ZOOM_MAX);
    setSceneTransform();
  });
}

viewerEl.addEventListener("click", (event) => {
  if (state.drag.suppressClick) {
    state.drag.suppressClick = false;
    return;
  }

  if (event.target === viewerEl || event.target.classList.contains("scene") || event.target.classList.contains("stack")) {
    state.activeFloor = null;
    setIsometricView();
    placeFloors();
  }
});

spacingRange.addEventListener("input", () => {
  state.spacing = Number(spacingRange.value);
  placeFloors();
});

tiltRange.addEventListener("input", () => {
  state.rotX = Number(tiltRange.value);
  setSceneTransform();
});

document.getElementById("viewIso").addEventListener("click", () => {
  setIsometricView();
});

document.getElementById("viewTop").addEventListener("click", () => {
  state.rotX = 82;
  state.rotZ = 0;
  state.zoom = -520;
  tiltRange.value = "82";
  setSceneTransform();
});

document.getElementById("viewFront").addEventListener("click", () => {
  setFrontView();
});

document.getElementById("resetView").addEventListener("click", () => {
  state.spacing = 120;
  state.zoom = -420;
  state.rotX = 58;
  state.rotZ = -18;
  state.activeFloor = null;
  spacingRange.value = "120";
  tiltRange.value = "58";
  placeFloors();
  setSceneTransform();
});

const tickAutoRotate = () => {
  if (state.autoRotate && !state.drag.active) {
    state.rotZ = state.rotZ + 0.12;
    setSceneTransform();
  }
  requestAnimationFrame(tickAutoRotate);
};

autoRotateBtn.addEventListener("click", () => {
  state.autoRotate = !state.autoRotate;
  autoRotateBtn.textContent = `Auto Rotate: ${state.autoRotate ? "On" : "Off"}`;
  autoRotateBtn.setAttribute("aria-pressed", String(state.autoRotate));
});

buildFloorButtons();
buildDirectory();
setSceneTransform();
loadFloors();
tickAutoRotate();
