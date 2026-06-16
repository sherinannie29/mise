"use client";

export function MiseLogo({ white = false, size = "md" }: { white?: boolean; size?: "sm" | "md" | "lg" }) {
  const color = white ? "#ffffff" : "#0d0d0d";
  const fontSize = size === "sm" ? "1.6rem" : size === "lg" ? "3.5rem" : "2.5rem";
  const leafSize = size === "sm" ? 8 : size === "lg" ? 16 : 12;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", position: "relative", lineHeight: 1 }}>
      <span style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontWeight: 700,
        fontSize,
        color,
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}>
        m
      </span>
      <span style={{ position: "relative" }}>
        {/* leaf above the i */}
        <svg
          width={leafSize}
          height={leafSize * 1.4}
          viewBox="0 0 10 14"
          style={{ position: "absolute", top: 2, left: "50%", transform: "translateX(-50%) rotate(-20deg)" }}
        >
          <ellipse cx="5" cy="7" rx="4.5" ry="6.5" fill="#40916c" />
          <ellipse cx="5" cy="7" rx="1.2" ry="5.5" fill="#2d6a4f" />
        </svg>
        <span style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontWeight: 700,
          fontSize,
          color,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}>i</span>
      </span>
      <span style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontWeight: 700,
        fontSize,
        color,
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}>se</span>
    </div>
  );
}
