let icones = {};
let icones_light = {};
let icones_dark = {};

function updateActiveIcons() {
  const source = lightMode ? icones_light : icones_dark;
  for (const [key, img] of Object.entries(source)) {
    icones[key] = img;
  }
  const fallback = lightMode ? icones_dark : icones_light;
  for (const [key, img] of Object.entries(fallback)) {
    if (!icones[key]) icones[key] = img;
  }
}

function toggleTheme() {
  lightMode = !lightMode;
  updateActiveIcons();
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem("tagrafia-theme", lightMode ? "light" : "dark");
    } catch (e) {}
  }
  if (typeof announceToScreenReader === "function") {
    announceToScreenReader(lightMode ? "Modo claro ativado" : "Modo escuro ativado");
  }
  if (typeof redraw === "function") {
    redraw();
  }
}

let fontes = {};
let sourceLines = {};
let geoJson = null;
let imageManifest = {};
let products = [];
let schools = [];
let geoCountries = [];
let tagsByKey = new Map();
let tagsByDimension = {};
let selectedTagKeys = new Set();
let selectedProduct = null;
let selectedImageIndex = 0;
let savedProductKeys = new Set();
let activeDimension = "tipo_obra";
let leftPanelTab = "filtros"; // "filtros", "exportar", "sobre"
let leftPanelExtendedOpen = true; // controls visibility of extended filter/export/sobre panel

// Per-frame cache for expensive computations
let _cacheFrame = -1;
let _cachedSelectedTags = null;
let _cachedVisibleProducts = null;
let _cachedVisibleProductsNoYear = null;
let _cachedTagCounts = null;
let _cachedBubbleGroups = null;
let _bubbleCacheKey = "";

let activeCategoryByDimension = Object.fromEntries(
  DIMENSION_ORDER.map((dim) => [dim, -1]),
);
let categorySelectorOpen = false;
let tagSearch = "";
let tagSearchActive = false;
let tagScroll = 0;
let detailScroll = 0;
let savedScroll = 0;
let savedSearch = "";
let savedSearchActive = false;
let savedSortMode = 0;
let rightPanelTab = "material"; // "tecnicas", "material", "estetico", "salvos"
let lightMode = true;
let activeView = VISAO_CIRCULAR;
let yearStart = YEAR_MIN;
let yearEnd = YEAR_MAX;
let draggedYearHandle = null;
let hitAreas = [];
let focusedCircularTagKey = "";
let exportViewsSelection = VIEWS_CONFIG.map(() => true);
let exportFormatDropdownOpen = false;
let exportFormatSelected = "PDF";

let mapState = {
  zoom: 1,
  panX: 0,
  panY: 0,
  dragging: false,
  previousX: 0,
  previousY: 0,
};
let imageCache = new Map();
let exportDropdownAnim = 0;
let tagClickAnim = new Map();
let clickRipples = [];
let currentFrameCursor = null;
let hoveredCircularTag = null;
let sobreScroll = 0;

// Estado para controle de responsividade mobile
let mobileState = {
  activeScreen: "visual", // "visual" | "filtros" | "produto" | "sobre" | "exportar"
  menuOpen: false,
  productSheetOpen: false,
  touchStartX: 0,
  touchStartY: 0,
  touchMoved: false,
};

// Acessibilidade e Navegação por Teclado (WCAG 2.1/2.2: 2.1.1, 2.1.2, 2.4.3, 2.4.7, 2.4.11)
let keyboardFocusActive = false;
let a11yState = {
  focusTarget: null,
  tagIndex: 0,
  savedIndex: 0,
  lastAnnouncement: "",
};

let _announcerTimer = null;
function announceToScreenReader(message) {
  if (!message) return;
  a11yState.lastAnnouncement = message;
  if (typeof document !== "undefined") {
    const el = document.getElementById("a11y-announcer") || document.querySelector(".sr-only");
    if (el) {
      if (_announcerTimer) clearTimeout(_announcerTimer);
      el.textContent = "";
      _announcerTimer = setTimeout(() => {
        el.textContent = message;
        _announcerTimer = null;
      }, 50);
    }
  }
}

function isFocusedElement(type, id, index) {
  if (!keyboardFocusActive || !a11yState.focusTarget) return false;
  const t = a11yState.focusTarget;
  if (t.type !== type) return false;
  if (id !== undefined && t.id !== id) return false;
  if (index !== undefined && t.index !== index) return false;
  return true;
}

function isFocusedTag(tag, index) {
  if (!keyboardFocusActive || !a11yState.focusTarget) return false;
  if (a11yState.focusTarget.type !== "tag_item") return false;
  if (a11yState.focusTarget.index === index) return true;
  if (tag && a11yState.focusTarget.tagKey && a11yState.focusTarget.tagKey === tag.key) return true;
  return false;
}

function drawFocusRingRect(x, y, w, h, cr = 4, rotation = 0) {
  if (!keyboardFocusActive) return;
  if (typeof push !== "function" || typeof rect !== "function") return;
  push();
  if (typeof rectMode === "function" && typeof CORNER !== "undefined") {
    rectMode(CORNER);
  }
  if (rotation && typeof translate === "function" && typeof rotate === "function") {
    translate(x, y);
    rotate(rotation);
    x = -w / 2;
    y = -h / 2;
  }
  if (typeof noFill === "function") noFill();
  const isLight = typeof lightMode === "undefined" || lightMode;
  if (typeof strokeWeight === "function") strokeWeight(3.5);
  if (typeof stroke === "function") stroke(isLight ? "#000000" : "#FFFFFF");
  rect(x - 3, y - 3, w + 6, h + 6, cr + 2);

  if (typeof strokeWeight === "function") strokeWeight(1.8);
  if (typeof stroke === "function") stroke(isLight ? "#2554FF" : "#959fff");
  rect(x - 3, y - 3, w + 6, h + 6, cr + 2);
  pop();
}

function drawFocusRingCircle(cx, cy, r) {
  if (!keyboardFocusActive) return;
  if (typeof push !== "function" || typeof circle !== "function") return;
  push();
  if (typeof noFill === "function") noFill();
  const isLight = typeof lightMode === "undefined" || lightMode;
  if (typeof strokeWeight === "function") strokeWeight(3.5);
  if (typeof stroke === "function") stroke(isLight ? "#000000" : "#FFFFFF");
  circle(cx, cy, (r + 4) * 2);

  if (typeof strokeWeight === "function") strokeWeight(1.8);
  if (typeof stroke === "function") stroke(isLight ? "#2554FF" : "#959fff");
  circle(cx, cy, (r + 4) * 2);
  pop();
}


