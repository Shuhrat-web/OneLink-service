import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { withLinkPrefix } from "@/lib/env";
import { findSmartLinkBySlug } from "@/server/repositories/smart-link-repository";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  const link = await findSmartLinkBySlug(slug);
  if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });

  const base = process.env.APP_BASE_URL ?? new URL(req.url).origin;
  const payload = `${base}${withLinkPrefix(`/${link.slug}`)}`;

  const url = new URL(req.url);
  const format = (url.searchParams.get("format") ?? "png").toLowerCase();
  const download = url.searchParams.get("download") === "1";

  if (format === "svg") {
    const svg = await QRCode.toString(payload, {
      type: "svg",
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
      width: 512,
    });

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        ...(download ? { "Content-Disposition": `attachment; filename="${link.slug}.svg"` } : {}),
      },
    });
  }

  const png = await QRCode.toBuffer(payload, {
    type: "png",
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
    width: 512,
  });

  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      ...(download ? { "Content-Disposition": `attachment; filename="${link.slug}.png"` } : {}),
    },
  });
}
