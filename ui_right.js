function drawProductPanel() {
  const x = productPanelX();
  const w = productPanelW();
  const scale = layoutScale();

  const titleH = 80 * scale;
  const sidebarW = 74 * scale;

  const mainX = x + sidebarW;
  const mainW = w - sidebarW;
  const imageH = Math.round(300 * scale);

  noStroke();
  fill("#FFFFFF");
  rect(x, 0, w, height);

  // 1. Top Image
  drawProductImage(x, 0, w, imageH, scale);

  // 2. Title Below Image
  drawProductInfo(x, imageH, w, titleH, scale);

  if (!selectedProduct) return;

  // 3. Left Sidebar
  drawProductSidebar(x, imageH + titleH, sidebarW, height - imageH - titleH, scale);

  // 4. Details / Content
  if (rightPanelTab === "salvos") {
    drawSavedProducts(mainX, imageH + titleH, mainW, scale);
  } else {
    drawProductDetailsNew(mainX, imageH + titleH, mainW, height - imageH - titleH, scale);
  }
}

function drawProductSidebar(x, y, w, h, scale) {
  fill("#FFFFFF");
  noStroke();
  rect(x, y, w, h);
  stroke(240);
  strokeWeight(1);
  line(x + w, y, x + w, y + h);

  const items = [
    { id: "tecnicas", label: "Técnico", icon: icones.tecnicas },
    { id: "materiais", label: "Materiais", icon: icones.material },
    { id: "estetico", label: "Estético", icon: icones.estetico },
    { id: "salvos", label: "Salvos", icon: icones.save },
  ];

  let currentY = y + 20 * scale;
  for (const item of items) {
    const active = rightPanelTab === item.id;
    if (active) {
      fill(240);
      noStroke();
      rect(x + 5 * scale, currentY - 5 * scale, w - 10 * scale, 75 * scale, 8);
    }
    if (item.icon) drawImageCentered(item.icon, x + w / 2, currentY + 17 * scale, 35 * scale, 35 * scale);
    fill("#000000");
    noStroke();
    textFont(fontes.roboto);
    textSize(14 * scale);
    textAlign(CENTER, CENTER);
    text(item.label, x + w / 2, currentY + 50 * scale);
    currentY += 75 * scale;
  }
}

function drawProductImage(x, y, w, h, scale) {
  fill("#FFFFFF");
  noStroke();
  rect(x, y, w, h);
  const img = getCurrentProductImage();
  if (img) {
    drawImageContain(img, x, y, w, h);
  } else {
    fill(17, 17, 17, 130);
    textFont(fontes.roboto);
    textSize(15 * scale);
    textAlign(CENTER, CENTER);
    text(
      selectedProduct && productImages(selectedProduct).length
        ? "Carregando imagem..."
        : "Imagem não encontrada",
      x + w / 2,
      y + h / 2,
    );
  }
  
  if (selectedProduct) {
    const images = productImages(selectedProduct);
    if (images.length > 1) {
      fill(255, 255, 255, 200);
      noStroke();
      circle(x + 45 * scale, y + h - 64 * scale, 30 * scale);
      circle(x + w - 45 * scale, y + h - 64 * scale, 30 * scale);
      if (icones.left) drawImageCentered(icones.left, x + 45 * scale, y + h - 64 * scale, 24 * scale, 24 * scale);
      if (icones.right) drawImageCentered(icones.right, x + w - 45 * scale, y + h - 64 * scale, 24 * scale, 24 * scale);
    }
  }
}

