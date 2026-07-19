export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#bg)" />
      <path
        d="M16 12v8c0 2.2 1.8 4 4 4h1v14h2V24h1c2.2 0 4-1.8 4-4v-8h-2v8h-3v-8h-2v8h-3v-8h-2z"
        fill="white"
        opacity="0.95"
      />
      <path
        d="M32 12c-1.1 0-2 .9-2 2v4h2v2h-2v12h2V20h2v12h2V20h2v-2h-2v-4c0-1.1-.9-2-2-2h-2z"
        fill="white"
        opacity="0.95"
      />
    </svg>
  );
}
