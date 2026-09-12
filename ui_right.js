function drawProductPanel() {
  const x = productPanelX();
  const w = productPanelW();
  const scale = layoutScale();

  const titleH = 80 * scale;
  const sidebarW = 74 * scale;

  const mainX = x + sidebarW;
  const mainW = w - sidebarW;
  const imageH = Math.round(300 * scale);
  const barH = Math.round(44 * scale);

  noStroke();
  fill(panelBackground());
  rect(x, 0, w, height);

  // 1. Top Image (Full width)
  drawProductImage(x, 0, w, imageH, scale);

  // 2. Title Below Image
  drawProductInfo(x, imageH, w, titleH, scale);

  // 3. Left Sidebar (Below Title)
  drawProductSidebar(
    x,
    imageH + titleH,
    sidebarW,
    height - imageH - titleH,
    scale,
  );

  // 4. Details / Content (Right of Sidebar)
  if (productDetailsActive)
    drawProductDetails(mainX, imageH + titleH, mainW, barH, scale);
  else drawSavedProducts(mainX, imageH + titleH, mainW, scale);
}

function drawProductSidebar(x, y, w, h, scale) {
  // Draw the vertical tabs
  fill(panelBackground());
  noStroke();
  rect(x, y, w, h);

  const items = [
    { label: "Técnico", icon: icones.tecnicas },
    { label: "Materiais", icon: icones.material },
    { label: "Estético", icon: icones.estetico },
    { label: "Salvos", icon: icones.save },
  ];

  let currentY = y + 20 * scale;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isSavedTab = item.label === "Salvos";
    const active =
      (productDetailsActive && !isSavedTab) ||
      (!productDetailsActive && isSavedTab);

    // Figma shows a blue indicator on the left if active
    if (active) {
      fill(COLORS.blue);
      rect(x, currentY, 4 * scale, 50 * scale);
    }

    // Icon
    if (item.icon)
      drawImageCentered(
        item.icon,
        x + w / 2,
        currentY + 15 * scale,
        30 * scale,
        30 * scale,
      );

    // Text
    fill(active ? panelTextColor() : color(150));
    noStroke();
    textFont(fontes.robotoCondensed);
    textSize(11 * scale);
    textAlign(CENTER, CENTER);
    text(item.label, x + w / 2, currentY + 40 * scale);

    currentY += 75 * scale;
  }
}

function drawProductImage(x, y, w, h, scale) {
  fill("#FFFFFF");
  noStroke();
  rect(x, y, w, h);
  const img = getCurrentProductImage();
  if (img) drawImageContain(img, x, y, w, h);
  else {
    fill(17, 17, 17, 130);
    textFont(fontes.robotoCondensed);
    textSize(15 * scale);
    textAlign(CENTER, CENTER);
    text(
      selectedProduct && productImages(selectedProduct).length
        ? "Carregando imagem..."
        : "Imagem nao encontrada",
      x + w / 2,
      y + h / 2,
    );
  }
  drawImageCentered(
    icones.left,
    x + 45 * scale,
    y + h - 64 * scale,
    38 * scale,
    38 * scale,
  );
  drawImageCentered(
    icones.right,
    x + w - 45 * scale,
    y + h - 64 * scale,
    38 * scale,
    38 * scale,
  );
}

function drawProductImageLine(x, y, w, scale) {
  noStroke();
  fill("#000000");
  const lineW = Math.min(w - 28 * scale, 475 * scale);
  rect(x + (w - lineW) / 2, y, lineW, 1);
}

