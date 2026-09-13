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

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
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
  _cacheFrame = frameCount;
  _cachedSelectedTags = null;
  _cachedVisibleProducts = null;
  _cachedVisibleProductsNoYear = null;
  _cachedTagCounts = null;
  background(240);
  drawCurrentVisualization();
  drawVisualizationSummary();
  drawProductPanel();
  drawFilterPanel();
  drawLayoutSeparators();

  if (hitAreaAt(mouseX, mouseY)) {
    requestCursor(HAND);
  }

  drawClickRipples();

  if (typeof cursor === "function") {
    cursor(currentFrameCursor);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  pixelDensity(Math.min(2, displayDensity()));
}

function filterPanelScale() {
  const w = typeof width !== "undefined" ? width : 1200;
  const h = typeof height !== "undefined" ? height : 800;
  const scaleW = w < 1000 ? w / 1000 : (w >= 2400 ? Math.min(1.25, w / 2000) : 1);
  const scaleH = h < 550 ? h / 550 : (h >= 1400 ? Math.min(1.25, h / 1200) : 1);
  return constrain(Math.min(scaleW, scaleH), 0.65, 1.25);
}

function baseContentSpace() {
  const baseFilterW = (LAYOUT_NAV_W + LAYOUT_FILTRO_W) * filterPanelScale();
  return Math.max(1, width - baseFilterW);
}

function layoutScale() {
  const space = baseContentSpace();
  const scaleW = space / (LAYOUT_VISUAL_W_BASE + LAYOUT_PAINEL_PRODUTO_W);
  const h = typeof height !== "undefined" ? height : 800;
  const scaleH = h < 750 ? h / 750 : (h > 1200 ? Math.min(1.25, h / 1080) : 1);
  return constrain(Math.min(scaleW, scaleH), 0.65, 1.25);
}

function filterPanelW() {
  if (typeof leftPanelExtendedOpen !== "undefined" && !leftPanelExtendedOpen) {
    return LAYOUT_NAV_W * filterPanelScale();
  }
  return (LAYOUT_NAV_W + LAYOUT_FILTRO_W) * filterPanelScale();
}

function contentSpace() {
  return Math.max(0, width - filterPanelW());
}

function minVisualW() {
  const space = contentSpace();
  const combined = LAYOUT_VISUAL_W_MIN + LAYOUT_PAINEL_PRODUTO_W_MIN;
  if (space < combined)
    return constrain(space * 0.52, 180, LAYOUT_VISUAL_W_MIN);
  return LAYOUT_VISUAL_W_MIN;
}

function minProductW() {
  const space = contentSpace();
  const scaledMin = Math.round(LAYOUT_PAINEL_PRODUTO_W_MIN * Math.min(1, layoutScale()));
  const combined = LAYOUT_VISUAL_W_MIN + scaledMin;
  if (space < combined)
    return constrain(space - minVisualW(), 160, scaledMin);
  return scaledMin;
}

function productPanelW() {
  const space = contentSpace();
  const visualMin = minVisualW();
  const scaled = Math.round(LAYOUT_PAINEL_PRODUTO_W * layoutScale());
  const minW = Math.min(minProductW(), Math.max(0, space - visualMin));
  const maxW = Math.max(minW, space - visualMin);
  return constrain(scaled, minW, maxW);
}

function visualW() {
  return Math.max(0, contentSpace() - productPanelW());
}

function visualX() {
  return filterPanelW();
}

function productPanelX() {
  return filterPanelW() + visualW();
}

function visualH() {
  return height;
}

function drawLayoutSeparators() {
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
  if (mouseButton !== LEFT) return;
  triggerClickRipple(mouseX, mouseY);
  if (filterMousePressed(mouseX, mouseY)) return false;
  if (productPanelMousePressed(mouseX, mouseY)) return false;
  if (visualMousePressed(mouseX, mouseY)) return false;
}

function mouseDragged() {
  if (draggedYearHandle) {
    requestCursor(HAND);
    const newYear = xToYear(mouseX);
    if (draggedYearHandle === "start")
      yearStart = constrain(newYear, YEAR_MIN, yearEnd);
    else yearEnd = constrain(newYear, yearStart, YEAR_MAX);
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
    mouseX <= filterPanelW() &&
    mouseY >= filterListY() * filterPanelScale()
  ) {
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
  while (textWidth(cleanText(textValue)) > maxWidth && size > minSize) {
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

