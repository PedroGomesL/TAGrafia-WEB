function drawFilterPanel() {
  const scl = filterPanelScale();
  push();
  scale(scl);
  noStroke();
  fill(255);
  rect(0, 0, LAYOUT_NAV_W + LAYOUT_FILTRO_W, height / scl);

  drawNavSidebar();

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
  pop();

  pop();
}

function drawNavSidebar() {
  push();
  noStroke();
  fill(255);
  rect(0, 0, LAYOUT_NAV_W, height / filterPanelScale());

  // Title
  fill(0);
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("TAGrafia", LAYOUT_NAV_W / 2, 40);
  textStyle(NORMAL);

  // Divider
  stroke("#959fff");
  strokeWeight(1.5);
  line(15, 75, LAYOUT_NAV_W - 15, 75);

  let dynamicViewIcon;
  if (activeView === 0) dynamicViewIcon = icones.visao_circular;
  else if (activeView === 1) dynamicViewIcon = icones.visao_bolhas;
  else if (activeView === 2) dynamicViewIcon = icones.visao_timeline;
  else dynamicViewIcon = icones.visao_mapa;

  const navItems = [
    { id: "filtros", label: "Filtros", y: 130, icon: icones.filtros },
    { id: "trocar", label: "Trocar\nVisualização", y: 240, icon: dynamicViewIcon },
    { id: "exportar", label: "Exportar", y: 350, icon: icones.export },
    { id: "sobre", label: "Sobre", y: 460, icon: icones.sobre },
  ];

  for (const item of navItems) {
    const active = leftPanelTab === item.id || (item.id === "trocar" && false); // no active state background for "trocar" as it's an action

    // Draw background if active
    if (active) {
      noStroke();
      fill("#959fff");
      rect(LAYOUT_NAV_W / 2 - 25, item.y - 25, 50, 50, 10);
    }

    // Icon
    if (item.icon) {
      // Invert color conceptually (since we can't easily tint() white for icons if they are black images, we might use them as is).
      drawImageCentered(item.icon, LAYOUT_NAV_W / 2, item.y, 40, 40);
    } else {
      // Fallback if missing
      noFill();
      stroke(active ? 255 : 0);
      strokeWeight(2);
      circle(LAYOUT_NAV_W / 2, item.y, 30);
    }

    // Text
    noStroke();
    fill(0);
    textFont(fontes.roboto);
    textSize(14);
    textAlign(CENTER, TOP);
    text(item.label, LAYOUT_NAV_W / 2, item.y + 35);
  }

  // Right border
  stroke("#959fff");
  strokeWeight(1.5);
  line(LAYOUT_NAV_W, 0, LAYOUT_NAV_W, height / filterPanelScale());
  pop();
}

function drawFilterHeader() {
  // O cabeçalho amarelo foi removido no novo design. Deixamos vazio.
}

