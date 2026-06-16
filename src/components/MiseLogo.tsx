export function MiseLogo({ white = false, size = "md" }: { white?: boolean; size?: "sm" | "md" | "lg" }) {
  const fill = white ? "#ffffff" : "#0d0d0d";

  if (size === "sm") {
    return (
      <svg width="90" height="44" viewBox="0 0 90 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="2" y="34" fontFamily="Georgia, 'Times New Roman', serif" fontSize="32" fontWeight="700" fill={fill} letterSpacing="-0.5">m</text>
        <text x="34" y="34" fontFamily="Georgia, 'Times New Roman', serif" fontSize="32" fontWeight="700" fill={fill}>i</text>
        <ellipse cx="38" cy="6" rx="3.5" ry="5" fill="#40916c" transform="rotate(-20 38 6)" />
        <ellipse cx="38" cy="6" rx="1" ry="4" fill="#2d6a4f" transform="rotate(-20 38 6)" />
        <text x="44" y="34" fontFamily="Georgia, 'Times New Roman', serif" fontSize="32" fontWeight="700" fill={fill}>s</text>
        <text x="61" y="34" fontFamily="Georgia, 'Times New Roman', serif" fontSize="32" fontWeight="700" fill={fill}>e</text>
      </svg>
    );
  }

  return (
    <svg width="140" height="80" viewBox="0 0 110 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="2" y="46" fontFamily="Georgia, 'Times New Roman', serif" fontSize="48" fontWeight="700" fill={fill} letterSpacing="-0.5">m</text>
      <text x="48" y="46" fontFamily="Georgia, 'Times New Roman', serif" fontSize="48" fontWeight="700" fill={fill}>i</text>
      <ellipse cx="53" cy="8" rx="5" ry="7" fill="#40916c" transform="rotate(-20 53 8)" />
      <ellipse cx="53" cy="8" rx="1.5" ry="5.5" fill="#2d6a4f" transform="rotate(-20 53 8)" />
      <text x="62" y="46" fontFamily="Georgia, 'Times New Roman', serif" fontSize="48" fontWeight="700" fill={fill}>s</text>
      <text x="84" y="46" fontFamily="Georgia, 'Times New Roman', serif" fontSize="48" fontWeight="700" fill={fill}>e</text>
    </svg>
  );
}
