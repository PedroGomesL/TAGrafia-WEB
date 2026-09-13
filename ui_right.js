let activeProductHeaderTooltip = null;
let _headerHoverHandSet = false;

function drawProductPanel() {
  const x = productPanelX();
  const w = productPanelW();
  const scale = layoutScale();

  const titleH = Math.round((typeof PRODUCT_TITLE_H !== "undefined" ? PRODUCT_TITLE_H : 56) * scale);
  const sidebarW = Math.round((typeof PRODUCT_SIDEBAR_W !== "undefined" ? PRODUCT_SIDEBAR_W : 70) * scale);

  const mainX = x + sidebarW;
  const mainW = w - sidebarW;
  const imageH = Math.round((typeof PRODUCT_IMAGE_H !== "undefined" ? PRODUCT_IMAGE_H : 190) * scale);

  noStroke();
  fill("#FFFFFF");
  rect(x, 0, w, height);

  // 1. Top Image
  drawProductImage(x, 0, w, imageH, scale);

  // 2. Title Below Image
  drawProductInfo(x, imageH, w, titleH, scale);

  if (selectedProduct) {
    // 3. Left Sidebar
    drawProductSidebar(x, imageH + titleH, sidebarW, height - imageH - titleH, scale);

    // 4. Details / Content
    if (rightPanelTab === "salvos") {
      drawSavedProducts(mainX, imageH + titleH, mainW, scale);
    } else {
      drawProductDetailsNew(mainX, imageH + titleH, mainW, height - imageH - titleH, scale);
    }

    // 5. Crisp vertical separator to the right of the sidebar (drawn over backgrounds to guarantee exact 1.5px stroke without clipping)
    stroke("#959fff");
    strokeWeight(1.5 * scale);
    line(mainX, imageH + titleH, mainX, height);
  }

  // Crisp horizontal separators (drawn over backgrounds to guarantee exact 1.5px stroke without clipping)
  stroke("#959fff");
  strokeWeight(1.5 * scale);
  line(x, imageH, x + w, imageH);
  line(x, imageH + titleH, x + w, imageH + titleH);

  // 6. Tooltip on top of all panel layers
  drawProductHeaderTooltip(scale);
}

