function drawCircularView(visible) {
  drawVisualizationBackground();
  const cx = visualX() + visualW() / 2;
  const cy = (height - TIMELINE_H) / 2;
  const baseRadius = Math.min(
    380,
    Math.max(80, Math.min(visualW() - 320, height - TIMELINE_H - 380) / 2),
  );
  const tags = tagsForCircular();
  const tagPositions = new Map();

  const productsVisual = getCircularVisualProducts(tags);

  if (!selectedProduct && productsVisual.length)
    selectProduct(productsVisual[0].product);

  // Pre-calculate max radius to determine scale factor
  let maxCornerDist = baseRadius + 160;
  let slotCalc = 0;
  for (const item of productsVisual) {
    if (slotCalc >= 38) break;
    const segments = Math.min(constrain(item.weight, 1, 3), 38 - slotCalc);
    const cardH = Math.max(38, ((TWO_PI * baseRadius) / 38) * segments * 0.92);
    const cardW = constrain(measureText(item.product.name, 18) + 28, 100, 150);
    const dist = Math.hypot(baseRadius + cardW + 6, cardH / 2);
    if (dist > maxCornerDist) maxCornerDist = dist;
    slotCalc += segments;
  }

  // Calculate safe boundaries (45px top padding for text)
  const safeR_Y = cy - 45;
  const safeR_X = visualW() / 2 - 20;
  const scaleRatio = Math.min(
    1,
    safeR_Y / maxCornerDist,
    safeR_X / maxCornerDist,
  );
  const radius = baseRadius;

  push();
  translate(cx, cy);
  scale(scaleRatio);
  translate(-cx, -cy);

  noFill();
  stroke(themeLineColor());
  strokeWeight(13);
  drawDashedCircle(cx, cy, radius, 38);

  for (const tag of tags) {
    const pos = tagPosition(tag, cx, cy, radius * 0.72);
    tagPositions.set(tag.key, pos);
    const active = !focusedCircularTagKey || focusedCircularTagKey === tag.key;
    noStroke();
    fill(colorAlpha(tag.color, active ? 255 : 75));
    circle(pos.x, pos.y, active ? 11 : 8);
    hitAreas.push({
      kind: "tag",
      tag,
      cx: cx + (pos.x - cx) * scaleRatio,
      cy: cy + (pos.y - cy) * scaleRatio,
      r: 13 * scaleRatio,
    });
  }

  let slot = 0;
  for (const item of productsVisual) {
    if (slot >= 38) break;
    const segments = Math.min(constrain(item.weight, 1, 3), 38 - slot);
    const angle = -HALF_PI + ((slot + (segments - 1) / 2) * TWO_PI) / 38;
    const cardW = constrain(measureText(item.product.name, 18) + 28, 100, 150);
    const cardH = Math.max(38, ((TWO_PI * radius) / 38) * segments * 0.92);
    const cardCx = cx + cos(angle) * (radius + cardW / 2 + 6);
    const cardCy = cy + sin(angle) * (radius + cardW / 2 + 6);
    const targetX = cx + cos(angle) * radius;
    const targetY = cy + sin(angle) * radius;
    const rotation = cos(angle) < 0 ? angle + PI : angle;

    for (const tag of item.tags) {
      const pos = tagPositions.get(tag.key);
      const active =
        !focusedCircularTagKey || focusedCircularTagKey === tag.key;
      stroke(colorAlpha(tag.color, active ? 230 : 55));
      strokeWeight(active ? 1.8 : 0.8);
      line(pos.x, pos.y, targetX, targetY);
    }

    drawProductCard(item.product, cardCx, cardCy, cardW, cardH, rotation);
    const hitCx = cx + (cardCx - cx) * scaleRatio;
    const hitCy = cy + (cardCy - cy) * scaleRatio;
    hitAreas.push({
      kind: "product",
      product: item.product,
      shape: "rotatedRect",
      cx: hitCx,
      cy: hitCy,
      w: cardW * scaleRatio,
      h: cardH * scaleRatio,
      rotation,
    });
    slot += segments;
  }

  pop();

  if (!productsVisual.length) {
    drawCenteredVisualMessage(
      selectedTagKeys.size
        ? "Nenhum produto encontrado para os filtros atuais"
        : "Selecione tags no filtro para visualizar os produtos",
      cx,
      cy,
    );
  }

  const focused = tagsByKey.get(focusedCircularTagKey);
  if (focused) {
    fill(themeLineColor());
    noStroke();
    textFont(fontes.robotoCondensed);
    textSize(13);
    textAlign(CENTER, TOP);
    text(focused.label, cx, cy + radius + 28);
  }
}

