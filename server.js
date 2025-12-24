const express = require("express");
const fetch = require("node-fetch");

const app = express();
const TARGET = "https://christmas-premium-free-demo.vercel.app";

const INJECT_SCRIPT = `
<script>
(function () {
  const BAD_NAME = /anupriya/gi;

  function cleanse(node) {
    if (!node) return;

    // Replace in text nodes
    if (node.nodeType === Node.TEXT_NODE) {
      if (BAD_NAME.test(node.textContent)) {
        node.textContent = node.textContent.replace(BAD_NAME, "Varsha");
      }
    }

    // Recurse
    node.childNodes && node.childNodes.forEach(cleanse);
  }

  // Initial sweep
  setTimeout(() => cleanse(document.body), 500);

  // Continuous protection
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(cleanse);
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Fallback interval (React-safe)
  setInterval(() => cleanse(document.body), 500);
})();
</script>
`;

app.use(async (req, res) => {
  try {
    const targetUrl = TARGET + req.originalUrl;
    const response = await fetch(targetUrl);
    const contentType = response.headers.get("content-type") || "";

    // ✅ HTML → inject script
    if (contentType.includes("text/html")) {
      let html = await response.text();

      // Inject before closing body
      html = html.replace("</body>", `${INJECT_SCRIPT}</body>`);

      res.set("Content-Type", contentType);
      res.send(html);
      return;
    }

    // ✅ Everything else → raw pipe
    res.set("Content-Type", contentType);
    response.body.pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy error");
  }
});

app.listen(3000, () => {
  console.log("✅ Proxy running at http://localhost:3000");
});
