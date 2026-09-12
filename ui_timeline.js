function drawYearBand() {
  const tx = visualX() + 40;
  const tw = visualW() - 80;
  const ty = height - TIMELINE_H / 2; // Middle of timeline area

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

  // Handles
  stroke("#000000");
  strokeWeight(2);
  fill("#ffffff");
  circle(xStart, ty, 30);
  circle(xEnd, ty, 30);

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
  const tx = visualX() + 40;
  const tw = visualW() - 80;
  return map(year, YEAR_MIN, YEAR_MAX, tx, tx + tw);
}

function xToYear(x) {
  const tx = visualX() + 40;
  const tw = visualW() - 80;
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
