const body = document.body;
const toast = document.querySelector(".toast");
const rainButton = document.querySelector(".rain-toggle");
const rainVolumeSlider = document.querySelector(".rain-volume__slider");
// Paste your Discord application Client ID here and add this page URL to OAuth2 Redirects.
const DISCORD_CLIENT_ID = "1507442769839525898";
const DISCORD_REDIRECT_URI = "https://blanch.monster/";
const DISCORD_API_BASE = "https://discord.com/api/v10";
const DISCORD_PROFILE_STORAGE_KEY = "blanchDiscordProfile";
const DISCORD_STATE_STORAGE_KEY = "blanchDiscordState";
const discordProfileButton = document.querySelector("#discordProfileButton");
const discordProfileMenu = document.querySelector("#discordProfileMenu");
const discordLogoutButton = document.querySelector("#discordLogoutButton");
const headerProfileAvatar = document.querySelector(".header-profile__avatar");
const headerProfileName = document.querySelector(".header-profile__name");
const albumLightbox = document.querySelector("#albumLightbox");
const albumLightboxImage = document.querySelector("#albumLightboxImage");
const albumLightboxCaption = document.querySelector("#albumLightboxCaption");
const albumLightboxCounter = document.querySelector("#albumLightboxCounter");
const albumLightboxClose = document.querySelector("#albumLightboxClose");
const albumLightboxPrev = document.querySelector("#albumLightboxPrev");
const albumLightboxNext = document.querySelector("#albumLightboxNext");
const defaultDiscordAvatar = headerProfileAvatar?.getAttribute("src") || "assets/member-ghost.png";
let discordUser = null;
let activeAlbumIndex = 0;

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

window.addEventListener("load", () => {
  window.setTimeout(() => body.classList.add("is-loaded"), 650);
});

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
  initHeroThree();
  initRainLayer();
  initMemberCards();
  initDiscordGate();
  initAlbumLightbox();
});

const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-counter]");
const activeLinks = document.querySelectorAll(".nav a");
const sections = document.querySelectorAll("main section[id]");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 5, 4) * 70}ms`;
    revealObserver.observe(item);
  });

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        activeLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    { threshold: 0.46 }
  );

  sections.forEach((section) => sectionObserver.observe(section));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
  counters.forEach((counter) => animateCounter(counter));
}

function animateCounter(element) {
  const target = Number(element.dataset.counter || 0);
  const suffix = element.dataset.suffix || "";
  const duration = 1300;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${Math.round(target * eased).toLocaleString("ru-RU")}${suffix}`;
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    scrollToSection(target, "smooth");
    window.history.pushState(null, "", link.getAttribute("href"));
  });
});

const initialParams = new URLSearchParams(window.location.search);
const jumpTarget = initialParams.get("jump");
if (jumpTarget) {
  window.addEventListener("load", () => {
    window.setTimeout(() => {
      const target = document.querySelector(`#${CSS.escape(jumpTarget)}`);
      if (target) scrollToSection(target, "auto");
    }, 200);
  });
}

if (window.location.hash) {
  window.addEventListener("load", () => {
    window.setTimeout(() => {
      const target = document.querySelector(window.location.hash);
      if (target) scrollToSection(target, "auto");
    }, 250);
  });
}

function scrollToSection(target, behavior = "smooth") {
  const header = document.querySelector(".site-header");
  const scrollTarget = target.id === "members" ? target.querySelector(".members-grid") || target : target;
  const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
  const offset = headerBottom + (target.id === "members" ? 48 : 34);
  const top = scrollTarget.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior });
}

const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
let ringX = window.innerWidth / 2;
let ringY = window.innerHeight / 2;
let pointerX = ringX;
let pointerY = ringY;

