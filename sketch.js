function asset(path) {
  return encodeURI(path);
}

function preload() {
  sourceLines.productsBR = loadStrings(asset(DATA_PATHS.productsBR));
  sourceLines.productsIntl = loadStrings(asset(DATA_PATHS.productsIntl));
  sourceLines.schools = loadStrings(asset(DATA_PATHS.schools));
  geoJson = loadJSON(asset(DATA_PATHS.geo));
  imageManifest = loadJSON(asset(DATA_PATHS.images));

  for (const [key, path] of Object.entries(FONTS_CONFIG)) {
    fontes[key] = loadFont(asset(path));
  }

  for (const [key, path] of Object.entries(ICONS_CONFIG)) {
    icones[key] = loadImage(asset(path));
  }
}

function getOptimalCanvasDimensions() {
  const currentW =
    typeof windowWidth !== "undefined" && windowWidth > 0
      ? windowWidth
      : typeof width !== "undefined" && width > 0
        ? width
        : 1024;
  const currentH =
    typeof windowHeight !== "undefined" && windowHeight > 0
      ? windowHeight
      : typeof height !== "undefined" && height > 0
        ? height
        : 768;
  if (currentW < BREAKPOINTS.mobile) {
    return {
      w: Math.max(320, currentW),
      h: Math.max(480, currentH),
    };
  }
  return {
    w: Math.max(1024, currentW),
    h: Math.max(640, currentH),
  };
}

function setup() {
  const dims = getOptimalCanvasDimensions();
  const canvas = createCanvas(dims.w, dims.h);
  canvas.parent("canvasMount");
  pixelDensity(Math.min(2, displayDensity()));
  textFont(fontes.robotoCondensed);
  frameRate(30);

  buildData();
  buildGeoCountries();
  loadSavedProducts();
  selectedProduct = null;
}

function requestCursor(type) {
  const isText = type === "text" || (typeof TEXT !== "undefined" && type === TEXT);
  const isHand = type === "hand" || type === "pointer" || (typeof HAND !== "undefined" && type === HAND);
  const textVal = typeof TEXT !== "undefined" ? TEXT : "text";
  const handVal = typeof HAND !== "undefined" ? HAND : "pointer";
  if (isText) {
    currentFrameCursor = textVal;
  } else if (isHand) {
    if (currentFrameCursor !== textVal) {
      currentFrameCursor = handVal;
    }
  }
}

function triggerClickRipple(x, y, color) {
  const now = typeof millis === "function" ? millis() : Date.now();
  clickRipples.push({
    x,
    y,
    startTime: now,
    duration: 250,
    maxR: 28,
    color: color || "#959fff",
  });
}

function drawClickRipples() {
  if (!clickRipples || clickRipples.length === 0) return;
  const now = typeof millis === "function" ? millis() : Date.now();
  push();
  noFill();
  for (let i = clickRipples.length - 1; i >= 0; i--) {
    const rip = clickRipples[i];
    const elapsed = now - rip.startTime;
    if (elapsed > rip.duration) {
      clickRipples.splice(i, 1);
      continue;
    }
    const t = elapsed / rip.duration;
    const ease = 1 - Math.pow(1 - t, 2);
    const r = rip.maxR * ease;
    const alphaVal = Math.round(180 * (1 - ease));
    stroke(149, 159, 255, alphaVal);
    strokeWeight(1.8 * (1 - ease * 0.4));
    circle(rip.x, rip.y, r * 2);
  }
  pop();
}

function draw() {
  currentFrameCursor = typeof ARROW !== "undefined" ? ARROW : "default";
  hitAreas = [];
  hoveredCircularTag = null;
  _cacheFrame = frameCount;
  _cachedSelectedTags = null;
  _cachedVisibleProducts = null;
  _cachedVisibleProductsNoYear = null;
  _cachedTagCounts = null;
  background(240);

  if (typeof isMobileMode === "function" && isMobileMode()) {
    drawMobileLayout();
  } else {
    drawDesktopLayout();
  }

  if (hitAreaAt(mouseX, mouseY)) {
    requestCursor(HAND);
  }

  drawClickRipples();

  if (typeof cursor === "function") {
    cursor(currentFrameCursor);
  }
}