function drawProductInfo(x, y, w, h, scale) {
  noStroke();
  // Fundo transparente/branco conforme Figma
  fill("#ffffff");
  rect(x, y, w, h);

  if (!selectedProduct) {
    fill("#000000");
    textFont(fontes.robotoCondensed);
    textSize(15 * scale);
    textAlign(LEFT, CENTER);
    text("Selecione um produto", x + 14 * scale, y + h / 2);
    return;
  }

  const nameX = x + 14 * scale;
  const nameY = y + 25 * scale;
  const containerX = x + w - 168 * scale;
  const textW = Math.max(118 * scale, containerX - 14 * scale - nameX);
  fill("#000000");
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(fitTextSize(selectedProduct.name, textW, 18 * scale, 10 * scale));
  textAlign(LEFT, BASELINE);
  text(selectedProduct.name, nameX, nameY);
  const yearText = `(${selectedProduct.year || selectedProduct.dateRaw})`;
  const yearX = nameX + textWidth(selectedProduct.name) + 6 * scale;
  textFont(fontes.robotoCondensed);
  textStyle(NORMAL);
  textSize(15 * scale);
  let authorY = y + 48 * scale;
  if (yearX + textWidth(yearText) < nameX + textW)
    text(yearText, yearX, nameY - 1 * scale);
  else {
    text(yearText, nameX, y + 42 * scale);
    authorY = y + 57 * scale;
  }
  textAlign(LEFT, TOP);
  text(selectedProduct.author || "", nameX, authorY, textW, 24 * scale);
  drawProductInfoRibbon(x, y, w, h, scale);
}

function drawProductInfoRibbon(x, y, w, h, scale) {
  const ribbonH = 56 * scale;
  const containerX = x + w - 168 * scale;
  const containerY = y + h - ribbonH;
  noStroke();
  fill(COLORS.yellow);
  circle(containerX + ribbonH / 2, containerY + ribbonH / 2, ribbonH);
  rect(
    containerX + ribbonH / 2,
    containerY,
    x + w - (containerX + ribbonH / 2),
    ribbonH,
  );
  const icons = [icones.save, icones.author, productionIcon()];
  for (let i = 0; i < icons.length; i++) {
    const cx = containerX + [46, 92, 138][i] * scale;
    const cy = containerY + ribbonH / 2;
    fill("#FFFFFF");
    circle(cx, cy, 38 * scale);
    drawImageCentered(icons[i], cx, cy, 24 * scale, 24 * scale);
  }
}

function drawProductTabs(x, y, w, h, scale) {
  drawProductTab(
    x,
    y,
    w / 2,
    h,
    "DETALHES DO PRODUTO",
    productDetailsActive,
    scale,
  );
  drawProductTab(
    x + w / 2,
    y,
    w / 2,
    h,
    "PRODUTOS SALVOS",
    !productDetailsActive,
    scale,
  );
}

function drawProductTab(x, y, w, h, label, active, scale) {
  stroke("#000000");
  strokeWeight(1);
  fill(active ? COLORS.yellow : lightMode ? "#D8CFAF" : COLORS.inactiveTab);
  rect(x, y, w, h);
  fill(active ? "#000000" : panelTextColor());
  noStroke();
  textFont(fontes.newAmsterdam);
  textSize(20 * scale);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2 + scale);
}

function drawProductDetails(x, y, w, barH, scale) {
  const visibleH = height - y;
  let contentH = detailsContentHeight(w, barH, scale);
  detailScroll = constrain(detailScroll, 0, Math.max(0, contentH - visibleH));

  // Clip to prevent scrolled content from overflowing into the image/tabs above
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(x, y, w, visibleH);
  drawingContext.clip();

  push();
  translate(0, -detailScroll);
  let cursor = y;
  cursor = drawDetailSection(
    x,
    cursor,
    w,
    barH,
    "material",
    "MATERIAIS",
    materialOpen,
    selectedProduct ? selectedProduct.materialDescription : "",
    scale,
  );
  cursor = drawDetailSection(
    x,
    cursor,
    w,
    barH,
    "tecnicas",
    "TECNICAS DE CONSTRUCAO",
    techniqueOpen,
    selectedProduct
      ? selectedProduct.origin === "brasileiro"
        ? selectedProduct.economicContext
        : selectedProduct.composition
      : "",
    scale,
  );
  drawDetailSection(
    x,
    cursor,
    w,
    barH,
    "estetico",
    "ESTETICO",
    aestheticOpen,
    selectedProduct ? selectedProduct.composition : "",
    scale,
  );
  pop();

  drawingContext.restore();

  drawPanelScroll(
    x + w - 6,
    y + 6,
    visibleH - 12,
    detailScroll,
    Math.max(0, contentH - visibleH),
  );
}

