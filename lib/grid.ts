/**
 * Arrow-key moves over the album grid (D-045). `index` runs page by page;
 * `pageSizes` holds the card count of each visible page, laid side by side,
 * so Left / Right cross from one page of a spread to the other on the same row.
 * Returns null when the move leaves the grid or lands on an empty pocket.
 */
export function gridMove(
  key: string,
  index: number,
  cols: number,
  pageSizes: readonly number[],
): number | null {
  const total = pageSizes.reduce((a, b) => a + b, 0);
  if (key === "Home") return total ? 0 : null;
  if (key === "End") return total ? total - 1 : null;

  let page = 0;
  let offset = index;
  while (page < pageSizes.length && offset >= pageSizes[page]) {
    offset -= pageSizes[page];
    page++;
  }
  if (page >= pageSizes.length) return null;
  let row = Math.floor(offset / cols);
  let x = page * cols + (offset % cols);

  if (key === "ArrowLeft") x--;
  else if (key === "ArrowRight") x++;
  else if (key === "ArrowUp") row--;
  else if (key === "ArrowDown") row++;
  else return null;

  const target = Math.floor(x / cols);
  if (x < 0 || row < 0 || target >= pageSizes.length) return null;
  const cell = row * cols + (x % cols);
  if (cell >= pageSizes[target]) return null;
  return pageSizes.slice(0, target).reduce((a, b) => a + b, 0) + cell;
}

/** Single-key shortcuts stay quiet while Ash types (D-046). */
export function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.closest("input, textarea, select, [contenteditable]") !== null
  );
}