function drawDesktopLayout() {
  drawCurrentVisualization();
  drawVisualizationSummary();
  drawProductPanel();
  drawFilterPanel();
  drawLayoutSeparators();
}

/**
 * Scaffold de layout mobile que prepara a arquitetura para telas responsivas.
 * O usuário adicionará e customizará os componentes específicos das telas.
 */
function drawMobileLayout() {
  const activeScreen = typeof mobileState !== "undefined" ? mobileState.activeScreen : "visual";
  switch (activeScreen) {
    case "filtros":
      drawMobileFiltrosScreen();
      break;
    case "produto":
      drawMobileProdutoScreen();
      break;
    case "sobre":
      drawMobileSobreScreen();
      break;
    case "exportar":
      drawMobileExportarScreen();
      break;
    case "visual":
    default:
      drawMobileVisualScreen();
      break;
  }
}

function drawMobileVisualScreen() {
  drawCurrentVisualization();
  drawVisualizationSummary();
}

function drawMobileFiltrosScreen() {
  drawFilterPanel();
}

function drawMobileProdutoScreen() {
  drawProductPanel();
}

function drawMobileSobreScreen() {
  drawSobreTab();
}

function drawMobileExportarScreen() {
  drawExportTab();
}

function touchStarted() {
  if (typeof mobileState !== "undefined") {
    mobileState.touchStartX = mouseX;
    mobileState.touchStartY = mouseY;
    mobileState.touchMoved = false;
  }
  return mousePressed();
}

function touchMoved() {
  if (typeof mobileState !== "undefined") {
    mobileState.touchMoved = true;
  }
  return mouseDragged();
}

function touchEnded() {
  return mouseReleased();
}

function windowResized() {
  const dims = getOptimalCanvasDimensions();
  resizeCanvas(dims.w, dims.h);
  pixelDensity(Math.min(2, displayDensity()));
  if (typeof limitMapPan === "function") {
    limitMapPan();
  }
}

function filterPanelScale() {
  if (width < 1000) return Math.max(0.65, width / 1000);
  return 1;
}

function baseContentSpace() {
  const baseFilterW = (LAYOUT_NAV_W + LAYOUT_FILTRO_W) * filterPanelScale();
  return Math.max(1, width - baseFilterW);
}

function minVisualW() {
  return LAYOUT_VISUAL_W_MIN;
}

function minProductW() {
  return LAYOUT_PAINEL_PRODUTO_W_MIN;
}

function productPanelW() {
  if (typeof isMobileMode === "function" && isMobileMode()) {
    return width;
  }
  const space = baseContentSpace();
  const visualMin = minVisualW();
  if (space < visualMin + LAYOUT_PAINEL_PRODUTO_W) {
    return constrain(space - visualMin, minProductW(), LAYOUT_PAINEL_PRODUTO_W);
  }
  return LAYOUT_PAINEL_PRODUTO_W;
}

function layoutScale() {
  return productPanelW() / LAYOUT_PAINEL_PRODUTO_W;
}

function filterPanelW() {
  if (typeof isMobileMode === "function" && isMobileMode()) {
    return width;
  }
  if (typeof leftPanelExtendedOpen !== "undefined" && !leftPanelExtendedOpen) {
    return LAYOUT_NAV_W * filterPanelScale();
  }
  return (LAYOUT_NAV_W + LAYOUT_FILTRO_W) * filterPanelScale();
}

function contentSpace() {
  return Math.max(0, width - filterPanelW());
}

function visualW() {
  if (typeof isMobileMode === "function" && isMobileMode()) {
    return width;
  }
  return Math.max(0, contentSpace() - productPanelW());
}

function visualX() {
  if (typeof isMobileMode === "function" && isMobileMode()) {
    return 0;
  }
  return filterPanelW();
}

function productPanelX() {
  if (typeof isMobileMode === "function" && isMobileMode()) {
    return 0;
  }
  return filterPanelW() + visualW();
}

function visualH() {
  return height;
}

