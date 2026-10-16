import type { CSSProperties } from "react";

export function VineLoader() {
  return <div className="vine-loader" role="status" aria-label="Loading puzzle">
    <svg viewBox="0 0 280 140" className="loading-vine" aria-hidden="true">
      <path className="loading-vine-stem" d="M9 58C30 12 63 21 90 36S142 56 164 26S224 5 270 39" fill="none" stroke="#76a94f" strokeWidth="5" strokeLinecap="round" pathLength="1" />
      {[[16,39], [66,24], [119,37], [170,18], [222,20]].map(([x, y], index) => <g key={index} transform={`translate(${x} ${y}) scale(.67)`}>
        <g className="loading-grapes" style={{ "--sprout-delay": `${index * 180}ms` } as CSSProperties}>
          <path d="M27 20Q29 8 23 4" fill="none" stroke="#58833b" strokeWidth="3" strokeLinecap="round" />
          <path d="M29 13Q34 0 47 5Q44 18 29 13Z" fill="#8bd13f" stroke="#58833b" strokeWidth="2" />
          {[[16,30,"#bd86f8"],[37,30,"#a863ed"],[16,49,"#a863ed"],[37,49,"#9848df"],[27,66,"#8134c9"]].map(([cx, cy, fill], i) => <circle key={i} cx={cx} cy={cy} r="12" fill={String(fill)} stroke="#302441" strokeWidth="2.5" />)}
          <path d="M11 25L15 23M32 25L36 23" fill="none" stroke="#f6ecff" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>)}
    </svg>
    <p>Growing your bunch…</p>
  </div>;
}
