export function MiseLogo({ white = false }: { white?: boolean }) {
  const fill = white ? "#ffffff" : "#0d0d0d";
  return (
    <svg width="90" height="60" viewBox="0 0 72 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="2" y="30" fontFamily="Georgia, 'Times New Roman', serif" fontSize="28" fontWeight="700" fill={fill} letterSpacing="-0.5">m</text>
      <text x="28" y="30" fontFamily="Georgia, 'Times New Roman', serif" fontSize="28" fontWeight="700" fill={fill}>i</text>
      <ellipse cx="31.5" cy="6" rx="3.5" ry="5" fill="#40916c" transform="rotate(-20 31.5 6)" />
      <ellipse cx="31.5" cy="6" rx="1" ry="4" fill="#2d6a4f" transform="rotate(-20 31.5 6)" />
      <text x="37" y="30" fontFamily="Georgia, 'Times New Roman', serif" fontSize="28" fontWeight="700" fill={fill}>s</text>
      <text x="51" y="30" fontFamily="Georgia, 'Times New Roman', serif" fontSize="28" fontWeight="700" fill={fill}>e</text>
    </svg>
  );
}
