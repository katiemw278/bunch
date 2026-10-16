export function BunchBuddy({ happy = true }: { happy?: boolean }) {
  return (
    <svg className="bunch-buddy" viewBox="0 0 140 130" fill="none" aria-hidden="true">
      <path d="M72 33C69 15 87 9 96 14C95 29 82 35 72 33Z" fill="#8BD13F" stroke="#302441" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="48" cy="55" r="31" fill="#A863ED" stroke="#302441" strokeWidth="3" />
      <circle cx="92" cy="55" r="31" fill="#BD86F8" stroke="#302441" strokeWidth="3" />
      <circle cx="70" cy="88" r="31" fill="#A981DF" stroke="#302441" strokeWidth="3" />
      <path d="M48 35C41 34 35 38 32 43M93 35C86 34 82 37 79 41" stroke="#F5ECFF" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="60" cy="83" rx="3" ry="4" fill="#302441" />
      <ellipse cx="80" cy="83" rx="3" ry="4" fill="#302441" />
      <path d={happy ? "M61 94Q70 105 79 94" : "M63 98Q70 93 77 98"} stroke="#302441" strokeWidth="3" strokeLinecap="round" />
      <circle cx="51" cy="92" r="4" fill="#F0A4B5" /><circle cx="89" cy="92" r="4" fill="#F0A4B5" />
      <path d="M12 83L15 77L18 83L24 86L18 89L15 95L12 89L6 86L12 83ZM121 19L124 13L127 19L133 22L127 25L124 31L121 25L115 22L121 19Z" fill="#E4AE36" />
    </svg>
  );
}
