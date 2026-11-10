const mono = "'JetBrains Mono Variable', ui-monospace, monospace"

/** Technische Zeichnung eines gedruckten Lagerbocks für den Startseiten-Kopf. */
export function PartDrawing() {
  return (
    <svg viewBox="0 0 520 440" aria-hidden="true" style={{ display: 'block', width: '100%', height: 'auto' }}>
      <defs>
        <pattern id="mm-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#E6EAF0" strokeWidth="1" />
        </pattern>
        <clipPath id="mm-part">
          <path d="M90 300H430V350H90Z M170 300V180A90 90 0 0 1 350 180V300Z" />
        </clipPath>
        <pattern id="mm-layers" width="8" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 0.5H8" stroke="#2163B5" strokeWidth="1" opacity="0.38" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="520" height="440" fill="url(#mm-grid)" />
      <g clipPath="url(#mm-part)">
        <rect x="80" y="80" width="360" height="280" fill="#E8F0FA" />
        <rect x="80" y="80" width="360" height="280" fill="url(#mm-layers)" />
      </g>
      <path d="M170 300V180A90 90 0 0 1 350 180V300" fill="none" stroke="#0E1726" strokeWidth="1.75" />
      <rect x="90" y="300" width="340" height="50" fill="none" stroke="#0E1726" strokeWidth="1.75" />
      <circle cx="260" cy="180" r="44" fill="#FFFFFF" stroke="#0E1726" strokeWidth="1.75" />
      <path d="M196 180H324M260 116V244" stroke="#2163B5" strokeWidth="1" strokeDasharray="14 4 2 4" />
      <circle cx="125" cy="325" r="9" fill="#FFFFFF" stroke="#0E1726" strokeWidth="1.5" />
      <circle cx="395" cy="325" r="9" fill="#FFFFFF" stroke="#0E1726" strokeWidth="1.5" />
      <path d="M90 362V398M430 362V398M90 388H430" stroke="#55607A" strokeWidth="1" />
      <path d="M90 388l9 -4v8zM430 388l-9 -4v8z" fill="#55607A" />
      <rect x="212" y="378" width="96" height="20" fill="#FFFFFF" />
      <text x="260" y="393" textAnchor="middle" fontFamily={mono} fontSize="13" fill="#0E1726">
        bis 350 mm
      </text>
      <path d="M442 90H478M442 350H478M468 90V350" stroke="#55607A" strokeWidth="1" />
      <path d="M468 90l-4 9h8zM468 350l-4 -9h8z" fill="#55607A" />
      <rect x="458" y="172" width="20" height="96" fill="#FFFFFF" />
      <text x="473" y="220" textAnchor="middle" transform="rotate(-90 473 220)" fontFamily={mono} fontSize="13" fill="#0E1726">
        bis 320 mm
      </text>
      <path d="M172 262H120V60" fill="none" stroke="#2163B5" strokeWidth="1" />
      <circle cx="172" cy="262" r="3" fill="#2163B5" />
      <text x="28" y="48" fontFamily={mono} fontSize="13" fill="#2163B5">
        Schichthöhe 0,20 mm
      </text>
    </svg>
  )
}
