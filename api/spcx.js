// Vercel サーバーレス関数。ブラウザからは /api/spcx で呼ばれる。
// APIキーは Vercel の環境変数 TWELVE_DATA_KEY にだけ置く（コード/ブラウザには出ない）。

export default async function handler(req, res) {
  // 門番：GET以外は弾く
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const key = process.env.TWELVE_DATA_KEY;
  if (!key) {
    return res.status(500).json({ error: "no_key", message: "サーバーにキーが設定されていません" });
  }

  const SYMBOL = "SPCX";
  const base = "https://api.twelvedata.com";

  try {
    const [quoteRes, tsRes] = await Promise.all([
      fetch(`${base}/quote?symbol=${SYMBOL}&apikey=${key}`),
      fetch(`${base}/time_series?symbol=${SYMBOL}&interval=1day&outputsize=30&apikey=${key}`),
    ]);
    const quote = await quoteRes.json();
    const ts = await tsRes.json();

    if (quote.status === "error") {
      // 上流の生メッセージ/URLはクライアントに返さない（鍵漏れ防止）。固定文のみ。
      return res.status(502).json({ error: "upstream_error", message: "データ取得に失敗しました" });
    }

    // CDNで60秒キャッシュ → 無料枠(800回/日)の節約＆叩かれ放題対策
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json({ quote, ts });
  } catch (e) {
    // e には上流URL(=apikey付き)が混ざる可能性がゼロではないので、クライアントには絶対返さない。
    // 詳細はサーバーログ(Vercel)にだけ残す。
    console.error("spcx upstream fetch failed:", e);
    return res.status(502).json({ error: "fetch_failed", message: "データ取得に失敗しました" });
  }
}
