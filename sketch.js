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
    const img = loadImage(asset(path));
    icones_light[key] = img;
    icones[key] = img;
  }

  if (typeof ICONS_DARK_CONFIG !== "undefined") {
    for (const [key, path] of Object.entries(ICONS_DARK_CONFIG)) {
      icones_dark[key] = loadImage(asset(path));
    }
  }
  if (typeof updateActiveIcons === "function") {
    updateActiveIcons();
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

  // WCAG: tornar o canvas acessível e focável por teclado
  if (canvas && canvas.elt) {
    canvas.elt.tabIndex = 0;
    canvas.elt.setAttribute("role", "application");
    canvas.elt.setAttribute("aria-label", "TAGrafia - visualização interativa de design e dados");
    canvas.elt.addEventListener("focus", () => {
      if (!a11yState.focusTarget) {
        const list = getFocusableElements();
        if (list.length) setA11yFocus(list[0]);
      }
      keyboardFocusActive = true;
    });
    canvas.elt.addEventListener("blur", () => {
      keyboardFocusActive = false;
    });
  }

  buildData();
  buildGeoCountries();
  loadSavedProducts();
  selectedProduct = null;

  if (typeof localStorage !== "undefined") {
    try {
      const savedTheme = localStorage.getItem("tagrafia-theme");
      if (savedTheme === "dark") {
        lightMode = false;
        if (typeof updateActiveIcons === "function") updateActiveIcons();
      }
    } catch (e) {}
  }
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
  if (typeof mouseIsPressed !== "undefined" && !mouseIsPressed) {
    draggedYearHandle = null;
    if (typeof mapState !== "undefined") mapState.dragging = false;
  }
  currentFrameCursor = typeof ARROW !== "undefined" ? ARROW : "default";
  hitAreas = [];
  hoveredCircularTag = null;
  _cacheFrame = frameCount;
  _cachedSelectedTags = null;
  _cachedVisibleProducts = null;
  _cachedVisibleProductsNoYear = null;
  _cachedTagCounts = null;
  background(lightMode ? 240 : "#222222");

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
  const scl = filterPanelScale();
  push();
  scale(scl);
  noStroke();
  fill(lightMode ? 255 : "#222222");
  rect(0, 0, width / scl, height / scl);
  push();
  translate(LAYOUT_NAV_W, 0);
  drawSobreTab();
  pop();
  pop();
}