function drawProductSidebar(x, y, w, h, scale) {
  fill("#FFFFFF");
  noStroke();
  rect(x, y, w, h);

  const detailTabs = typeof DETAIL_TABS !== "undefined" ? DETAIL_TABS : ["material", "estetico", "tecnicas"];
  const items = detailTabs.map((id) => {
    const dim = getDimension(id) || DIMENSIONS[id];
    return {
      id,
      label: dim.label,
      icon: icones[dim.iconKey],
      color: dim.pastelColor,
    };
  });

  const availableH = height - y;
  const stepY = Math.min(78 * scale, Math.max(50 * scale, (availableH - 24 * scale) / 4.2));
  const topPad = Math.min(20 * scale, Math.max(8 * scale, (availableH - 4 * stepY) / 2));
  const circleD = 42 * scale;
  const iconSz = 26 * scale;
  let currentY = y + topPad;
  for (const item of items) {
    const active = rightPanelTab === item.id || (item.id === "material" && rightPanelTab === "materiais");
    const isHover = mouseX >= x && mouseX <= x + w && mouseY >= currentY - 6 * scale && mouseY <= currentY + (stepY - 8 * scale);

    if (isHover && typeof requestCursor === "function") {
      requestCursor(HAND);
    }

    if (active) {
      fill(item.color);
      noStroke();
      circle(x + w / 2, currentY + 12 * scale, circleD);
    } else if (isHover) {
      fill(item.color + "44");
      noStroke();
      circle(x + w / 2, currentY + 12 * scale, circleD);
    }

    if (item.icon) drawImageCentered(item.icon, x + w / 2, currentY + 12 * scale, iconSz, iconSz);
    fill("#000000");
    noStroke();
    textFont(fontes.roboto);
    textSize(11 * scale);
    textAlign(CENTER, CENTER);
    text(item.label, x + w / 2, currentY + 38 * scale);
    currentY += stepY;
  }

  // Draw separator before "Salvos" exactly centered between Técnica and Salvos
  const salvosY = currentY + 8 * scale;
  const tecBottom = currentY - stepY + 44 * scale;
  const salvosTop = salvosY + 12 * scale - circleD / 2;
  const sepY = Math.round((tecBottom + salvosTop) / 2);

  stroke("#959fff");
  strokeWeight(1.5 * scale);
  line(x + 12 * scale, sepY, x + w - 12 * scale, sepY);

  // Draw "Salvos" button below the separator
  const salvosActive = rightPanelTab === "salvos";
  const salvosHover = mouseX >= x && mouseX <= x + w && mouseY >= salvosY - 6 * scale && mouseY <= salvosY + 56 * scale;
  if (salvosHover && typeof requestCursor === "function") {
    requestCursor(HAND);
  }

  if (salvosActive) {
    fill("#959fff");
    noStroke();
    circle(x + w / 2, salvosY + 12 * scale, circleD);
  } else if (salvosHover) {
    fill("#959fff44");
    noStroke();
    circle(x + w / 2, salvosY + 12 * scale, circleD);
  }

  if (icones.save) drawImageCentered(icones.save, x + w / 2, salvosY + 12 * scale, iconSz, iconSz);
  fill("#000000");
  noStroke();
  textFont(fontes.roboto);
  textSize(11 * scale);
  textAlign(CENTER, CENTER);
  text("Salvos", x + w / 2, salvosY + 38 * scale);
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
    const images = selectedProduct ? productImages(selectedProduct) : [];
    const currentPath = images.length
      ? images[constrain(selectedImageIndex, 0, images.length - 1)]
      : null;
    const isFailed = currentPath && imageCache.get(currentPath) === false;
    text(
      isFailed || !selectedProduct || !images.length
        ? "Imagem não encontrada"
        : "Carregando imagem...",
      x + w / 2,
      y + h / 2,
    );
  }
  
  if (selectedProduct) {
    const images = productImages(selectedProduct);
    if (images.length > 1) {
      const leftBtnHover = dist(mouseX, mouseY, x + 28 * scale, y + h - 28 * scale) <= 18 * scale;
      const rightBtnHover = dist(mouseX, mouseY, x + w - 28 * scale, y + h - 28 * scale) <= 18 * scale;
      if ((leftBtnHover || rightBtnHover) && typeof requestCursor === "function") {
        requestCursor(HAND);
      }

      fill(leftBtnHover ? 255 : color(255, 255, 255, 200));
      noStroke();
      circle(x + 28 * scale, y + h - 28 * scale, 30 * scale);
      fill(rightBtnHover ? 255 : color(255, 255, 255, 200));
      circle(x + w - 28 * scale, y + h - 28 * scale, 30 * scale);
      if (icones.left) drawImageCentered(icones.left, x + 28 * scale, y + h - 28 * scale, 22 * scale, 22 * scale);
      if (icones.right) drawImageCentered(icones.right, x + w - 28 * scale, y + h - 28 * scale, 22 * scale, 22 * scale);
    }
  }
}