function drawDetailSection(x, y, w, barH, dim, label, open, textValue, scale) {
  stroke("#000000");
  strokeWeight(1);
  fill(COLORS.yellow);
  rect(x, y, w, barH);
  drawImageCentered(
    icones[dim] || icones.tecnicas,
    x + 33 * scale,
    y + barH / 2,
    34 * scale,
    34 * scale,
  );
  fill("#000000");
  noStroke();
  textFont(fontes.newAmsterdam);
  textSize(20 * scale);
  textAlign(LEFT, CENTER);
  text(label, x + 64 * scale, y + barH / 2 + scale);
  drawSectionToggle(x + w - 30 * scale, y + barH / 2, 18 * scale, open);
  if (!open) return y + barH;
  const h = detailSectionContentHeight(w, dim, textValue, scale);
  noStroke();
  fill(panelBackground());
  rect(x, y + barH, w, h);
  drawDetailSectionContent(x, y + barH, w, dim, textValue, scale);
  return y + barH + h;
}

function drawDetailSectionContent(x, y, w, dim, textValue, scale) {
  const tags = selectedProduct ? selectedProduct.tagsByDimension[dim] : [];
  let cursorX = x + 84 * scale;
  let cursorY = y + 14 * scale;
  const maxX = x + w - 20 * scale;
  const chipH = 25 * scale;
  fill(panelTextColor());
  textFont(fontes.robotoCondensed);
  textSize(16 * scale);
  textAlign(LEFT, CENTER);
  text("Tags:", x + 18 * scale, cursorY + chipH / 2 - scale);
  for (const tag of tags) {
    textSize(16 * scale);
    const chipW = Math.max(54 * scale, textWidth(tag.label) + 18 * scale);
    if (cursorX + chipW > maxX) {
      cursorX = x + 84 * scale;
      cursorY += chipH + 8 * scale;
    }
    noStroke();
    fill(tag.color);
    rect(cursorX, cursorY, chipW, chipH, 3);
    fill(dim === "tecnicas" ? "#000000" : "#FFFFFF");
    textAlign(CENTER, CENTER);
    text(tag.label, cursorX + chipW / 2, cursorY + chipH / 2 - scale);
    cursorX += chipW + 7 * scale;
  }
  if (!cleanText(textValue)) return;
  fill(panelTextColor());
  textAlign(LEFT, TOP);
  textSize(16 * scale);
  text(
    cleanText(textValue),
    x + 18 * scale,
    cursorY + chipH + 26 * scale,
    w - 36 * scale,
    1000,
  );
}

function detailsContentHeight(w, barH, scale) {
  let total = barH;
  if (materialOpen)
    total += detailSectionContentHeight(
      w,
      "material",
      selectedProduct ? selectedProduct.materialDescription : "",
      scale,
    );
  total += barH;
  if (techniqueOpen)
    total += detailSectionContentHeight(
      w,
      "tecnicas",
      selectedProduct
        ? selectedProduct.origin === "brasileiro"
          ? selectedProduct.economicContext
          : selectedProduct.composition
        : "",
      scale,
    );
  total += barH;
  if (aestheticOpen)
    total += detailSectionContentHeight(
      w,
      "estetico",
      selectedProduct ? selectedProduct.composition : "",
      scale,
    );
  return total;
}

function detailSectionContentHeight(w, dim, textValue, scale) {
  const tags = selectedProduct ? selectedProduct.tagsByDimension[dim] : [];
  const lines = chipLines(tags, w - 104 * scale, scale);
  const approxTextLines = cleanText(textValue)
    ? Math.ceil(
        cleanText(textValue).length /
          Math.max(30, (w - 36 * scale) / (8 * scale)),
      )
    : 0;
  return (
    24 * scale +
    lines * 33 * scale +
    (approxTextLines > 0
      ? 24 * scale + approxTextLines * 18 * scale
      : 12 * scale)
  );
}

function chipLines(tags, available, scale) {
  if (!tags.length) return 1;
  let lines = 1;
  let used = 0;
  textFont(fontes.robotoCondensed);
  textSize(16 * scale);
  for (const tag of tags) {
    const w =
      Math.max(54 * scale, textWidth(tag.label) + 18 * scale) + 7 * scale;
    if (used + w > available) {
      lines++;
      used = 0;
    }
    used += w;
  }
  return lines;
}

function drawSectionToggle(cx, cy, size, open) {
  stroke("#000000");
  strokeWeight(Math.max(1.2, 1.8 * layoutScale()));
  line(cx - size * 0.38, cy, cx + size * 0.38, cy);
  if (!open) line(cx, cy - size * 0.38, cx, cy + size * 0.38);
}