function drawDashedCircle(cx, cy, radius, segments) {
  const step = TWO_PI / segments;
  for (let i = 0; i < segments; i++) {
    const center = -HALF_PI + i * step;
    arc(
      cx,
      cy,
      radius * 2,
      radius * 2,
      center - step * 0.21,
      center + step * 0.21,
    );
  }
}

function drawProductCard(product, cx, cy, w, h, rotation) {
  push();
  translate(cx, cy);
  rotate(rotation);
  const selected = selectedProduct && selectedProduct.key === product.key;
  if (selected) {
    stroke(themeLineColor());
    strokeWeight(2.4);
  } else {
    noStroke();
  }
  fill(product.origin === "brasileiro" ? COLORS.yellow : COLORS.magenta);
  rectMode(CENTER);
  rect(0, 0, w, h);
  if (selected) {
    noFill();
    stroke(lightMode ? color(255, 255, 255, 135) : color(0, 0, 0, 135));
    strokeWeight(0.9);
    rect(0, 0, w - 4, h - 4);
  }
  fill("#000000");
  noStroke();
  textFont(fontes.afacad);
  textStyle(BOLD);
  drawProductCardLabel(product.name, w - 18, h - 8);
  textStyle(NORMAL);
  pop();
}

function drawProductCardLabel(label, maxW, maxH) {
  const cleanLabel = cleanText(label);
  const layout = fitProductCardLabel(cleanLabel, maxW, maxH);
  textSize(layout.size);
  textAlign(CENTER, CENTER);
  const lineH = layout.size * 0.94;
  const startY = -((layout.lines.length - 1) * lineH) / 2;
  for (let i = 0; i < layout.lines.length; i++) {
    text(layout.lines[i], 0, startY + i * lineH);
  }
}

function fitProductCardLabel(label, maxW, maxH) {
  for (let size = 22; size >= 12; size--) {
    textSize(size);
    const lines = wrapProductCardLabel(label, maxW);
    const lineH = size * 0.94;
    if (
      lines.length * lineH <= maxH + 1 &&
      lines.every((line) => textWidth(line) <= maxW + 0.5)
    ) {
      return { lines, size };
    }
  }
  textSize(12);
  const maxLines = Math.max(1, Math.floor(maxH / (12 * 0.94)));
  const lines = wrapProductCardLabel(label, maxW).slice(0, maxLines);
  if (lines.length && textWidth(lines[lines.length - 1]) > maxW) {
    lines[lines.length - 1] = fitLineWithEllipsis(
      lines[lines.length - 1],
      maxW,
    );
  }
  return { lines, size: 12 };
}

function wrapProductCardLabel(label, maxW) {
  const words = label.split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || textWidth(candidate) <= maxW) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function fitLineWithEllipsis(line, maxW) {
  let result = line;
  while (result.length > 1 && textWidth(`${result}...`) > maxW)
    result = result.slice(0, -1);
  return `${result}...`;
}

function drawBubbleView(productsVisible) {
  drawVisualizationBackground();
  const cx = visualX() + visualW() / 2;
  const cy = (height - TIMELINE_H) / 2;
  const outerR = Math.max(140, Math.min(visualW(), height - TIMELINE_H) * 0.46);
  const bubbleKey = `${productsVisible.map((p) => p.key).join(",")}|${cx}|${cy}|${outerR}`;
  if (bubbleKey !== _bubbleCacheKey || !_cachedBubbleGroups) {
    _cachedBubbleGroups = buildBubbleGroups(productsVisible, cx, cy, outerR);
    _bubbleCacheKey = bubbleKey;
  }
  const groups = _cachedBubbleGroups;

  if (!selectedProduct && groups.length && groups[0].products.length)
    selectProduct(groups[0].products[0]);

  noFill();
  stroke(themeLineColor());
  strokeWeight(4);
  circle(cx, cy, outerR * 2);

  for (const group of groups) {
    stroke("#000000");
    strokeWeight(2);
    fill("#D9D9D9");
    circle(group.x, group.y, group.r * 2);
    drawProductsInBubble(group);
    fill("#000000");
    noStroke();
    textFont(fontes.afacad);
    textStyle(BOLD);
    textSize(fitTextSize(group.name, group.r * 1.52, 26, 11));
    textAlign(CENTER, CENTER);
    text(group.name, group.x - group.r * 0.75, group.y - 24, group.r * 1.5, 54);
    textStyle(NORMAL);
  }

  if (!groups.length)
    drawCenteredVisualMessage(
      "Nenhum produto encontrado para os filtros atuais",
      cx,
      cy,
    );
}

