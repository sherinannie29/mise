"use client";

export function MiseLogo({ white = false, size = "md" }: { white?: boolean; size?: "sm" | "md" | "lg" }) {
  const color = white ? "#ffffff" : "#0d0d0d";
  const fontSize = size === "sm" ? "22px" : size === "lg" ? "52px" : "36px";
  const leafSize = size === "sm" ? 7 : size === "lg" ? 14 : 10;

  return (
    <div style={{ display: "inline-flex", alignItems: "flex-start", position: "relative" }}>
      <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize, color, lineHeight: 1, letterSpacing: "-0.02em" }}>
        mis
      </span>
      <span style={{ position: "relative", fontFamily: "Georgia, serif", fontWeight: 700, fontSize, color, lineHeight: 1, letterSpacing: "-0.02em" }}>
        <span style={{
          position: "absolute",
          top: "-2px",
          left: "50%",
          transform: "translateX(-50%)",
          width: leafSize,
          height: leafSize * 1.4,
          background: "#40916c",
          borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          rotate: "-20deg",
        }} />
        e
      </span>
    </div>
  );
}