function drawProductInfo(x, y, w, h, scale) {
  noStroke();
  fill("#FFFFFF");
  rect(x, y, w, h);

  if (!selectedProduct) {
    activeProductHeaderTooltip = null;
    noStroke();
    fill("#000000");
    textFont(fontes.roboto);
    textSize(13 * scale);
    textAlign(LEFT, CENTER);
    text("Selecione um produto", x + 12 * scale, y + h / 2);
    return;
  }

  const titleY = y + 10 * scale;
  const titleX = x + 18 * scale;
  const titleW = w - 96 * scale;

  const yearText = selectedProduct.year || selectedProduct.dateRaw ? ` (${selectedProduct.year || selectedProduct.dateRaw})` : "";
  const titleWithYear = `${selectedProduct.name}${yearText}`;

  const titleSize = fitTextSize(titleWithYear, titleW, 14 * scale, 10 * scale);

  // Colored strip for origin
  noStroke();
  fill(selectedProduct.origin === "brasileiro" ? COLORS.yellow : COLORS.magenta);
  rect(x + 8 * scale, titleY + 1 * scale, 4 * scale, 30 * scale, 2 * scale);

  // Title area (product name + year)
  fill("#000000");
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(titleSize);
  textAlign(LEFT, TOP);
  text(titleWithYear, titleX, titleY, titleW, 20 * scale);
  textStyle(NORMAL);

  // Author & Origin label
  const originText = typeof getOriginLabel === "function" ? getOriginLabel(selectedProduct.origin) : (selectedProduct.origin === "brasileiro" ? "Brasil" : "Internacional");
  const authorName = selectedProduct.author || "Designer desconhecido";
  const designerAndOrigin = `${authorName} • ${originText}`;
  textFont(fontes.roboto);
  textSize(11 * scale);
  fill("#444444");
  text(designerAndOrigin, titleX, titleY + 18 * scale, titleW, 16 * scale);

  // Icons on the right
  const iconY = y + h / 2;
  const iconRadius = 15 * scale;
  const iconCircleD = 30 * scale;
  const iconImgSize = 20 * scale;
  const iconSaveX = x + w - 24 * scale;
  const iconProdX = x + w - 64 * scale;

  // Draw save icon with circle around it
  const isSaved = selectedProduct && savedProductKeys.has(selectedProduct.key);
  if (isSaved) {
    fill("#959fff");
  } else {
    noFill();
  }
  stroke("#000000");
  strokeWeight(1.2 * scale);
  circle(iconSaveX, iconY, iconCircleD);
  if (icones.save) {
    drawImageCentered(icones.save, iconSaveX, iconY, iconImgSize, iconImgSize);
  }

  // Draw production icon with circle around it
  const prodInfo = getProductionInfo(selectedProduct.production);
  const prodIcon = prodInfo ? icones[prodInfo.iconKey] : null;
  
  if (prodIcon) {
    noFill();
    stroke("#000000");
    strokeWeight(1.2 * scale);
    circle(iconProdX, iconY, iconCircleD);
    drawImageCentered(prodIcon, iconProdX, iconY, iconImgSize, iconImgSize);
  }

  // Tooltip & Hover Detection
  activeProductHeaderTooltip = null;
  const hoverSave = dist(mouseX, mouseY, iconSaveX, iconY) <= iconRadius + 2 * scale;
  const hoverProd = prodIcon && dist(mouseX, mouseY, iconProdX, iconY) <= iconRadius + 2 * scale;
  const hoverOrigin = insideRect(mouseX, mouseY, x + 6 * scale, titleY, 10 * scale, 34 * scale);

  if (hoverSave) {
    activeProductHeaderTooltip = {
      text: isSaved ? "Salvo" : "Salvar",
      targetX: iconSaveX,
      targetY: iconY,
      radius: iconRadius,
      panelX: x,
      panelW: w,
    };
  } else if (hoverProd) {
    const prodTooltip = prodInfo.tooltip || prodInfo.label || "Design assinado";
    activeProductHeaderTooltip = {
      text: prodTooltip,
      targetX: iconProdX,
      targetY: iconY,
      radius: iconRadius,
      panelX: x,
      panelW: w,
    };
  } else if (hoverOrigin) {
    activeProductHeaderTooltip = {
      text: `Origem: ${originText}`,
      targetX: x + 10 * scale,
      targetY: titleY + 16 * scale,
      radius: 8 * scale,
      panelX: x,
      panelW: w,
    };
  }

  if ((hoverSave || hoverProd || hoverOrigin) && typeof requestCursor === "function") {
    requestCursor(HAND);
  }
}

