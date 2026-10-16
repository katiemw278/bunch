import { useId } from "react";

export function BunchWordmark() {
  const filterId = useId();
  const grapesId = `${filterId}-grapes`;
  const bId = `${filterId}-b`;
  const bBoundary = "M0 0H470V300L473 340L476 420L480 460L482 500L482 540L478 640V778H0Z";
  const lettersId = `${filterId}-letters`;
  const grapeBoundary = "M1549 180H1900V650H1620V550L1615 540L1593 520L1578 500L1555 480L1541 460L1535 420L1544 380L1549 340Z";
  return <svg className="bunch-wordmark" viewBox="90 175 1730 465" role="img" aria-label="Bunch" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id={filterId} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -1 -1 -1 0 3" />
        <feComponentTransfer><feFuncA type="table" tableValues="0 0 1 1" /></feComponentTransfer>
        <feComposite in2="SourceAlpha" operator="in" />
      </filter>
      <clipPath id={bId}><path d={bBoundary} /></clipPath>
      <clipPath id={grapesId}><path d={grapeBoundary} /></clipPath>
      <mask id={lettersId} maskUnits="userSpaceOnUse" x="0" y="0" width="2022" height="778">
        <rect width="2022" height="778" fill="white" />
        <path d={grapeBoundary} fill="black" />
        <path d={bBoundary} fill="black" />
      </mask>
    </defs>
    <g filter={`url(#${filterId})`}>
      <image href="/bunch-logo-balanced.png" width="2022" height="778" mask={`url(#${lettersId})`} />
      <g transform="translate(482 430) scale(1.015) translate(-482 -430)">
        <image href="/bunch-logo-refined-b.png" width="2022" height="778" clipPath={`url(#${bId})`} />
      </g>
      <g transform="translate(16.8 10.2)">
        <image href="/bunch-logo-balanced.png" width="2022" height="778" clipPath={`url(#${grapesId})`} />
      </g>
    </g>
  </svg>;
}