function drawProductInfo(x, y, w, h, scale) {
  noStroke();
  fill("#FFFFFF");
  rect(x, y, w, h);

  if (!selectedProduct) {
    fill("#000000");
    textFont(fontes.roboto);
    textSize(15 * scale);
    textAlign(LEFT, CENTER);
    text("Selecione um produto", x + 14 * scale, y + h / 2);
    return;
  }

  const sidebarW = 74 * scale;

  // Blue vertical line separating sidebar from title area
  stroke("#959fff");
  strokeWeight(1.5 * scale);
  line(x + sidebarW, y, x + sidebarW, y + h);

  // --- Title area (right of sidebar) ---
  const titleX = x + sidebarW + 10 * scale;
  const titleW = w - sidebarW - 14 * scale;
  const titleY = y + 6 * scale;

  // Product name (small bold Afacad, matches Figma 12/700)
  noStroke();
  fill("#190000");
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(fitTextSize(selectedProduct.name, titleW, 14 * scale, 10 * scale));
  textAlign(LEFT, TOP);
  text(selectedProduct.name, titleX, titleY, titleW, 30 * scale);
  textStyle(NORMAL);

  // Designer name (Afacad Regular 16)
  const designerText = selectedProduct.designer || "Designer desconhecido";
  const yearText = ` (${selectedProduct.year || selectedProduct.dateRaw})`;
  textSize(14 * scale);
  fill("#190000");
  textAlign(LEFT, TOP);
  text(designerText + yearText, titleX, titleY + 22 * scale, titleW, 20 * scale);
}

function drawProductDetailsNew(x, y, w, h, scale) {
  // White content background
  noStroke();
  fill("#FFFFFF");
  rect(x, y, w, h);

  const visibleH = h;
  let contentH = calculateNewDetailsHeight(w, scale);
  detailScroll = constrain(detailScroll, 0, Math.max(0, contentH - visibleH));

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(x, y, w, visibleH);
  drawingContext.clip();

  push();
  translate(0, -detailScroll);

  const dim = rightPanelTab;
  const marginX = x + 13 * scale;
  const contentW = w - 26 * scale;
  let cursorY = y + 14 * scale;

  // ─── Tags section header ───
  fill("#000000");
  noStroke();
  textFont(fontes.roboto);
  textStyle(BOLD);
  textSize(15 * scale);
  textAlign(LEFT, CENTER);
  text("Tags:", marginX, cursorY + 8 * scale);
  textStyle(NORMAL);
  cursorY += 26 * scale;

  // Tag chips
  const tags = selectedProduct.tagsByDimension[dim] || [];
  if (tags.length === 0) {
    fill(120);
    textSize(13 * scale);
    textAlign(LEFT, CENTER);
    text("Sem tags nesta categoria", marginX, cursorY + 10 * scale);
    cursorY += 26 * scale;
  } else {
    let cursorX = marginX;
    const maxX = x + w - 13 * scale;
    const chipH = 22 * scale;
    textSize(13 * scale);

    for (const tag of tags) {
      const chipW = Math.max(50 * scale, textWidth(tag.label) + 16 * scale);
      if (cursorX + chipW > maxX) {
        cursorX = marginX;
        cursorY += chipH + 6 * scale;
      }
      noStroke();
      fill(tag.color);
      rect(cursorX, cursorY, chipW, chipH, 4);
      fill(dim === "tecnicas" ? "#000000" : "#FFFFFF");
      textAlign(CENTER, CENTER);
      text(tag.label, cursorX + chipW / 2, cursorY + chipH / 2);
      cursorX += chipW + 6 * scale;
    }
    cursorY += chipH + 14 * scale;
  }

  // ─── Detalhes section header ───
  fill("#000000");
  noStroke();
  textFont(fontes.roboto);
  textStyle(BOLD);
  textSize(15 * scale);
  textAlign(LEFT, CENTER);
  text("Detalhes:", marginX, cursorY + 8 * scale);
  textStyle(NORMAL);
  cursorY += 26 * scale;

  // Body text
  let textValue = "";
  if (dim === "materiais") textValue = selectedProduct.materialDescription;
  else if (dim === "tecnicas")
    textValue =
      selectedProduct.origin === "brasileiro"
        ? selectedProduct.economicContext
        : selectedProduct.composition;
  else if (dim === "estetico") textValue = selectedProduct.aestheticDescription;

  if (!textValue) textValue = "Nenhum detalhe disponível para esta categoria.";

  fill("#1B1212");
  textFont(fontes.roboto);
  textSize(15 * scale);
  textLeading(22 * scale);
  textAlign(LEFT, TOP);
  text(textValue, marginX, cursorY, contentW, 2000 * scale);

  pop();
  drawingContext.restore();
}

