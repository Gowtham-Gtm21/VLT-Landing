/**
 * A fixed film-grain overlay. Pure CSS over an inline SVG turbulence texture —
 * no image request, and it sits above everything at very low opacity to take
 * the flatness off the large dark areas.
 */
export default function Grain() {
  return <div className="grain" aria-hidden="true" />;
}
