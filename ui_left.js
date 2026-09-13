function drawFilterPanel() {
  const scl = filterPanelScale();
  push();
  scale(scl);
  noStroke();
  fill(255);
  const isExtended = typeof leftPanelExtendedOpen === "undefined" || leftPanelExtendedOpen;
  const panelW = isExtended ? LAYOUT_NAV_W + LAYOUT_FILTRO_W : LAYOUT_NAV_W;
  rect(0, 0, panelW, height / scl);

  drawNavSidebar();

  if (isExtended) {
    push();
    translate(LAYOUT_NAV_W, 0);
    if (leftPanelTab === "filtros") {
      drawFilterCards();
      drawFilterBody();
    } else if (leftPanelTab === "exportar") {
      drawExportTab();
    } else if (leftPanelTab === "sobre") {
      drawSobreTab();
    }
    drawCollapseButton();
    pop();

    // Draw separator line over everything to ensure uniform thickness
    stroke("#959fff");
    strokeWeight(1.5);
    line(LAYOUT_NAV_W, 0, LAYOUT_NAV_W, height / scl);
  }

  pop();
}

function drawNavSidebar() {
  push();
  noStroke();
  fill(255);
  rect(0, 0, LAYOUT_NAV_W, height / filterPanelScale());

  // Title (Compact Afacad Flux, bold 700)
  fill("#000000");
  noStroke();
  drawingContext.save();
  drawingContext.font = "700 15px 'Afacad Flux', sans-serif";
  drawingContext.fillStyle = "#000000";
  drawingContext.textAlign = "center";
  drawingContext.textBaseline = "middle";
  drawingContext.fillText("TAGrafia", LAYOUT_NAV_W / 2, 28);
  drawingContext.restore();

  // Divider
  stroke("#959fff");
  strokeWeight(1.5);
  line(10, 48, LAYOUT_NAV_W - 10, 48);

  const currentView = VIEWS_CONFIG.find((v) => v.id === activeView);
  const dynamicViewIcon = currentView ? icones[currentView.iconKey] : icones.visao_circular;

  const scl = filterPanelScale();
  const mx = mouseX / scl;
  const my = mouseY / scl;

  const isExtended = typeof leftPanelExtendedOpen === "undefined" || leftPanelExtendedOpen;

  for (const item of NAV_CONFIG) {
    const active = isExtended && leftPanelTab === item.id;
    const icon = item.iconKey ? icones[item.iconKey] : dynamicViewIcon;
    const hover = mx >= 0 && mx <= LAYOUT_NAV_W && my >= item.y - 25 && my <= item.y + 31;

    if (hover && typeof requestCursor === "function") {
      requestCursor(HAND);
    }

    // Draw background if active or hovered
    if (active) {
      noStroke();
      fill("#959fff");
      rect(LAYOUT_NAV_W / 2 - 25, item.y - 25, 50, 56, 6);
    } else if (hover) {
      noStroke();
      fill(0, 0, 0, 15);
      rect(LAYOUT_NAV_W / 2 - 25, item.y - 25, 50, 56, 6);
    }

    // Icon
    const iconSz = item.iconSize || 28;
    if (icon) {
      drawImageCentered(icon, LAYOUT_NAV_W / 2, item.y - 9, iconSz, iconSz);
    } else {
      // Fallback if missing
      noFill();
      stroke(active ? 255 : 0);
      strokeWeight(1.8);
      circle(LAYOUT_NAV_W / 2, item.y - 9, iconSz * 0.75);
    }

    // Text
    noStroke();
    fill(0);
    textFont(fontes.roboto);
    textSize(10);
    textLeading(11);
    textAlign(CENTER, TOP);
    text(item.label, LAYOUT_NAV_W / 2, item.y + 7);

    // Focus visible WCAG
    if (typeof isFocusedElement === "function" && isFocusedElement("nav", item.id)) {
      drawFocusRingRect(LAYOUT_NAV_W / 2 - 25, item.y - 25, 50, 56, 6);
    }
  }

  // Divider between Exportar and Sobre
  stroke("#959fff");
  strokeWeight(1.5);
  line(10, 278, LAYOUT_NAV_W - 10, 278);

  pop();
}