function calculateNewDetailsHeight(w, scale) {
  if (!selectedProduct) return 0;
  const dim = rightPanelTab;
  let h = 20 * scale;
  h += 25 * scale; // "Tags:"
  
  const tags = selectedProduct.tagsByDimension[dim] || [];
  let cursorX = 20 * scale;
  const maxX = w - 20 * scale;
  const chipH = 25 * scale;
  
  for (const tag of tags) {
    // textSize is not strictly needed here as we use an approximation, but we'll approximate textWidth
    const estW = tag.label.length * 8 * scale;
    const chipW = Math.max(54 * scale, estW + 18 * scale);
    if (cursorX + chipW > maxX) {
      cursorX = 20 * scale;
      h += chipH + 8 * scale;
    }
    cursorX += chipW + 7 * scale;
  }
  if (tags.length > 0) h += chipH + 20 * scale;
  
  h += 40 * scale; // "Detalhes:"
  
  let textValue = "";
  if (dim === "materiais") textValue = selectedProduct.materialDescription;
  else if (dim === "tecnicas") textValue = selectedProduct.origin === "brasileiro" ? selectedProduct.economicContext : selectedProduct.composition;
  else if (dim === "estetico") textValue = selectedProduct.aestheticDescription;
  
  if (!textValue) textValue = "Nenhum detalhe disponível para esta categoria.";
  
  const charsPerLine = Math.floor((w - 40 * scale) / (8 * scale));
  const lines = Math.ceil(textValue.length / charsPerLine);
  h += lines * 20 * scale + 50 * scale;
  
  return h;
}

function drawPanelScroll(x, y, h, value, maxValue) {
  if (maxValue <= 0) return;
  const barH = Math.max(20, (h / (h + maxValue)) * h);
  const barY = y + (value / maxValue) * (h - barH);
  noStroke();
  fill(180, 180, 180, 150);
  rect(x, barY, 4, barH, 2);
}

function drawSavedProducts(x, y, w, scale) {
  const searchX = x + 22 * scale;
  const searchY = y + 18 * scale;
  const searchW = Math.min(240 * scale, w - 150 * scale);
  fill(lightMode ? "#FFFFFF" : "#D9D9D9");
  noStroke();
  rect(searchX, searchY, searchW, 20 * scale, 10 * scale);
  fill(savedSearch.length ? "#000000" : color(80));
  textFont(fontes.roboto);
  textSize(12 * scale);
  textAlign(LEFT, CENTER);
  text(
    savedSearch.length ? savedSearch : "Digite o nome, tipo ou ano",
    searchX + 13 * scale,
    searchY + 9 * scale,
  );

  const buttonX = x + w - 88 * scale;
  fill(lightMode ? "#FFFFFF" : "#D9D9D9");
  rect(buttonX, searchY, 66 * scale, 20 * scale, 10 * scale);
  fill("#000000");
  textAlign(CENTER, CENTER);
  text(savedSortLabel(), buttonX + 33 * scale, searchY + 9 * scale);

  const items = savedProductsFiltered();
  const gridY = y + 58 * scale;
  const cardW = 92 * scale;
  const cardH = 122 * scale;
  const gapX = Math.max(12 * scale, (w - 44 * scale - cardW * 3) / 2);
  const gapY = 32 * scale;
  const gridX = x + 22 * scale;
  const rows = Math.ceil(items.length / 3);
  const totalH = rows * cardH + Math.max(0, rows - 1) * gapY;
  savedScroll = constrain(
    savedScroll,
    0,
    Math.max(0, totalH - (height - gridY)),
  );

  // Clip to prevent saved product cards from overflowing
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(x, gridY, w, height - gridY);
  drawingContext.clip();

  for (let i = 0; i < items.length; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = gridX + col * (cardW + gapX);
    const cy = gridY + row * (cardH + gapY) - savedScroll;
    if (cy + cardH < gridY || cy > height) continue;
    drawSavedCard(items[i], cx, cy, cardW, cardH, scale);
  }

  drawingContext.restore();

  drawPanelScroll(
    x + w - 6,
    gridY + 4,
    height - gridY - 8,
    savedScroll,
    Math.max(0, totalH - (height - gridY)),
  );
}