function buildBubbleGroups(productsVisible, cx, cy, outerR) {
  const byName = new Map();
  for (const product of productsVisible) {
    if (product.year < yearStart || product.year > yearEnd) continue;
    const name =
      product.origin === "brasileiro"
        ? "Obras brasileiras"
        : movementName(product.movementRaw) || "Sem escola";
    if (!byName.has(name)) byName.set(name, { name, products: [] });
    byName.get(name).products.push(product);
  }
  const groups = Array.from(byName.values()).sort(
    (a, b) =>
      b.products.length - a.products.length ||
      a.name.localeCompare(b.name, "pt-BR"),
  );
  let area = 0;
  for (const group of groups) {
    group.products.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    group.r = constrain(45 + Math.sqrt(group.products.length) * 24, 55, 150);
    area += PI * group.r * group.r;
  }
  const available = PI * outerR * outerR * 0.85; // Allow more density
  const scale = area > available ? Math.sqrt(available / area) : 1;
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    group.r = constrain(group.r * scale, 45, 150);
    if (i === 0) {
      group.x = cx;
      group.y = cy;
    } else {
      const angle = -HALF_PI + i * GOLDEN_ANGLE;
      const distance = Math.min(outerR - group.r - 10, 42 + Math.sqrt(i) * 72);
      group.x = cx + cos(angle) * distance;
      group.y = cy + sin(angle) * distance;
    }
  }
  for (let iter = 0; iter < 220; iter++) {
    for (const group of groups) {
      group.x += (cx - group.x) * 0.0035;
      group.y += (cy - group.y) * 0.0035;
    }
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const a = groups[i];
        const b = groups[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.max(0.001, Math.hypot(dx, dy));
        const minD = a.r + b.r + 4;
        if (d < minD) {
          const push = (minD - d) * 0.5;
          a.x -= (dx / d) * push;
          a.y -= (dy / d) * push;
          b.x += (dx / d) * push;
          b.y += (dy / d) * push;
        }
      }
    }
    for (const group of groups) {
      const dx = group.x - cx;
      const dy = group.y - cy;
      const d = Math.hypot(dx, dy);
      const maxD = outerR - group.r - 3;
      if (d > maxD) {
        group.x = cx + (dx / d) * maxD;
        group.y = cy + (dy / d) * maxD;
      }
    }
  }
  return groups;
}

function drawProductsInBubble(group) {
  const total = group.products.length;
  if (!total) return;
  const usable = Math.max(6, group.r - Math.max(18, group.r * 0.25));
  const dotR = constrain(usable / Math.max(2.2, Math.sqrt(total) * 2.2), 5, 9);
  for (let i = 0; i < total; i++) {
    const product = group.products[i];
    const angle = i * GOLDEN_ANGLE - HALF_PI;
    const d = Math.sqrt((i + 0.5) / total) * usable;
    const x = total === 1 ? group.x : group.x + cos(angle) * d;
    const y = total === 1 ? group.y + group.r * 0.28 : group.y + sin(angle) * d;
    const selected = selectedProduct && selectedProduct.key === product.key;
    if (selected) {
      stroke(themeLineColor());
      strokeWeight(2.3);
    } else {
      noStroke();
    }
    fill(product.origin === "brasileiro" ? COLORS.yellow : COLORS.magenta);
    circle(x, y, (dotR + (selected ? 1.5 : 0)) * 2);
    hitAreas.push({
      kind: "product",
      product,
      shape: "circle",
      cx: x,
      cy: y,
      r: dotR + 7,
    });
  }
}

