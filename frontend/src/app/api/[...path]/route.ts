/** Runtime proxy to the FastAPI service — resolved per request, so the
 *  backend host comes from the container env rather than the build. */
export const dynamic = "force-dynamic";

const API = () => process.env.API_INTERNAL_URL || "http://localhost:8054";

async function handler(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const { search } = new URL(req.url);
  const target = `${API()}/api/${path.join("/")}${search}`;
  const ct = req.headers.get("content-type");

  const init: RequestInit = { method: req.method, cache: "no-store" };
  if (ct) init.headers = { "content-type": ct };
  if (req.method !== "GET" && req.method !== "HEAD") init.body = await req.arrayBuffer();

  try {
    const r = await fetch(target, init);
    return new Response(r.body, {
      status: r.status,
      headers: {
        "content-type": r.headers.get("content-type") || "application/json",
        "cache-control": r.headers.get("cache-control") || "no-store",
      },
    });
  } catch {
    return Response.json({ error: "upstream unavailable" }, { status: 502 });
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
