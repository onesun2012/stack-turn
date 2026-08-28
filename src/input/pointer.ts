/** 统一点按输入：pointerdown 覆盖触屏 + 鼠标；空格仅供桌面调试 */
export function onTap(handler: () => void): () => void {
  const onPointer = () => handler();
  const onKey = (e: KeyboardEvent) => {
    if (e.code === 'Space' && !e.repeat) handler();
  };
  // 长按弹出的右键菜单会打断连续点按（移动端长按尤其明显）
  const prevent = (e: Event) => e.preventDefault();
  window.addEventListener('pointerdown', onPointer);
  window.addEventListener('keydown', onKey);
  window.addEventListener('contextmenu', prevent);
  return () => {
    window.removeEventListener('pointerdown', onPointer);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('contextmenu', prevent);
  };
}