function drawTimelineView(productsVisible) {
  drawVisualizationBackground();
  const axisY = (height - TIMELINE_H) * 0.5;
  const x1 = visualX() + 40;
  const x2 = visualX() + visualW() - 40;
  stroke(themeLineColor());
  strokeWeight(3);
  line(visualX(), axisY, visualX() + visualW(), axisY);
  const visible = productsVisible
    .filter((product) => product.year >= yearStart && product.year <= yearEnd)
    .sort((a, b) => a.year - b.year || a.name.localeCompare(b.name, "pt-BR"));
  if (!selectedProduct && visible.length) selectProduct(visible[0]);
  if (!visible.length) {
    drawCenteredVisualMessage(
      "Nenhum produto encontrado para os filtros atuais",
      visualX() + visualW() / 2,
      axisY - 42,
    );
    return;
  }
  const positions = [];
  const baseR = visible.length > 140 ? 5 : visible.length > 85 ? 6 : 8;
  const maxLinks = Math.max(1, ...visible.map(activeLinkCount));
  for (const product of visible) {
    const px = yearToProductX(product.year, x1, x2);
    const links = activeLinkCount(product);
    const r = links > 0 ? lerp(baseR, baseR * 2.15, links / maxLinks) : baseR;
    const py = timelineYWithoutOverlap(px, axisY, r * 2.8, r, positions);
    positions.push({ x: px, y: py, r });
    const selected = selectedProduct && selectedProduct.key === product.key;
    if (selected) {
      stroke(themeLineColor());
      strokeWeight(2.5);
    } else {
      noStroke();
    }
    fill(product.origin === "brasileiro" ? COLORS.yellow : COLORS.magenta);
    circle(px, py, (r + (selected ? 3 : 0)) * 2);
    hitAreas.push({
      kind: "product",
      product,
      shape: "circle",
      cx: px,
      cy: py,
      r: r + 8,
    });
  }
}

function yearToProductX(year, x1, x2) {
  if (yearStart === yearEnd) return (x1 + x2) / 2;
  return map(constrain(year, yearStart, yearEnd), yearStart, yearEnd, x1, x2);
}

function timelineYWithoutOverlap(px, axisY, stepY, r, positions) {
  const layers = [
    -1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6, 6, -7, 7, -8, 8, -9, 9, -10, 10,
  ];
  for (const layer of layers) {
    const py = axisY + layer * stepY;
    if (py < 54 || py > height - TIMELINE_H - 42) continue;
    if (!positions.some((pos) => dist(px, py, pos.x, pos.y) < r + pos.r + 4))
      return py;
  }
  return axisY + layers[layers.length - 1] * stepY;
}

function activeLinkCount(product) {
  let count = 0;
  for (const key of selectedTagKeys) if (product.tagKeys.has(key)) count++;
  return count;
}

function drawMapView(productsVisible) {
  drawVisualizationBackground();
  const mapBox = currentMapBox();
  const activeSchools = schools
    .filter((school) => school.end >= yearStart && school.start <= yearEnd)
    .flatMap((school) =>
      school.locations.map((location) => ({ school, location })),
    );
  const activeCountries = new Set(
    activeSchools.map((item) => normalizeCountry(item.location.country)),
  );
  for (const country of geoCountries) {
    const active = activeCountries.has(normalizeCountry(country.name));
    fill(
      active
        ? lightMode
          ? "#CFE8E4"
          : "#245257"
        : lightMode
          ? "#DAD6CC"
          : "#2A2A2A",
    );
    stroke(
      active ? colorAlpha(COLORS.cyan, 170) : lightMode ? "#969186" : "#4A4A4A",
    );
    strokeWeight(active ? 0.9 : 0.55);
    for (const ring of country.rings) {
      beginShape();
      for (const point of ring) {
        const projected = project(point[0], point[1], mapBox);
        vertex(projected.x, projected.y);
      }
      endShape(CLOSE);
    }
  }

  for (const item of activeSchools) {
    const pos = project(item.location.lon, item.location.lat, mapBox);
    stroke(themeVisualBackground());
    strokeWeight(1.4);
    fill(COLORS.cyan);
    triangle(pos.x, pos.y - 8, pos.x - 7, pos.y + 6, pos.x + 7, pos.y + 6);
  }

  const points = productsVisible
    .filter((product) => product.year >= yearStart && product.year <= yearEnd)
    .map((product) => ({ product, location: productLocation(product) }))
    .filter((item) => item.location);
  if (!selectedProduct && points.length) selectProduct(points[0].product);
  const clusters = makeMapClusters(points, mapBox);
  for (const cluster of clusters) {
    if (cluster.points.length === 1 || mapState.zoom > 5.2)
      drawMapPoint(cluster.points[0]);
    else drawMapCluster(cluster);
  }
  if (!points.length)
    drawCenteredVisualMessage(
      "Nenhuma obra com localizacao no intervalo atual",
      visualX() + visualW() / 2,
      (height - TIMELINE_H) / 2,
    );

  fill(colorAlpha(themeLineColor(), 205));
  noStroke();
  textFont(fontes.robotoCondensed);
  textSize(13);
  textAlign(LEFT, TOP);
  text(
    `${points.length} obras localizadas - ${activeSchools.length} escolas/movimentos - zoom ${mapState.zoom.toFixed(1)}x`,
    visualX() + 18,
    36,
  );
}