function drawFilterCards() {
  const midX = LAYOUT_FILTRO_W / 2;

  push();
  stroke("#959fff");
  strokeWeight(1.5);

  // 1. Divisor vertical superior entre Tipo e Material (50px, igual à barra horizontal)
  line(midX, 64, midX, 114);

  // 2. Barras horizontais sob os rótulos de Tipo e Material (50px cada)
  const tipoX = DIMENSIONS.tipo_obra.gridX;
  const matX = DIMENSIONS.material.gridX;
  line(tipoX - 2, 134, tipoX + 48, 134);
  line(matX - 2, 134, matX + 48, 134);

  // 3. Divisor vertical inferior entre Estético e Técnica (50px, igual à barra horizontal)
  line(midX, 164, midX, 214);

  // 4. Barra horizontal longa sob Estético e Técnica
  line(28, 246, LAYOUT_FILTRO_W - 28, 246);
  pop();

  const scl = filterPanelScale();
  const mx = mouseX / scl - LAYOUT_NAV_W;
  const my = mouseY / scl;

  for (const dimKey of Object.keys(DIMENSIONS)) {
    const dim = DIMENSIONS[dimKey];
    const active = activeDimension === dimKey;
    const cx = dim.gridX;
    const cy = dim.gridY;
    const hover = mx >= cx - 6 && mx <= cx + 52 && my >= cy && my <= cy + 74;

    if (hover && typeof requestCursor === "function") {
      requestCursor(HAND);
    }

    // Background if active or subtle hover
    if (active) {
      noStroke();
      fill(dim.pastelColor);
      rect(cx, cy, 46, 46, 6);
    } else if (hover) {
      noStroke();
      fill(dim.pastelColor + "44");
      rect(cx, cy, 46, 46, 6);
    }

    // Draw icon
    const icon = icones[dim.iconKey];
    if (icon) drawImageCentered(icon, cx + 23, cy + 21, 35, 35);

    // Draw text
    fill("#000000");
    noStroke();
    textFont(fontes.roboto);
    textSize(11);
    textAlign(CENTER, TOP);
    text(dim.label, cx + 23, cy + 50);

    // Focus visible WCAG
    if (typeof isFocusedElement === "function" && isFocusedElement("dimension", dimKey)) {
      drawFocusRingRect(cx, cy, 46, 46, 6);
    }
  }
}

function drawFilterBody() {
  // White background for entire filter body
  noStroke();
  fill("#FFFFFF");
  rect(
    0,
    FILTER_BODY_Y,
    LAYOUT_FILTRO_W,
    height / filterPanelScale() - FILTER_BODY_Y,
  );

  const catY = FILTER_BODY_Y + FILTER_CAT_OFFSET;
  const searchY = catY + FILTER_SEARCH_OFFSET;
  const clearY = searchY + FILTER_CLEAR_OFFSET;
  const listY = clearY + FILTER_LIST_OFFSET;

  const scl = filterPanelScale();
  const mx = mouseX / scl - LAYOUT_NAV_W;
  const my = mouseY / scl;

  // --- Category pill (white bg, radius 4, label centered) ---
  if (activeDimension !== "tipo_obra") {
    const hoverCat = insideRect(mx, my, FILTER_BAR_X, catY, FILTER_BAR_W, 24);
    if (hoverCat && typeof requestCursor === "function") requestCursor(HAND);
    stroke("#D9D9D9");
    strokeWeight(1);
    fill(hoverCat ? "#F4F4F8" : "#FFFFFF");
    rect(FILTER_BAR_X, catY, FILTER_BAR_W, 24, 4);
    const categoryLabel = currentCategoryLabel();
    fill("#000000");
    noStroke();
    textFont(fontes.roboto);
    textSize(fitTextSize(categoryLabel, FILTER_BAR_W - 24, 12, 9));
    textAlign(CENTER, CENTER);
    text(categoryLabel, FILTER_BAR_X + FILTER_BAR_W / 2 - 4, catY + 12);

    // Subtle dropdown chevron
    stroke("#888888");
    strokeWeight(1.4);
    noFill();
    const arrX = FILTER_BAR_X + FILTER_BAR_W - 10;
    const arrY = catY + 12;
    if (categorySelectorOpen) {
      line(arrX - 3.5, arrY + 2, arrX, arrY - 2);
      line(arrX, arrY - 2, arrX + 3.5, arrY + 2);
    } else {
      line(arrX - 3.5, arrY - 2, arrX, arrY + 2);
      line(arrX, arrY + 2, arrX + 3.5, arrY - 2);
    }
    // Focus visible WCAG
    if (typeof isFocusedElement === "function" && isFocusedElement("category_selector")) {
      drawFocusRingRect(FILTER_BAR_X, catY, FILTER_BAR_W, 24, 4);
    }
  }

  // --- Search bar ---
  const hoverSearch = insideRect(mx, my, FILTER_BAR_X, searchY, FILTER_BAR_W, 24);
  if (hoverSearch && typeof requestCursor === "function") requestCursor(TEXT);
  stroke("#D9D9D9");
  strokeWeight(1);
  fill(hoverSearch && !tagSearchActive ? "#FAFAFC" : "#FFFFFF");
  rect(FILTER_BAR_X, searchY, FILTER_BAR_W, 24, 4);
  noStroke();
  textFont(fontes.roboto);
  textSize(12);
  textAlign(LEFT, CENTER);
  fill(tagSearch.length ? "#000000" : "#595959");
  text(
    tagSearch.length ? tagSearch : "Pesquisar tag",
    FILTER_BAR_X + 8,
    searchY + 12,
  );
  // Blinking cursor
  if (tagSearchActive && frameCount % 60 < 30) {
    const cx = FILTER_BAR_X + 8 + textWidth(tagSearch);
    stroke("#000000");
    strokeWeight(1);
    line(cx + 2, searchY + 4, cx + 2, searchY + 20);
  }
  // Focus visible WCAG
  if (typeof isFocusedElement === "function" && isFocusedElement("tag_search")) {
    drawFocusRingRect(FILTER_BAR_X, searchY, FILTER_BAR_W, 24, 4);
  }

  // --- Clear button ---
  const hoverClear = insideRect(mx, my, FILTER_BAR_X, clearY, FILTER_BAR_W, 24);
  if (hoverClear && selectedTagKeys.size && typeof requestCursor === "function") requestCursor(HAND);
  noStroke();
  fill(selectedTagKeys.size ? (hoverClear ? "#C8C8C8" : "#D9D9D9") : color(220));
  rect(FILTER_BAR_X, clearY, FILTER_BAR_W, 24, 12);
  drawImageCentered(
    icones.clear,
    FILTER_BAR_X + FILTER_BAR_W / 2,
    clearY + 12,
    18,
    18,
  );
  // Focus visible WCAG
  if (typeof isFocusedElement === "function" && isFocusedElement("tag_clear")) {
    drawFocusRingRect(FILTER_BAR_X, clearY, FILTER_BAR_W, 24, 12);
  }

  const maxH = height / filterPanelScale() - 10;
  if (categorySelectorOpen && activeDimension !== "tipo_obra")
    drawCategorySelector(listY, maxH);
  else drawTagList(listY, maxH);
}

