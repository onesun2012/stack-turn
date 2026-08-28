/** 统一点按输入：pointerdown 覆盖触屏 + 鼠标；空格仅供桌面调试 */
export function onTap(handler: () => void): () => void {
  const onPointer = () => handler();
  const onKey = (e: KeyboardEvent) => {
    if (e.code === 'Space' && !e.repeat) handler();
  };
  window.addEventListener('pointerdown', onPointer);
  window.addEventListener('keydown', onKey);
  return () => {
    window.removeEventListener('pointerdown', onPointer);
    window.removeEventListener('keydown', onKey);
  };
}