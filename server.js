const express = require("express");
const https = require("https");
const app = express();

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

app.get("/", async (req, res) => {
  const q = req.query.q || "";

  if (!q) {
    return res.send(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SalivaSiva</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#020f04;color:#e0ffe6;font-family:monospace;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px}
  h1{font-size:clamp(42px,9vw,82px);color:#39ff6a;letter-spacing:-3px;margin-bottom:8px}
  h1 span{color:#e0ffe6}
  p{font-size:10px;color:#2d6b3a;letter-spacing:3px;text-transform:uppercase;margin-bottom:44px}
  form{width:100%;max-width:600px;display:flex;gap:0}
  input{flex:1;background:#061a09;border:1.5px solid #0d2e12;border-right:none;color:#e0ffe6;font-family:monospace;font-size:14px;padding:14px 18px;outline:none}
  input:focus{border-color:#39ff6a}
  button{background:#39ff6a;border:none;color:#020f04;font-weight:800;font-size:11px;letter-spacing:1px;text-transform:uppercase;padding:14px 22px;cursor:pointer}
  button:hover{background:#5fffaa}
  .chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px;justify-content:center}
  .chip{background:transparent;border:1px solid #0d2e12;color:#2d6b3a;font-family:monospace;font-size:11px;padding:6px 12px;cursor:pointer;text-decoration:none;border-radius:2px}
  .chip:hover{border-color:#39ff6a;color:#39ff6a}
</style>
</head>
<body>
<h1>Saliva<span>Siva</span></h1>
<p>Wikipedia · Instant Answers · Calculator</p>
<form action="/" method="get">
  <input name="q" type="text" placeholder='Try "black hole" or "10 * 3"...' autofocus autocomplete="off">
  <button type="submit">Search</button>
</form>
<div class="chips">
  <a class="chip" href="/?q=black+hole">black hole</a>
  <a class="chip" href="/?q=World+War+II">World War II</a>
  <a class="chip" href="/?q=Albert+Einstein">Albert Einstein</a>
  <a class="chip" href="/?q=climate+change">climate change</a>
  <a class="chip" href="/?q=artificial+intelligence">artificial intelligence</a>
</div>
</body>
</html>`);
  }

  // Math check
  let mathResult = null;
  const clean = q.replace(/[^0-9+\-*\/().%^ ]/g,"").trim();
  if (clean && /[\d]/.test(clean)) {
    try { mathResult = eval(clean.replace(/\^/g,"**")); } catch(e) {}
  }

  // Wikipedia search
  let hits = [], summary = null;
  try {
    const searchData = JSON.parse(await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=8&format=json`));
    hits = searchData.query?.search || [];
    if (hits.length) {
      const s = JSON.parse(await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hits[0].title)}`));
      if (s.extract) summary = s;
    }
  } catch(e) {}

  const cards = hits.map(h => {
    const snippet = h.snippet.replace(/<[^>]+>/g,"").replace(/&quot;/g,'"').replace(/&#039;/g,"'").replace(/&amp;/g,"&");
    const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(h.title.replace(/ /g,"_"))}`;
    return `<div class="card">
      <div class="curl">en.wikipedia.org</div>
      <a class="ctitle" href="${url}">${h.title}</a>
      <div class="csnip">${snippet}</div>
    </div>`;
  }).join("");

  res.send(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${q} — SalivaSiva</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#020f04;color:#e0ffe6;font-family:monospace;min-height:100vh}
  #top{position:sticky;top:0;background:rgba(2,15,4,0.97);border-bottom:1px solid #0d2e12;padding:10px 28px;display:flex;align-items:center;gap:16px;z-index:10;backdrop-filter:blur(14px)}
  #top a{font-size:20px;font-weight:800;color:#39ff6a;text-decoration:none;letter-spacing:-1px;white-space:nowrap;font-family:sans-serif}
  form{flex:1;display:flex}
  input{flex:1;background:#061a09;border:1.5px solid #0d2e12;border-right:none;color:#e0ffe6;font-family:monospace;font-size:13px;padding:9px 14px;outline:none}
  input:focus{border-color:#39ff6a}
  button{background:#39ff6a;border:none;color:#020f04;font-weight:800;font-size:10px;letter-spacing:1px;text-transform:uppercase;padding:9px 16px;cursor:pointer;white-space:nowrap}
  button:hover{background:#5fffaa}
  #out{max-width:700px;margin:0 auto;padding:0 24px 80px}
  .meta{font-size:11px;color:#2d6b3a;padding:16px 0 18px;border-bottom:1px solid #0d2e12;margin-bottom:24px}
  .meta b{color:#e0ffe6}
  .math{background:#071509;border:1.5px solid rgba(57,255,106,0.2);border-radius:3px;padding:18px 24px;margin-bottom:24px;position:relative;overflow:hidden}
  .math::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#39ff6a,#00c94a)}
  .mlabel{font-size:10px;color:#2d6b3a;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px}
  .mans{font-size:34px;font-weight:800;color:#39ff6a;font-family:sans-serif}
  .instant{background:#071509;border:1.5px solid rgba(57,255,106,0.15);border-radius:3px;padding:20px 24px;margin-bottom:24px;position:relative;overflow:hidden}
  .instant::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#39ff6a,#00c94a)}
  .ilabel{font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#39ff6a;margin-bottom:8px}
  .itext{font-size:13px;line-height:1.85;color:#7abf85}
  .iimg{float:right;margin:0 0 10px 16px;max-width:100px;max-height:100px;object-fit:cover;border:1px solid #0d2e12;border-radius:2px}
  .ilink{display:inline-block;margin-top:10px;color:#39ff6a;font-size:11px;text-decoration:none}
  .ilink:hover{text-decoration:underline}
  .card{padding:18px 0;border-bottom:1px solid #0d2e12}
  .curl{font-size:11px;color:#2d6b3a;margin-bottom:3px}
  .ctitle{font-size:16px;font-weight:700;color:#e0ffe6;text-decoration:none;display:block;margin-bottom:6px;font-family:sans-serif}
  .ctitle:hover{color:#39ff6a}
  .csnip{font-size:12px;line-height:1.8;color:#2d5c35}
  .none{text-align:center;padding:60px 0;color:#2d6b3a;font-size:13px}
</style>
</head>
<body>
<div id="top">
  <a href="/">SalivaSiva</a>
  <form action="/" method="get">
    <input name="q" value="${q.replace(/"/g,'&quot;')}" autocomplete="off">
    <button type="submit">Search</button>
  </form>
</div>
<div id="out">
  <div class="meta">Results for <b>"${q}"</b></div>
  ${mathResult !== null ? `<div class="math"><div class="mlabel">Calculator</div><div class="mans">${mathResult}</div><div style="font-size:12px;color:#2d6b3a;margin-top:4px">${clean} = ${mathResult}</div></div>` : ""}
  ${summary ? `<div class="instant">
    <div class="ilabel">Top Result</div>
    ${summary.thumbnail ? `<img class="iimg" src="${summary.thumbnail.source}" alt="">` : ""}
    <div class="itext">${summary.extract.slice(0,300)}${summary.extract.length>300?"…":""}</div>
    <a class="ilink" href="${summary.content_urls?.desktop?.page||"#"}">→ Read full article on Wikipedia</a>
  </div>` : ""}
  ${cards || `<div class="none">No results for "${q}"</div>`}
</div>
</body>
</html>`);
});

app.listen(3000, () => console.log("SalivaSiva running"));