function filterListY() {
  return (
    FILTER_BODY_Y +
    FILTER_CAT_OFFSET +
    FILTER_SEARCH_OFFSET +
    FILTER_CLEAR_OFFSET +
    FILTER_LIST_OFFSET
  );
}

function currentCategoryLabel() {
  if (activeDimension === "tipo_obra") return "TAGS ATIVAS";
  const active = activeCategoryByDimension[activeDimension];
  if (active === -2) return "TAGS DISPONIVEIS";
  if (active === -1) return "TAGS ATIVAS";
  const option = categoryOptions(activeDimension)[active];
  return option ? option.label.toUpperCase() : "TAGS ATIVAS";
}

function categoryOptions(dimension) {
  const observed = new Set(
    (tagsByDimension[dimension] || []).map((tag) => tag.category),
  );
  return (CATEGORY_FILTERS[dimension] || [])
    .map(([label]) => ({ label, category: label }))
    .filter((option) => observed.has(option.category))
    .concat(
      observed.has("Sem agrupamento")
        ? [{ label: "Sem agrupamento", category: "Sem agrupamento" }]
        : [],
    );
}

function getFilterCategoryOptions(dimension) {
  return [
    { label: "Tags disponiveis", value: -2 },
    { label: "Tags ativas", value: -1 },
    ...categoryOptions(dimension).map((option, index) => ({
      label: option.label,
      value: index,
    })),
  ];
}

function drawCategorySelector(listY, listBottom) {
  const options = getFilterCategoryOptions(activeDimension);
  const rowH = 28;
  const scl = filterPanelScale();
  const mx = mouseX / scl - LAYOUT_NAV_W;
  const my = mouseY / scl;

  noStroke();
  fill(lightMode ? "#FFFFFF" : "#D9D9D9");
  rect(0, listY - 6, LAYOUT_FILTRO_W, Math.max(0, listBottom - listY + 6));
  for (let i = 0; i < options.length; i++) {
    const y = listY + i * rowH;
    if (y > listBottom) break;
    const option = options[i];
    const active = activeCategoryByDimension[activeDimension] === option.value;
    const isHover = mx >= 0 && mx <= LAYOUT_FILTRO_W && my >= y && my <= y + rowH;

    if (isHover && typeof requestCursor === "function") {
      requestCursor(HAND);
    }

    if (isHover && !active) {
      noStroke();
      fill(0, 0, 0, 12);
      rect(0, y, LAYOUT_FILTRO_W, rowH);
    }

    if (active) {
      noStroke();
      fill("#959fff");
      rect(FILTER_BAR_X, y + rowH - 4, FILTER_BAR_W, 2);
    }
    if (active && typeof isFocusedElement === "function" && isFocusedElement("category_selector")) {
      drawFocusRingRect(FILTER_BAR_X, y + 2, FILTER_BAR_W, rowH - 4, 4);
    }
    stroke(lightMode ? color(0, 0, 0, 45) : color(0, 0, 0, 65));
    strokeWeight(0.5);
    line(FILTER_BAR_X, y + rowH - 1, FILTER_BAR_X + FILTER_BAR_W, y + rowH - 1);
    fill("#000000");
    noStroke();
    textFont(fontes.roboto);
    textSize(fitTextSize(option.label.toUpperCase(), FILTER_BAR_W - 12, 11, 9));
    textAlign(LEFT, CENTER);
    text(option.label.toUpperCase(), FILTER_BAR_X + 2, y + rowH / 2);
  }
}