function drawSavedCard(product, x, y, w, h, scale) {
  const colorOrigin =
    product.origin === "brasileiro" ? COLORS.yellow : COLORS.magenta;
  noStroke();
  fill(lightMode ? color(210) : "#8D8D8D");
  rect(x, y, w, 88 * scale, 7);
  fill("#FFFFFF");
  rect(x + 5 * scale, y + 5 * scale, w - 10 * scale, 74 * scale, 4);
  const img = getProductImage(product, 0);
  if (img)
    drawImageContain(
      img,
      x + 8 * scale,
      y + 8 * scale,
      w - 16 * scale,
      68 * scale,
    );
  fill(colorOrigin);
  rect(x + 5 * scale, y + 72 * scale, w - 10 * scale, 14 * scale, 0, 0, 6, 6);
  fill(lightMode ? color(245) : "#000000");
  rect(x, y + 96 * scale, w, 19 * scale, 10);
  fill(lightMode ? "#000000" : "#FFFFFF");
  textFont(fontes.roboto);
  textSize(fitTextSize(product.name, w - 10 * scale, 11 * scale, 8 * scale));
  textAlign(CENTER, CENTER);
  text(product.name, x + w / 2, y + 105 * scale);
}

function savedProductsFiltered() {
  const search = normalizeText(savedSearch);
  const items = products.filter(
    (product) =>
      savedProductKeys.has(product.key) &&
      (!search ||
        normalizeText(
          `${product.name} ${productType(product)} ${product.year}`,
        ).includes(search)),
  );
  items.sort((a, b) => {
    if (savedSortMode === 1) return a.year - b.year;
    if (savedSortMode === 2) {
      const cmp = productType(a).localeCompare(productType(b), "pt-BR");
      if (cmp) return cmp;
    }
    return a.name.localeCompare(b.name, "pt-BR");
  });
  return items;
}

function savedSortLabel() {
  if (savedSortMode === 1) return "ANO";
  if (savedSortMode === 2) return "TIPO";
  return "A-Z";
}

function productionIcon() {
  const textValue = normalizeText(
    selectedProduct ? selectedProduct.production : "",
  );
  if (textValue.includes("artesanal")) return icones.artesanal;
  if (
    textValue.includes("industrial") ||
    textValue.includes("massa") ||
    textValue.includes("seri")
  )
    return icones.industrial;
  return icones.assinado;
}

function getCurrentProductImage() {
  return getProductImage(selectedProduct, selectedImageIndex);
}

function getProductImage(product, index) {
  const images = productImages(product);
  if (!images.length) return null;
  const path = images[constrain(index, 0, images.length - 1)];
  if (imageCache.has(path)) return imageCache.get(path);
  imageCache.set(path, null);
  loadImage(
    asset(path),
    (img) => imageCache.set(path, img),
    () => imageCache.set(path, null),
  );
  return null;
}

function productImages(product) {
  if (!product || !imageManifest) return [];
  const group = imageManifest[product.origin] || {};
  return group[String(Number(product.id))] || [];
}

function selectProduct(product) {
  if (!product) return;
  if (!selectedProduct || selectedProduct.key !== product.key) {
    selectedProduct = product;
    selectedImageIndex = 0;
    detailScroll = 0;
  }
}

function ensureSelectedVisible() {
  const visible = visibleProducts();
  if (
    !selectedProduct ||
    !visible.some((product) => product.key === selectedProduct.key)
  )
    selectProduct(visible[0] || products[0]);
}

