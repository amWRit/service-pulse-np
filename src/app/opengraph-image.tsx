import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 45%, #fed7aa 100%)",
          padding: "56px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: 34,
            fontWeight: 700,
            color: "#9a3412",
          }}
        >
          <span>📊</span>
          <span>Service Pulse</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              fontSize: 74,
              fontWeight: 800,
              color: "#7c2d12",
              lineHeight: 1.05,
              maxWidth: "92%",
            }}
          >
            Real-time public service experience tracker
          </div>
          <div
            style={{
              fontSize: 36,
              color: "#9a3412",
              fontWeight: 600,
            }}
          >
            सेवा सूचक • Nepal
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            color: "#7c2d12",
            fontWeight: 600,
          }}
        >
          <span>Ratings • Wait time • Reports</span>
          <span>service-pulse.vercel.app</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