window.addEventListener("pointermove", (event) => {
  pointerX = event.clientX;
  pointerY = event.clientY;

  document.documentElement.style.setProperty("--mx", `${event.clientX}px`);
  document.documentElement.style.setProperty("--my", `${event.clientY}px`);

  if (cursorDot) {
    cursorDot.style.left = `${event.clientX}px`;
    cursorDot.style.top = `${event.clientY}px`;
  }

  const heroMedia = document.querySelector(".hero__media");
  if (heroMedia && window.matchMedia("(pointer: fine)").matches) {
    const moveX = (event.clientX / window.innerWidth - 0.5) * 14;
    const moveY = (event.clientY / window.innerHeight - 0.5) * 10;
    heroMedia.style.transform = `scale(1.035) translate(${moveX}px, ${moveY}px)`;
  }
});

function renderCursorRing() {
  ringX += (pointerX - ringX) * 0.16;
  ringY += (pointerY - ringY) * 0.16;
  if (cursorRing) {
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
  }
  requestAnimationFrame(renderCursorRing);
}

renderCursorRing();

document.querySelectorAll("a, button, input, textarea, .member-card, .album-slot").forEach((element) => {
  element.addEventListener("pointerenter", () => cursorRing?.classList.add("is-hovering"));
  element.addEventListener("pointerleave", () => cursorRing?.classList.remove("is-hovering"));
});

document.querySelectorAll(".stat-card, .code-card, .criteria-card, .application-form").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  });
});

function initMemberCards() {
  document.querySelectorAll(".member-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (!window.matchMedia("(pointer: fine)").matches) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function getAlbumItems() {
  return Array.from(document.querySelectorAll(".album-slot")).map((slot) => {
    const image = slot.querySelector("img");
    const caption = slot.querySelector("figcaption")?.textContent?.trim() || image?.alt || "";
    return {
      slot,
      src: image?.getAttribute("src") || "",
      alt: image?.getAttribute("alt") || caption,
      caption,
    };
  });
}

function initAlbumLightbox() {
  const items = getAlbumItems();
  if (!albumLightbox || !items.length) return;

  items.forEach((item, index) => {
    item.slot.addEventListener("click", () => openAlbumLightbox(index));
    item.slot.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openAlbumLightbox(index);
    });
  });

  albumLightboxClose?.addEventListener("click", closeAlbumLightbox);
  albumLightboxPrev?.addEventListener("click", () => moveAlbumLightbox(-1));
  albumLightboxNext?.addEventListener("click", () => moveAlbumLightbox(1));
  albumLightbox.addEventListener("click", (event) => {
    if (event.target === albumLightbox) closeAlbumLightbox();
  });
  document.addEventListener("keydown", handleAlbumLightboxKeys);
}

function openAlbumLightbox(index) {
  activeAlbumIndex = index;
  renderAlbumLightbox();
  albumLightbox.hidden = false;
  body.classList.add("lightbox-open");
  if (window.lucide) window.lucide.createIcons();
  albumLightboxClose?.focus();
}

function closeAlbumLightbox() {
  if (!albumLightbox || albumLightbox.hidden) return;
  albumLightbox.hidden = true;
  body.classList.remove("lightbox-open");
}

function moveAlbumLightbox(direction) {
  const items = getAlbumItems();
  if (!items.length) return;
  activeAlbumIndex = (activeAlbumIndex + direction + items.length) % items.length;
  renderAlbumLightbox();
}

