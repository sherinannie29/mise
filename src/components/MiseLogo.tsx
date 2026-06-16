"use client";

export function MiseLogo({ white = false, size = "md" }: { white?: boolean; size?: "sm" | "md" | "lg" }) {
  const color = white ? "#ffffff" : "#0d0d0d";
  const fontSize = size === "sm" ? "38px" : size === "lg" ? "52px" : "36px";
  const leafSize = size === "sm" ? 7 : size === "lg" ? 14 : 10;

  return (
    <div style={{ display: "inline-flex", alignItems: "flex-start", position: "relative" }}>
      <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize, color, lineHeight: 1, letterSpacing: "-0.02em" }}>
        m
      </span>
      <span style={{ position: "relative", fontFamily: "Georgia, serif", fontWeight: 700, fontSize, color, lineHeight: 1, letterSpacing: "-0.02em" }}>
        {/* dotless i with leaf replacing the dot */}
        <span style={{ display: "inline-block", position: "relative" }}>
          <span style={{
            position: "absolute",
            top: "-2px",
            left: "50%",
            transform: "translateX(-50%) rotate(-20deg)",
            width: leafSize,
            height: leafSize * 1.4,
            background: "#40916c",
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          }} />
          ı
        </span>
      </span>
      <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize, color, lineHeight: 1, letterSpacing: "-0.02em" }}>
        se
      </span>
    </div>
  );
}