function drawTagList(listY, listBottom) {
  const tags = tagsToDisplay();
  const maxScroll = Math.max(
    0,
    tags.length * FILTER_TAG_ROW_H - (listBottom - listY),
  );
  tagScroll = constrain(tagScroll, 0, maxScroll);

  // Clip to prevent tags from bleeding outside the list area
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, listY, LAYOUT_FILTRO_W, listBottom - listY);
  drawingContext.clip();

  for (let i = 0; i < tags.length; i++) {
    const y = listY - tagScroll + i * FILTER_TAG_ROW_H;
    if (y + FILTER_TAG_ROW_H < listY || y > listBottom) continue;
    const tag = tags[i];
    tag._index = i; // used by drawFilterTag for alternating stripe
    drawFilterTag(tag, y, FILTER_TAG_ROW_H);
  }

  drawingContext.restore();

  if (maxScroll > 0) {
    const trackX = LAYOUT_FILTRO_W - 5;
    const trackH = listBottom - listY;
    const thumbH = Math.max(34, (trackH * trackH) / (trackH + maxScroll));
    const thumbY = listY + map(tagScroll, 0, maxScroll, 0, trackH - thumbH);
    noStroke();
    fill(lightMode ? color(0, 0, 0, 45) : color(255, 255, 255, 45));
    rect(trackX, listY, 5, trackH, 2.5);
    fill("#959fff");
    rect(trackX, thumbY, 5, thumbH, 2.5);
  }
}

function drawFilterTag(tag, y, rowH) {
  const selected = selectedTagKeys.has(tag.key);
  const dimColor = getDimensionPastelColor(tag.dimension);

  const scl = filterPanelScale();
  const mx = mouseX / scl - LAYOUT_NAV_W;
  const my = mouseY / scl;
  const listY = filterListY();
  const listBottom = height / scl - 10;
  const isHovered = mx >= 0 && mx <= LAYOUT_FILTRO_W && my >= y && my <= y + rowH && my >= listY && my <= listBottom && !categorySelectorOpen;

  if (isHovered && typeof requestCursor === "function") {
    requestCursor(HAND);
  }

  // Base background
  if (selected) {
    noStroke();
    fill(dimColor);
    rect(0, y, LAYOUT_FILTRO_W, rowH);
    
    // Hover highlight overlay on selected tag
    if (isHovered) {
      fill(255, 255, 255, 45);
      rect(0, y, LAYOUT_FILTRO_W, rowH);
    }
    fill("#000000");
  } else {
    noStroke();
    fill(isHovered ? "#F0F2F7" : "#FFFFFF");
    rect(0, y, LAYOUT_FILTRO_W, rowH);
    // Subtle alternating stripe if not hovered
    if (!isHovered && tag._index % 2 === 1) {
      fill(0, 0, 0, 8);
      rect(0, y, LAYOUT_FILTRO_W, rowH);
    }
    fill("#000000");
  }

  // Click animation effect (if recently clicked)
  if (tagClickAnim.has(tag.key)) {
    const animStart = tagClickAnim.get(tag.key);
    const now = typeof millis === "function" ? millis() : Date.now();
    const elapsed = now - animStart;
    const duration = 240;
    if (elapsed < duration) {
      const progress = elapsed / duration;
      // Soft flash across row
      noStroke();
      fill(255, 255, 255, Math.round(180 * (1 - progress)));
      rect(0, y, LAYOUT_FILTRO_W, rowH);

      // Accent color wave on left edge
      const barW = Math.round(4 + Math.sin(progress * Math.PI) * 8);
      fill(getDimensionColor(tag.dimension));
      rect(0, y, barW, rowH);
    } else {
      tagClickAnim.delete(tag.key);
    }
  }

  noStroke();
  textFont(fontes.roboto);
  const badgeText =
    tag.dimension === "tipo_obra"
      ? ""
      : String(countProductsWithTagInCurrentType(tag));
  textSize(11);
  const badgeW = badgeText ? Math.max(20, textWidth(badgeText) + 10) : 0;
  const badgeX = LAYOUT_FILTRO_W - badgeW - 12;

  // Tag label
  textSize(fitTextSize(tag.label, badgeX - FILTER_BAR_X - 5, 12, 9));
  textAlign(LEFT, CENTER);
  text(tag.label, FILTER_BAR_X, y + rowH / 2);

  // Badge pill
  if (badgeText) {
    noStroke();
    fill(selected ? color(255, 255, 255, 130) : (isHovered ? color(200, 200, 205, 240) : color(217, 217, 217, 210)));
    rect(badgeX, y + rowH / 2 - 9, badgeW, 18, 9);
    fill(selected ? "#000000" : (isHovered ? "#111111" : "#333333"));
    textSize(10);
    textAlign(CENTER, CENTER);
    text(badgeText, badgeX + badgeW / 2, y + rowH / 2);
  }

  // Focus visible WCAG
  if (typeof isFocusedTag === "function" && isFocusedTag(tag, tag._index)) {
    drawFocusRingRect(3, y + 2, LAYOUT_FILTRO_W - 6, rowH - 4, 3);
  }
}