function drawFilterCards() {
  const cards = [
    ["tipo_obra", "Tipo", icones.tipo_obra, "#ffef95", 28, 20],
    ["material", "Material", icones.material, "#959fff", 126, 20],
    ["estetico", "Estético", icones.estetico, "#ff9597", 28, 120],
    ["tecnicas", "Técnica", icones.tecnicas, "#a7ff95", 126, 120],
  ];

  push();
  // Draw the blue cross
  stroke("#959fff");
  strokeWeight(1.5);
  line(107, 50, 107, 169); // Vertical
  line(47, 110, 166, 110); // Horizontal
  pop();

  for (let i = 0; i < cards.length; i++) {
    const [dim, label, icon, bgColor, cx, cy] = cards[i];
    const active = activeDimension === dim;

    // Background ONLY if active (as per previous request)
    if (active) {
      noStroke();
      fill(bgColor);
      rect(cx, cy, 50, 50, 5); // Rounded corners like Figma
    }

    // Draw icon
    if (icon) drawImageCentered(icon, cx + 25, cy + 25, 40, 40);

    // Draw text
    fill("#000000");
    noStroke();
    textFont(fontes.roboto);
    textSize(14);
    textAlign(CENTER, TOP);
    text(label, cx + 25, cy + 60);
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

  // --- Category pill (white bg, radius 5, label centered) ---
  if (activeDimension !== "tipo_obra") {
    stroke("#D9D9D9");
    strokeWeight(1);
    fill("#FFFFFF");
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
  stroke("#D9D9D9");
  strokeWeight(1);
  fill("#FFFFFF");
  rect(FILTER_BAR_X, searchY, FILTER_BAR_W, 26, 5);
  noStroke();
  textFont(fontes.roboto);
  textSize(14);
  textAlign(LEFT, CENTER);
  fill(tagSearch.length ? "#000000" : color(160));
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
  noStroke();
  fill(selectedTagKeys.size ? "#D9D9D9" : color(220));
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

function drawCategorySelector(listY, listBottom) {
  const options = [
    { label: "Tags disponiveis", value: -2 },
    { label: "Tags ativas", value: -1 },
    ...categoryOptions(activeDimension).map((option, index) => ({
      label: option.label,
      value: index,
    })),
  ];
  const rowH = 34;
  noStroke();
  fill(lightMode ? "#FFFFFF" : "#D9D9D9");
  rect(0, listY - 6, LAYOUT_FILTRO_W, Math.max(0, listBottom - listY + 6));
  for (let i = 0; i < options.length; i++) {
    const y = listY + i * rowH;
    if (y > listBottom) break;
    const option = options[i];
    const active = activeCategoryByDimension[activeDimension] === option.value;
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
    textFont(fontes.newAmsterdam);
    textSize(fitTextSize(option.label, 225, 16, 10));
    textAlign(LEFT, BASELINE);
    text(option.label, FILTER_BAR_X, y + rowH / 2 + 5);
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

  const DIM_COLORS = {
    material:  "#959fff",
    tecnicas:  "#a7ff95",
    estetico:  "#ff9597",
    tipo_obra: "#ffef95",
  };
  const dimColor = DIM_COLORS[tag.dimension] || "#959fff";

  if (selected) {
    // Full row colored background
    noStroke();
    fill(dimColor);
    rect(0, y, LAYOUT_FILTRO_W, rowH);
    // Left accent strip (4px)
    fill("#959fff");
    rect(0, y, 4, rowH);
    
    // Use black text for all light pastel backgrounds
    fill("#000000");
  } else {
    noStroke();
    fill("#FFFFFF");
    rect(0, y, LAYOUT_FILTRO_W, rowH);
    // Subtle alternating stripe
    if (tag._index % 2 === 1) {
      fill(0, 0, 0, 8);
      rect(0, y, LAYOUT_FILTRO_W, rowH);
    }
    fill("#000000");
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
    fill(selected ? color(255, 255, 255, 120) : color(217, 217, 217, 210));
    rect(badgeX, y + rowH / 2 - 11, badgeW, 22, 11);
    fill(selected ? "#000000" : color(80));
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

function countProductsWithTagInCurrentType(tag) {
  if (_cachedTagCounts) {
    const cached = _cachedTagCounts.get(tag.key);
    if (cached !== undefined) return cached;
  }

  if (!_cachedTagCounts) {
    _cachedTagCounts = new Map();
    const typeTags = selectedTags().filter(
      (item) => item.dimension === "tipo_obra",
    );
    if (!typeTags.length) {
      // No type filter — all tags use their raw count
      for (const [key, t] of tagsByKey) _cachedTagCounts.set(key, t.count);
    } else {
      // Pre-compute counts for all tags at once
      const counters = new Map();
      for (const product of products) {
        if (!typeTags.some((typeTag) => product.tagKeys.has(typeTag.key)))
          continue;
        for (const key of product.tagKeys) {
          counters.set(key, (counters.get(key) || 0) + 1);
        }
      }
      for (const [key] of tagsByKey)
        _cachedTagCounts.set(key, counters.get(key) || 0);
    }
  }

  return _cachedTagCounts.get(tag.key) || 0;
}

function filterMousePressed(mxRaw, myRaw) {
  const scale = filterPanelScale();
  let mx = mxRaw / scale;
  const my = myRaw / scale;

  if (
    mx < 0 ||
    mx > LAYOUT_NAV_W + LAYOUT_FILTRO_W ||
    my < 0 ||
    my > height / scale
  ) {
    tagSearchActive = false;
    return false;
  }

  if (mx < LAYOUT_NAV_W) {
    // Clicked in the Nav Sidebar
    // Nav Items: Filtros (130), Trocar (240), Exportar (350), Sobre (460)
    if (my >= 100 && my <= 160) {
      leftPanelTab = "filtros";
    } else if (my >= 210 && my <= 270) {
      activeView = (activeView + 1) % 4; // Toggle view
    } else if (my >= 320 && my <= 380) {
      leftPanelTab = "exportar";
    } else if (my >= 430 && my <= 490) {
      leftPanelTab = "sobre";
    }
    return true;
  }

  // Adjust mx for the Filter area
  mx -= LAYOUT_NAV_W;

  if (leftPanelTab === "filtros") {
    const cards = [
      ["tipo_obra", 28, 20],
      ["material", 126, 20],
      ["estetico", 28, 120],
      ["tecnicas", 126, 120],
    ];
    for (const [dim, cx, cy] of cards) {
      if (mx >= cx - 12 && mx <= cx + 62 && my >= cy && my <= cy + 90) {
        activeDimension = dim;
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
      const options = [
        { label: "Tags disponiveis", value: -2 },
        { label: "Tags ativas", value: -1 },
        ...categoryOptions(activeDimension).map((option, index) => ({
          label: option.label,
          value: index,
        })),
      ];
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
        return true;
      }
    }
  } else if (leftPanelTab === "exportar") {
    // Export tab interaction
    const viewsY = [90, 130, 170, 210];
    for (let i = 0; i < viewsY.length; i++) {
      if (my >= viewsY[i] - 10 && my <= viewsY[i] + 28 && mx >= 20 && mx <= 160) {
        exportViewsSelection[i] = !exportViewsSelection[i];
        return true;
      }
    }

    if (my >= 310 && my <= 336) {
      saveCanvas("tagrafia-visualizacao", "pdf"); // pseudo
      return true;
    }
    if (my >= 336 && my <= 362) {
      saveCanvas("tagrafia-visualizacao", "jpg");
      return true;
    }
    if (my >= 362 && my <= 388) {
      saveCanvas("tagrafia-visualizacao", "svg"); // pseudo
      return true;
    }
  }

  return true;
}

// -- NEW TABS --

function drawExportTab() {
  fill(0);
  noStroke();
  textFont(fontes.roboto);
  textSize(15);
  textAlign(LEFT, TOP);
  text("Selecione as visualizações\npara exportar", 24, 30);

  const views = [
    { label: "Circular", y: 90, selected: exportViewsSelection[0] },
    { label: "Bolhas", y: 130, selected: exportViewsSelection[1] },
    { label: "Linha do tempo", y: 170, selected: exportViewsSelection[2] },
    { label: "Mapa-Mundi", y: 210, selected: exportViewsSelection[3] },
  ];

  for (const v of views) {
    stroke("#6750a4");
    strokeWeight(2);
    if (v.selected) {
      fill("#6750a4");
    } else {
      noFill();
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
  line(24, 260, LAYOUT_FILTRO_W - 24, 260);

  fill(0);
  noStroke();
  text("Exportar em:", 24, 280);

  stroke("#959fff");
  strokeWeight(1.5);
  noFill();
  rect(24, 310, 144, 26, 4);
  rect(24, 336, 144, 26, 4);
  rect(24, 362, 144, 26, 4);

  fill(0);
  noStroke();
  text("PDF", 30, 315);
  text("JPG", 30, 341);
  text("SVG", 30, 367);

  // Chevron
  stroke("#959fff");
  strokeWeight(2);
  noFill();
  beginShape();
  vertex(150, 318);
  vertex(155, 323);
  vertex(150, 328);
  endShape();
}

function drawSobreTab() {
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

  text(txt, 20, 20, LAYOUT_FILTRO_W - 40, height);
}
