/** Fixed stitched line on the left edge; PageMotion draws it with scroll. */
export function Rail() {
  return (
    <div id="rail" aria-hidden="true">
      <svg viewBox="0 0 20 100" preserveAspectRatio="none">
        <path id="stitch-path" d="M10,0 L10,100" pathLength={100} />
      </svg>
    </div>
  );
}