function currentMapBox() {
  const maxW = Math.max(260, visualW() - 70);
  const maxH = Math.max(180, height - TIMELINE_H - 116);
  const w = Math.min(maxW, maxH * 2.48);
  const h = w / 2.48;
  return {
    x: visualX() + (visualW() - w) / 2,
    y: 78 + Math.max(0, (height - TIMELINE_H - 116 - h) / 2),
    w,
    h,
  };
}

function project(lon, lat, box) {
  const xBase = map(lon, -180, 180, box.x, box.x + box.w);
  const yBase = map(constrain(lat, -60, 85), 85, -60, box.y, box.y + box.h);
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  return {
    x: cx + (xBase - cx) * mapState.zoom + mapState.panX,
    y: cy + (yBase - cy) * mapState.zoom + mapState.panY,
  };
}

function makeMapClusters(points, box) {
  const expanded = [];
  const perLocation = new Map();
  for (const point of points) {
    const key = `${point.location.name}:${point.location.lat}:${point.location.lon}`;
    const index = perLocation.get(key) || 0;
    perLocation.set(key, index + 1);
    const pos = project(point.location.lon, point.location.lat, box);
    if (index > 0 && mapState.zoom > 2.6) {
      const angle = index * GOLDEN_ANGLE;
      const radius = Math.min(14 * Math.sqrt(index), 44);
      pos.x += cos(angle) * radius;
      pos.y += sin(angle) * radius;
    }
    expanded.push({ ...point, x: pos.x, y: pos.y });
  }
  const threshold =
    mapState.zoom < 2
      ? 52
      : mapState.zoom < 3.8
        ? 34
        : mapState.zoom < 5.2
          ? 20
          : 0;
  if (!threshold)
    return expanded.map((point) => ({
      x: point.x,
      y: point.y,
      points: [point],
    }));
  const clusters = [];
  for (const point of expanded) {
    let cluster = clusters.find(
      (item) => dist(point.x, point.y, item.x, item.y) <= threshold,
    );
    if (!cluster) {
      cluster = { x: point.x, y: point.y, points: [] };
      clusters.push(cluster);
    }
    cluster.points.push(point);
    cluster.x =
      cluster.points.reduce((sum, item) => sum + item.x, 0) /
      cluster.points.length;
    cluster.y =
      cluster.points.reduce((sum, item) => sum + item.y, 0) /
      cluster.points.length;
  }
  return clusters;
}

function drawMapPoint(point) {
  const selected = selectedProduct && selectedProduct.key === point.product.key;
  const r = selected ? 10 : 7;
  if (selected) {
    stroke(themeLineColor());
    strokeWeight(2.4);
  } else {
    stroke(themeVisualBackground());
    strokeWeight(1.2);
  }
  fill(point.product.origin === "brasileiro" ? COLORS.yellow : COLORS.magenta);
  circle(point.x, point.y, r * 2);
  hitAreas.push({
    kind: "product",
    product: point.product,
    shape: "circle",
    cx: point.x,
    cy: point.y,
    r: r + 6,
  });
}

function drawMapCluster(cluster) {
  const total = cluster.points.length;
  const hasBR = cluster.points.some(
    (point) => point.product.origin === "brasileiro",
  );
  const hasIntl = cluster.points.some(
    (point) => point.product.origin === "internacional",
  );
  const r = constrain(13 + Math.sqrt(total) * 7, 20, 58);
  stroke(themeLineColor());
  strokeWeight(1);
  fill(
    hasBR && hasIntl ? COLORS.yellow : hasBR ? COLORS.yellow : COLORS.magenta,
  );
  circle(cluster.x, cluster.y, r * 2);
  if (hasBR && hasIntl) {
    noStroke();
    fill(colorAlpha(COLORS.magenta, 210));
    arc(cluster.x, cluster.y, r * 2, r * 2, -HALF_PI, HALF_PI);
  }
  fill(hasIntl && !hasBR ? "#FFFFFF" : "#000000");
  noStroke();
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(Math.min(21, r * 0.78));
  textAlign(CENTER, CENTER);
  text(String(total), cluster.x, cluster.y - 1);
  textStyle(NORMAL);
  hitAreas.push({
    kind: "cluster",
    cluster,
    shape: "circle",
    cx: cluster.x,
    cy: cluster.y,
    r: r + 6,
  });
}