function drawLayoutSeparators() {
  if (typeof isMobileMode === "function" && isMobileMode()) return;
  push();
  stroke("#000000");
  strokeWeight(2);
  line(filterPanelW(), 0, filterPanelW(), height);
  line(productPanelX(), 0, productPanelX(), height);
  pop();
}

function themeVisualBackground() {
  return lightMode ? COLORS.visualLight : COLORS.visualDark;
}

function themeLineColor() {
  return lightMode ? "#111111" : "#FFFFFF";
}

function mousePressed() {
  if (typeof touches !== "undefined" && touches.length > 0) {
    // Evento de toque em andamento, prosseguir
  } else if (typeof mouseButton !== "undefined" && mouseButton !== LEFT) {
    return;
  }
  triggerClickRipple(mouseX, mouseY);

  if (typeof isMobileMode === "function" && isMobileMode()) {
    const activeScreen =
      typeof mobileState !== "undefined" ? mobileState.activeScreen : "visual";
    if (activeScreen === "filtros") {
      if (filterMousePressed(mouseX, mouseY)) return false;
    } else if (activeScreen === "produto") {
      if (productPanelMousePressed(mouseX, mouseY)) return false;
    } else if (activeScreen === "sobre") {
      return false;
    } else if (activeScreen === "exportar") {
      if (filterMousePressed(mouseX, mouseY)) return false;
    } else {
      if (visualMousePressed(mouseX, mouseY)) return false;
    }
    return;
  }

  if (filterMousePressed(mouseX, mouseY)) return false;
  if (productPanelMousePressed(mouseX, mouseY)) return false;
  if (visualMousePressed(mouseX, mouseY)) return false;
}

function mouseDragged() {
  if (draggedYearHandle) {
    requestCursor(HAND);
    const newYear = xToYear(mouseX);
    if (draggedYearHandle === "start") {
      if (newYear > yearEnd) {
        yearStart = yearEnd;
        yearEnd = constrain(newYear, yearStart, YEAR_MAX);
        draggedYearHandle = "end";
      } else {
        yearStart = constrain(newYear, YEAR_MIN, yearEnd);
      }
    } else {
      if (newYear < yearStart) {
        yearEnd = yearStart;
        yearStart = constrain(newYear, YEAR_MIN, yearEnd);
        draggedYearHandle = "start";
      } else {
        yearEnd = constrain(newYear, yearStart, YEAR_MAX);
      }
    }
    return false;
  }
  if (mapState.dragging) {
    requestCursor(HAND);
    mapState.panX += mouseX - mapState.previousX;
    mapState.panY += mouseY - mapState.previousY;
    mapState.previousX = mouseX;
    mapState.previousY = mouseY;
    limitMapPan();
    return false;
  }
}

function mouseReleased() {
  draggedYearHandle = null;
  mapState.dragging = false;
}

function mouseWheel(event) {
  if (productPanelWheel(event)) return false;
  if (
    activeView === VISAO_MAPA_MUNDI &&
    mouseX >= visualX() &&
    mouseX <= productPanelX() &&
    mouseY < height - TIMELINE_H
  ) {
    const previousZoom = mapState.zoom;
    mapState.zoom = constrain(
      mapState.zoom * (event.delta > 0 ? 0.88 : 1.14),
      1,
      7,
    );
    if (Math.abs(previousZoom - mapState.zoom) > 0.001) {
      const box = currentMapBox();
      const cx = box.x + box.w / 2;
      const cy = box.y + box.h / 2;
      mapState.panX =
        mouseX -
        cx -
        (mouseX - cx - mapState.panX) * (mapState.zoom / previousZoom);
      mapState.panY =
        mouseY -
        cy -
        (mouseY - cy - mapState.panY) * (mapState.zoom / previousZoom);
      limitMapPan();
    }
    return false;
  }
  if (
    mouseX >= 0 &&
    mouseX <= filterPanelW()
  ) {
    if (leftPanelTab === "sobre" && mouseY >= 58 * filterPanelScale()) {
      const maxScroll = Math.max(0, 460 - (height / filterPanelScale() - 70));
      sobreScroll = constrain(
        sobreScroll + (event.delta * 0.45) / filterPanelScale(),
        0,
        maxScroll,
      );
      return false;
    }
    if (mouseY >= filterListY() * filterPanelScale()) {
      const tags = tagsToDisplay();
      const maxScroll = Math.max(
        0,
        tags.length * FILTER_TAG_ROW_H -
          (height / filterPanelScale() - 10 - filterListY()),
      );
      tagScroll = constrain(
        tagScroll + (event.delta * 0.45) / filterPanelScale(),
        0,
        maxScroll,
      );
      return false;
    }
  }
}