function tagsToDisplay() {
  const search = normalizeText(tagSearch);
  return tagsByDimension[activeDimension]
    .filter((tag) => categoryAllowsTag(tag))
    .filter((tag) => !search || normalizeText(tag.label).includes(search))
    .sort(
      (a, b) =>
        Number(selectedTagKeys.has(b.key)) -
          Number(selectedTagKeys.has(a.key)) ||
        b.count - a.count ||
        a.label.localeCompare(b.label, "pt-BR"),
    );
}

function categoryAllowsTag(tag) {
  if (activeDimension === "tipo_obra") return true;
  const active = activeCategoryByDimension[activeDimension];
  if (active === -2) return countProductsWithTagInCurrentType(tag) > 0;
  if (active === -1) return true;
  const option = categoryOptions(activeDimension)[active];
  return option ? tag.category === option.category : true;
}

function filterMousePressed(mxRaw, myRaw) {
  const scale = filterPanelScale();
  let mx = mxRaw / scale;
  const my = myRaw / scale;

  const isExtended = typeof leftPanelExtendedOpen === "undefined" || leftPanelExtendedOpen;
  const currentPanelW = isExtended ? LAYOUT_NAV_W + LAYOUT_FILTRO_W : LAYOUT_NAV_W;

  if (
    mx < 0 ||
    mx > currentPanelW ||
    my < 0 ||
    my > height / scale
  ) {
    tagSearchActive = false;
    return false;
  }

  if (mx < LAYOUT_NAV_W) {
    for (const item of NAV_CONFIG) {
      if (my >= item.y - 25 && my <= item.y + 31) {
        if (item.id === "trocar") {
          activeView = (activeView + 1) % VIEWS_CONFIG.length;
          if (typeof mapState !== "undefined") mapState.dragging = false;
          draggedYearHandle = null;
          hoveredCircularTag = null;
          focusedCircularTagKey = "";
        } else {
          if (isExtended && leftPanelTab === item.id) {
            leftPanelExtendedOpen = false;
          } else {
            leftPanelTab = item.id;
            leftPanelExtendedOpen = true;
            sobreScroll = 0;
          }
        }
        return true;
      }
    }
    return true;
  }

  // If extended panel is collapsed, do not process extended panel clicks
  if (!isExtended) {
    return false;
  }

  // Adjust mx for the Filter area
  mx -= LAYOUT_NAV_W;

  // Check collapse button click at top right of extended panel
  const btnW = 24;
  const btnH = 24;
  const btnX = LAYOUT_FILTRO_W - btnW - 10;
  const btnY = 12;
  if (
    mx >= btnX - 4 &&
    mx <= btnX + btnW + 4 &&
    my >= btnY - 4 &&
    my <= btnY + btnH + 4
  ) {
    leftPanelExtendedOpen = false;
    return true;
  }

  if (leftPanelTab === "filtros") {
    for (const dimKey of Object.keys(DIMENSIONS)) {
      const dim = DIMENSIONS[dimKey];
      const cx = dim.gridX;
      const cy = dim.gridY;
      if (mx >= cx - 6 && mx <= cx + 52 && my >= cy && my <= cy + 74) {
        activeDimension = dimKey;
        tagScroll = 0;
        categorySelectorOpen = false;
        return true;
      }
    }
    const catY = FILTER_BODY_Y + FILTER_CAT_OFFSET;
    const searchY = catY + FILTER_SEARCH_OFFSET;
    const clearY = searchY + FILTER_CLEAR_OFFSET;
    if (
      activeDimension !== "tipo_obra" &&
      insideRect(mx, my, FILTER_BAR_X, catY, FILTER_BAR_W, 24)
    ) {
      categorySelectorOpen = !categorySelectorOpen;
      tagSearchActive = false;
      return true;
    }
    if (insideRect(mx, my, FILTER_BAR_X, searchY, FILTER_BAR_W, 24)) {
      tagSearchActive = true;
      return true;
    }
    if (insideRect(mx, my, FILTER_BAR_X, clearY, FILTER_BAR_W, 24)) {
      selectedTagKeys.clear();
      focusedCircularTagKey = "";
      tagSearch = "";
      tagScroll = 0;
      ensureSelectedVisible();
      return true;
    }
    const listY = filterListY();
    if (
      categorySelectorOpen &&
      activeDimension !== "tipo_obra"
    ) {
      if (my >= listY) {
        const options = getFilterCategoryOptions(activeDimension);
        const index = Math.floor((my - listY) / 28);
        if (index >= 0 && index < options.length) {
          activeCategoryByDimension[activeDimension] = options[index].value;
          tagScroll = 0;
        }
        categorySelectorOpen = false;
        return true;
      }
      categorySelectorOpen = false;
    }
    if (my >= listY) {
      const tags = tagsToDisplay();
      const index = Math.floor((my - listY + tagScroll) / FILTER_TAG_ROW_H);
      if (index >= 0 && index < tags.length) {
        const tag = tags[index];
        if (selectedTagKeys.has(tag.key)) selectedTagKeys.delete(tag.key);
        else selectedTagKeys.add(tag.key);
        if (!selectedTagKeys.has(focusedCircularTagKey))
          focusedCircularTagKey = "";
        ensureSelectedVisible();
        tagClickAnim.set(tag.key, typeof millis === "function" ? millis() : Date.now());
        return true;
      }
    }
  } else if (leftPanelTab === "exportar") {
    // Export tab interaction
    for (let i = 0; i < VIEWS_CONFIG.length; i++) {
      const vy = 108 + i * 32;
      if (my >= vy - 4 && my <= vy + 24 && mx >= FILTER_BAR_X - 4 && mx <= FILTER_BAR_X + FILTER_BAR_W) {
        exportViewsSelection[i] = !exportViewsSelection[i];
        return true;
      }
    }

    const dy = 286;
    if (my >= dy && my <= dy + 24 && mx >= FILTER_BAR_X && mx <= FILTER_BAR_X + FILTER_BAR_W) {
      exportFormatDropdownOpen = !exportFormatDropdownOpen;
      return true;
    }

    const availableFormats = typeof EXPORT_FORMATS !== "undefined" ? EXPORT_FORMATS : ["PDF", "JPG", "SVG"];
    const formats = availableFormats.filter(f => f !== exportFormatSelected);
    const totalMenuH = formats.length * 24;

    if (exportFormatDropdownOpen && exportDropdownAnim > 0.3) {
      for (let i = 0; i < formats.length; i++) {
        const oy = dy + 24 + i * 24;
        if (my >= oy && my <= oy + 24 && mx >= FILTER_BAR_X && mx <= FILTER_BAR_X + FILTER_BAR_W) {
          exportFormatSelected = formats[i];
          exportFormatDropdownOpen = false;
          return true;
        }
      }
    }

    // Export button click
    const btnY = Math.round(dy + 38 + (totalMenuH + 8) * exportDropdownAnim);
    if (mx >= FILTER_BAR_X && mx <= FILTER_BAR_X + FILTER_BAR_W && my >= btnY && my <= btnY + 28) {
      if (exportFormatSelected === "JPG") {
        saveCanvas("tagrafia-visualizacao", "jpg");
      } else {
        console.log("Exporting to " + exportFormatSelected);
      }
      exportFormatDropdownOpen = false;
      return true;
    }

    if (exportFormatDropdownOpen) {
      exportFormatDropdownOpen = false; // click outside closes it
      return true;
    }
  }

  return true;
}

