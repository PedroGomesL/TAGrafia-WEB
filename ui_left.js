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

  // Title (Figma: Afacad Flux, 24px, weight 600, color #000, text-align center)
  fill("#000000");
  noStroke();
  drawingContext.save();
  drawingContext.font = "600 24px 'Afacad Flux', sans-serif";
  drawingContext.fillStyle = "#000000";
  drawingContext.textAlign = "center";
  drawingContext.textBaseline = "middle";
  drawingContext.fillText("TAGrafia", LAYOUT_NAV_W / 2, 40);
  drawingContext.restore();

  // Divider
  stroke("#959fff");
  strokeWeight(1.5);
  line(15, 75, LAYOUT_NAV_W - 15, 75);

  const currentView = VIEWS_CONFIG.find((v) => v.id === activeView);
  const dynamicViewIcon = currentView ? icones[currentView.iconKey] : icones.visao_circular;

  const scl = filterPanelScale();
  const mx = mouseX / scl;
  const my = mouseY / scl;

  const isExtended = typeof leftPanelExtendedOpen === "undefined" || leftPanelExtendedOpen;

  for (const item of NAV_CONFIG) {
    const active = isExtended && leftPanelTab === item.id;
    const icon = item.iconKey ? icones[item.iconKey] : dynamicViewIcon;
    const hover = mx >= 0 && mx <= LAYOUT_NAV_W && my >= item.y - 30 && my <= item.y + 30;

    if (hover && typeof requestCursor === "function") {
      requestCursor(HAND);
    }

    // Draw background if active or hovered
    if (active) {
      noStroke();
      fill("#959fff");
      rect(LAYOUT_NAV_W / 2 - 25, item.y - 25, 50, 50, 10);
    } else if (hover) {
      noStroke();
      fill(0, 0, 0, 15);
      rect(LAYOUT_NAV_W / 2 - 25, item.y - 25, 50, 50, 10);
    }

    // Icon
    const iconSz = item.iconSize || 40;
    if (icon) {
      drawImageCentered(icon, LAYOUT_NAV_W / 2, item.y, iconSz, iconSz);
    } else {
      // Fallback if missing
      noFill();
      stroke(active ? 255 : 0);
      strokeWeight(2);
      circle(LAYOUT_NAV_W / 2, item.y, iconSz * 0.75);
    }

    // Text
    noStroke();
    fill(0);
    textFont(fontes.roboto);
    textSize(14);
    textAlign(CENTER, TOP);
    text(item.label, LAYOUT_NAV_W / 2, item.y + 35);
  }

  // Divider between Exportar and Sobre
  stroke("#959fff");
  strokeWeight(1.5);
  line(15, 420, LAYOUT_NAV_W - 15, 420);

  pop();
}