function keyPressed() {
  if (tagSearchActive) {
    if (keyCode === BACKSPACE) tagSearch = tagSearch.slice(0, -1);
    else if (keyCode === DELETE) tagSearch = "";
    else if (keyCode === ENTER || keyCode === RETURN || keyCode === ESCAPE)
      tagSearchActive = false;
    else if (key.length === 1 && key >= " ") tagSearch += key;
    tagScroll = 0;
    return false;
  }
  if (savedSearchActive) {
    if (keyCode === BACKSPACE) savedSearch = savedSearch.slice(0, -1);
    else if (keyCode === DELETE) savedSearch = "";
    else if (keyCode === ENTER || keyCode === RETURN || keyCode === ESCAPE)
      savedSearchActive = false;
    else if (key.length === 1 && key >= " ") savedSearch += key;
    savedScroll = 0;
    return false;
  }
}

function hitAreaAt(mx, my) {
  // Limita hit testing visual a área de visualização visível (evita cursor fantasma fora do centro)
  if (
    typeof visualX === "function" &&
    typeof visualW === "function" &&
    !insideRect(mx, my, visualX(), 0, visualW(), height - (typeof TIMELINE_H !== "undefined" ? TIMELINE_H : 74))
  ) {
    return null;
  }
  for (let i = hitAreas.length - 1; i >= 0; i--) {
    const area = hitAreas[i];
    if (area.shape === "circle" || area.kind === "tag") {
      if (dist(mx, my, area.cx, area.cy) <= area.r) return area;
    } else if (area.shape === "rotatedRect") {
      const dx = mx - area.cx;
      const dy = my - area.cy;
      const c = cos(-area.rotation);
      const s = sin(-area.rotation);
      const lx = dx * c - dy * s;
      const ly = dx * s + dy * c;
      if (Math.abs(lx) <= area.w / 2 && Math.abs(ly) <= area.h / 2) return area;
    }
  }
  return null;
}

function drawImageCentered(img, cx, cy, w, h) {
  if (!img || !img.width || !img.height) return;
  const scale = Math.min(w / img.width, h / img.height);
  const iw = img.width * scale;
  const ih = img.height * scale;
  image(img, cx - iw / 2, cy - ih / 2, iw, ih);
}

function drawImageContain(img, x, y, w, h) {
  if (!img || !img.width || !img.height) return;
  const scale = Math.min(w / img.width, h / img.height);
  const iw = img.width * scale;
  const ih = img.height * scale;
  image(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}

function colorAlpha(hexOrColor, alpha) {
  const c = color(hexOrColor);
  c.setAlpha(alpha);
  return c;
}

function fitTextSize(textValue, maxWidth, start, minSize) {
  let size = start;
  textSize(size);
  const textStr = cleanText(textValue);
  const lines = textStr.split("\n");
  const getWidth = (s) => {
    if (typeof textWidth === "function") {
      textSize(s);
      let maxW = 0;
      for (const line of lines) {
        const w = textWidth(cleanText(line));
        if (w > maxW) maxW = w;
      }
      return maxW;
    }
    let maxW = 0;
    for (const line of lines) {
      const w = cleanText(line).length * s * 0.55;
      if (w > maxW) maxW = w;
    }
    return maxW;
  };
  while (getWidth(size) > maxWidth && size > minSize) {
    size -= 1;
    textSize(size);
  }
  return size;
}

function measureText(textValue, size) {
  textFont(fontes.afacad);
  textSize(size);
  return textWidth(cleanText(textValue));
}

function insideRect(mx, my, x, y, w, h) {
  return mx >= x && mx <= x + w && my >= y && my <= y + h;
}