function drawProductHeaderTooltip(scale) {
  if (!activeProductHeaderTooltip) return;

  const { text: tooltipText, targetX, targetY, radius, panelX, panelW } = activeProductHeaderTooltip;
  push();
  textFont(fontes.roboto);
  textStyle(NORMAL);
  textSize(12 * scale);
  const padX = 10 * scale;
  const padY = 5 * scale;
  const tw = textWidth(tooltipText);
  const boxW = Math.round(tw + padX * 2);
  const boxH = Math.round(24 * scale);

  // Position above the circle
  let boxX = Math.round(targetX - boxW / 2);
  let boxY = Math.round(targetY - radius - boxH - 7 * scale);

  // Constrain within right panel boundaries
  boxX = constrain(boxX, panelX + 8 * scale, panelX + panelW - boxW - 8 * scale);

  // Drop shadow
  noStroke();
  fill(0, 0, 0, 40);
  rect(boxX + 1, boxY + 2, boxW, boxH, 4 * scale);

  // Tooltip background
  fill("#1E1E1E");
  noStroke();
  rect(boxX, boxY, boxW, boxH, 4 * scale);

  // Pointer triangle
  const arrowX = constrain(targetX, boxX + 6 * scale, boxX + boxW - 6 * scale);
  const arrowY = boxY + boxH;
  const arrowSize = 5 * scale;
  triangle(
    arrowX - arrowSize, arrowY,
    arrowX + arrowSize, arrowY,
    arrowX, arrowY + arrowSize
  );

  // Tooltip text
  fill("#FFFFFF");
  textAlign(CENTER, CENTER);
  text(tooltipText, boxX + boxW / 2, boxY + boxH / 2);
  pop();
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

  const dim = rightPanelTab === "materiais" ? "material" : rightPanelTab;
  const marginX = x + 12 * scale;
  const contentW = w - 24 * scale;
  let cursorY = y + 10 * scale;

  // ─── Tags section header ───
  fill("#000000");
  noStroke();
  textFont(fontes.roboto);
  textStyle(BOLD);
  textSize(13 * scale);
  textAlign(LEFT, CENTER);
  text("Tags:", marginX, cursorY + 6 * scale);
  textStyle(NORMAL);
  cursorY += 20 * scale;

  // Tag chips
  const tags = selectedProduct.tagsByDimension[dim] || [];
  if (tags.length === 0) {
    fill("#595959");
    textSize(11 * scale);
    textAlign(LEFT, CENTER);
    text("Sem tags nesta categoria", marginX, cursorY + 8 * scale);
    cursorY += 22 * scale;
  } else {
    let cursorX = marginX;
    const maxX = x + w - 12 * scale;
    const chipH = 20 * scale;
    textSize(11 * scale);

    const tagBgColor = getDimensionPastelColor(dim);

    for (const tag of tags) {
      const chipW = Math.max(44 * scale, textWidth(tag.label) + 14 * scale);
      if (cursorX + chipW > maxX) {
        cursorX = marginX;
        cursorY += chipH + 5 * scale;
      }
      noStroke();
      fill(tagBgColor);
      rect(cursorX, cursorY, chipW, chipH, 4);
      fill("#000000");
      textAlign(CENTER, CENTER);
      text(tag.label, cursorX + chipW / 2, cursorY + chipH / 2);
      cursorX += chipW + 5 * scale;
    }
    if (tags.length > 0) cursorY += chipH + 8 * scale;
  }

  // --- Draw horizontal separator between Tags and Detalhes ---
  cursorY += 4 * scale;
  stroke("#959fff");
  strokeWeight(1.5 * scale);
  line(x, cursorY, x + w, cursorY);
  cursorY += 12 * scale;

  // ─── Detalhes section header ───
  fill("#000000");
  noStroke();
  textFont(fontes.roboto);
  textStyle(BOLD);
  textSize(13 * scale);
  textAlign(LEFT, CENTER);
  text("Detalhes:", marginX, cursorY + 6 * scale);
  textStyle(NORMAL);
  cursorY += 20 * scale;

  // Body text
  const textValue = getProductDetailsForDimension(selectedProduct, dim);

  fill("#1B1212");
  textFont(fontes.roboto);
  textSize(12 * scale);
  textLeading(18 * scale);
  textAlign(LEFT, TOP);
  text(textValue, marginX, cursorY, contentW, 2000 * scale);

  pop();
  drawingContext.restore();

  if (contentH > visibleH) {
    drawPanelScroll(x + w - 6 * scale, y, visibleH, detailScroll, contentH - visibleH);
  }
}

function getProductDetailsForDimension(product, dimension) {
  if (!product) return "Nenhum detalhe disponível para esta categoria.";
  const dim = dimension === "materiais" ? "material" : dimension;
  let textValue = "";
  if (dim === "material") textValue = product.materialDescription;
  else if (dim === "tecnicas")
    textValue =
      product.origin === "brasileiro"
        ? product.economicContext
        : product.composition;
  else if (dim === "estetico") textValue = product.aestheticDescription;

  return textValue || "Nenhum detalhe disponível para esta categoria.";
}

