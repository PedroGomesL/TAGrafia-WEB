function timelineTrackBounds() {
  const inset = typeof TIMELINE_TRACK_INSET !== "undefined" ? TIMELINE_TRACK_INSET : 40;
  const maxTimelineW = 1800;
  const rawW = Math.max(100, visualW() - inset * 2);
  const tw = Math.min(rawW, maxTimelineW);
  const tx = visualX() + (visualW() - tw) / 2;
  const ty = height - TIMELINE_H / 2;
  return { tx, tw, ty };
}

function drawYearBand() {
  const { tx, tw, ty } = timelineTrackBounds();
  const xStart = yearToX(yearStart);
  const xEnd = yearToX(yearEnd);

  // Background track (linha base)
  stroke("#8a93e3");
  strokeWeight(6);
  strokeCap(ROUND);
  line(tx, ty, tx + tw, ty);

  // Marcadores visuais sutis de décadas e lustros para dar precisão à passagem ano a ano
  for (let y = YEAR_MIN; y <= YEAR_MAX; y += 10) {
    const mx = yearToX(y);
    const isMajor = y % 20 === 0;
    stroke(typeof themeLineColor === "function" ? colorAlpha(themeLineColor(), isMajor ? 55 : 30) : "rgba(0,0,0,0.2)");
    strokeWeight(isMajor ? 1.4 : 1.0);
    line(mx, ty + 7, mx, ty + (isMajor ? 14 : 11));
  }
  for (let y = YEAR_MIN + 5; y < YEAR_MAX; y += 10) {
    const mx = yearToX(y);
    stroke(typeof themeLineColor === "function" ? colorAlpha(themeLineColor(), 18) : "rgba(0,0,0,0.1)");
    strokeWeight(0.8);
    line(mx, ty + 7, mx, ty + 10);
  }

  // Active track (intervalo ativo selecionado em azul)
  stroke(COLORS.blue);
  strokeWeight(6);
  line(xStart, ty, xEnd, ty);

  // Handles hover & interaction
  const hoverStart = dist(mouseX, mouseY, xStart, ty) <= 20;
  const hoverEnd = dist(mouseX, mouseY, xEnd, ty) <= 20;
  if ((hoverStart || hoverEnd || draggedYearHandle) && typeof requestCursor === "function") {
    requestCursor(HAND);
  }

  // Handles (alças circulares de arraste)
  stroke("#000000");
  strokeWeight(1.8);
  fill(hoverStart || draggedYearHandle === "start" ? "#F0F2FF" : "#ffffff");
  circle(xStart, ty, hoverStart || draggedYearHandle === "start" ? 28 : 26);
  fill(hoverEnd || draggedYearHandle === "end" ? "#F0F2FF" : "#ffffff");
  circle(xEnd, ty, hoverEnd || draggedYearHandle === "end" ? 28 : 26);

  // Labels dos anos selecionados (com afastamento suave quando os anos estão próximos)
  noStroke();
  fill(typeof themeLineColor === "function" ? themeLineColor() : "#000000");
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(16);
  textAlign(CENTER, BOTTOM);
  if (yearStart === yearEnd) {
    text(String(yearStart), xStart, ty - 16);
  } else {
    const span = Math.abs(xEnd - xStart);
    if (span < 52) {
      const shift = Math.max(12, (52 - span) / 2);
      text(String(yearStart), xStart - shift, ty - 16);
      text(String(yearEnd), xEnd + shift, ty - 16);
    } else {
      text(String(yearStart), xStart, ty - 16);
      text(String(yearEnd), xEnd, ty - 16);
    }
  }
  textStyle(NORMAL);
}

function yearToX(year) {
  const { tx, tw } = timelineTrackBounds();
  return map(year, YEAR_MIN, YEAR_MAX, tx, tx + tw);
}

function xToYear(x) {
  const { tx, tw } = timelineTrackBounds();
  const end = tx + tw;
  const value = map(constrain(x, tx, end), tx, end, YEAR_MIN, YEAR_MAX);
  return constrain(Math.round(value), YEAR_MIN, YEAR_MAX);
}

function clickedYearHandle(mx, my) {
  if (my < height - TIMELINE_H || my > height) return null;
  const { tx, tw, ty } = timelineTrackBounds();
  const xStart = yearToX(yearStart);
  const xEnd = yearToX(yearEnd);
  const distStart = Math.abs(mx - xStart);
  const distEnd = Math.abs(mx - xEnd);

  // Se as alças estão sobrepostas ou muito próximas (ex: mesmo ano selecionado)
  if (Math.abs(xStart - xEnd) < 22) {
    if (distStart < 24 || distEnd < 24) {
      return mx >= (xStart + xEnd) / 2 ? "end" : "start";
    }
    return null;
  }

  if (distStart < 20) return "start";
  if (distEnd < 20) return "end";

  // Clique direto na barra da timeline para posicionar suavemente a alça mais próxima
  if (Math.abs(my - ty) <= 16 && mx >= tx - 6 && mx <= tx + tw + 6) {
    const clickedYear = xToYear(mx);
    if (mx < xStart) {
      yearStart = clickedYear;
      return "start";
    } else if (mx > xEnd) {
      yearEnd = clickedYear;
      return "end";
    } else {
      if (distStart <= distEnd) {
        yearStart = clickedYear;
        return "start";
      } else {
        yearEnd = clickedYear;
        return "end";
      }
    }
  }

  return null;
}
