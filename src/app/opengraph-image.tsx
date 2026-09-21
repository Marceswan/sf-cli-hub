import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "SFDX Hub — The Salesforce Developer Ecosystem";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0a0f1e 0%, #101b3a 55%, #0b3a4f 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 20,
              background: "linear-gradient(135deg, #38bdf8, #22d3ee)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 52,
              color: "#06121f",
              fontWeight: 800,
            }}
          >
            ⚡
          </div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 800, letterSpacing: -1 }}>
            SFDX Hub
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 40, marginTop: 40, color: "#93c5fd", maxWidth: 900 }}>
          The community-driven registry for Salesforce developer tools.
        </div>
        <div style={{ display: "flex", fontSize: 28, marginTop: 28, color: "#94a3b8" }}>
          CLI plugins · Lightning Web Components · Apex utilities · Agentforce
        </div>
        <div style={{ display: "flex", fontSize: 26, marginTop: 48, color: "#67e8f9" }}>
          sfdxhub.com
        </div>
      </div>
    ),
    size
  );
}