function calculateNewDetailsHeight(w, scale) {
  if (!selectedProduct) return 0;
  const dim = rightPanelTab === "materiais" ? "material" : rightPanelTab;
  let h = 14 * scale;
  h += 20 * scale; // "Tags:"
  
  const tags = selectedProduct.tagsByDimension[dim] || [];
  let cursorX = 14 * scale;
  const maxX = w - 14 * scale;
  const chipH = 20 * scale;
  
  for (const tag of tags) {
    const estW = tag.label.length * 7 * scale;
    const chipW = Math.max(44 * scale, estW + 14 * scale);
    if (cursorX + chipW > maxX) {
      cursorX = 14 * scale;
      h += chipH + 5 * scale;
    }
    cursorX += chipW + 5 * scale;
  }
  if (tags.length === 0) {
    h += 22 * scale;
  } else {
    h += chipH + 8 * scale;
  }
  
  h += 18 * scale; // Separator & spacing
  h += 20 * scale; // "Detalhes:"
  
  const textValue = getProductDetailsForDimension(selectedProduct, dim);
  if (textValue) {
    const contentW = w - 24 * scale;
    const charsPerLine = Math.max(20, Math.floor(contentW / (7 * scale)));
    const estimatedLines = Math.ceil(textValue.length / charsPerLine) + (textValue.split('\n').length - 1);
    h += estimatedLines * (18 * scale);
  }
  h += 30 * scale; // Bottom padding
  
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
  const searchH = 24 * scale;
  const searchX = x + 12 * scale;
  const searchY = y + 12 * scale;
  const buttonW = 54 * scale;
  const searchW = Math.max(80 * scale, w - buttonW - 32 * scale);
  const buttonX = searchX + searchW + 8 * scale;
  
  const isSearchHover = insideRect(mouseX, mouseY, searchX, searchY, searchW, searchH);
  if (isSearchHover && typeof requestCursor === "function") {
    requestCursor(TEXT);
  }

  stroke("#D9D9D9");
  strokeWeight(1);
  fill(isSearchHover && !savedSearchActive ? (lightMode ? "#F7F7FA" : "#CCCCCC") : (lightMode ? "#FFFFFF" : "#D9D9D9"));
  rect(searchX, searchY, searchW, searchH, 4);

  fill(savedSearch.length ? "#000000" : "#595959");
  noStroke();
  textFont(fontes.roboto);
  textSize(11 * scale);
  textAlign(LEFT, CENTER);
  text(
    savedSearch.length ? savedSearch : "Digite o nome, tipo ou ano",
    searchX + 10 * scale,
    searchY + searchH / 2,
  );

  // Blinking cursor if search active
  if (savedSearchActive && frameCount % 60 < 30) {
    const cx = searchX + 10 * scale + textWidth(savedSearch);
    stroke("#000000");
    strokeWeight(1);
    line(cx + 2, searchY + 4 * scale, cx + 2, searchY + searchH - 4 * scale);
  }

  const isSortHover = insideRect(mouseX, mouseY, buttonX, searchY, buttonW, searchH);
  if (isSortHover && typeof requestCursor === "function") {
    requestCursor(HAND);
  }

  stroke("#D9D9D9");
  strokeWeight(1);
  fill(isSortHover ? (lightMode ? "#EFEFF4" : "#C4C4C4") : (lightMode ? "#FFFFFF" : "#D9D9D9"));
  rect(buttonX, searchY, buttonW, searchH, 4);

  fill("#000000");
  noStroke();
  textFont(fontes.roboto);
  textSize(11 * scale);
  textAlign(CENTER, CENTER);
  text(savedSortLabel(), buttonX + buttonW / 2, searchY + searchH / 2);

  const items = savedProductsFiltered();
  const gridY = y + 46 * scale;
  const gapX = 8 * scale;
  const gridX = x + 12 * scale;
  const cardW = Math.floor((w - 24 * scale - gapX) / 2);
  const imgBoxH = Math.round(cardW * 0.9);
  const pillH = Math.round(22 * scale);
  const cardH = imgBoxH + 6 * scale + pillH;
  const gapY = 14 * scale;
  const rows = Math.ceil(items.length / 2);
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

  if (!items.length) {
    fill("#595959");
    textFont(fontes.roboto);
    textSize(12 * scale);
    textAlign(CENTER, CENTER);
    text(
      savedSearch.length
        ? "Nenhuma obra encontrada."
        : "Nenhuma obra salva ainda.\nClique no ícone de salvar para adicionar.",
      x + w / 2,
      gridY + 40 * scale,
    );
  }

  for (let i = 0; i < items.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = gridX + col * (cardW + gapX);
    const cy = gridY + row * (cardH + gapY) - savedScroll;
    if (cy + cardH < gridY || cy > height) continue;
    drawSavedCard(items[i], cx, cy, cardW, cardH, scale);
  }

  drawingContext.restore();

  drawPanelScroll(
    x + w - 4,
    gridY + 2,
    height - gridY - 4,
    savedScroll,
    Math.max(0, totalH - (height - gridY)),
  );
}

