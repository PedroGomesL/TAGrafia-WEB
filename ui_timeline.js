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
  strokeWeight(8);
  strokeCap(ROUND);
  line(tx, ty, tx + tw, ty);

  // Active track (dark blue)
  stroke(COLORS.blue);
  strokeWeight(8);
  line(xStart, ty, xEnd, ty);

  // Handles hover & interaction
  const hoverStart = dist(mouseX, mouseY, xStart, ty) <= 18;
  const hoverEnd = dist(mouseX, mouseY, xEnd, ty) <= 18;
  if ((hoverStart || hoverEnd || draggedYearHandle) && typeof requestCursor === "function") {
    requestCursor(HAND);
  }

  // Handles
  stroke("#000000");
  strokeWeight(2);
  fill(hoverStart || draggedYearHandle === "start" ? "#F0F2FF" : "#ffffff");
  circle(xStart, ty, hoverStart || draggedYearHandle === "start" ? 33 : 30);
  fill(hoverEnd || draggedYearHandle === "end" ? "#F0F2FF" : "#ffffff");
  circle(xEnd, ty, hoverEnd || draggedYearHandle === "end" ? 33 : 30);

  // Labels
  noStroke();
  fill("#000000");
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(24);
  textAlign(CENTER, BOTTOM);
  text(String(yearStart), xStart, ty - 22);
  text(String(yearEnd), xEnd, ty - 22);
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
  if (Math.abs(mx - yearToX(yearStart)) < 18) return "start";
  if (Math.abs(mx - yearToX(yearEnd)) < 18) return "end";
  return null;
}
