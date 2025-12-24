const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ===== CONFIG =====
const ORIGINAL_SITE = "https://christmas-premium-free-demo.vercel.app";
const CUSTOM_NAME = "Varsha"; // <<< change this

// ===== PROXY ASSETS (images, videos, etc.) =====
app.get("/assets/*", async (req, res) => {
  try {
    const assetPath = req.originalUrl.replace("/assets", "");
    const assetUrl = ORIGINAL_SITE + "/assets" + assetPath;

    const response = await fetch(assetUrl);

    if (!response.ok) {
      return res.sendStatus(404);
    }

    const contentType = response.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.send(buffer);
  } catch (err) {
    console.error("Asset error:", err);
    res.sendStatus(500);
  }
});

// ===== MAIN PAGE PROXY + NAME REPLACEMENT =====
app.get("*", async (req, res) => {
  try {
    const targetUrl = ORIGINAL_SITE + req.originalUrl;

    const response = await fetch(targetUrl);
    let html = await response.text();

    // Replace name
    html = html.replace(/Anupriya/g, CUSTOM_NAME);
    html = html.replace(/anupriya/g, CUSTOM_NAME);

    // Fix asset paths
    html = html.replace(
      /https:\/\/christmas-premium-free-demo\.vercel\.app\/assets/g,
      "/assets"
    );

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (err) {
    console.error("Page error:", err);
    res.status(500).send("Error loading page");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy running on port ${PORT}`);
});

