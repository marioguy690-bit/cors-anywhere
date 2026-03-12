const express = require("express");
const request = require("request");
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/proxy", (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("No URL");
  request({ url, headers: { "User-Agent": "Mozilla/5.0" } }, (err, response, body) => {
    if (err) return res.status(500).send("Error: " + err.message);
    const ct = response.headers["content-type"] || "text/html";
    res.removeHeader("X-Frame-Options");
    res.removeHeader("Content-Security-Policy");
    res.setHeader("Content-Type", ct);
    res.send(body);
  });
});

app.listen(3000, () => console.log("Proxy running"));
