function savedProductsMousePressed(mx, my, x, contentY, w, scale) {
  const searchY = contentY + 18 * scale;
  const searchX = x + 22 * scale;
  const searchW = Math.min(240 * scale, w - 150 * scale);
  if (insideRect(mx, my, searchX, searchY, searchW, 20 * scale)) {
    savedSearchActive = true;
    return true;
  }
  savedSearchActive = false;
  const sortX = x + w - 88 * scale;
  if (insideRect(mx, my, sortX, searchY, 66 * scale, 20 * scale)) {
    savedSortMode = (savedSortMode + 1) % 3;
    savedScroll = 0;
    return true;
  }
  const items = savedProductsFiltered();
  const gridY = contentY + 58 * scale;
  const cardW = 92 * scale;
  const cardH = 122 * scale;
  const gapX = Math.max(12 * scale, (w - 44 * scale - cardW * 3) / 2);
  const gapY = 32 * scale;
  const gridX = x + 22 * scale;
  const localY = my - gridY + savedScroll;
  for (let i = 0; i < items.length; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = gridX + col * (cardW + gapX);
    const cy = row * (cardH + gapY);
    if (mx >= cx && mx <= cx + cardW && localY >= cy && localY <= cy + cardH) {
      selectProduct(items[i]);
      rightPanelTab = "materiais";
      return true;
    }
  }
  return true;
}