function drawFilterCards() {
  push();
  // Draw the blue cross
  stroke("#959fff");
  strokeWeight(1.5);
  line(107, 88, 107, 207); // Vertical
  line(47, 148, 166, 148); // Horizontal
  pop();

  const scl = filterPanelScale();
  const mx = mouseX / scl - LAYOUT_NAV_W;
  const my = mouseY / scl;

  for (const dimKey of Object.keys(DIMENSIONS)) {
    const dim = DIMENSIONS[dimKey];
    const active = activeDimension === dimKey;
    const cx = dim.gridX;
    const cy = dim.gridY;
    const hover = mx >= cx - 12 && mx <= cx + 62 && my >= cy && my <= cy + 90;

    if (hover && typeof requestCursor === "function") {
      requestCursor(HAND);
    }

    // Background if active or subtle hover
    if (active) {
      noStroke();
      fill(dim.pastelColor);
      rect(cx, cy, 50, 50, 5); // Rounded corners like Figma
    } else if (hover) {
      noStroke();
      fill(dim.pastelColor + "44"); // Soft pastel hover
      rect(cx, cy, 50, 50, 5);
    }

    // Draw icon
    const icon = icones[dim.iconKey];
    if (icon) drawImageCentered(icon, cx + 25, cy + 25, 40, 40);

    // Draw text
    fill("#000000");
    noStroke();
    textFont(fontes.roboto);
    textSize(14);
    textAlign(CENTER, TOP);
    text(dim.label, cx + 25, cy + 60);
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

  // --- Category pill (white bg, radius 5, label centered) ---
  if (activeDimension !== "tipo_obra") {
    const hoverCat = insideRect(mx, my, FILTER_BAR_X, catY, FILTER_BAR_W, 26);
    if (hoverCat && typeof requestCursor === "function") requestCursor(HAND);
    stroke("#D9D9D9");
    strokeWeight(1);
    fill(hoverCat ? "#F4F4F8" : "#FFFFFF");
    rect(FILTER_BAR_X, catY, FILTER_BAR_W, 26, 5);
    const categoryLabel = currentCategoryLabel();
    fill("#000000");
    noStroke();
    textFont(fontes.roboto);
    textSize(fitTextSize(categoryLabel, FILTER_BAR_W - 22, 14, 10));
    textAlign(CENTER, CENTER);
    text(categoryLabel, FILTER_BAR_X + FILTER_BAR_W / 2, catY + 13);
  }

  // --- Search bar ---
  const hoverSearch = insideRect(mx, my, FILTER_BAR_X, searchY, FILTER_BAR_W, 26);
  if (hoverSearch && typeof requestCursor === "function") requestCursor(TEXT);
  stroke("#D9D9D9");
  strokeWeight(1);
  fill(hoverSearch && !tagSearchActive ? "#FAFAFC" : "#FFFFFF");
  rect(FILTER_BAR_X, searchY, FILTER_BAR_W, 26, 5);
  noStroke();
  textFont(fontes.roboto);
  textSize(14);
  textAlign(LEFT, CENTER);
  fill(tagSearch.length ? "#000000" : "#595959");
  text(
    tagSearch.length ? tagSearch : "Pesquisar tag",
    FILTER_BAR_X + 10,
    searchY + 13,
  );
  // Blinking cursor
  if (tagSearchActive && frameCount % 60 < 30) {
    const cx = FILTER_BAR_X + 10 + textWidth(tagSearch);
    stroke("#000000");
    strokeWeight(1);
    line(cx + 2, searchY + 6, cx + 2, searchY + 20);
  }

  // --- Clear button ---
  const hoverClear = insideRect(mx, my, FILTER_BAR_X, clearY, FILTER_BAR_W, 26);
  if (hoverClear && selectedTagKeys.size && typeof requestCursor === "function") requestCursor(HAND);
  noStroke();
  fill(selectedTagKeys.size ? (hoverClear ? "#C8C8C8" : "#D9D9D9") : color(220));
  rect(FILTER_BAR_X, clearY, FILTER_BAR_W, 26, 13);
  drawImageCentered(
    icones.clear,
    FILTER_BAR_X + FILTER_BAR_W / 2,
    clearY + 13,
    20,
    20,
  );

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
  const rowH = 34;
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
      rect(13, y + rowH - 6, LAYOUT_FILTRO_W - 26, 3);
    }
    stroke(lightMode ? color(0, 0, 0, 65) : color(0, 0, 0, 80));
    strokeWeight(0.5);
    line(13, y + rowH - 3, LAYOUT_FILTRO_W - 13, y + rowH - 3);
    fill("#000000");
    noStroke();
    textFont(fontes.roboto);
    textSize(fitTextSize(option.label.toUpperCase(), 225, 14, 10));
    textAlign(LEFT, BASELINE);
    text(option.label.toUpperCase(), FILTER_BAR_X, y + rowH / 2 + 5);
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
  textSize(12);
  const badgeW = badgeText ? Math.max(26, textWidth(badgeText) + 14) : 0;
  const badgeX = LAYOUT_FILTRO_W - badgeW - 14;

  // Tag label
  textSize(fitTextSize(tag.label, badgeX - FILTER_BAR_X - 5, 15, 10));
  textAlign(LEFT, CENTER);
  text(tag.label, FILTER_BAR_X, y + rowH / 2);

  // Badge pill
  if (badgeText) {
    noStroke();
    fill(selected ? color(255, 255, 255, 130) : (isHovered ? color(200, 200, 205, 240) : color(217, 217, 217, 210)));
    rect(badgeX, y + rowH / 2 - 11, badgeW, 22, 11);
    fill(selected ? "#000000" : (isHovered ? "#111111" : "#333333"));
    textSize(12);
    textAlign(CENTER, CENTER);
    text(badgeText, badgeX + badgeW / 2, y + rowH / 2);
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
      if (my >= item.y - 30 && my <= item.y + 30) {
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
  const btnW = 28;
  const btnH = 28;
  const btnX = LAYOUT_FILTRO_W - btnW - 12;
  const btnY = 16;
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
      if (mx >= cx - 12 && mx <= cx + 62 && my >= cy && my <= cy + 90) {
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
      insideRect(mx, my, FILTER_BAR_X, catY, FILTER_BAR_W, 31)
    ) {
      categorySelectorOpen = !categorySelectorOpen;
      tagSearchActive = false;
      return true;
    }
    if (insideRect(mx, my, FILTER_BAR_X, searchY, FILTER_BAR_W, 31)) {
      tagSearchActive = true;
      return true;
    }
    if (insideRect(mx, my, FILTER_BAR_X, clearY, FILTER_BAR_W, 28)) {
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
      activeDimension !== "tipo_obra" &&
      my >= listY
    ) {
      const options = getFilterCategoryOptions(activeDimension);
      const index = Math.floor((my - listY) / 34);
      if (index >= 0 && index < options.length) {
        activeCategoryByDimension[activeDimension] = options[index].value;
        categorySelectorOpen = false;
        tagScroll = 0;
        return true;
      }
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
      const vy = 118 + i * 38;
      if (my >= vy - 6 && my <= vy + 26 && mx >= 20 && mx <= 160) {
        exportViewsSelection[i] = !exportViewsSelection[i];
        return true;
      }
    }

    const dy = 325;
    if (my >= dy && my <= dy + 26 && mx >= 24 && mx <= 168) {
      exportFormatDropdownOpen = !exportFormatDropdownOpen;
      return true;
    }

    const availableFormats = typeof EXPORT_FORMATS !== "undefined" ? EXPORT_FORMATS : ["PDF", "JPG", "SVG"];
    const formats = availableFormats.filter(f => f !== exportFormatSelected);
    const totalMenuH = formats.length * 26;

    if (exportFormatDropdownOpen && exportDropdownAnim > 0.3) {
      for (let i = 0; i < formats.length; i++) {
        const oy = dy + 26 + i * 26;
        if (my >= oy && my <= oy + 26 && mx >= 24 && mx <= 168) {
          exportFormatSelected = formats[i];
          exportFormatDropdownOpen = false;
          return true;
        }
      }
    }

    // Export button click
    const btnY = Math.round(dy + 46 + (totalMenuH + 10) * exportDropdownAnim);
    if (mx >= 24 && mx <= 168 && my >= btnY && my <= btnY + 30) {
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
  textSize(15);
  textAlign(LEFT, TOP);
  text("Selecione as visualizações\npara exportar", 24, 58);

  const views = VIEWS_CONFIG.map((v, i) => ({
    label: v.label,
    y: 118 + i * 38,
    selected: Boolean(exportViewsSelection[i]),
  }));

  for (const v of views) {
    const isViewHover = mx >= 20 && mx <= 180 && my >= v.y - 4 && my <= v.y + 24;
    if (isViewHover && typeof requestCursor === "function") {
      requestCursor(HAND);
    }

    stroke("#6750a4");
    strokeWeight(2);
    if (v.selected) {
      fill("#6750a4");
    } else {
      fill(isViewHover ? "#F2EFF9" : "#FFFFFF");
    }
    rect(24, v.y, 18, 18, 4);

    if (v.selected) {
      stroke(255);
      strokeWeight(2);
      noFill();
      beginShape();
      vertex(28, v.y + 9);
      vertex(32, v.y + 13);
      vertex(38, v.y + 5);
      endShape();
    }

    fill(0);
    noStroke();
    text(v.label, 54, v.y + 2);
  }

  stroke(220);
  strokeWeight(1);
  line(24, 275, LAYOUT_FILTRO_W - 24, 275);

  fill(0);
  noStroke();
  text("Exportar em:", 24, 295);

  // Smooth dropdown animation
  const targetAnim = exportFormatDropdownOpen ? 1 : 0;
  exportDropdownAnim = lerp(exportDropdownAnim, targetAnim, 0.22);
  if (Math.abs(exportDropdownAnim - targetAnim) < 0.005) {
    exportDropdownAnim = targetAnim;
  }

  const dy = 325;
  const isTriggerHover = mx >= 24 && mx <= 168 && my >= dy && my <= dy + 26;
  if (isTriggerHover && typeof requestCursor === "function") {
    requestCursor(HAND);
  }

  stroke("#959fff");
  strokeWeight(1.5);
  fill(isTriggerHover ? "#F6F7FF" : "#FFFFFF");
  rect(24, dy, 144, 26, 4);

  fill(0);
  noStroke();
  text(exportFormatSelected, 30, dy + 5);

  // Animated rotating chevron
  push();
  translate(155, dy + 13);
  rotate(radians(exportDropdownAnim * 180));
  stroke("#959fff");
  strokeWeight(2);
  noFill();
  beginShape();
  vertex(-4.5, -2.5);
  vertex(0, 2.5);
  vertex(4.5, -2.5);
  endShape();
  pop();

  const availableFormats = typeof EXPORT_FORMATS !== "undefined" ? EXPORT_FORMATS : ["PDF", "JPG", "SVG"];
  const formats = availableFormats.filter(f => f !== exportFormatSelected);
  const totalMenuH = formats.length * 26;
  const currentMenuH = totalMenuH * exportDropdownAnim;

  if (currentMenuH > 0.5) {
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(24, dy + 26, 144, currentMenuH);
    drawingContext.clip();

    for (let i = 0; i < formats.length; i++) {
      const oy = dy + 26 + i * 26;
      const isOptHover = mx >= 24 && mx <= 168 && my >= oy && my <= oy + 26 && exportDropdownAnim > 0.3;
      if (isOptHover && typeof requestCursor === "function") {
        requestCursor(HAND);
      }
      stroke("#959fff");
      strokeWeight(1.5);
      fill(isOptHover ? "#EFF2FF" : "#FFFFFF");
      rect(24, oy, 144, 26, 4);

      fill(0, 0, 0, Math.round(exportDropdownAnim * 255));
      noStroke();
      text(formats[i], 30, oy + 5);
    }
    drawingContext.restore();
  }

  // Smoothly animated "Baixar" button position
  const btnY = Math.round(dy + 46 + (totalMenuH + 10) * exportDropdownAnim);
  const isBtnHover = mx >= 24 && mx <= 168 && my >= btnY && my <= btnY + 30;
  if (isBtnHover && typeof requestCursor === "function") {
    requestCursor(HAND);
  }
  const btnBg = isBtnHover ? "#2D39B8" : (typeof COLORS !== "undefined" && COLORS.blue ? COLORS.blue : "#3E4AD3");
  fill(btnBg);
  noStroke();
  rect(24, btnY, 144, 30, 15);

  fill(255);
  textFont(fontes.roboto);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("Baixar", 24 + 72, btnY + 15);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);
}

function drawSobreTab() {
  const scl = filterPanelScale();
  const availableH = height / scl - 70;

  fill(0);
  noStroke();
  textFont(fontes.roboto);
  textSize(15);
  textAlign(LEFT, TOP);
  textLeading(22);

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
  text(txt, 20, 58, LAYOUT_FILTRO_W - 40, contentH + 100);
  pop();

  drawingContext.restore();
}

function drawCollapseButton() {
  const btnW = 28;
  const btnH = 28;
  const btnX = LAYOUT_FILTRO_W - btnW - 12;
  const btnY = 16;
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
    rect(btnX - 2, btnY - 2, btnW + 4, btnH + 4, 6);
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
    // Vector fallback resembling panel collapse icon
    stroke(60);
    strokeWeight(1.8);
    noFill();
    rect(btnX, btnY, btnW, btnH, 5);
    line(btnX + 8, btnY, btnX + 8, btnY + btnH);
    beginShape();
    vertex(btnX + 19, btnY + 8);
    vertex(btnX + 13, btnY + 14);
    vertex(btnX + 19, btnY + 20);
    endShape();
  }

  if (isHover) {
    push();
    fill(20, 20, 24, 230);
    noStroke();
    if (fontes && fontes.roboto) textFont(fontes.roboto);
    textSize(11);
    const tipTxt = "Esconder menu";
    const tw = textWidth(tipTxt);
    const tipW = tw + 14;
    const tipH = 22;
    const tipX = constrain(
      btnX + btnW / 2 - tipW / 2,
      5,
      LAYOUT_FILTRO_W - tipW - 5,
    );
    const tipY = btnY + btnH + 6;
    rect(tipX, tipY, tipW, tipH, 4);
    fill(255);
    textAlign(CENTER, CENTER);
    text(tipTxt, tipX + tipW / 2, tipY + tipH / 2);
    pop();
  }
}
