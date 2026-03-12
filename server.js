const express = require("express");
const request = require("request");
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/proxy", (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("No URL provided");

  request(
    {
      url,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
    },
    (err, response, body) => {
      if (err) return res.status(500).send("Proxy error: " + err.message);

      // Strip headers that block embedding
      res.removeHeader("X-Frame-Options");
      res.removeHeader("Content-Security-Policy");

      // Forward content type
      const ct = response.headers["content-type"] || "text/html";
      res.setHeader("Content-Type", ct);

      // Rewrite links so they go through the proxy too
      if (ct.includes("text/html")) {
        const base = new URL(url);
        const origin = base.origin;
        body = body
          .replace(/(href|src|action)="\/(?!\/)/g, `$1="${origin}/`)
          .replace(/(href|src|action)='\/(?!\/)/g, `$1='${origin}/`);
      }

      res.send(body);
    }
  );
});

app.listen(3000, () => console.log("SalivaSiva proxy running"));