// -- NEW TABS --

function drawExportTab() {
  const scl = filterPanelScale();
  const mx = mouseX / scl - LAYOUT_NAV_W;
  const my = mouseY / scl;

  fill(0);
  noStroke();
  textFont(fontes.roboto);
  textSize(13);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text("Selecione as visualizações\npara exportar", FILTER_BAR_X, 58);
  textStyle(NORMAL);

  const views = VIEWS_CONFIG.map((v, i) => ({
    label: v.label,
    y: 108 + i * 32,
    selected: Boolean(exportViewsSelection[i]),
  }));

  for (const v of views) {
    const isViewHover = mx >= FILTER_BAR_X - 4 && mx <= FILTER_BAR_X + FILTER_BAR_W && my >= v.y - 4 && my <= v.y + 22;
    if (isViewHover && typeof requestCursor === "function") {
      requestCursor(HAND);
    }

    stroke("#6750a4");
    strokeWeight(1.5);
    if (v.selected) {
      fill("#6750a4");
    } else {
      fill(isViewHover ? "#F2EFF9" : "#FFFFFF");
    }
    rect(FILTER_BAR_X, v.y, 16, 16, 3);

    if (v.selected) {
      stroke(255);
      strokeWeight(1.8);
      noFill();
      beginShape();
      vertex(FILTER_BAR_X + 3.5, v.y + 8);
      vertex(FILTER_BAR_X + 7, v.y + 11.5);
      vertex(FILTER_BAR_X + 12.5, v.y + 4.5);
      endShape();
    }

    fill(0);
    noStroke();
    textFont(fontes.roboto);
    textSize(11);
    textAlign(LEFT, CENTER);
    text(v.label, FILTER_BAR_X + 24, v.y + 8);

    // Focus visible WCAG
    if (typeof isFocusedElement === "function" && isFocusedElement("export_view", undefined, i)) {
      drawFocusRingRect(FILTER_BAR_X - 2, v.y - 2, 20, 20, 4);
    }
  }

  stroke(220);
  strokeWeight(1);
  line(FILTER_BAR_X, 248, FILTER_BAR_X + FILTER_BAR_W, 248);

  fill(0);
  noStroke();
  textFont(fontes.roboto);
  textSize(11);
  textAlign(LEFT, TOP);
  text("Exportar em:", FILTER_BAR_X, 264);

  // Smooth dropdown animation
  const targetAnim = exportFormatDropdownOpen ? 1 : 0;
  exportDropdownAnim = lerp(exportDropdownAnim, targetAnim, 0.22);
  if (Math.abs(exportDropdownAnim - targetAnim) < 0.005) {
    exportDropdownAnim = targetAnim;
  }

  const dy = 286;
  const isTriggerHover = mx >= FILTER_BAR_X && mx <= FILTER_BAR_X + FILTER_BAR_W && my >= dy && my <= dy + 24;
  if (isTriggerHover && typeof requestCursor === "function") {
    requestCursor(HAND);
  }

  stroke("#959fff");
  strokeWeight(1.2);
  fill(isTriggerHover ? "#F6F7FF" : "#FFFFFF");
  rect(FILTER_BAR_X, dy, FILTER_BAR_W, 24, 4);

  fill(0);
  noStroke();
  textFont(fontes.roboto);
  textSize(11);
  textAlign(LEFT, CENTER);
  text(exportFormatSelected, FILTER_BAR_X + 8, dy + 12);

  // Focus visible WCAG
  if (typeof isFocusedElement === "function" && isFocusedElement("export_format")) {
    drawFocusRingRect(FILTER_BAR_X, dy, FILTER_BAR_W, 24, 4);
  }

  // Animated rotating chevron
  push();
  translate(FILTER_BAR_X + FILTER_BAR_W - 14, dy + 12);
  rotate(radians(exportDropdownAnim * 180));
  stroke("#959fff");
  strokeWeight(1.8);
  noFill();
  beginShape();
  vertex(-4, -2);
  vertex(0, 2);
  vertex(4, -2);
  endShape();
  pop();

  const availableFormats = typeof EXPORT_FORMATS !== "undefined" ? EXPORT_FORMATS : ["PDF", "JPG", "SVG"];
  const formats = availableFormats.filter(f => f !== exportFormatSelected);
  const totalMenuH = formats.length * 24;
  const currentMenuH = totalMenuH * exportDropdownAnim;

  if (currentMenuH > 0.5) {
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(FILTER_BAR_X, dy + 24, FILTER_BAR_W, currentMenuH);
    drawingContext.clip();

    for (let i = 0; i < formats.length; i++) {
      const oy = dy + 24 + i * 24;
      const isOptHover = mx >= FILTER_BAR_X && mx <= FILTER_BAR_X + FILTER_BAR_W && my >= oy && my <= oy + 24 && exportDropdownAnim > 0.3;
      if (isOptHover && typeof requestCursor === "function") {
        requestCursor(HAND);
      }
      stroke("#959fff");
      strokeWeight(1.2);
      fill(isOptHover ? "#EFF2FF" : "#FFFFFF");
      rect(FILTER_BAR_X, oy, FILTER_BAR_W, 24, 4);

      fill(0, 0, 0, Math.round(exportDropdownAnim * 255));
      noStroke();
      textFont(fontes.roboto);
      textSize(11);
      textAlign(LEFT, CENTER);
      text(formats[i], FILTER_BAR_X + 8, oy + 12);
    }
    drawingContext.restore();
  }

  // Smoothly animated "Baixar" button position
  const btnY = Math.round(dy + 38 + (totalMenuH + 8) * exportDropdownAnim);
  const isBtnHover = mx >= FILTER_BAR_X && mx <= FILTER_BAR_X + FILTER_BAR_W && my >= btnY && my <= btnY + 28;
  if (isBtnHover && typeof requestCursor === "function") {
    requestCursor(HAND);
  }
  const btnBg = isBtnHover ? "#2D39B8" : (typeof COLORS !== "undefined" && COLORS.blue ? COLORS.blue : "#3E4AD3");
  fill(btnBg);
  noStroke();
  rect(FILTER_BAR_X, btnY, FILTER_BAR_W, 28, 14);

  fill(255);
  textFont(fontes.roboto);
  textStyle(BOLD);
  textSize(12);
  textAlign(CENTER, CENTER);
  text("Baixar", FILTER_BAR_X + FILTER_BAR_W / 2, btnY + 14);
  textStyle(NORMAL);

  // Focus visible WCAG
  if (typeof isFocusedElement === "function" && isFocusedElement("export_button")) {
    drawFocusRingRect(FILTER_BAR_X, btnY, FILTER_BAR_W, 28, 14);
  }
}

