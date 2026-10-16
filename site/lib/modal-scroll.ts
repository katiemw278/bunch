/** Keep modal focus restoration from scrolling the underlying page. */
export function lockModalViewport() {
  const left = window.scrollX;
  const top = window.scrollY;
  const overflow = document.body.style.overflow;
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  document.body.style.overflow = "hidden";
  const restorePosition = () => window.scrollTo({ left, top, behavior: "instant" });
  return {
    restorePosition,
    release() {
      document.body.style.overflow = overflow;
      if (previous?.isConnected && previous !== document.body) previous.focus({ preventScroll: true });
      restorePosition();
      // Native dialog close/focus restoration may run after React cleanup.
      requestAnimationFrame(restorePosition);
    },
  };
}
