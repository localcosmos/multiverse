import { describe, it, expect, beforeEach } from "vitest";
import { useContentSecurityPolicy } from "../useContentSecurityPolicy";

describe("useContentSecurityPolicy", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });

  it("adds a CSP meta tag that allows HTTPS image and media sources", () => {
    const settings = {
      API_URL: "https://example.com/api/",
      MEDIA_URL: "https://example.com/media/",
    } as any;

    const app = document.createElement("div");
    document.body.appendChild(app);

    const originalProvide = (app as any).__vccAppContext;
    (app as any).__vccAppContext = {
      provides: {
        settings,
      },
    };

    try {
      useContentSecurityPolicy();
    } finally {
      (app as any).__vccAppContext = originalProvide;
      app.remove();
    }

    const meta = document.head.querySelector('meta[http-equiv="Content-Security-Policy"]');
    expect(meta).not.toBeNull();
    expect(meta?.getAttribute("content")).toContain(
      "img-src 'self' data: content: blob: https: https://example.com/media/",
    );
    expect(meta?.getAttribute("content")).toContain("media-src 'self' blob: https:");
  });
});