function drawSobreTab() {
  const scl = filterPanelScale();
  const availableH = height / scl - 70;

  fill(0);
  noStroke();
  textFont(fontes.roboto);
  textSize(12);
  textAlign(LEFT, TOP);
  textLeading(18);

  let txt =
    "Projeto de Conclusão de Curso\n\n" +
    "Este projeto foi desenvolvido entre 03/2025 e 06/2026, sob a orientação do professor José Neto de Faria.\n\n" +
    "Neste trabalho, planejei e descrevi as etapas de desenvolvimento de sistemas de visualização com base nos 5 Planos de Garrett.\n\n" +
    "Explorei aspectos da visualização de dados, tipos de dados, seu valor na geração de informações e a etapa de limpeza dos dados.\n\n" +
    "Outro passo igualmente importante foi a produção das visualizações, integrando-as aos dados para representar correlações e semelhanças entre obras de design.\n\n" +
    "Disponibilizarei um link com o detalhamento da metodologia, a qual pode ser aplicada a qualquer outro projeto.";

  const contentH = 460;
  sobreScroll = constrain(sobreScroll, 0, Math.max(0, contentH - availableH));

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, 58, LAYOUT_FILTRO_W, availableH);
  drawingContext.clip();

  push();
  translate(0, -sobreScroll);
  text(txt, FILTER_BAR_X, 58, LAYOUT_FILTRO_W - FILTER_BAR_X * 2, contentH + 100);
  pop();

  drawingContext.restore();

  if (contentH > availableH) {
    const trackX = LAYOUT_FILTRO_W - 5;
    const thumbH = Math.max(30, (availableH * availableH) / contentH);
    const thumbY = 58 + map(sobreScroll, 0, contentH - availableH, 0, availableH - thumbH);
    noStroke();
    fill(lightMode ? color(0, 0, 0, 45) : color(255, 255, 255, 45));
    rect(trackX, 58, 4, availableH, 2);
    fill("#959fff");
    rect(trackX, thumbY, 4, thumbH, 2);
  }

  // Focus visible WCAG
  if (typeof isFocusedElement === "function" && isFocusedElement("sobre_content")) {
    drawFocusRingRect(FILTER_BAR_X - 4, 54, LAYOUT_FILTRO_W - FILTER_BAR_X * 2 + 8, availableH + 4, 4);
  }
}

