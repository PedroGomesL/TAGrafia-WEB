function asset(path) {
  return encodeURI(path);
}

function preload() {
  sourceLines.productsBR = loadStrings(asset(DATA_PATHS.productsBR));
  sourceLines.productsIntl = loadStrings(asset(DATA_PATHS.productsIntl));
  sourceLines.schools = loadStrings(asset(DATA_PATHS.schools));
  geoJson = loadJSON(asset(DATA_PATHS.geo));
  imageManifest = loadJSON(asset(DATA_PATHS.images));

  fontes.afacad = loadFont(
    asset("data/Fontes/AfacadFlux-VariableFont_slnt,wght.ttf"),
  );
  fontes.newAmsterdam = loadFont(asset("data/Fontes/NewAmsterdam-Regular.ttf"));
  fontes.robotoCondensed = loadFont(
    asset("data/Fontes/RobotoCondensed-VariableFont_wght.ttf"),
  );
  fontes.roboto = loadFont(asset("data/Fontes/Roboto-VariableFont_wdth,wght.ttf"));

  icones.material = loadImage(asset("data/Icones/material.png"));
  icones.tecnicas = loadImage(asset("data/Icones/técnica.png"));
  icones.estetico = loadImage(asset("data/Icones/estético.png"));
  icones.filtros = loadImage(asset("data/Icones/filtros.svg"));
  icones.sobre = loadImage(asset("data/Icones/sobre.svg"));
  icones.tipo_obra = loadImage(asset("data/Icones/tipodeproduto.png"));
  icones.clear = loadImage(asset("data/Icones/filter_alt_off.png"));
  icones.left = loadImage(asset("data/Icones/keyboard_arrow_left.png"));
  icones.right = loadImage(asset("data/Icones/keyboard_arrow_right.png"));
  icones.save = loadImage(asset("data/Icones/salvar_produto.png"));
  icones.author = loadImage(asset("data/Icones/autor.png"));
  icones.artesanal = loadImage(asset("data/Icones/produto artesanal.png"));
  icones.assinado = loadImage(asset("data/Icones/design_assinado.png"));
  icones.industrial = loadImage(asset("data/Icones/produto industrial.png"));
  icones.export = loadImage(asset("data/Icones/exportar.svg"));
  icones.change = loadImage(asset("data/Icones/change.png"));
}

function setup() {
  const canvas = createCanvas(
    Math.max(1024, windowWidth),
    Math.max(640, windowHeight),
  );
  canvas.parent("canvasMount");
  pixelDensity(Math.min(2, displayDensity()));
  textFont(fontes.robotoCondensed);
  frameRate(30);

  buildData();
  buildGeoCountries();
  loadSavedProducts();
  selectedProduct = null;
}

function draw() {
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
}

function windowResized() {
  resizeCanvas(Math.max(1024, windowWidth), Math.max(640, windowHeight));
}

function layoutScale() {
  const space = Math.max(1, contentSpace());
  return Math.min(1, space / (LAYOUT_VISUAL_W_BASE + LAYOUT_PAINEL_PRODUTO_W));
}

function filterPanelScale() {
  if (width < 1000) return Math.max(0.65, width / 1000);
  return 1;
}

function filterPanelW() {
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
  const combined = LAYOUT_VISUAL_W_MIN + LAYOUT_PAINEL_PRODUTO_W_MIN;
  if (space < combined)
    return constrain(space - minVisualW(), 160, LAYOUT_PAINEL_PRODUTO_W_MIN);
  return LAYOUT_PAINEL_PRODUTO_W_MIN;
}

function productPanelW() {
  const space = contentSpace();
  const visualMin = minVisualW();
  const scaled = LAYOUT_PAINEL_PRODUTO_W * layoutScale();
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

function timelineW() {
  return Math.max(0, visualW() - 8);
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

function themeTimelineColor() {
  return lightMode ? COLORS.timelineLight : COLORS.timelineDark;
}

function themeHatchColor() {
  return lightMode ? COLORS.hatchLight : COLORS.hatchDark;
}

function panelBackground() {
  return lightMode ? COLORS.visualLight : COLORS.panelDark;
}

function panelTextColor() {
  return lightMode ? "#111111" : "#FFFFFF";
}

function mousePressed() {
  if (mouseButton !== LEFT) return;
  if (filterMousePressed(mouseX, mouseY)) return false;
  if (themeMousePressed(mouseX, mouseY)) return false;
  if (productPanelMousePressed(mouseX, mouseY)) return false;
  if (visualMousePressed(mouseX, mouseY)) return false;
}

function mouseDragged() {
  if (draggedYearHandle) {
    const newYear = xToYear(mouseX);
    if (draggedYearHandle === "start")
      yearStart = constrain(newYear, YEAR_MIN, yearEnd);
    else yearEnd = constrain(newYear, yearStart, YEAR_MAX);
    return false;
  }
  if (mapState.dragging) {
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

function hasAny(textValue, terms) {
  return terms.some((term) => textValue.includes(normalizeText(term)));
}