function productPanelMousePressed(mx, my) {
  const x = productPanelX();
  const w = productPanelW();
  const scale = layoutScale();

  const titleH = 80 * scale;
  const sidebarW = 74 * scale;
  const mainX = x + sidebarW;
  const mainW = w - sidebarW;
  const imageH = Math.round(300 * scale);

  if (mx < x || mx > x + w || my < 0 || my > height) return false;

  // Previous/Next Image buttons
  if (dist(mx, my, x + 45 * scale, imageH - 64 * scale) <= 30 * scale) {
    changeProductImage(-1);
    return true;
  }
  if (dist(mx, my, x + w - 45 * scale, imageH - 64 * scale) <= 30 * scale) {
    changeProductImage(1);
    return true;
  }

  // Vertical Tabs Click
  if (mx >= x && mx <= x + sidebarW && my > imageH + titleH) {
    let clickedY = my - imageH - titleH - 20 * scale;
    let index = Math.floor(clickedY / (75 * scale));
    const tabs = ["tecnicas", "materiais", "estetico", "salvos"];
    if (index >= 0 && index < 4) {
      rightPanelTab = tabs[index];
      savedSearchActive = false;
      return true;
    }
  }

  const contentY = imageH + titleH;
  if (rightPanelTab === "salvos") {
    return savedProductsMousePressed(mx, my, mainX, contentY, mainW, scale);
  }
  return true;
}

function savedProductsMousePressed(mx, my, x, contentY, w, scale) {
  const searchY = contentY + 18 * scale;
  const searchX = x + 22 * scale;
  const searchW = Math.min(240 * scale, w - 150 * scale);
  if (insideRect(mx, my, searchX, searchY, searchW, 20 * scale)) {
    savedSearchActive = true;
    return true;
  }
  savedSearchActive = false;
  const sortX = x + w - 88 * scale;
  if (insideRect(mx, my, sortX, searchY, 66 * scale, 20 * scale)) {
    savedSortMode = (savedSortMode + 1) % 3;
    savedScroll = 0;
    return true;
  }
  const items = savedProductsFiltered();
  const gridY = contentY + 58 * scale;
  const cardW = 92 * scale;
  const cardH = 122 * scale;
  const gapX = Math.max(12 * scale, (w - 44 * scale - cardW * 3) / 2);
  const gapY = 32 * scale;
  const gridX = x + 22 * scale;
  const localY = my - gridY + savedScroll;
  for (let i = 0; i < items.length; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = gridX + col * (cardW + gapX);
    const cy = row * (cardH + gapY);
    if (mx >= cx && mx <= cx + cardW && localY >= cy && localY <= cy + cardH) {
      selectProduct(items[i]);
      rightPanelTab = "materiais";
      return true;
    }
  }
  return true;
}

function productPanelWheel(event) {
  const x = productPanelX();
  const w = productPanelW();
  const scale = layoutScale();
  const contentY = Math.round(300 * scale) + Math.round(80 * scale);
  
  if (mouseX < x || mouseX > x + w || mouseY < contentY) return false;
  
  if (rightPanelTab === "salvos") {
    savedScroll = Math.max(0, savedScroll + event.delta * 0.45);
  } else {
    const visibleH = height - contentY;
    const contentH = calculateNewDetailsHeight(w - 74 * scale, scale);
    const maxScroll = Math.max(0, contentH - visibleH);
    detailScroll = constrain(detailScroll + event.delta * 0.45, 0, maxScroll);
  }
  return true;
}

function changeProductImage(direction) {
  const images = productImages(selectedProduct);
  if (images.length <= 1) return;
  selectedImageIndex =
    (selectedImageIndex + direction + images.length) % images.length;
}

function toggleSavedProduct() {
  if (!selectedProduct) return;
  if (savedProductKeys.has(selectedProduct.key))
    savedProductKeys.delete(selectedProduct.key);
  else savedProductKeys.add(selectedProduct.key);
  persistSavedProducts();
}

function loadSavedProducts() {
  try {
    savedProductKeys = new Set(
      JSON.parse(localStorage.getItem("tagrafia-saved-products") || "[]"),
    );
  } catch {
    savedProductKeys = new Set();
  }
}

function persistSavedProducts() {
  localStorage.setItem(
    "tagrafia-saved-products",
    JSON.stringify(Array.from(savedProductKeys)),
  );
}