function drawCollapseButton() {
  const btnW = 24;
  const btnH = 24;
  const btnX = LAYOUT_FILTRO_W - btnW - 10;
  const btnY = 12;
  const scl = filterPanelScale();
  const mx = mouseX / scl - LAYOUT_NAV_W;
  const my = mouseY / scl;
  const isHover =
    mx >= btnX - 4 &&
    mx <= btnX + btnW + 4 &&
    my >= btnY - 4 &&
    my <= btnY + btnH + 4;

  if (isHover && typeof requestCursor === "function") {
    requestCursor(HAND);
  }

  if (isHover) {
    noStroke();
    fill(0, 0, 0, 15);
    rect(btnX - 2, btnY - 2, btnW + 4, btnH + 4, 4);
  }

  // Focus visible WCAG
  if (typeof isFocusedElement === "function" && isFocusedElement("collapse")) {
    drawFocusRingRect(btnX - 2, btnY - 2, btnW + 4, btnH + 4, 4);
  }

  if (icones && icones.collapse_panel) {
    drawImageCentered(
      icones.collapse_panel,
      btnX + btnW / 2,
      btnY + btnH / 2,
      22,
      22,
    );
  } else {
    // Vector fallback resembling the chevron icon from Figma (keyboard_arrow_left)
    stroke(60);
    strokeWeight(1.8);
    noFill();
    strokeCap(ROUND);
    strokeJoin(ROUND);
    const cx = btnX + btnW / 2;
    const cy = btnY + btnH / 2;
    beginShape();
    vertex(cx + 3, cy - 5.5);
    vertex(cx - 3, cy);
    vertex(cx + 3, cy + 5.5);
    endShape();
  }

  if (isHover) {
    push();
    fill(20, 20, 24, 230);
    noStroke();
    if (fontes && fontes.roboto) textFont(fontes.roboto);
    textSize(10);
    const tipTxt = "Esconder menu";
    const tw = textWidth(tipTxt);
    const tipW = tw + 12;
    const tipH = 20;
    const tipX = constrain(
      btnX + btnW / 2 - tipW / 2,
      5,
      LAYOUT_FILTRO_W - tipW - 5,
    );
    const tipY = btnY + btnH + 5;
    rect(tipX, tipY, tipW, tipH, 4);
    fill(255);
    textAlign(CENTER, CENTER);
    text(tipTxt, tipX + tipW / 2, tipY + tipH / 2);
    pop();
  }
}