function renderAlbumLightbox() {
  const items = getAlbumItems();
  const item = items[activeAlbumIndex];
  if (!item) return;

  if (albumLightboxImage) {
    albumLightboxImage.src = item.src;
    albumLightboxImage.alt = item.alt;
  }
  if (albumLightboxCaption) albumLightboxCaption.textContent = item.caption;
  if (albumLightboxCounter) {
    albumLightboxCounter.textContent = `${String(activeAlbumIndex + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
  }
}

function handleAlbumLightboxKeys(event) {
  if (!albumLightbox || albumLightbox.hidden) return;
  if (event.key === "Escape") closeAlbumLightbox();
  if (event.key === "ArrowLeft") moveAlbumLightbox(-1);
  if (event.key === "ArrowRight") moveAlbumLightbox(1);
}

function initDiscordGate() {
  discordProfileButton?.addEventListener("click", toggleDiscordProfileMenu);
  discordLogoutButton?.addEventListener("click", logoutDiscordProfile);
  document.addEventListener("click", closeDiscordProfileMenuOnOutsideClick);
  document.addEventListener("keydown", closeDiscordProfileMenuOnEscape);
  hydrateDiscordProfile();
}

async function hydrateDiscordProfile() {
  const authPayload = parseDiscordAuthHash();

  if (authPayload.error) {
    clearDiscordAuthHash();
    clearDiscordState();
    resetDiscordProfile();
    showToast("Вход через Discord отменен или не прошел.", true);
    return;
  }

  if (authPayload.accessToken) {
    if (!isValidDiscordState(authPayload.state)) {
      clearDiscordAuthHash();
      clearDiscordState();
      resetDiscordProfile();
      showToast("Discord не подтвердил состояние входа. Попробуйте еще раз.", true);
      return;
    }

    try {
      const profile = normalizeDiscordProfile(await fetchDiscordProfile(authPayload.accessToken));
      storeDiscordProfile(profile);
      unlockDiscordGate(profile);
      showToast("Discord профиль подключен.");
    } catch (error) {
      resetDiscordProfile();
      showToast("Не удалось получить профиль Discord.", true);
      console.error(error);
    } finally {
      clearDiscordAuthHash();
      clearDiscordState();
    }
    return;
  }

  const storedProfile = readStoredDiscordProfile();
  if (storedProfile) {
    storeDiscordProfile(storedProfile);
    unlockDiscordGate(storedProfile);
    return;
  }

  resetDiscordProfile();
}

function startDiscordOAuth() {
  closeDiscordProfileMenu();
  const clientId = DISCORD_CLIENT_ID.trim();
  const redirectUri = getDiscordRedirectUri();

  if (!clientId) {
    showToast("Добавьте DISCORD_CLIENT_ID в script.js и Redirect URL в Discord Developer Portal.", true);
    return;
  }

  if (!redirectUri) {
    showToast("Discord вход работает только через http/https адрес сайта.", true);
    return;
  }

  const state = createDiscordState();
  try {
    sessionStorage.setItem(DISCORD_STATE_STORAGE_KEY, state);
  } catch {
    return;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "token",
    scope: "identify",
    state,
    prompt: "consent",
  });

  window.location.href = `https://discord.com/oauth2/authorize?${params.toString()}`;
}

function getDiscordRedirectUri() {
  if (DISCORD_REDIRECT_URI) return DISCORD_REDIRECT_URI;
  if (!window.location.origin || window.location.origin === "null") return "";
  return `${window.location.origin}${window.location.pathname}`;
}

function createDiscordState() {
  if (window.crypto?.getRandomValues) {
    const bytes = new Uint32Array(4);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (value) => value.toString(16).padStart(8, "0")).join("");
  }

  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function parseDiscordAuthHash() {
  if (!window.location.hash || window.location.hash.length < 2) return {};
  const hash = new URLSearchParams(window.location.hash.slice(1));
  return {
    accessToken: hash.get("access_token"),
    tokenType: hash.get("token_type"),
    state: hash.get("state"),
    error: hash.get("error"),
  };
}

function clearDiscordAuthHash() {
  if (!window.location.hash) return;
  window.history.replaceState(null, document.title, `${window.location.pathname}${window.location.search}`);
}

function isValidDiscordState(state) {
  try {
    return Boolean(state && sessionStorage.getItem(DISCORD_STATE_STORAGE_KEY) === state);
  } catch {
    return false;
  }
}

function clearDiscordState() {
  try {
    sessionStorage.removeItem(DISCORD_STATE_STORAGE_KEY);
  } catch {
    return;
  }
}

async function fetchDiscordProfile(accessToken) {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Discord profile request failed: ${response.status}`);
  }

  return response.json();
}

function normalizeDiscordProfile(user) {
  const discriminator = user.discriminator && user.discriminator !== "0" ? `#${user.discriminator}` : "";
  const username = user.username || "Discord";
  const displayName = user.global_name || `${username}${discriminator}`;

  return {
    id: user.id,
    username,
    displayName,
    avatarUrl: getDiscordAvatarUrl(user) || getDiscordDefaultAvatarUrl(user) || defaultDiscordAvatar,
  };
}

function getDiscordAvatarUrl(user) {
  if (!user?.id || !user.avatar) return "";
  const extension = user.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=128`;
}

function getDiscordDefaultAvatarUrl(user) {
  if (!user?.id) return "";
  let index = 0;

  if (user.discriminator && user.discriminator !== "0") {
    index = Number(user.discriminator) % 5;
  } else {
    try {
      index = Number((BigInt(user.id) >> 22n) % 6n);
    } catch {
      index = 0;
    }
  }

  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

function storeDiscordProfile(profile) {
  const serializedProfile = JSON.stringify(profile);
  try {
    localStorage.setItem(DISCORD_PROFILE_STORAGE_KEY, serializedProfile);
  } catch {
    try {
      sessionStorage.setItem(DISCORD_PROFILE_STORAGE_KEY, serializedProfile);
    } catch {
      return;
    }
  }
}

function readStoredDiscordProfile() {
  try {
    const rawProfile = localStorage.getItem(DISCORD_PROFILE_STORAGE_KEY) || sessionStorage.getItem(DISCORD_PROFILE_STORAGE_KEY);
    return rawProfile ? JSON.parse(rawProfile) : null;
  } catch {
    try {
      const rawProfile = sessionStorage.getItem(DISCORD_PROFILE_STORAGE_KEY);
      return rawProfile ? JSON.parse(rawProfile) : null;
    } catch {
      return null;
    }
  }
}

function unlockDiscordGate(profile) {
  discordUser = profile;
  renderDiscordProfile(profile);
  body.classList.remove("auth-locked");
  window.requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
}

function resetDiscordProfile() {
  discordUser = null;
  closeDiscordProfileMenu();
  body.classList.remove("auth-locked");
  renderDiscordProfile(null);
}

function renderDiscordProfile(profile) {
  const displayName = profile?.displayName || "Войти через Discord";
  const avatarUrl = profile?.avatarUrl || defaultDiscordAvatar;

  if (headerProfileName) headerProfileName.textContent = displayName;
  if (headerProfileAvatar) {
    headerProfileAvatar.src = avatarUrl;
    headerProfileAvatar.alt = profile ? `${displayName} Discord avatar` : "Discord avatar";
  }
  discordProfileButton?.setAttribute(
    "aria-label",
    profile ? `Discord профиль ${displayName}. Открыть меню профиля` : "Войти через Discord"
  );
}

function toggleDiscordProfileMenu(event) {
  event?.stopPropagation();
  if (!discordUser) {
    const storedProfile = readStoredDiscordProfile();
    if (storedProfile) {
      discordUser = storedProfile;
      renderDiscordProfile(storedProfile);
    }
  }

  if (!discordUser) {
    startDiscordOAuth();
    return;
  }

  const isOpen = discordProfileMenu && !discordProfileMenu.hidden;
  setDiscordProfileMenuOpen(!isOpen);
}

function setDiscordProfileMenuOpen(isOpen) {
  if (!discordProfileMenu) return;
  discordProfileMenu.hidden = !isOpen;
  discordProfileButton?.setAttribute("aria-expanded", String(isOpen));
  if (window.lucide) window.lucide.createIcons();
}

function closeDiscordProfileMenu() {
  setDiscordProfileMenuOpen(false);
}

function closeDiscordProfileMenuOnOutsideClick(event) {
  if (!discordProfileMenu || discordProfileMenu.hidden) return;
  if (event.target.closest(".profile-shell")) return;
  closeDiscordProfileMenu();
}

function closeDiscordProfileMenuOnEscape(event) {
  if (event.key !== "Escape") return;
  closeDiscordProfileMenu();
}

function logoutDiscordProfile(event) {
  event?.stopPropagation();
  try {
    localStorage.removeItem(DISCORD_PROFILE_STORAGE_KEY);
    sessionStorage.removeItem(DISCORD_PROFILE_STORAGE_KEY);
  } catch {
    try {
      sessionStorage.removeItem(DISCORD_PROFILE_STORAGE_KEY);
    } catch {
      // The visible session should still be reset even if storage is blocked.
    }
  }
  closeDiscordProfileMenu();
  resetDiscordProfile();
  showToast("Вы вышли из профиля.");
}

function initHeroThree() {
  const canvas = document.querySelector("#heroThree");
  const hero = document.querySelector(".hero");
  const THREE = window.THREE;
  const params = new URLSearchParams(window.location.search);

  if (!canvas || !hero || !THREE || params.get("no3d") === "1") return;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas,
    preserveDrawingBuffer: true,
  });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120);
  camera.position.set(0, 3.6, 31);

  const rig = new THREE.Group();
  scene.add(rig);

  const red = new THREE.Color(0xff1838);
  const white = new THREE.Color(0xf2f7ff);
  const gray = new THREE.Color(0x9fa8b6);

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: red,
    transparent: true,
    opacity: 0.38,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const whiteMaterial = new THREE.MeshBasicMaterial({
    color: white,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  for (let i = 0; i < 7; i += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.6 + i * 0.78, 0.018, 10, 96), i % 2 ? whiteMaterial : ringMaterial);
    ring.position.set(8 + i * 0.58, -1.4 + Math.sin(i) * 0.7, -i * 2.5);
    ring.rotation.set(Math.PI * 0.55, Math.PI * 0.08, i * 0.12);
    rig.add(ring);
  }

  const lineMaterial = new THREE.LineBasicMaterial({
    color: red,
    transparent: true,
    opacity: 0.46,
    blending: THREE.AdditiveBlending,
  });
  const grayLineMaterial = new THREE.LineBasicMaterial({
    color: gray,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
  });

  for (let i = 0; i < 28; i += 1) {
    const z = -34 + i * 1.65;
    const x = -18 + Math.random() * 36;
    const y = -6 + Math.random() * 10;
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, y, z),
      new THREE.Vector3(x + (Math.random() - 0.5) * 5, y + 0.3 + Math.random() * 2, z - 5 - Math.random() * 7),
    ]);
    const line = new THREE.Line(geometry, i % 3 ? grayLineMaterial : lineMaterial);
    rig.add(line);
  }

  const particleCount = 420;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i += 1) {
    const i3 = i * 3;
    positions[i3] = -24 + Math.random() * 48;
    positions[i3 + 1] = -8 + Math.random() * 18;
    positions[i3 + 2] = -46 + Math.random() * 44;
    const color = i % 5 === 0 ? red : i % 7 === 0 ? white : gray;
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.62,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  rig.add(particles);

  const blockMaterial = new THREE.MeshBasicMaterial({
    color: 0x5b626e,
    transparent: true,
    opacity: 0.16,
    wireframe: true,
    blending: THREE.AdditiveBlending,
  });

  for (let i = 0; i < 16; i += 1) {
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.6 + Math.random() * 1.2, 2 + Math.random() * 6, 0.55), blockMaterial);
    block.position.set(-15 + Math.random() * 34, -5.2 + Math.random() * 2.2, -12 - Math.random() * 32);
    block.rotation.y = Math.random() * 0.5;
    rig.add(block);
  }

  let pointer = { x: 0, y: 0 };
  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    pointer = {
      x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.height - 0.5,
    };
  });

  function resize() {
    const rect = hero.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const forceMotion = params.get("motion") === "on";
  const reducedMotion = !forceMotion && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let frameId;
  let renderedFrames = 0;

  function animate(time = 0) {
    const t = time * 0.001;
    rig.rotation.y = -0.28 + pointer.x * 0.16 + Math.sin(t * 0.22) * 0.035;
    rig.rotation.x = 0.06 - pointer.y * 0.08;
    particles.rotation.y = t * 0.018;
    particles.position.y = Math.sin(t * 0.9) * 0.22;

    rig.children.forEach((child, index) => {
      if (child.geometry?.type === "TorusGeometry") {
        child.rotation.z += index % 2 ? -0.002 : 0.0025;
        child.material.opacity = (index % 2 ? 0.16 : 0.34) + Math.sin(t * 1.4 + index) * 0.04;
      }
    });

    renderer.render(scene, camera);
    renderedFrames += 1;
    updateCanvasDiagnostics(renderedFrames);
    if (!reducedMotion) {
      frameId = requestAnimationFrame(animate);
    }
  }

  function updateCanvasDiagnostics(frame) {
    if (frame > 3 && frame % 45 !== 0) return;
    try {
      const gl = renderer.getContext();
      const size = renderer.getDrawingBufferSize(new THREE.Vector2());
      const sampleSize = 24;
      const sample = new Uint8Array(sampleSize * sampleSize * 4);
      const x = Math.max(0, Math.floor(size.x * 0.72) - sampleSize / 2);
      const y = Math.max(0, Math.floor(size.y * 0.46) - sampleSize / 2);
      gl.readPixels(x, y, sampleSize, sampleSize, gl.RGBA, gl.UNSIGNED_BYTE, sample);
      canvas.dataset.threeReady = "true";
      canvas.dataset.threeFrame = String(frame);
      canvas.dataset.threePixelSum = String(sample.reduce((sum, value) => sum + value, 0));
    } catch {
      canvas.dataset.threeReady = "unknown";
    }
  }

  resize();
  animate(0);
  window.addEventListener("resize", resize);
  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(frameId);
    renderer.dispose();
  });
}

let audioContext;
let rainAudio = { master: null, sources: [], intervals: [] };
let rainOn = false;
let rainVolume = Number(rainVolumeSlider?.value || 55) / 100;

rainButton?.addEventListener("click", async () => {
  if (rainOn) {
    await stopRainAudio();
  } else {
    await startRainAudio();
  }
});

rainVolumeSlider?.addEventListener("input", () => {
  rainVolume = Number(rainVolumeSlider.value) / 100;
  updateRainVolumeFill();
  if (!audioContext || !rainAudio.master) return;
  const now = audioContext.currentTime;
  rainAudio.master.gain.cancelScheduledValues(now);
  rainAudio.master.gain.linearRampToValueAtTime(getRainGain(), now + 0.12);
});

updateRainVolumeFill();

function initRainLayer() {
  const layer = document.querySelector(".rain-layer");
  if (!layer || layer.children.length) return;

  const drops = window.matchMedia("(max-width: 640px)").matches ? 105 : 180;
  for (let i = 0; i < drops; i += 1) {
    const drop = document.createElement("span");
    drop.className = "rain-drop";
    drop.style.setProperty("--x", `${Math.random() * 100}%`);
    drop.style.setProperty("--length", `${12 + Math.random() * 22}px`);
    drop.style.setProperty("--delay", `${Math.random() * -3.6}s`);
    drop.style.setProperty("--duration", `${1.05 + Math.random() * 0.8}s`);
    drop.style.setProperty("--drift", `${-14 + Math.random() * 9}px`);
    drop.style.setProperty("--opacity", `${0.46 + Math.random() * 0.4}`);
    layer.appendChild(drop);
  }
}

async function startRainAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    showToast("Ваш браузер не поддерживает Web Audio.");
    return;
  }

  audioContext = new AudioContextClass();
  await audioContext.resume();

  const master = audioContext.createGain();
  const highpass = audioContext.createBiquadFilter();
  const rainBand = audioContext.createBiquadFilter();
  const softBand = audioContext.createBiquadFilter();
  const rainGain = audioContext.createGain();
  const softGain = audioContext.createGain();
  const compressor = audioContext.createDynamicsCompressor();

  master.gain.setValueAtTime(0, audioContext.currentTime);
  master.gain.linearRampToValueAtTime(getRainGain(), audioContext.currentTime + 1.1);

  highpass.type = "highpass";
  highpass.frequency.value = 520;
  highpass.Q.value = 0.55;

  rainBand.type = "bandpass";
  rainBand.frequency.value = 2600;
  rainBand.Q.value = 0.72;
  rainGain.gain.value = 0.115;

  softBand.type = "bandpass";
  softBand.frequency.value = 820;
  softBand.Q.value = 0.38;
  softGain.gain.value = 0.048;

  const rainNoise = createRainNoiseSource(2.6, 0.72);
  const softNoise = createRainNoiseSource(3.4, 0.32);
  rainNoise.connect(highpass).connect(rainBand).connect(rainGain).connect(compressor);
  softNoise.connect(softBand).connect(softGain).connect(compressor);
  compressor.connect(master).connect(audioContext.destination);
  rainNoise.start();
  softNoise.start();

  const dripTimer = window.setInterval(playRainTick, 420 + Math.random() * 180);
  rainAudio = { master, sources: [rainNoise, softNoise], intervals: [dripTimer] };
  rainOn = true;
  body.classList.add("rain-on");
  updateRainButton();
}

async function stopRainAudio() {
  if (!audioContext) return;
  const { master, sources, intervals } = rainAudio;
  const now = audioContext.currentTime;
  master?.gain.cancelScheduledValues(now);
  master?.gain.linearRampToValueAtTime(0, now + 0.45);
  window.setTimeout(() => {
    sources.forEach((source) => {
      try {
        source.stop();
      } catch {
        return;
      }
    });
    intervals.forEach((id) => window.clearInterval(id));
    audioContext.close();
    audioContext = undefined;
    rainAudio = { master: null, sources: [], intervals: [] };
  }, 520);
  rainOn = false;
  body.classList.remove("rain-on");
  updateRainButton();
}

function createRainNoiseSource(seconds, volume) {
  const noiseBuffer = audioContext.createBuffer(1, Math.floor(audioContext.sampleRate * seconds), audioContext.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i += 1) {
    const white = Math.random() * 2 - 1;
    last = last * 0.64 + white * 0.36;
    data[i] = last * volume;
  }

  const source = audioContext.createBufferSource();
  source.loop = true;
  source.buffer = noiseBuffer;
  return source;
}

function playRainTick() {
  if (!audioContext || !rainOn) return;
  const now = audioContext.currentTime;
  const tick = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  tick.type = "triangle";
  tick.frequency.setValueAtTime(760 + Math.random() * 900, now);
  filter.type = "bandpass";
  filter.frequency.value = 1800 + Math.random() * 1200;
  filter.Q.value = 5;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.018 + Math.random() * 0.016, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07 + Math.random() * 0.04);
  tick.connect(filter).connect(gain).connect(rainAudio.master);
  tick.start(now);
  tick.stop(now + 0.14);
}

function updateRainButton() {
  rainButton?.classList.toggle("is-on", rainOn);
  rainButton?.setAttribute("aria-label", rainOn ? "Выключить дождь" : "Включить дождь");
  if (!rainButton) return;
  rainButton.innerHTML = `<i data-lucide="${rainOn ? "cloud-rain" : "cloud"}"></i>`;
  if (window.lucide) window.lucide.createIcons();
}

function getRainGain() {
  return 0.02 + rainVolume * 0.2;
}

function updateRainVolumeFill() {
  rainVolumeSlider?.style.setProperty("--rain-volume", `${Math.round(rainVolume * 100)}%`);
}

function showToast(message, isError = false) {
  if (!toast) return;
  toast.textContent = message;
  toast.style.borderColor = isError ? "rgba(255, 92, 92, 0.7)" : "rgba(255, 24, 56, 0.42)";
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 4200);
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