function visualMousePressed(mx, my) {
  if (mx < visualX() || mx > productPanelX() || my < 0 || my > height)
    return false;
  const yearHit = clickedYearHandle(mx, my);
  if (yearHit) {
    draggedYearHandle = yearHit;
    return true;
  }
  const hit = hitAreaAt(mx, my);
  if (hit && hit.kind === "product") {
    selectProduct(hit.product);
    return true;
  }
  if (hit && hit.kind === "tag") {
    focusedCircularTagKey =
      focusedCircularTagKey === hit.tag.key ? "" : hit.tag.key;
    return true;
  }
  if (hit && hit.kind === "cluster") {
    mapState.zoom = constrain(mapState.zoom * 1.65, 1, 7);
    mapState.panX += visualX() + visualW() / 2 - hit.cluster.x;
    mapState.panY += (height - TIMELINE_H) / 2 - hit.cluster.y;
    limitMapPan();
    return true;
  }
  if (activeView === VISAO_MAPA_MUNDI && my < height - TIMELINE_H) {
    mapState.dragging = true;
    mapState.previousX = mx;
    mapState.previousY = my;
    return true;
  }
  return false;
}

const VIEW_RENDERERS = {
  [VISAO_CIRCULAR]: (visible) => drawCircularView(visible),
  [VISAO_BOLHAS]: () => drawBubbleView(productsShownInCircular()),
  [VISAO_LINHA_TEMPO]: () => drawTimelineView(productsShownInCircular()),
  [VISAO_MAPA_MUNDI]: (visible) => drawMapView(visible),
};

function drawCurrentVisualization() {
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(visualX(), 0, visualW(), visualH());
  drawingContext.clip();

  const productsVisible = visibleProducts();
  const renderer = VIEW_RENDERERS[activeView] || drawCircularView;
  renderer(productsVisible);

  drawYearBand();

  drawingContext.restore();
}

function drawVisualizationBackground() {
  noStroke();
  fill(themeVisualBackground());
  rect(visualX(), 0, visualW(), visualH());
}

function drawVisualizationSummary() {
  const sel = selectedTags();
  const summaryDims = DIMENSION_ORDER.filter((dim) => dim !== "tipo_obra");
  const countsByDim = {};
  let totalTags = 0;
  for (const dim of summaryDims) {
    const count = sel.filter((tag) => tag.dimension === dim).length;
    countsByDim[dim] = count;
    totalTags += count;
  }
  const totalProducts = visibleProducts(true).length;
  fill(colorAlpha(themeLineColor(), 215));
  noStroke();
  textFont(fontes.robotoCondensed);
  textSize(13);
  textAlign(LEFT, TOP);
  const parts = summaryDims.map(
    (dim) => `${getDimension(dim)?.label || dim}: ${countsByDim[dim] || 0}`,
  );
  text(
    `${totalProducts} obras conectadas a ${totalTags} tags - ${parts.join(" - ")}`,
    visualX() + 10,
    12,
  );
}

function drawCenteredVisualMessage(message, x, y) {
  fill(colorAlpha(themeLineColor(), 180));
  noStroke();
  textFont(fontes.robotoCondensed);
  textSize(16);
  textAlign(CENTER, CENTER);
  text(message, x, y);
}

function limitMapPan() {
  if (mapState.zoom <= 1.01) {
    mapState.panX = 0;
    mapState.panY = 0;
    return;
  }
  const box = currentMapBox();
  mapState.panX = constrain(
    mapState.panX,
    -box.w * (mapState.zoom - 1) * 0.55,
    box.w * (mapState.zoom - 1) * 0.55,
  );
  mapState.panY = constrain(
    mapState.panY,
    -box.h * (mapState.zoom - 1) * 0.62,
    box.h * (mapState.zoom - 1) * 0.62,
  );
}