function drawSavedCard(product, x, y, w, h, scale) {
  const isCardHover = insideRect(mouseX, mouseY, x, y, w, h);
  if (isCardHover && typeof requestCursor === "function") {
    requestCursor(HAND);
  }

  const colorOrigin =
    product.origin === "brasileiro" ? COLORS.yellow : COLORS.magenta;
  const imgBoxH = Math.round(w * 0.9);
  const pillH = Math.round(22 * scale);
  const strokeW = (isCardHover ? 2.2 : 1.6) * scale;

  // White card background
  noStroke();
  fill("#FFFFFF");
  rect(x, y, w, imgBoxH, 6 * scale);

  // Product image (occupies interior)
  const img = getProductImage(product, 0);
  if (img) {
    drawImageContain(
      img,
      x + 4 * scale,
      y + 4 * scale,
      w - 8 * scale,
      imgBoxH - 8 * scale,
    );
  }

  // Stroke with origin color and 90% opacity
  noFill();
  stroke(colorAlpha(colorOrigin, isCardHover ? 255 : 230));
  strokeWeight(strokeW);
  rect(
    x + strokeW / 2,
    y + strokeW / 2,
    w - strokeW,
    imgBoxH - strokeW,
    6 * scale,
  );
  noStroke();

  // Origin pill badge for colorblind accessibility
  const badgeW = 22 * scale;
  const badgeH = 13 * scale;
  const badgeX = x + w - badgeW - 5 * scale;
  const badgeY = y + 5 * scale;
  noStroke();
  fill(product.origin === "brasileiro" ? COLORS.yellow : COLORS.magenta);
  rect(badgeX, badgeY, badgeW, badgeH, 3 * scale);
  fill(product.origin === "brasileiro" ? "#000000" : "#FFFFFF");
  textFont(fontes.roboto);
  textStyle(BOLD);
  textSize(8 * scale);
  textAlign(CENTER, CENTER);
  text(
    product.origin === "brasileiro" ? "BR" : "INT",
    badgeX + badgeW / 2,
    badgeY + badgeH / 2,
  );
  textStyle(NORMAL);

  // Pill for product name
  const pillY = y + imgBoxH + 6 * scale;
  fill(isCardHover ? (lightMode ? "#E8E8EE" : "#333333") : (lightMode ? "#F0F0F0" : "#222222"));
  rect(x, pillY, w, pillH, pillH / 2);

  fill(lightMode ? "#000000" : "#FFFFFF");
  textFont(fontes.roboto);
  textStyle(BOLD);
  textSize(fitTextSize(product.name, w - 10 * scale, 11 * scale, 7.5 * scale));
  textAlign(CENTER, CENTER);
  text(product.name, x + w / 2, pillY + pillH / 2);
  textStyle(NORMAL);
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
    () => imageCache.set(path, false),
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

  const titleH = Math.round((typeof PRODUCT_TITLE_H !== "undefined" ? PRODUCT_TITLE_H : 56) * scale);
  const sidebarW = Math.round((typeof PRODUCT_SIDEBAR_W !== "undefined" ? PRODUCT_SIDEBAR_W : 70) * scale);
  const mainX = x + sidebarW;
  const mainW = w - sidebarW;
  const imageH = Math.round((typeof PRODUCT_IMAGE_H !== "undefined" ? PRODUCT_IMAGE_H : 190) * scale);

  if (mx < x || mx > x + w || my < 0 || my > height) return false;

  // Previous/Next Image buttons
  if (dist(mx, my, x + 28 * scale, imageH - 28 * scale) <= 22 * scale) {
    changeProductImage(-1);
    return true;
  }
  if (dist(mx, my, x + w - 28 * scale, imageH - 28 * scale) <= 22 * scale) {
    changeProductImage(1);
    return true;
  }

  // Save Icon Button Click (in title bar)
  const saveIconY = imageH + titleH / 2;
  const saveIconX = x + w - 24 * scale;
  if (dist(mx, my, saveIconX, saveIconY) <= 18 * scale) {
    toggleSavedProduct();
    return true;
  }

  // Production Icon Click (prevent unselecting or leaking clicks)
  const prodIconX = x + w - 64 * scale;
  if (dist(mx, my, prodIconX, saveIconY) <= 18 * scale) {
    return true;
  }

  // Vertical Tabs Click
  if (mx >= x && mx <= x + sidebarW && my > imageH + titleH) {
    let clickedY = my - imageH - titleH;
    const availableH = height - (imageH + titleH);
    const stepY = Math.min(78 * scale, Math.max(50 * scale, (availableH - 24 * scale) / 4.2));
    const topPad = Math.min(20 * scale, Math.max(8 * scale, (availableH - 4 * stepY) / 2));
    let currentY = topPad;
    
    const tabs = typeof DETAIL_TABS !== "undefined" ? DETAIL_TABS : ["material", "estetico", "tecnicas"];
    for (let i = 0; i < tabs.length; i++) {
      if (clickedY >= currentY - 6 * scale && clickedY <= currentY + (stepY - 8 * scale)) {
        rightPanelTab = tabs[i];
        savedSearchActive = false;
        return true;
      }
      currentY += stepY;
    }
    
    const salvosY = currentY + 8 * scale;
    if (clickedY >= salvosY - 6 * scale && clickedY <= salvosY + 56 * scale) {
      rightPanelTab = "salvos";
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
  const searchH = 24 * scale;
  const searchX = x + 12 * scale;
  const searchY = contentY + 12 * scale;
  const buttonW = 54 * scale;
  const searchW = Math.max(80 * scale, w - buttonW - 32 * scale);
  if (insideRect(mx, my, searchX, searchY, searchW, searchH)) {
    savedSearchActive = true;
    return true;
  }
  savedSearchActive = false;
  const buttonX = searchX + searchW + 8 * scale;
  if (insideRect(mx, my, buttonX, searchY, buttonW, searchH)) {
    savedSortMode = (savedSortMode + 1) % 3;
    savedScroll = 0;
    return true;
  }
  const items = savedProductsFiltered();
  const gridY = contentY + 46 * scale;
  const gapX = 8 * scale;
  const gridX = x + 12 * scale;
  const cardW = Math.floor((w - 24 * scale - gapX) / 2);
  const imgBoxH = Math.round(cardW * 0.9);
  const pillH = Math.round(22 * scale);
  const cardH = imgBoxH + 6 * scale + pillH;
  const gapY = 14 * scale;
  const localY = my - gridY + savedScroll;
  for (let i = 0; i < items.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = gridX + col * (cardW + gapX);
    const cy = row * (cardH + gapY);
    if (mx >= cx && mx <= cx + cardW && localY >= cy && localY <= cy + cardH) {
      selectProduct(items[i]);
      rightPanelTab = "material";
      return true;
    }
  }
  return true;
}

function productPanelWheel(event) {
  const x = productPanelX();
  const w = productPanelW();
  const scale = layoutScale();
  const imageH = Math.round((typeof PRODUCT_IMAGE_H !== "undefined" ? PRODUCT_IMAGE_H : 190) * scale);
  const titleH = Math.round((typeof PRODUCT_TITLE_H !== "undefined" ? PRODUCT_TITLE_H : 56) * scale);
  const sidebarW = Math.round((typeof PRODUCT_SIDEBAR_W !== "undefined" ? PRODUCT_SIDEBAR_W : 70) * scale);
  const contentY = imageH + titleH;
  
  if (mouseX < x || mouseX > x + w || mouseY < contentY) return false;
  
  if (rightPanelTab === "salvos") {
    savedScroll = Math.max(0, savedScroll + event.delta * 0.45);
  } else {
    const visibleH = height - contentY;
    const contentH = calculateNewDetailsHeight(w - sidebarW, scale);
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
  const key = typeof STORAGE_KEYS !== "undefined" ? STORAGE_KEYS.savedProducts : "tagrafia-saved-products";
  try {
    savedProductKeys = new Set(
      JSON.parse(localStorage.getItem(key) || "[]"),
    );
  } catch {
    savedProductKeys = new Set();
  }
}

function persistSavedProducts() {
  const key = typeof STORAGE_KEYS !== "undefined" ? STORAGE_KEYS.savedProducts : "tagrafia-saved-products";
  localStorage.setItem(
    key,
    JSON.stringify(Array.from(savedProductKeys)),
  );
}
