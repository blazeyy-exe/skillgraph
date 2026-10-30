export function GraphPreview() {
  return (
    <figure className="overflow-hidden rounded-sm border border-line bg-paper-raised p-4">
      <svg
        viewBox="0 0 640 320"
        role="img"
        aria-labelledby="graph-preview-title graph-preview-desc"
        className="h-auto w-full"
      >
        <title id="graph-preview-title">Illustration of a capability graph</title>
        <desc id="graph-preview-desc">
          Experiences connect to tasks, which connect to inferred skills. This is a product
          illustration, not a live user graph.
        </desc>
        <rect width="640" height="320" fill="#fbf7ef" />
        <line x1="120" y1="90" x2="260" y2="70" stroke="#d9d0c3" />
        <line x1="120" y1="90" x2="250" y2="160" stroke="#d9d0c3" />
        <line x1="120" y1="220" x2="250" y2="160" stroke="#d9d0c3" />
        <line x1="260" y1="70" x2="420" y2="110" stroke="#8c3a1f" />
        <line x1="250" y1="160" x2="420" y2="110" stroke="#8c3a1f" />
        <line x1="250" y1="160" x2="430" y2="210" stroke="#d9d0c3" />
        <line x1="420" y1="110" x2="540" y2="70" stroke="#d9d0c3" />
        <g fontFamily="Georgia, serif" fontSize="13" fill="#1c1916">
          <rect x="40" y="68" width="160" height="44" fill="#f3eee4" stroke="#1c1916" />
          <text x="52" y="94">
            Community event
          </text>
          <rect x="40" y="198" width="160" height="44" fill="#f3eee4" stroke="#1c1916" />
          <text x="52" y="224">
            Independent shop
          </text>
          <rect x="200" y="48" width="130" height="40" fill="#fbf7ef" stroke="#5c564e" />
          <text x="212" y="72">
            Coordinated volunteers
          </text>
          <rect x="190" y="140" width="130" height="40" fill="#fbf7ef" stroke="#5c564e" />
          <text x="202" y="164">
            Resolved logistics
          </text>
          <rect x="360" y="88" width="130" height="44" fill="#f0ddd4" stroke="#8c3a1f" />
          <text x="372" y="114">
            Organisation
          </text>
          <rect x="370" y="188" width="130" height="44" fill="#fbf7ef" stroke="#5c564e" />
          <text x="382" y="214">
            Problem solving
          </text>
          <rect x="500" y="48" width="110" height="44" fill="#f3eee4" stroke="#1c1916" />
          <text x="512" y="74">
            Operations
          </text>
        </g>
      </svg>
      <figcaption className="mt-3 text-sm text-ink-soft">
        Product illustration. Live graphs are generated from stored relationships, not decoration.
      </figcaption>
    </figure>
  );
}
