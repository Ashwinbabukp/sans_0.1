/** Text-only "sans." wordmark (Bricolage Grotesque, purple dot). Click to go home. */
export default function Logo({ color = '#111111', onClick }: { color?: string; onClick?: () => void }) {
  return (
    <button className="logo" onClick={onClick} aria-label="Go to home">
      <span className="wm" style={{ color }}>sans<span className="dot">.</span></span>
    </button>
  );
}
