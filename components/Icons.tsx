export const HeartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 5.6a5.2 5.2 0 0 0-7.4 0L12 7l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 21.8l8.8-8.8a5.2 5.2 0 0 0 0-7.4z" /></svg>
);
export const BookmarkIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4.5L6 21z" /></svg>
);
export const CommentIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" /></svg>
);
export const MoreIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="19" cy="12" r="1.2" /></svg>
);
export const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
);
export const BellIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 17V11a6 6 0 1 1 12 0v6l1.5 2h-15zM10 21a2 2 0 0 0 4 0" /></svg>
);
export const PlusIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
);
export const MoonIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
);
export const HomeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5z" /></svg>
);
export const UserIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M5 20c0-4 3.5-6 7-6s7 2 7 6" /></svg>
);
export const ShareIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 3L11 14M22 3l-7 19-4-8-8-4 19-7z" /></svg>
);

export const CloseIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
);

export const FontIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <text x="3" y="17.5" fontFamily="Outfit, sans-serif" fontSize="15" fontWeight="700" fill="currentColor">Aa</text>
  </svg>
);

export const PaletteIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" /><circle cx="8" cy="10" r="1.5" fill="currentColor" /><circle cx="16" cy="10" r="1.5" fill="currentColor" /><circle cx="12" cy="15.5" r="1.5" fill="currentColor" /></svg>
);

export const PhotoIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" fill="none" /><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" /><path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
);

export const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" /></svg>
);

export const AlignIcon = ({ align = 'center' }: { align?: 'left' | 'center' | 'right' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <line x1={align === 'center' ? '7' : align === 'right' ? '10' : '4'} y1="12" x2={align === 'center' ? '17' : '20'} y2="12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <line x1={align === 'center' ? '5' : align === 'right' ? '8' : '4'} y1="18" x2={align === 'center' ? '19' : '20'} y2="18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
);

export const TagIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
);

export const CatDoodle = ({ size = 68, className = 'cat-doodle' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 74 74"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Radiating 3 sparkle rays in corner */}
    <line x1="56" y1="14" x2="63" y2="7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    <line x1="50" y1="9" x2="52" y2="2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    <line x1="62" y1="20" x2="69" y2="21" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    {/* Ears */}
    <path d="M19 32L14 16L30 25" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M44 25L60 16L55 32" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    {/* Head Outline */}
    <path d="M19 32C12 37 11 48 15 56C20 64 28 66 37 66C46 66 54 64 59 56C63 48 62 37 55 32C49 30 25 30 19 32Z" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    {/* Sunglasses Bar & Lenses */}
    <path d="M20 41H54" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M22 41L25 50C26 53 30 55 33 54L36 53V41H22Z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" />
    <path d="M38 41V53L41 54C44 55 48 53 49 50L52 41H38Z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" />
    {/* Cute Nose and Cat Mouth */}
    <path d="M35 57L37 58L39 57" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M34 60C35.5 61.5 37 61.5 37 60C37 61.5 38.5 61.5 40 60" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    {/* Whiskers */}
    <line x1="8" y1="48" x2="16" y2="49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="7" y1="55" x2="15" y2="54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="58" y1="49" x2="66" y2="48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="59" y1="54" x2="67" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
