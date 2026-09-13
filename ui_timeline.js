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

  // Background track (lighter)
  stroke("#8a93e3");
  strokeWeight(6);
  strokeCap(ROUND);
  line(tx, ty, tx + tw, ty);

  // Active track (dark blue)
  stroke(COLORS.blue);
  strokeWeight(6);
  line(xStart, ty, xEnd, ty);

  // Handles hover & interaction
  const hoverStart = dist(mouseX, mouseY, xStart, ty) <= 18;
  const hoverEnd = dist(mouseX, mouseY, xEnd, ty) <= 18;
  if ((hoverStart || hoverEnd || draggedYearHandle) && typeof requestCursor === "function") {
    requestCursor(HAND);
  }

  // Handles
  stroke("#000000");
  strokeWeight(1.8);
  fill(hoverStart || draggedYearHandle === "start" ? "#F0F2FF" : "#ffffff");
  circle(xStart, ty, hoverStart || draggedYearHandle === "start" ? 28 : 26);
  fill(hoverEnd || draggedYearHandle === "end" ? "#F0F2FF" : "#ffffff");
  circle(xEnd, ty, hoverEnd || draggedYearHandle === "end" ? 28 : 26);

  // Labels
  noStroke();
  fill(typeof themeLineColor === "function" ? themeLineColor() : "#000000");
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(16);
  textAlign(CENTER, BOTTOM);
  if (yearStart === yearEnd) {
    text(String(yearStart), xStart, ty - 16);
  } else if (Math.abs(xStart - xEnd) < 45) {
    text(String(yearStart), xStart - 10, ty - 16);
    text(String(yearEnd), xEnd + 10, ty - 16);
  } else {
    text(String(yearStart), xStart, ty - 16);
    text(String(yearEnd), xEnd, ty - 16);
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
  return constrain(Math.round(value / 10) * 10, YEAR_MIN, YEAR_MAX);
}

function clickedYearHandle(mx, my) {
  if (my < height - TIMELINE_H || my > height) return null;
  const xStart = yearToX(yearStart);
  const xEnd = yearToX(yearEnd);
  const distStart = Math.abs(mx - xStart);
  const distEnd = Math.abs(mx - xEnd);

  // Se as alças estão sobrepostas ou muito próximas (ex: mesmo ano selecionado)
  if (Math.abs(xStart - xEnd) < 22) {
    if (distStart < 20 || distEnd < 20) {
      return mx >= (xStart + xEnd) / 2 ? "end" : "start";
    }
    return null;
  }

  if (distStart < 16) return "start";
  if (distEnd < 16) return "end";
  return null;
}