function drawMobileExportarScreen() {
  const scl = filterPanelScale();
  push();
  scale(scl);
  noStroke();
  fill(lightMode ? 255 : "#222222");
  rect(0, 0, width / scl, height / scl);
  push();
  translate(LAYOUT_NAV_W, 0);
  drawExportTab();
  pop();
  pop();
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
  stroke(lightMode ? "#000000" : "#959fff");
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

function themeTextColor() {
  return lightMode ? "#000000" : "#FFFFFF";
}

function themePanelBackground() {
  return lightMode ? "#FFFFFF" : "#222222";
}

function mousePressed() {
  keyboardFocusActive = false; // cliques com mouse suprimem foco visível até próxima navegação por teclado
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

function getFocusableElements() {
  const list = [];

  // 1. Barra de Navegação Esquerda (sempre presente)
  if (typeof NAV_CONFIG !== "undefined" && Array.isArray(NAV_CONFIG)) {
    for (const nav of NAV_CONFIG) {
      if (nav.id === "sobre") {
        list.push({
          type: "theme_toggle",
          id: "theme_toggle",
          label: lightMode ? "Mudar para modo escuro" : "Mudar para modo claro",
        });
      }
      list.push({ type: "nav", id: nav.id, label: nav.label });
    }
  }

  // 2. Painel Lateral Estendido (se aberto)
  const isExtended = typeof leftPanelExtendedOpen === "undefined" || leftPanelExtendedOpen;
  if (isExtended) {
    list.push({ type: "collapse", id: "collapse", label: "Esconder menu" });

    if (leftPanelTab === "filtros") {
      const dims = ["tipo_obra", "material", "estetico", "tecnicas"];
      for (const dimKey of dims) {
        const dimObj = typeof DIMENSIONS !== "undefined" ? DIMENSIONS[dimKey] : null;
        list.push({ type: "dimension", id: dimKey, label: dimObj?.label || dimKey });
      }
      if (activeDimension !== "tipo_obra" && typeof currentCategoryLabel === "function") {
        list.push({ type: "category_selector", id: "category", label: currentCategoryLabel() });
      }
      list.push({ type: "tag_search", id: "search", label: "Pesquisar tag" });
      list.push({ type: "tag_clear", id: "clear", label: "Limpar filtros" });
      if (typeof tagsToDisplay === "function") {
        const tags = tagsToDisplay();
        if (tags.length > 0) {
          const idx = Math.min(Math.max(0, a11yState.tagIndex), tags.length - 1);
          list.push({ type: "tag_item", id: "tag_list", index: idx, tagKey: tags[idx]?.key, label: tags[idx]?.label });
        }
      }
    } else if (leftPanelTab === "exportar") {
      if (typeof VIEWS_CONFIG !== "undefined" && Array.isArray(VIEWS_CONFIG)) {
        for (let i = 0; i < VIEWS_CONFIG.length; i++) {
          list.push({ type: "export_view", id: `view_${i}`, index: i, label: VIEWS_CONFIG[i].label });
        }
      }
      list.push({ type: "export_format", id: "format", label: exportFormatSelected });
      list.push({ type: "export_button", id: "download", label: "Baixar" });
    } else if (leftPanelTab === "sobre") {
      list.push({ type: "sobre_content", id: "sobre_text", label: "Sobre o projeto" });
    }
  }

  // 3. Visualização Central (nó / obra)
  const prods = typeof visibleProducts === "function" ? visibleProducts() : [];
  if (prods.length > 0 || (typeof products !== "undefined" && products.length > 0)) {
    list.push({
      type: "center_product",
      id: "center_product",
      label: selectedProduct ? selectedProduct.name : "Visualização Central",
    });
  }

  // 4. Alças da Timeline
  list.push({ type: "timeline_start", id: "timeline_start", label: `Início da Timeline (${yearStart})` });
  list.push({ type: "timeline_end", id: "timeline_end", label: `Fim da Timeline (${yearEnd})` });

  // 5. Painel de Produto Direito
  if (selectedProduct) {
    if (typeof productImages === "function") {
      const imgs = productImages(selectedProduct);
      if (imgs.length > 1) {
        list.push({ type: "product_image_prev", id: "prev_image", label: "Imagem anterior" });
        list.push({ type: "product_image_next", id: "next_image", label: "Próxima imagem" });
      }
    }
    list.push({ type: "product_save", id: "product_save", label: "Salvar obra" });

    const tabs = typeof DETAIL_TABS !== "undefined" ? [...DETAIL_TABS, "salvos"] : ["material", "estetico", "tecnicas", "salvos"];
    for (const tabId of tabs) {
      const dim = typeof DIMENSIONS !== "undefined" ? DIMENSIONS[tabId] : null;
      list.push({ type: "product_tab", id: tabId, label: tabId === "salvos" ? "Salvos" : (dim?.label || tabId) });
    }

    if (rightPanelTab === "salvos") {
      list.push({ type: "saved_search", id: "saved_search", label: "Pesquisar salvos" });
      list.push({ type: "saved_sort", id: "saved_sort", label: "Ordenar salvos" });
      if (typeof savedProductsFiltered === "function") {
        const savedList = savedProductsFiltered();
        if (savedList.length > 0) {
          const sIdx = Math.min(Math.max(0, a11yState.savedIndex), savedList.length - 1);
          list.push({ type: "saved_item", id: "saved_item", index: sIdx, label: savedList[sIdx]?.name });
        }
      }
    } else {
      list.push({ type: "product_details", id: "product_details", label: "Detalhes do produto" });
    }
  }

  return list;
}

function setA11yFocus(target) {
  if (!target) return;
  a11yState.focusTarget = target;
  keyboardFocusActive = true;

  if (target.type === "tag_item") {
    if (typeof tagsToDisplay === "function") {
      const tags = tagsToDisplay();
      if (tags.length > 0) {
        a11yState.tagIndex = Math.min(Math.max(0, a11yState.tagIndex), tags.length - 1);
        target.index = a11yState.tagIndex;
        target.tagKey = tags[a11yState.tagIndex].key;
        ensureFocusedTagVisible(a11yState.tagIndex);
        const t = tags[a11yState.tagIndex];
        const isSel = selectedTagKeys.has(t.key);
        const count = typeof countProductsWithTagInCurrentType === "function" ? countProductsWithTagInCurrentType(t) : t.count;
        announceToScreenReader(`Tag ${a11yState.tagIndex + 1} de ${tags.length}: ${t.label}, ${count} obras. ${isSel ? "Marcada" : "Desmarcada"}. Use setas cima/baixo para navegar, Espaço para alternar.`);
        return;
      }
    }
  }

  if (target.type === "nav") {
    const v = typeof VIEWS_CONFIG !== "undefined" ? VIEWS_CONFIG.find((x) => x.id === activeView) : null;
    const extra = target.id === "trocar" ? ` (visão atual: ${v?.label || activeView})` : "";
    announceToScreenReader(`Navegação: ${String(target.label || target.id).replace("\n", " ")}${extra}. Pressione Enter para ativar.`);
    return;
  }

  if (target.type === "collapse") {
    announceToScreenReader("Botão: Esconder menu de filtros. Pressione Enter para recolher.");
    return;
  }

  if (target.type === "dimension") {
    const isAct = activeDimension === target.id;
    announceToScreenReader(`Dimensão: ${target.label}${isAct ? " (ativa)" : ""}. Pressione Enter para selecionar.`);
    return;
  }

  if (target.type === "category_selector") {
    const lbl = typeof currentCategoryLabel === "function" ? currentCategoryLabel() : "";
    announceToScreenReader(`Agrupamento de tags: ${lbl}. Pressione Enter para abrir opções.`);
    return;
  }

  if (target.type === "tag_search") {
    announceToScreenReader("Campo de pesquisa de tags. Pressione Enter para digitar ou seta para baixo para ir à lista.");
    return;
  }

  if (target.type === "tag_clear") {
    announceToScreenReader(`Botão Limpar Filtros. ${selectedTagKeys.size} tags selecionadas. Pressione Enter para desmarcar todas.`);
    return;
  }

  if (target.type === "center_product") {
    if (!selectedProduct && typeof visibleProducts === "function") {
      const vis = visibleProducts();
      if (vis.length) selectProduct(vis[0]);
    }
    if (selectedProduct) {
      announceToScreenReader(`Obra: ${selectedProduct.name} (${selectedProduct.year}), por ${selectedProduct.author || "autor desconhecido"}. Origem: ${getOriginLabel(selectedProduct.origin)}. Use setas para navegar entre obras.`);
    } else {
      announceToScreenReader("Área de visualização central.");
    }
    return;
  }

  if (target.type === "timeline_start") {
    announceToScreenReader(`Linha do tempo: Alça inicial ano ${yearStart}. Use setas esquerda e direita para alterar o ano.`);
    return;
  }

  if (target.type === "timeline_end") {
    announceToScreenReader(`Linha do tempo: Alça final ano ${yearEnd}. Use setas esquerda e direita para alterar o ano.`);
    return;
  }

  if (target.type === "product_image_prev") {
    announceToScreenReader("Botão imagem anterior.");
    return;
  }

  if (target.type === "product_image_next") {
    announceToScreenReader("Botão próxima imagem.");
    return;
  }

  if (target.type === "product_save") {
    const isSaved = selectedProduct && savedProductKeys.has(selectedProduct.key);
    announceToScreenReader(isSaved ? "Botão: Obra salva nos favoritos. Pressione Enter para remover." : "Botão: Salvar obra nos favoritos. Pressione Enter para salvar.");
    return;
  }

  if (target.type === "product_tab") {
    const isAct = rightPanelTab === target.id;
    announceToScreenReader(`Aba do produto: ${target.label}${isAct ? " (ativa)" : ""}. Pressione Enter ou use as setas para alternar.`);
    return;
  }

  if (target.type === "export_view") {
    const isSel = exportViewsSelection[target.index];
    announceToScreenReader(`Exportar visão: ${target.label}. ${isSel ? "Marcada" : "Desmarcada"}. Pressione Espaço para alternar.`);
    return;
  }

  if (target.type === "export_format") {
    announceToScreenReader(`Formato de exportação: ${exportFormatSelected}. Pressione Enter para alterar.`);
    return;
  }

  if (target.type === "export_button") {
    announceToScreenReader(`Botão Baixar visualizações em formato ${exportFormatSelected}. Pressione Enter para baixar.`);
    return;
  }

  if (target.type === "saved_search") {
    announceToScreenReader("Campo de pesquisa de obras salvas. Pressione Enter para digitar.");
    return;
  }

  if (target.type === "saved_sort") {
    const modes = ["Nome", "Ano", "Origem"];
    announceToScreenReader(`Botão ordenar salvos. Modo atual: por ${modes[savedSortMode] || "Nome"}. Pressione Enter para alterar.`);
    return;
  }

  if (target.type === "saved_item") {
    const items = typeof savedProductsFiltered === "function" ? savedProductsFiltered() : [];
    if (items.length) {
      a11yState.savedIndex = Math.min(Math.max(0, a11yState.savedIndex), items.length - 1);
      target.index = a11yState.savedIndex;
      ensureFocusedSavedItemVisible(a11yState.savedIndex);
      const it = items[a11yState.savedIndex];
      announceToScreenReader(`Obra salva ${a11yState.savedIndex + 1} de ${items.length}: ${it.name} (${it.year}). Pressione Enter para visualizar detalhes.`);
    }
    return;
  }

  if (target.type === "product_details") {
    announceToScreenReader("Detalhes da obra. Use setas para cima e para baixo para rolar o conteúdo.");
    return;
  }

  if (target.type === "sobre_content") {
    announceToScreenReader("Texto sobre o projeto TAGrafia. Use setas para cima e para baixo para rolar o texto.");
    return;
  }
}

function handleA11yTab(reverse = false) {
  if (categorySelectorOpen) {
    categorySelectorOpen = false;
  }
  if (exportFormatDropdownOpen) {
    exportFormatDropdownOpen = false;
  }

  const elements = getFocusableElements();
  if (!elements.length) return;

  keyboardFocusActive = true;

  let currentIndex = -1;
  if (a11yState.focusTarget) {
    currentIndex = elements.findIndex((el) => {
      if (el.type !== a11yState.focusTarget.type) return false;
      if (el.id !== undefined && el.id !== a11yState.focusTarget.id) return false;
      return true;
    });
  }

  let nextIndex;
  if (currentIndex === -1) {
    nextIndex = reverse ? elements.length - 1 : 0;
  } else {
    if (reverse) {
      nextIndex = (currentIndex - 1 + elements.length) % elements.length;
    } else {
      nextIndex = (currentIndex + 1) % elements.length;
    }
  }

  setA11yFocus(elements[nextIndex]);
}

function ensureFocusedSavedItemVisible(index) {
  if (typeof savedProductsFiltered !== "function") return;
  const items = savedProductsFiltered();
  if (!items.length || index < 0 || index >= items.length) return;
  const scale = typeof layoutScale === "function" ? layoutScale() : 1;
  const titleH = Math.round((typeof PRODUCT_TITLE_H !== "undefined" ? PRODUCT_TITLE_H : 56) * scale);
  const imageH = Math.round((typeof PRODUCT_IMAGE_H !== "undefined" ? PRODUCT_IMAGE_H : 240) * scale);
  const gridY = imageH + titleH + 46 * scale;
  const cardH = 92 * scale;
  const gapY = 12 * scale;
  const availH = Math.max(50, height - gridY);
  const row = Math.floor(index / 2);
  const totalRows = Math.ceil(items.length / 2);
  const totalH = totalRows * cardH + Math.max(0, totalRows - 1) * gapY;
  const maxScroll = Math.max(0, totalH - availH);

  const itemTop = row * (cardH + gapY);
  const itemBottom = itemTop + cardH;

  if (itemTop < savedScroll) {
    savedScroll = itemTop;
  } else if (itemBottom > savedScroll + availH) {
    savedScroll = itemBottom - availH;
  }
  savedScroll = typeof constrain === "function" ? constrain(savedScroll, 0, maxScroll) : Math.min(Math.max(savedScroll, 0), maxScroll);
}

function ensureFocusedTagVisible(index) {
  const scl = typeof filterPanelScale === "function" ? filterPanelScale() : 1;
  const listY = typeof filterListY === "function" ? filterListY() : 200;
  const curH = typeof height !== "undefined" ? height : 768;
  const listBottom = curH / scl - 10;
  const availH = Math.max(50, listBottom - listY);
  const rowH = typeof FILTER_TAG_ROW_H !== "undefined" ? FILTER_TAG_ROW_H : 30;

  const tagTop = index * rowH;
  const tagBottom = tagTop + rowH;

  if (tagTop < tagScroll) {
    tagScroll = tagTop;
  } else if (tagBottom > tagScroll + availH) {
    tagScroll = tagBottom - availH;
  }
  const tags = typeof tagsToDisplay === "function" ? tagsToDisplay() : [];
  const maxScroll = Math.max(0, tags.length * rowH - availH);
  tagScroll = typeof constrain === "function" ? constrain(tagScroll, 0, maxScroll) : Math.min(Math.max(tagScroll, 0), maxScroll);
}

function handleA11yArrow(direction) {
  keyboardFocusActive = true;
  if (!a11yState.focusTarget) {
    const list = getFocusableElements();
    if (list.length) setA11yFocus(list[0]);
    return;
  }

  const target = a11yState.focusTarget;

  // 1. Barra de Navegação Esquerda (Menu vertical)
  if (target.type === "nav") {
    const navItems = typeof NAV_CONFIG !== "undefined" ? NAV_CONFIG : [];
    let idx = navItems.findIndex((n) => n.id === target.id);
    if (idx === -1) idx = 0;
    if (direction === "down" || direction === "right") {
      idx = (idx + 1) % navItems.length;
    } else {
      idx = (idx - 1 + navItems.length) % navItems.length;
    }
    const nextNav = navItems[idx];
    setA11yFocus({ type: "nav", id: nextNav.id, label: nextNav.label });
    return;
  }

  // 1b. Alternador de Tema
  if (target.type === "theme_toggle") {
    if (direction === "up" || direction === "left") {
      setA11yFocus({ type: "nav", id: "exportar", label: "Exportar" });
    } else {
      setA11yFocus({ type: "nav", id: "sobre", label: "Sobre" });
    }
    return;
  }

  // 2. Alça Inicial da Timeline
  if (target.type === "timeline_start") {
    if (direction === "left" || direction === "down") {
      yearStart = constrain(yearStart - 1, YEAR_MIN, yearEnd);
    } else if (direction === "right" || direction === "up") {
      yearStart = constrain(yearStart + 1, YEAR_MIN, yearEnd);
    }
    _cachedVisibleProducts = null;
    _cachedVisibleProductsNoYear = null;
    _cachedTagCounts = null;
    _cachedBubbleGroups = null;
    ensureSelectedVisible();
    announceToScreenReader(`Linha do tempo: Ano inicial ajustado para ${yearStart}.`);
    return;
  }

  // 3. Alça Final da Timeline
  if (target.type === "timeline_end") {
    if (direction === "left" || direction === "down") {
      yearEnd = constrain(yearEnd - 1, yearStart, YEAR_MAX);
    } else if (direction === "right" || direction === "up") {
      yearEnd = constrain(yearEnd + 1, yearStart, YEAR_MAX);
    }
    _cachedVisibleProducts = null;
    _cachedVisibleProductsNoYear = null;
    _cachedTagCounts = null;
    _cachedBubbleGroups = null;
    ensureSelectedVisible();
    announceToScreenReader(`Linha do tempo: Ano final ajustado para ${yearEnd}.`);
    return;
  }

  // 4. Lista de Tags do Filtro
  if (target.type === "tag_item") {
    const tags = tagsToDisplay();
    if (!tags.length) return;
    if (direction === "down" || direction === "right") {
      a11yState.tagIndex = Math.min(tags.length - 1, a11yState.tagIndex + 1);
    } else if (direction === "up" || direction === "left") {
      a11yState.tagIndex = Math.max(0, a11yState.tagIndex - 1);
    }
    target.index = a11yState.tagIndex;
    target.tagKey = tags[a11yState.tagIndex].key;
    ensureFocusedTagVisible(a11yState.tagIndex);
    const tag = tags[a11yState.tagIndex];
    const isSel = selectedTagKeys.has(tag.key);
    const count = typeof countProductsWithTagInCurrentType === "function" ? countProductsWithTagInCurrentType(tag) : tag.count;
    announceToScreenReader(`Tag ${a11yState.tagIndex + 1} de ${tags.length}: ${tag.label}, ${count} obras. ${isSel ? "Marcada" : "Desmarcada"}. Espaço para alternar.`);
    return;
  }

  // 5. Obras da Visualização Central
  if (target.type === "center_product") {
    let prods;
    if (activeView === VISAO_CIRCULAR && typeof productsShownInCircular === "function" && productsShownInCircular().length) {
      prods = productsShownInCircular();
    } else if (activeView === VISAO_LINHA_TEMPO) {
      prods = (typeof visibleProducts === "function" ? visibleProducts() : [])
        .filter((p) => p.year >= yearStart && p.year <= yearEnd)
        .sort((a, b) => a.year - b.year || a.name.localeCompare(b.name, "pt-BR"));
    } else {
      prods = typeof visibleProducts === "function" ? visibleProducts() : [];
    }
    if (!prods.length) return;
    let idx = prods.findIndex((p) => p.key === selectedProduct?.key);
    if (idx === -1) {
      idx = (direction === "left" || direction === "up") ? prods.length - 1 : 0;
    } else if (direction === "right" || direction === "down") {
      idx = (idx + 1) % prods.length;
    } else if (direction === "left" || direction === "up") {
      idx = (idx - 1 + prods.length) % prods.length;
    }
    selectProduct(prods[idx]);
    target.label = selectedProduct.name;
    announceToScreenReader(`Obra: ${selectedProduct.name} (${selectedProduct.year}), por ${selectedProduct.author || "autor desconhecido"}. Origem: ${getOriginLabel(selectedProduct.origin)}.`);
    return;
  }

  // 6. Abas do Painel de Produto
  if (target.type === "product_tab") {
    const tabs = typeof DETAIL_TABS !== "undefined" ? [...DETAIL_TABS, "salvos"] : ["material", "estetico", "tecnicas", "salvos"];
    let idx = tabs.indexOf(rightPanelTab);
    if (idx === -1) idx = 0;
    if (direction === "right" || direction === "down") {
      idx = (idx + 1) % tabs.length;
    } else if (direction === "left" || direction === "up") {
      idx = (idx - 1 + tabs.length) % tabs.length;
    }
    rightPanelTab = tabs[idx];
    target.id = tabs[idx];
    const label = tabs[idx] === "salvos" ? "Salvos" : (DIMENSIONS[tabs[idx]]?.label || tabs[idx]);
    announceToScreenReader(`Aba do produto alterada para: ${label}.`);
    return;
  }

  // 7. Cards de Dimensão (grid 2x2: tipo_obra, material / estetico, tecnicas)
  if (target.type === "dimension") {
    const grid = [
      ["tipo_obra", "material"],
      ["estetico", "tecnicas"],
    ];
    let r = target.id === "estetico" || target.id === "tecnicas" ? 1 : 0;
    let c = target.id === "material" || target.id === "tecnicas" ? 1 : 0;
    if (direction === "right") c = (c + 1) % 2;
    else if (direction === "left") c = (c - 1 + 2) % 2;
    else if (direction === "down") r = (r + 1) % 2;
    else if (direction === "up") r = (r - 1 + 2) % 2;
    const nextDim = grid[r][c];
    target.id = nextDim;
    activeDimension = nextDim;
    tagScroll = 0;
    categorySelectorOpen = false;
    announceToScreenReader(`Dimensão de filtro: ${DIMENSIONS[nextDim]?.label || nextDim}.`);
    return;
  }

  // 8. Seletor de Categoria
  if (target.type === "category_selector") {
    categorySelectorOpen = true;
    const options = getFilterCategoryOptions(activeDimension);
    let curVal = activeCategoryByDimension[activeDimension];
    let optIdx = options.findIndex((o) => o.value === curVal);
    if (optIdx === -1) optIdx = 0;
    if (direction === "down" || direction === "right") {
      optIdx = Math.min(options.length - 1, optIdx + 1);
    } else {
      optIdx = Math.max(0, optIdx - 1);
    }
    activeCategoryByDimension[activeDimension] = options[optIdx].value;
    tagScroll = 0;
    announceToScreenReader(`Agrupamento: ${options[optIdx].label}.`);
    return;
  }

  // 9. Opções de Visão na Exportação
  if (target.type === "export_view") {
    const totalViews = typeof VIEWS_CONFIG !== "undefined" ? VIEWS_CONFIG.length : 4;
    let curIdx = target.index !== undefined ? target.index : 0;
    if (direction === "down" || direction === "right") {
      curIdx = (curIdx + 1) % totalViews;
    } else {
      curIdx = (curIdx - 1 + totalViews) % totalViews;
    }
    target.index = curIdx;
    target.id = `view_${curIdx}`;
    target.label = VIEWS_CONFIG[curIdx]?.label;
    const isSel = exportViewsSelection[curIdx];
    announceToScreenReader(`Exportar visão: ${target.label}. ${isSel ? "Marcada" : "Desmarcada"}. Espaço para alternar.`);
    return;
  }

  // 10. Formato de Exportação (combobox/select)
  if (target.type === "export_format") {
    const formats = typeof EXPORT_FORMATS !== "undefined" ? EXPORT_FORMATS : ["PDF", "JPG", "SVG"];
    let curIdx = formats.indexOf(exportFormatSelected);
    if (curIdx === -1) curIdx = 0;
    if (direction === "down" || direction === "right") {
      curIdx = (curIdx + 1) % formats.length;
    } else {
      curIdx = (curIdx - 1 + formats.length) % formats.length;
    }
    exportFormatSelected = formats[curIdx];
    announceToScreenReader(`Formato de exportação alterado para: ${exportFormatSelected}.`);
    return;
  }

  // 11. Obras Salvas
  if (target.type === "saved_item") {
    const items = savedProductsFiltered();
    if (!items.length) return;
    if (direction === "down" || direction === "right") {
      a11yState.savedIndex = Math.min(items.length - 1, a11yState.savedIndex + 1);
    } else {
      a11yState.savedIndex = Math.max(0, a11yState.savedIndex - 1);
    }
    target.index = a11yState.savedIndex;
    ensureFocusedSavedItemVisible(a11yState.savedIndex);
    const it = items[a11yState.savedIndex];
    announceToScreenReader(`Obra salva ${a11yState.savedIndex + 1} de ${items.length}: ${it.name} (${it.year}).`);
    return;
  }

  // 12. Conteúdo de detalhes
  if (target.type === "product_details") {
    if (direction === "down") detailScroll = Math.max(0, detailScroll + 30);
    else if (direction === "up") detailScroll = Math.max(0, detailScroll - 30);
    return;
  }

  // 13. Conteúdo sobre
  if (target.type === "sobre_content") {
    if (direction === "down") sobreScroll = Math.max(0, sobreScroll + 30);
    else if (direction === "up") sobreScroll = Math.max(0, sobreScroll - 30);
    return;
  }
}

function handleA11yActivate() {
  keyboardFocusActive = true;
  if (!a11yState.focusTarget) {
    const list = getFocusableElements();
    if (list.length) setA11yFocus(list[0]);
    return;
  }

  const target = a11yState.focusTarget;

  // 1. Barra de Navegação
  if (target.type === "nav") {
    if (target.id === "trocar") {
      activeView = (activeView + 1) % VIEWS_CONFIG.length;
      if (typeof mapState !== "undefined") mapState.dragging = false;
      draggedYearHandle = null;
      hoveredCircularTag = null;
      focusedCircularTagKey = "";
      if (typeof ensureSelectedVisible === "function") ensureSelectedVisible();
      const v = VIEWS_CONFIG.find((item) => item.id === activeView);
      announceToScreenReader(`Visualização alterada para: ${v?.label || activeView}.`);
    } else {
      if (leftPanelExtendedOpen && leftPanelTab === target.id) {
        leftPanelExtendedOpen = false;
        announceToScreenReader(`Painel ${target.id} recolhido.`);
      } else {
        leftPanelTab = target.id;
        leftPanelExtendedOpen = true;
        sobreScroll = 0;
        announceToScreenReader(`Painel ${target.id} expandido.`);
      }
    }
    return;
  }

  // 1b. Alternador de Tema
  if (target.type === "theme_toggle") {
    if (typeof toggleTheme === "function") {
      toggleTheme();
    }
    return;
  }

  // 2. Botão Recolher
  if (target.type === "collapse") {
    leftPanelExtendedOpen = !leftPanelExtendedOpen;
    if (!leftPanelExtendedOpen) {
      a11yState.focusTarget = { type: "nav", id: leftPanelTab };
      announceToScreenReader("Menu de filtros recolhido.");
    } else {
      announceToScreenReader("Menu de filtros expandido.");
    }
    return;
  }

  // 3. Card de Dimensão
  if (target.type === "dimension") {
    activeDimension = target.id;
    tagScroll = 0;
    categorySelectorOpen = false;
    announceToScreenReader(`Dimensão ativada: ${DIMENSIONS[target.id]?.label || target.id}.`);
    return;
  }

  // 4. Seletor de Categoria
  if (target.type === "category_selector") {
    categorySelectorOpen = !categorySelectorOpen;
    announceToScreenReader(categorySelectorOpen ? "Seletor de agrupamento aberto. Use as setas para escolher." : "Seletor de agrupamento fechado.");
    return;
  }

  // 5. Pesquisar Tag
  if (target.type === "tag_search") {
    tagSearchActive = true;
    announceToScreenReader("Campo de busca ativo. Digite o termo de busca.");
    return;
  }

  // 6. Limpar Tags
  if (target.type === "tag_clear") {
    selectedTagKeys.clear();
    focusedCircularTagKey = "";
    tagSearch = "";
    tagScroll = 0;
    ensureSelectedVisible();
    announceToScreenReader("Filtros limpos. Todas as tags foram desmarcadas.");
    return;
  }

  // 7. Item da Lista de Tags
  if (target.type === "tag_item") {
    const tags = tagsToDisplay();
    const tag = tags[a11yState.tagIndex];
    if (tag) {
      if (selectedTagKeys.has(tag.key)) {
        selectedTagKeys.delete(tag.key);
      } else {
        selectedTagKeys.add(tag.key);
      }
      if (!selectedTagKeys.has(focusedCircularTagKey)) {
        focusedCircularTagKey = "";
      }
      ensureSelectedVisible();
      tagClickAnim.set(tag.key, typeof millis === "function" ? millis() : Date.now());
      const isSel = selectedTagKeys.has(tag.key);
      announceToScreenReader(`Tag ${tag.label} ${isSel ? "marcada" : "desmarcada"}. Total de tags ativas: ${selectedTagKeys.size}.`);
    }
    return;
  }

  // 8. Controles da Aba Exportar
  if (target.type === "export_view") {
    exportViewsSelection[target.index] = !exportViewsSelection[target.index];
    announceToScreenReader(`Visão ${VIEWS_CONFIG[target.index].label} ${exportViewsSelection[target.index] ? "incluída" : "removida"} da exportação.`);
    return;
  }
  if (target.type === "export_format") {
    const formats = typeof EXPORT_FORMATS !== "undefined" ? EXPORT_FORMATS : ["PDF", "JPG", "SVG"];
    const curIdx = formats.indexOf(exportFormatSelected);
    const nextFmt = formats[(curIdx + 1) % formats.length];
    exportFormatSelected = nextFmt;
    announceToScreenReader(`Formato de exportação alterado para: ${exportFormatSelected}.`);
    return;
  }
  if (target.type === "export_button") {
    if (exportFormatSelected === "JPG" && typeof saveCanvas === "function") {
      saveCanvas("tagrafia-visualizacao", "jpg");
      announceToScreenReader("Imagem JPG exportada com sucesso.");
    } else {
      announceToScreenReader(`Exportação em ${exportFormatSelected} iniciada.`);
    }
    return;
  }

  // 9. Controles do Painel de Produto
  if (target.type === "product_image_prev") {
    changeProductImage(-1);
    const totalImgs = productImages(selectedProduct).length;
    announceToScreenReader(`Exibindo imagem ${selectedImageIndex + 1} de ${totalImgs}.`);
    return;
  }
  if (target.type === "product_image_next") {
    changeProductImage(1);
    const totalImgs = productImages(selectedProduct).length;
    announceToScreenReader(`Exibindo imagem ${selectedImageIndex + 1} de ${totalImgs}.`);
    return;
  }
  if (target.type === "product_save") {
    toggleSavedProduct();
    const isSaved = selectedProduct && savedProductKeys.has(selectedProduct.key);
    announceToScreenReader(isSaved ? `Obra '${selectedProduct.name}' salva nos favoritos.` : `Obra '${selectedProduct.name}' removida dos favoritos.`);
    return;
  }
  if (target.type === "product_tab") {
    rightPanelTab = target.id;
    const label = target.id === "salvos" ? "Salvos" : (DIMENSIONS[target.id]?.label || target.id);
    announceToScreenReader(`Aba ativada: ${label}.`);
    return;
  }
  if (target.type === "saved_search") {
    savedSearchActive = true;
    announceToScreenReader("Campo de busca de obras salvas ativo.");
    return;
  }
  if (target.type === "saved_sort") {
    savedSortMode = (savedSortMode + 1) % 3;
    const sortLabels = ["Nome", "Ano", "Origem"];
    announceToScreenReader(`Ordenação de salvos: por ${sortLabels[savedSortMode]}.`);
    return;
  }
  if (target.type === "saved_item") {
    const items = savedProductsFiltered();
    if (items[a11yState.savedIndex]) {
      selectProduct(items[a11yState.savedIndex]);
      rightPanelTab = "material";
      announceToScreenReader(`Obra '${items[a11yState.savedIndex].name}' selecionada. Exibindo detalhes.`);
    }
    return;
  }
}

function handleA11yEscape() {
  if (tagSearchActive) {
    tagSearchActive = false;
    announceToScreenReader("Busca de tags fechada.");
    return;
  }
  if (savedSearchActive) {
    savedSearchActive = false;
    announceToScreenReader("Busca de salvos fechada.");
    return;
  }
  if (categorySelectorOpen) {
    categorySelectorOpen = false;
    announceToScreenReader("Seletor de agrupamento fechado.");
    return;
  }
  if (exportFormatDropdownOpen) {
    exportFormatDropdownOpen = false;
    announceToScreenReader("Menu de formatos fechado.");
    return;
  }
  if (tagSearch.length > 0) {
    tagSearch = "";
    tagScroll = 0;
    announceToScreenReader("Texto de busca de tags limpo.");
    return;
  }
  if (savedSearch.length > 0) {
    savedSearch = "";
    savedScroll = 0;
    announceToScreenReader("Texto de busca de salvos limpo.");
    return;
  }
  if (focusedCircularTagKey) {
    focusedCircularTagKey = "";
    announceToScreenReader("Filtro circular desmarcado.");
    return;
  }
  if (typeof leftPanelExtendedOpen !== "undefined" && leftPanelExtendedOpen) {
    leftPanelExtendedOpen = false;
    a11yState.focusTarget = { type: "nav", id: leftPanelTab };
    keyboardFocusActive = true;
    announceToScreenReader("Painel lateral recolhido. Foco retornado ao menu de navegação.");
    return;
  }
  if (selectedProduct) {
    selectedProduct = null;
    announceToScreenReader("Obra desmarcada.");
    return;
  }
  keyboardFocusActive = false;
  announceToScreenReader("Nenhum item selecionado.");
}

function handleKeyboardEvent(event) {
  const k = event && event.key !== undefined ? event.key : typeof key !== "undefined" ? key : "";
  const code = event && event.keyCode !== undefined ? event.keyCode : typeof keyCode !== "undefined" ? keyCode : 0;
  const isShift = Boolean(
    event && event.shiftKey !== undefined
      ? event.shiftKey
      : typeof keyIsDown === "function" && typeof SHIFT !== "undefined"
        ? keyIsDown(SHIFT)
        : false,
  );

  // 1. Se em digitação de busca
  if (tagSearchActive || savedSearchActive) {
    if (k === "Escape" || code === 27) {
      tagSearchActive = false;
      savedSearchActive = false;
      announceToScreenReader("Busca cancelada.");
      return false;
    }
    if (k === "Enter" || code === 13 || k === "Return") {
      tagSearchActive = false;
      savedSearchActive = false;
      announceToScreenReader("Busca concluída.");
      return false;
    }
    if (k === "ArrowDown" || code === 40) {
      if (tagSearchActive) {
        tagSearchActive = false;
        a11yState.focusTarget = { type: "tag_item", id: "tag_list", index: 0 };
        a11yState.tagIndex = 0;
        keyboardFocusActive = true;
        ensureFocusedTagVisible(0);
        const tags = tagsToDisplay();
        if (tags.length) announceToScreenReader("Foco movido para tag: " + tags[0].label);
        return false;
      }
      if (savedSearchActive) {
        savedSearchActive = false;
        a11yState.focusTarget = { type: "saved_item", id: "saved_item", index: 0 };
        a11yState.savedIndex = 0;
        keyboardFocusActive = true;
        ensureFocusedSavedItemVisible(0);
        const savedList = typeof savedProductsFiltered === "function" ? savedProductsFiltered() : [];
        if (savedList.length) announceToScreenReader("Foco movido para obra salva: " + savedList[0].name);
        return false;
      }
    }
    if (k === "Tab" || code === 9) {
      tagSearchActive = false;
      savedSearchActive = false;
      handleA11yTab(isShift);
      if (event && typeof event.preventDefault === "function") event.preventDefault();
      return false;
    }
    if (code === 8 || (typeof BACKSPACE !== "undefined" && code === BACKSPACE)) {
      if (tagSearchActive) tagSearch = tagSearch.slice(0, -1);
      if (savedSearchActive) savedSearch = savedSearch.slice(0, -1);
      tagScroll = 0;
      savedScroll = 0;
      return false;
    }
    if (code === 46 || (typeof DELETE !== "undefined" && code === DELETE)) {
      if (tagSearchActive) tagSearch = "";
      if (savedSearchActive) savedSearch = "";
      tagScroll = 0;
      savedScroll = 0;
      return false;
    }
    if (k.length === 1 && k >= " ") {
      if (tagSearchActive) tagSearch += k;
      if (savedSearchActive) savedSearch += k;
      tagScroll = 0;
      savedScroll = 0;
      return false;
    }
    return false;
  }

  // 2. Tab e Shift+Tab
  if (k === "Tab" || code === 9) {
    handleA11yTab(isShift);
    if (event && typeof event.preventDefault === "function") event.preventDefault();
    return false;
  }

  // 3. Escape
  if (k === "Escape" || code === 27 || (typeof ESCAPE !== "undefined" && code === ESCAPE)) {
    handleA11yEscape();
    if (event && typeof event.preventDefault === "function") event.preventDefault();
    return false;
  }

  // 4. Setas direcionais
  if (k === "ArrowLeft" || code === 37 || (typeof LEFT_ARROW !== "undefined" && code === LEFT_ARROW)) {
    handleA11yArrow("left");
    if (event && typeof event.preventDefault === "function") event.preventDefault();
    return false;
  }
  if (k === "ArrowUp" || code === 38 || (typeof UP_ARROW !== "undefined" && code === UP_ARROW)) {
    handleA11yArrow("up");
    if (event && typeof event.preventDefault === "function") event.preventDefault();
    return false;
  }
  if (k === "ArrowRight" || code === 39 || (typeof RIGHT_ARROW !== "undefined" && code === RIGHT_ARROW)) {
    handleA11yArrow("right");
    if (event && typeof event.preventDefault === "function") event.preventDefault();
    return false;
  }
  if (k === "ArrowDown" || code === 40 || (typeof DOWN_ARROW !== "undefined" && code === DOWN_ARROW)) {
    handleA11yArrow("down");
    if (event && typeof event.preventDefault === "function") event.preventDefault();
    return false;
  }

  // 5. Enter e Espaço (Ativação)
  if (
    k === "Enter" ||
    code === 13 ||
    k === "Return" ||
    (typeof ENTER !== "undefined" && code === ENTER) ||
    (typeof RETURN !== "undefined" && code === RETURN) ||
    k === " " ||
    code === 32
  ) {
    handleA11yActivate();
    if (event && typeof event.preventDefault === "function") event.preventDefault();
    return false;
  }
}

function keyPressed(event) {
  return handleKeyboardEvent(event);
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