function drawPanelScroll(x, y, h, value, maxValue) {
  if (maxValue <= 0 || h <= 0) return;
  const thumbH = Math.max(34, (h * h) / (h + maxValue));
  const thumbY = y + map(value, 0, maxValue, 0, h - thumbH);
  noStroke();
  fill(lightMode ? color(0, 0, 0, 42) : color(255, 255, 255, 45));
  rect(x, y, 3, h, 2);
  fill(COLORS.yellow);
  rect(x - 1, thumbY, 5, thumbH, 2);
}

function drawSavedProducts(x, y, w, scale) {
  const searchX = x + 22 * scale;
  const searchY = y + 18 * scale;
  const searchW = Math.min(240 * scale, w - 150 * scale);
  fill(lightMode ? "#FFFFFF" : "#D9D9D9");
  noStroke();
  rect(searchX, searchY, searchW, 20 * scale, 10 * scale);
  fill(savedSearch.length ? "#000000" : color(80));
  textFont(fontes.robotoCondensed);
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
  textFont(fontes.robotoCondensed);
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

  // Save Ribbon button (needs to be adjusted if it exists, it was inside drawProductInfo)
  const ribbonY = imageH + titleH - 56 * scale;
  const ribbonX = x + w - 168 * scale;
  if (
    selectedProduct &&
    dist(mx, my, ribbonX + 46 * scale, ribbonY + 28 * scale) <= 24 * scale
  ) {
    toggleSavedProduct();
    return true;
  }

  // Vertical Tabs Click
  if (mx >= x && mx <= x + sidebarW && my > imageH + titleH) {
    let clickedY = my - imageH - titleH - 20 * scale;
    let index = Math.floor(clickedY / (75 * scale));
    if (index >= 0 && index < 4) {
      if (index === 3) {
        // "Salvos" tab
        productDetailsActive = false;
      } else {
        productDetailsActive = true;
      }
      savedSearchActive = false;
      return true;
    }
  }

  const barH = Math.round(44 * scale);
  const contentY = imageH + titleH;
  if (!productDetailsActive)
    return savedProductsMousePressed(mx, my, mainX, contentY, mainW, scale);
  detailSectionsMousePressed(mx, my, mainX, contentY, mainW, scale);
  return true;
}

function detailSectionsMousePressed(mx, my, x, contentY, w, scale) {
  const barH = Math.round(44 * scale);
  let y = contentY - detailScroll;
  if (insideRect(mx, my, x, y, w, barH)) {
    materialOpen = !materialOpen;
    return;
  }
  y +=
    barH +
    (materialOpen
      ? detailSectionContentHeight(
          w,
          "material",
          selectedProduct ? selectedProduct.materialDescription : "",
          scale,
        )
      : 0);
  if (insideRect(mx, my, x, y, w, barH)) {
    techniqueOpen = !techniqueOpen;
    return;
  }
  y +=
    barH +
    (techniqueOpen
      ? detailSectionContentHeight(
          w,
          "tecnicas",
          selectedProduct
            ? selectedProduct.origin === "brasileiro"
              ? selectedProduct.economicContext
              : selectedProduct.composition
            : "",
          scale,
        )
      : 0);
  if (insideRect(mx, my, x, y, w, barH)) aestheticOpen = !aestheticOpen;
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
      productDetailsActive = true;
      return true;
    }
  }
  return true;
}

function productPanelWheel(event) {
  const x = productPanelX();
  const w = productPanelW();
  const scale = layoutScale();
  const contentY =
    Math.round(337 * scale) +
    Math.round(80 * scale) +
    Math.round(55 * scale) +
    2;
  if (mouseX < x || mouseX > x + w || mouseY < contentY) return false;
  if (productDetailsActive) {
    const barH = Math.round(44 * scale);
    const visibleH = height - contentY;
    const contentH = detailsContentHeight(w, barH, scale);
    const maxScroll = Math.max(0, contentH - visibleH);
    detailScroll = constrain(detailScroll + event.delta * 0.45, 0, maxScroll);
  } else {
    savedScroll = Math.max(0, savedScroll + event.delta * 0.45);
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
