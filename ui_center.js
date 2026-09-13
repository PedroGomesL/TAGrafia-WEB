function drawCircularView(visible) {
  drawVisualizationBackground();
  const cx = visualX() + visualW() / 2;
  const cy = (height - TIMELINE_H) / 2;
  const availH = height - TIMELINE_H;
  const baseRadius = Math.min(
    340,
    Math.max(100, Math.min(visualW() - 260, availH - 80) / 2),
  );
  const tags = tagsForCircular();
  const tagPositions = new Map();

  let productsVisual = getCircularVisualProducts(tags);

  if (selectedProduct && productsVisual.length) {
    let slot = 0;
    let maxFitIdx = -1;
    for (let i = 0; i < productsVisual.length; i++) {
      if (slot >= 38) break;
      const seg = Math.min(Math.max(1, productsVisual[i].weight), 3, 38 - slot);
      slot += seg;
      maxFitIdx = i;
    }
    const selIdx = productsVisual.findIndex(
      (item) => item.product.key === selectedProduct.key,
    );
    if (selIdx > maxFitIdx && maxFitIdx >= 0) {
      const item = productsVisual[selIdx];
      productsVisual = [
        ...productsVisual.slice(0, maxFitIdx),
        item,
        ...productsVisual.slice(maxFitIdx, selIdx),
        ...productsVisual.slice(selIdx + 1),
      ];
    }
  }

  if (!selectedProduct && productsVisual.length)
    selectProduct(productsVisual[0].product);

  // Pre-calculate max radius to determine scale factor
  let maxCornerDist = baseRadius + 140;
  let slotCalc = 0;
  for (const item of productsVisual) {
    if (slotCalc >= 38) break;
    const segments = Math.min(constrain(item.weight, 1, 3), 38 - slotCalc);
    const cardH = Math.max(34, ((TWO_PI * baseRadius) / 38) * segments * 0.92);
    const cardW = constrain(measureText(item.product.name, 16) + 24, 90, 135);
    const dist = Math.hypot(baseRadius + cardW + 6, cardH / 2);
    if (dist > maxCornerDist) maxCornerDist = dist;
    slotCalc += segments;
  }

  // Calculate safe boundaries (40px top padding for text)
  const safeR_Y = cy - 40;
  const safeR_X = visualW() / 2 - 16;
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
    const hitX = cx + (pos.x - cx) * scaleRatio;
    const hitY = cy + (pos.y - cy) * scaleRatio;
    if (dist(mouseX, mouseY, hitX, hitY) <= 13 * scaleRatio) {
      hoveredCircularTag = tag;
    }
    hitAreas.push({
      kind: "tag",
      tag,
      cx: hitX,
      cy: hitY,
      r: 13 * scaleRatio,
    });
  }

  let slot = 0;
  for (const item of productsVisual) {
    if (slot >= 38) break;
    const segments = Math.min(constrain(item.weight, 1, 3), 38 - slot);
    const angle = -HALF_PI + ((slot + (segments - 1) / 2) * TWO_PI) / 38;
    const cardW = constrain(measureText(item.product.name, 16) + 24, 90, 135);
    const cardH = Math.max(34, ((TWO_PI * radius) / 38) * segments * 0.92);
    const cardCx = cx + cos(angle) * (radius + cardW / 2 + 5);
    const cardCy = cy + sin(angle) * (radius + cardW / 2 + 5);
    const targetX = cx + cos(angle) * radius;
    const targetY = cy + sin(angle) * radius;
    const rotation = cos(angle) < 0 ? angle + PI : angle;

    const isItemSelected = selectedProduct && selectedProduct.key === item.product.key;
    for (const tag of item.tags) {
      const pos = tagPositions.get(tag.key);
      const active =
        !focusedCircularTagKey || focusedCircularTagKey === tag.key;
      stroke(colorAlpha(tag.color, isItemSelected ? 255 : (active ? 230 : 55)));
      strokeWeight(isItemSelected ? 3.0 : (active ? 1.8 : 0.8));
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

  const displayTag = hoveredCircularTag || tagsByKey.get(focusedCircularTagKey);
  if (displayTag) {
    const dim = getDimension(displayTag.dimension);
    const dimLabel = dim ? dim.label : "";
    const tooltipText = dimLabel
      ? `${displayTag.label} (${dimLabel})`
      : displayTag.label;
    fill(themeLineColor());
    noStroke();
    textFont(fontes.robotoCondensed);
    textSize(13);
    textAlign(CENTER, TOP);
    text(tooltipText, cx, cy + radius * scaleRatio + 28);
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
  fill(product.origin === "brasileiro" ? "#000000" : "#FFFFFF");
  noStroke();
  textFont(fontes.afacad);
  textStyle(BOLD);
  drawProductCardLabel(product.name, w - 18, h - 8);
  textStyle(NORMAL);
  if (selected && typeof isFocusedElement === "function" && isFocusedElement("center_product")) {
    drawFocusRingRect(-w / 2, -h / 2, w, h, 4);
  }
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
  for (let size = 16; size >= 10; size--) {
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
  textSize(10);
  const maxLines = Math.max(1, Math.floor(maxH / (10 * 0.94)));
  const lines = wrapProductCardLabel(label, maxW).slice(0, maxLines);
  if (lines.length && textWidth(lines[lines.length - 1]) > maxW) {
    lines[lines.length - 1] = fitLineWithEllipsis(
      lines[lines.length - 1],
      maxW,
    );
  }
  return { lines, size: 10 };
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

function getBubbleTextCandidates(name) {
  const clean = cleanText(name);
  if (!clean) return [[""]];

  if (clean === "Modernismo Norte-Americano") {
    return [
      ["Modernismo", "Norte-Americano"],
      ["Modernismo", "Norte-", "Americano"],
      ["Modernismo", "Norte", "Americano"],
      [clean],
    ];
  }
  if (clean === "HfG Ulm / Good Design") {
    return [
      ["HfG Ulm /", "Good Design"],
      ["HfG Ulm", "Good Design"],
      ["HfG Ulm", "Good", "Design"],
      [clean],
    ];
  }
  if (clean === "Cranbrook Academy of Art") {
    return [
      ["Cranbrook", "Academy of Art"],
      ["Cranbrook", "Academy", "of Art"],
      [clean],
    ];
  }
  if (clean === "California New Wave") {
    return [
      ["California", "New Wave"],
      ["California", "New", "Wave"],
      [clean],
    ];
  }
  if (clean === "Deutscher Werkbund") {
    return [
      ["Deutscher", "Werkbund"],
      ["Deutscher", "Werk-", "bund"],
      [clean],
    ];
  }
  if (clean === "Estilo Internacional") {
    return [
      ["Estilo", "Internacional"],
      ["Estilo", "Inter-", "nacional"],
      [clean],
    ];
  }
  if (clean === "Art Nouveau") {
    return [
      [clean],
      ["Art", "Nouveau"],
    ];
  }
  if (clean === "Design Orgânico") {
    return [
      [clean],
      ["Design", "Orgânico"],
    ];
  }
  if (clean === "Obras brasileiras") {
    return [
      [clean],
      ["Obras", "brasileiras"],
    ];
  }
  if (clean === "Streamlining") {
    return [
      [clean],
      ["Stream-", "lining"],
    ];
  }
  if (clean === "Biomorfismo") {
    return [
      [clean],
      ["Bio-", "morfismo"],
    ];
  }
  if (clean === "Anti-Design") {
    return [
      [clean],
      ["Anti-", "Design"],
    ];
  }

  const words = clean.split(/\s+/);
  if (words.length === 1) {
    if (clean.includes("-")) {
      const parts = clean.split("-");
      return [
        [clean],
        [parts[0] + "-", parts.slice(1).join("-")],
      ];
    }
    return [[clean]];
  }
  if (words.length === 2) {
    return [
      [clean],
      [words[0], words[1]],
    ];
  }
  const mid = Math.ceil(words.length / 2);
  return [
    [words.slice(0, mid).join(" "), words.slice(mid).join(" ")],
    [clean],
    words,
  ];
}

function fitBubbleText(group) {
  const hasProds = group.products.length > 0;
  const candidates = getBubbleTextCandidates(group.name);

  const measureW = (str, s) => {
    if (typeof textWidth === "function") {
      textSize(s);
      return textWidth(cleanText(str));
    }
    return cleanText(str).length * s * 0.55;
  };

  const centerY = hasProds ? group.y - group.r * 0.44 : group.y;
  const minDotTopY = group.y - group.r * 0.08;

  let bestCand = candidates[0];
  let bestSize = 6.0;
  let foundValid = false;
  let bestScore = -999999;

  for (const cand of candidates) {
    const maxS = Math.min(13.5, Math.max(9.0, group.r * 0.25));
    for (let s = maxS; s >= 5.5; s -= 0.25) {
      const lineHeight = s * 1.15;
      const totalH = (cand.length - 1) * lineHeight;
      const startY = centerY - totalH / 2;
      const topY = startY - s * 0.45;
      const bottomY = startY + totalH + s * 0.45;

      // Restrições verticais: topo dentro da calota e base acima dos círculos das obras
      if (topY < group.y - group.r + 1.5) continue;
      if (hasProds && bottomY > minDotTopY - 1.0) continue;
      if (!hasProds && bottomY > group.y + group.r - 1.5) continue;

      // Restrições horizontais: cada linha deve caber na corda do círculo naquela altura
      let allLinesFit = true;
      for (let i = 0; i < cand.length; i++) {
        const lineY = startY + i * lineHeight;
        const dy = Math.abs(lineY - group.y);
        if (dy >= group.r - 0.5) {
          allLinesFit = false;
          break;
        }
        const chordW = 2 * Math.sqrt(group.r * group.r - dy * dy) - 4.0;
        const lineW = measureW(cand[i], s);
        if (lineW > chordW) {
          allLinesFit = false;
          break;
        }
      }

      if (allLinesFit) {
        const score = s * 10 - cand.length * 0.6;
        if (!foundValid || score > bestScore) {
          foundValid = true;
          bestScore = score;
          bestCand = cand;
          bestSize = s;
        }
        break; // Encontrou maior tamanho que cabe para este candidato
      }
    }
  }

  if (!foundValid) {
    bestCand = candidates.find((c) => c.length > 1) || candidates[0];
    bestSize = 5.5;
  }

  return { lines: bestCand, size: bestSize };
}

function drawBubbleView(productsVisible) {
  drawVisualizationBackground();
  const cx = visualX() + visualW() / 2;
  const cy = (height - TIMELINE_H) / 2;
  const outerR = Math.max(130, Math.min(visualW() * 0.46, (height - TIMELINE_H) * 0.46));
  const bubbleKey = `${productsVisible.map((p) => p.key).join(",")}|${cx}|${cy}|${outerR}|${yearStart}|${yearEnd}`;
  if (bubbleKey !== _bubbleCacheKey || !_cachedBubbleGroups) {
    _cachedBubbleGroups = buildBubbleGroups(productsVisible, cx, cy, outerR);
    _bubbleCacheKey = bubbleKey;
  }
  const groups = _cachedBubbleGroups;

  if (!selectedProduct && groups.length && groups[0].products.length)
    selectProduct(groups[0].products[0]);

  noFill();
  stroke(themeLineColor());
  strokeWeight(2.5);
  circle(cx, cy, outerR * 2);

  for (const group of groups) {
    stroke(lightMode ? "#000000" : "#FFFFFF");
    strokeWeight(1.6);
    fill(lightMode ? "#D9D9D9" : "#333333");
    circle(group.x, group.y, group.r * 2);
    drawProductsInBubble(group);

    // Renderiza o nome do grupo SEMPRE dentro do círculo (terço superior)
    fill(lightMode ? "#000000" : "#FFFFFF");
    noStroke();
    textFont(fontes.afacad);
    textStyle(BOLD);
    const hasProds = group.products.length > 0;

    const { lines, size } = fitBubbleText(group);
    textSize(size);
    textAlign(CENTER, CENTER);

    const lineHeight = size * 1.15;
    const centerY = hasProds ? group.y - group.r * 0.44 : group.y;
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = centerY - totalHeight / 2;

    for (let i = 0; i < lines.length; i++) {
      text(lines[i], group.x, startY + i * lineHeight);
    }
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
      (a.name === "Obras brasileiras" ? -1 : b.name === "Obras brasileiras" ? 1 : 0) ||
      b.products.length - a.products.length ||
      a.name.localeCompare(b.name, "pt-BR"),
  );

  if (!groups.length) return [];
  if (groups.length === 1) {
    groups[0].x = cx;
    groups[0].y = cy;
    groups[0].r = Math.min(outerR * 0.65, 140);
    return groups;
  }

  const gap = 8;
  const boundaryGap = 6;
  const maxOuterD = outerR - boundaryGap;

  // Sizing of center bubble (Obras brasileiras)
  const centerGroup = groups[0];
  centerGroup.x = cx;
  centerGroup.y = cy;
  centerGroup.r = constrain(38 + Math.sqrt(centerGroup.products.length) * 12, 48, outerR * 0.38);

  // Sizing of satellite bubbles
  const satellites = groups.slice(1);
  const satCount = satellites.length;

  for (const g of satellites) {
    g.products.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    g.r = constrain(26 + Math.sqrt(g.products.length) * 10, 30, outerR * 0.28);
  }

  // Calculate area constraint and scale proportionally
  let totalSatArea = 0;
  for (const g of satellites) totalSatArea += PI * (g.r + gap / 2) ** 2;
  const availableArea = PI * (maxOuterD ** 2 - (centerGroup.r + gap) ** 2) * 0.62;
  if (totalSatArea > availableArea) {
    const scale = Math.sqrt(availableArea / totalSatArea);
    centerGroup.r = Math.max(36, centerGroup.r * Math.max(0.75, scale));
    for (const g of satellites) {
      g.r = Math.max(22, g.r * scale);
    }
  }

  // Initial circular distribution around center
  for (let i = 0; i < satCount; i++) {
    const g = satellites[i];
    const angle = -HALF_PI + (i * TWO_PI) / satCount;
    const d = Math.min(maxOuterD - g.r, centerGroup.r + g.r + gap);
    g.x = cx + cos(angle) * d;
    g.y = cy + sin(angle) * d;
  }

  // Force relaxation iterations to guarantee non-overlapping layout
  const totalIters = 350;
  for (let iter = 0; iter < totalIters; iter++) {
    for (const g of satellites) {
      g.x += (cx - g.x) * 0.005;
      g.y += (cy - g.y) * 0.005;
    }

    for (const g of satellites) {
      const dx = g.x - cx;
      const dy = g.y - cy;
      const d = Math.max(0.001, Math.hypot(dx, dy));
      const minCenterD = centerGroup.r + g.r + gap;
      if (d < minCenterD) {
        g.x = cx + (dx / d) * minCenterD;
        g.y = cy + (dy / d) * minCenterD;
      }
    }

    for (let i = 0; i < satCount; i++) {
      for (let j = i + 1; j < satCount; j++) {
        const a = satellites[i];
        const b = satellites[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.max(0.001, Math.hypot(dx, dy));
        const minD = a.r + b.r + gap;
        if (d < minD) {
          const push = (minD - d) * 0.52;
          a.x -= (dx / d) * push;
          a.y -= (dy / d) * push;
          b.x += (dx / d) * push;
          b.y += (dy / d) * push;
        }
      }
    }

    for (const g of satellites) {
      const dx = g.x - cx;
      const dy = g.y - cy;
      const d = Math.hypot(dx, dy);
      const limit = maxOuterD - g.r;
      if (d > limit) {
        g.x = cx + (dx / d) * limit;
        g.y = cy + (dy / d) * limit;
      }
    }

    if (iter > 180 && iter % 10 === 0) {
      let maxOverlap = 0;
      for (let i = 0; i < satCount; i++) {
        for (let j = i + 1; j < satCount; j++) {
          const d = Math.hypot(satellites[i].x - satellites[j].x, satellites[i].y - satellites[j].y);
          const minD = satellites[i].r + satellites[j].r + gap;
          if (d < minD) {
            maxOverlap = Math.max(maxOverlap, minD - d);
          }
        }
      }
      if (maxOverlap > 0.5) {
        for (const g of satellites) {
          g.r = Math.max(18, g.r * 0.98);
        }
        centerGroup.r = Math.max(32, centerGroup.r * 0.99);
      }
    }
  }

  for (const g of satellites) {
    const dx = g.x - cx;
    const dy = g.y - cy;
    const d = Math.max(0.001, Math.hypot(dx, dy));
    const minCenterD = centerGroup.r + g.r + gap;
    if (d < minCenterD) {
      g.x = cx + (dx / d) * minCenterD;
      g.y = cy + (dy / d) * minCenterD;
    }
    const curD = Math.hypot(g.x - cx, g.y - cy);
    const limit = maxOuterD - g.r;
    if (curD > limit) {
      g.x = cx + ((g.x - cx) / curD) * limit;
      g.y = cy + ((g.y - cy) / curD) * limit;
    }
  }

  return groups;
}

function seededRandom(seed, idx, salt) {
  let h = (seed ^ (idx * 374761393) ^ (salt * 668265263)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 2246822519);
  h = Math.imul(h ^ (h >>> 13), 3266489917);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function computeBubbleDots(group) {
  const total = group.products.length;
  if (!total) return [];

  let dotR;
  if (total === 1) dotR = constrain(group.r * 0.15, 6, 9);
  else if (total === 2) dotR = constrain(group.r * 0.14, 5.5, 8.5);
  else if (total <= 4) dotR = constrain(group.r * 0.125, 5, 8);
  else {
    const fieldR = group.r * 0.52;
    dotR = constrain(fieldR / Math.max(2.2, Math.sqrt(total) * 1.75), 4.0, 7.5);
  }

  const minDotTopY = group.y - group.r * 0.08;
  const centerY = group.y + group.r * (total <= 4 ? 0.35 : 0.30);
  const centerX = group.x;

  if (total === 1) {
    return [{ x: centerX, y: centerY, r: dotR }];
  }

  const seed = Math.abs(hashString(group.name));
  const baseAngle = seededRandom(seed, 0, 101) * TWO_PI;
  const minSpacing = dotR * 2 + 2.5;
  const maxSpreadR = Math.min(
    group.r - dotR - 3.5,
    Math.max(minSpacing * 0.9, Math.sqrt(total) * minSpacing * 0.58),
  );

  const dots = group.products.map((p, i) => {
    const pSeed = Math.abs(hashString(p.key || p.name || String(i)));
    const u = seededRandom(seed ^ pSeed, i, 3);
    const v = seededRandom(seed ^ pSeed, i, 7);
    const angle = baseAngle + i * GOLDEN_ANGLE + (u - 0.5) * 1.4;
    const dist = Math.sqrt(0.15 + 0.85 * ((i + v * 0.8) / total)) * maxSpreadR;
    return {
      x: centerX + Math.cos(angle) * dist,
      y: centerY + Math.sin(angle) * dist * 0.85,
      r: dotR,
    };
  });

  function applyConstraints(d) {
    const distFromCenter = Math.hypot(d.x - group.x, d.y - group.y);
    const maxDist = group.r - dotR - 2.5;
    if (distFromCenter > maxDist) {
      d.x = group.x + ((d.x - group.x) / distFromCenter) * maxDist;
      d.y = group.y + ((d.y - group.y) / distFromCenter) * maxDist;
    }
    if (d.y - dotR < minDotTopY) {
      d.y = minDotTopY + dotR;
      const dy = d.y - group.y;
      const maxAllowedXDistSq = maxDist * maxDist - dy * dy;
      if (maxAllowedXDistSq > 0) {
        const maxAllowedX = Math.sqrt(maxAllowedXDistSq);
        const curX = d.x - group.x;
        if (Math.abs(curX) > maxAllowedX) {
          d.x = group.x + Math.sign(curX) * maxAllowedX;
        }
      } else {
        d.x = group.x;
      }
    }
  }

  const iters = 40;
  for (let iter = 0; iter < iters; iter++) {
    for (let i = 0; i < total; i++) {
      for (let j = i + 1; j < total; j++) {
        const dx = dots[j].x - dots[i].x;
        const dy = dots[j].y - dots[i].y;
        const d = Math.hypot(dx, dy) || 0.001;
        if (d < minSpacing) {
          const push = (minSpacing - d) * 0.52;
          const px = (dx / d) * push;
          const py = (dy / d) * push;
          dots[i].x -= px;
          dots[i].y -= py;
          dots[j].x += px;
          dots[j].y += py;
        }
      }
    }

    for (let i = 0; i < total; i++) {
      dots[i].x += (centerX - dots[i].x) * 0.02;
      dots[i].y += (centerY - dots[i].y) * 0.02;
      applyConstraints(dots[i]);
    }
  }

  for (let pass = 0; pass < 8; pass++) {
    for (let i = 0; i < total; i++) {
      for (let j = i + 1; j < total; j++) {
        const dx = dots[j].x - dots[i].x;
        const dy = dots[j].y - dots[i].y;
        const d = Math.hypot(dx, dy) || 0.001;
        const reqDist = dots[i].r + dots[j].r + 1.2;
        if (d < reqDist) {
          const push = (reqDist - d) * 0.5;
          const px = (dx / d) * push;
          const py = (dy / d) * push;
          dots[i].x -= px;
          dots[i].y -= py;
          dots[j].x += px;
          dots[j].y += py;
        }
      }
    }
    for (let i = 0; i < total; i++) {
      applyConstraints(dots[i]);
    }
  }

  // Previne alinhamento acidental em grupos pequenos (2 e 3 obras)
  if (total === 2) {
    if (Math.abs(dots[0].y - dots[1].y) < 2.5) {
      dots[0].y -= 1.8;
      dots[1].y += 1.8;
      applyConstraints(dots[0]);
      applyConstraints(dots[1]);
    }
    if (Math.abs(dots[0].x - dots[1].x) < 2.5) {
      dots[0].x -= 1.8;
      dots[1].x += 1.8;
      applyConstraints(dots[0]);
      applyConstraints(dots[1]);
    }
  } else if (total === 3) {
    for (let i = 0; i < 3; i++) {
      for (let j = i + 1; j < 3; j++) {
        if (Math.abs(dots[i].y - dots[j].y) < 1.5) {
          dots[i].y -= 1.2;
          dots[j].y += 1.2;
          applyConstraints(dots[i]);
          applyConstraints(dots[j]);
        }
      }
    }
  }

  return dots;
}

function drawProductsInBubble(group) {
  const total = group.products.length;
  if (!total) return;

  if (!group._dotPositions || group._dotPositions.length !== total) {
    group._dotPositions = computeBubbleDots(group);
  }
  const positions = group._dotPositions;

  for (let i = 0; i < total; i++) {
    const product = group.products[i];
    const pos = positions[i];
    const selected = selectedProduct && selectedProduct.key === product.key;
    if (selected) {
      stroke(themeLineColor());
      strokeWeight(2.3);
    } else {
      noStroke();
    }
    fill(product.origin === "brasileiro" ? COLORS.yellow : COLORS.magenta);
    circle(pos.x, pos.y, (pos.r + (selected ? 1.5 : 0)) * 2);
    if (selected && typeof isFocusedElement === "function" && isFocusedElement("center_product")) {
      drawFocusRingCircle(pos.x, pos.y, pos.r + 3);
    }
    hitAreas.push({
      kind: "product",
      product,
      shape: "circle",
      cx: pos.x,
      cy: pos.y,
      r: pos.r + 7,
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
    if (selected && typeof isFocusedElement === "function" && isFocusedElement("center_product")) {
      drawFocusRingCircle(px, py, r + 4);
    }
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
    if (mapState.zoom > 5.2) {
      for (const pt of cluster.points) drawMapPoint(pt);
    } else if (cluster.points.length === 1) {
      drawMapPoint(cluster.points[0]);
    } else {
      drawMapCluster(cluster);
    }
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

const _mapLocationOffsetsCache = new Map();

function getOrganicLocationOffsets(locPoints, locKey) {
  const sorted = [...locPoints].sort((a, b) =>
    (a.product.key || "").localeCompare(b.product.key || ""),
  );
  const cacheKey = `${locKey}|${sorted.map((p) => p.product.key).join(",")}`;
  if (_mapLocationOffsetsCache.has(cacheKey)) {
    const cached = _mapLocationOffsetsCache.get(cacheKey);
    const mapByKey = new Map();
    for (let i = 0; i < sorted.length; i++) {
      mapByKey.set(sorted[i].product.key, cached[i]);
    }
    return locPoints.map(
      (pt) => mapByKey.get(pt.product.key) || { dx: 0, dy: 0 },
    );
  }

  const n = sorted.length;
  if (n === 0) return [];
  if (n === 1) {
    const res = [{ dx: 0, dy: 0 }];
    _mapLocationOffsetsCache.set(cacheKey, res);
    return res;
  }

  const dotSep = 18.0;
  const maxR = Math.max(dotSep * 0.95, Math.sqrt(n) * dotSep * 0.68);

  let groupSeed = 0;
  for (const pt of sorted) {
    groupSeed =
      (groupSeed + Math.abs(hashString(pt.product.key || pt.product.name))) >>>
      0;
  }

  const baseAngle = seededRandom(groupSeed, 0, 101) * TWO_PI;

  const pts = sorted.map((pt, i) => {
    const pSeed = Math.abs(
      hashString(pt.product.key || pt.product.name || String(i)),
    );
    const u = seededRandom(groupSeed ^ pSeed, i, 11);
    const v = seededRandom(groupSeed ^ pSeed, i, 17);
    const angle = baseAngle + i * GOLDEN_ANGLE + (u - 0.5) * 1.5;
    const r = Math.sqrt(0.08 + 0.92 * ((i + v * 0.8) / n)) * maxR;
    return {
      dx: Math.cos(angle) * r,
      dy: Math.sin(angle) * r,
    };
  });

  const iters = 35;
  for (let iter = 0; iter < iters; iter++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = pts[j].dx - pts[i].dx;
        const dy = pts[j].dy - pts[i].dy;
        const d = Math.hypot(dx, dy) || 0.001;
        if (d < dotSep) {
          const push = (dotSep - d) * 0.5;
          const px = (dx / d) * push;
          const py = (dy / d) * push;
          pts[i].dx -= px;
          pts[i].dy -= py;
          pts[j].dx += px;
          pts[j].dy += py;
        }
      }
    }
    for (let i = 0; i < n; i++) {
      pts[i].dx *= 0.98;
      pts[i].dy *= 0.98;
    }
  }

  for (let pass = 0; pass < 8; pass++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = pts[j].dx - pts[i].dx;
        const dy = pts[j].dy - pts[i].dy;
        const d = Math.hypot(dx, dy) || 0.001;
        const minReq = 18.0;
        if (d < minReq) {
          const push = (minReq - d) * 0.5;
          const px = (dx / d) * push;
          const py = (dy / d) * push;
          pts[i].dx -= px;
          pts[i].dy -= py;
          pts[j].dx += px;
          pts[j].dy += py;
        }
      }
    }
  }

  _mapLocationOffsetsCache.set(cacheKey, pts);
  const mapByKey = new Map();
  for (let i = 0; i < sorted.length; i++) {
    mapByKey.set(sorted[i].product.key, pts[i]);
  }
  return locPoints.map((pt) => mapByKey.get(pt.product.key) || { dx: 0, dy: 0 });
}

function distributeMapLocationPoints(locPoints, locKey, basePos, zoom) {
  const offsets = getOrganicLocationOffsets(locPoints, locKey);
  const zoomFactor = Math.min(1.35, Math.max(0.85, 0.85 + (zoom - 1) * 0.08));
  return locPoints.map((pt, i) => ({
    ...pt,
    x: basePos.x + offsets[i].dx * zoomFactor,
    y: basePos.y + offsets[i].dy * zoomFactor,
  }));
}

function makeMapClusters(points, box) {
  const byLocation = new Map();
  for (const point of points) {
    const key = `${point.location.name || ""}:${point.location.lat}:${point.location.lon}`;
    if (!byLocation.has(key)) byLocation.set(key, []);
    byLocation.get(key).push(point);
  }

  const expanded = [];
  const locGroups = [];
  for (const [key, locPoints] of byLocation.entries()) {
    const basePos = project(
      locPoints[0].location.lon,
      locPoints[0].location.lat,
      box,
    );
    const distributed = distributeMapLocationPoints(
      locPoints,
      key,
      basePos,
      mapState.zoom,
    );
    for (const p of distributed) {
      expanded.push(p);
    }
    locGroups.push({ key, basePos, points: distributed });
  }

  // Anti-colisão global entre todas as obras para garantir margem de >= 4.5-5px entre círculos
  const minPointSep = 19.0;
  for (let iter = 0; iter < 55; iter++) {
    for (let i = 0; i < expanded.length; i++) {
      for (let j = i + 1; j < expanded.length; j++) {
        const dx = expanded[j].x - expanded[i].x;
        const dy = expanded[j].y - expanded[i].y;
        const d = Math.hypot(dx, dy) || 0.001;
        if (d < minPointSep) {
          const push = (minPointSep - d) * 0.5;
          const px = (dx / d) * push;
          const py = (dy / d) * push;
          expanded[i].x -= px;
          expanded[i].y -= py;
          expanded[j].x += px;
          expanded[j].y += py;
        }
      }
    }
  }
  for (let pass = 0; pass < 10; pass++) {
    for (let i = 0; i < expanded.length; i++) {
      for (let j = i + 1; j < expanded.length; j++) {
        const dx = expanded[j].x - expanded[i].x;
        const dy = expanded[j].y - expanded[i].y;
        const d = Math.hypot(dx, dy) || 0.001;
        if (d < minPointSep) {
          const push = (minPointSep - d) * 0.5;
          const px = (dx / d) * push;
          const py = (dy / d) * push;
          expanded[i].x -= px;
          expanded[i].y -= py;
          expanded[j].x += px;
          expanded[j].y += py;
        }
      }
    }
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
  for (const loc of locGroups) {
    let cluster = clusters.find(
      (item) => dist(loc.basePos.x, loc.basePos.y, item.x, item.y) <= threshold,
    );
    if (!cluster) {
      cluster = { x: loc.basePos.x, y: loc.basePos.y, points: [] };
      clusters.push(cluster);
    }
    for (const pt of loc.points) {
      cluster.points.push(pt);
    }
    cluster.x =
      cluster.points.reduce((sum, item) => sum + item.x, 0) /
      cluster.points.length;
    cluster.y =
      cluster.points.reduce((sum, item) => sum + item.y, 0) /
      cluster.points.length;
  }

  // Anti-colisão global entre clusters para garantir margem
  const clusterMargin = 4.5;
  for (let iter = 0; iter < 40; iter++) {
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const rA =
          clusters[i].points.length === 1
            ? 7
            : constrain(13 + Math.sqrt(clusters[i].points.length) * 7, 20, 58);
        const rB =
          clusters[j].points.length === 1
            ? 7
            : constrain(13 + Math.sqrt(clusters[j].points.length) * 7, 20, 58);
        const minDist = rA + rB + clusterMargin;
        const dx = clusters[j].x - clusters[i].x;
        const dy = clusters[j].y - clusters[i].y;
        const d = Math.hypot(dx, dy) || 0.001;
        if (d < minDist) {
          const push = (minDist - d) * 0.5;
          const px = (dx / d) * push;
          const py = (dy / d) * push;
          clusters[i].x -= px;
          clusters[i].y -= py;
          clusters[j].x += px;
          clusters[j].y += py;
        }
      }
    }
  }

  for (const cluster of clusters) {
    if (cluster.points.length === 1) {
      cluster.points[0].x = cluster.x;
      cluster.points[0].y = cluster.y;
    }
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
  if (selected && typeof isFocusedElement === "function" && isFocusedElement("center_product")) {
    drawFocusRingCircle(point.x, point.y, r + 4);
  }
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

    // Badge circular interno para garantir contraste WCAG AAA do número sobre as duas cores
    const innerR = Math.min(13, r * 0.5);
    fill(lightMode ? 255 : 24);
    stroke(themeLineColor());
    strokeWeight(1);
    circle(cluster.x, cluster.y, innerR * 2);
    fill(lightMode ? "#000000" : "#FFFFFF");
    noStroke();
  } else {
    fill(hasIntl ? "#FFFFFF" : "#000000");
    noStroke();
  }
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
  if (mx < visualX() || mx > visualX() + visualW() || my < 0 || my > height)
    return false;
  const yearHit = clickedYearHandle(mx, my);
  if (yearHit) {
    draggedYearHandle = yearHit;
    return true;
  }
  const hit = hitAreaAt(mx, my);
  if (hit && hit.kind === "product") {
    selectProduct(hit.product);
    if (typeof setA11yFocus === "function") {
      setA11yFocus({
        type: "center_product",
        id: "center_product",
        label: hit.product.name,
      });
    }
    keyboardFocusActive = true;
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
  [VISAO_LINHA_TEMPO]: (visible) => drawTimelineView(visible),
  [VISAO_MAPA_MUNDI]: (visible) => drawMapView(visible),
};

function drawCurrentVisualization() {
  drawingContext.save();
  try {
    drawingContext.beginPath();
    drawingContext.rect(visualX(), 0, visualW(), visualH());
    drawingContext.clip();

    const productsVisible = visibleProducts();
    const renderer = VIEW_RENDERERS[activeView] || drawCircularView;
    renderer(productsVisible);

    drawYearBand();
  } finally {
    drawingContext.restore();
  }
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
  const fullText = `${totalProducts} obras conectadas a ${totalTags} tags - ${parts.join(" - ")}`;
  const compactText = `${totalProducts} obras • ${totalTags} tags`;
  const availW = Math.max(50, visualW() - 20);
  const textToShow = textWidth(fullText) <= availW ? fullText : compactText;
  text(textToShow, visualX() + 10, 12);
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
