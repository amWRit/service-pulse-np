import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage() {
  const iconBuffer = await readFile(join(process.cwd(), "public", "icons", "icon.png"));
  const iconBase64 = iconBuffer.toString("base64");

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
          <img
            src={`data:image/png;base64,${iconBase64}`}
            alt="Service Pulse icon"
            width={40}
            height={40}
            style={{ borderRadius: 10 }}
          />
          <span>सेवा सूचक</span>
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
            सार्वजनिक सेवा अनुभव ट्र्याक गर्ने प्लेटफर्म
          </div>
          <div
            style={{
              fontSize: 36,
              color: "#9a3412",
              fontWeight: 600,
            }}
          >
            सेवा सूचक • नेपाल
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
          <span>रेटिङ • पर्खाइ समय • रिपोर्टहरू</span>
          <span>sewasuchak.vercel.app</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
