let lastCheck: number | null = null;
let lastResult = false;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET() {
  const now = Date.now();
  if (lastCheck && now - lastCheck < CACHE_DURATION) {
    return new Response(JSON.stringify({ isUp: lastResult }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch("https://ipa-reader.com", {
      method: "HEAD",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    lastCheck = now;
    lastResult = response.ok;
    return new Response(JSON.stringify({ isUp: response.ok }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    lastCheck = now;
    lastResult = false;
    return new Response(JSON.stringify({ isUp: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
