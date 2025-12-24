const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// ===== CONFIG =====
const ORIGINAL_SITE = "https://christmas-premium-free-demo.vercel.app";
const CUSTOM_NAME = "Varsha"; // 🔥 CHANGE THIS NAME

// ===== PROXY ASSETS =====
app.get("/assets/*", async (req, res) => {
  try {
    const assetUrl = ORIGINAL_SITE + req.originalUrl;

    const response = await fetch(assetUrl);
    if (!response.ok) return res.sendStatus(404);

    const contentType = response.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);

    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// ===== MAIN PAGE + FORCE NAME OVERRIDE =====
app.get("*", async (req, res) => {
  try {
    const response = await fetch(ORIGINAL_SITE + req.originalUrl);
    let html = await response.text();

    // Fix asset paths
    html = html.replace(
      /https:\/\/christmas-premium-free-demo\.vercel\.app\/assets/g,
      "/assets"
    );

    // 🔥 Inject name override script
    const injection = `
<script>
(function () {
  const NEW_NAME = "${CUSTOM_NAME}";
  const OLD_NAMES = ["Anupriya", "anupriya", "ANUPRIYA"];

  function replaceText(node) {
    if (node.nodeType === 3) {
      OLD_NAMES.forEach(oldName => {
        node.nodeValue = node.nodeValue.replaceAll(oldName, NEW_NAME);
      });
    }
    node.childNodes && node.childNodes.forEach(replaceText);
  }

  function run() {
    replaceText(document.body);
  }

  run();

  // React-safe: keep replacing even after DOM updates
  const observer = new MutationObserver(run);
  observer.observe(document.body, { childList: true, subtree: true });
})();
</script>
</body>`;

    html = html.replace("</body>", injection);

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error loading page");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy running on port ${PORT}`);
});
