const http = require("http");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const port = 5173;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".json": "application/json"
};

http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  const file = path.normalize(path.join(root, url === "/" ? "index.html" : url.replace(/^\/+/, "")));
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end();
    return;
  }
  fs.stat(file, (err, st) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const send = (p) => {
      res.writeHead(200, { "Content-Type": types[path.extname(p).toLowerCase()] || "application/octet-stream" });
      fs.createReadStream(p).pipe(res);
    };
    if (st.isDirectory()) send(path.join(file, "index.html"));
    else send(file);
  });
}).listen(port, "0.0.0.0", () => {
  console.log("Accepting connections at http://localhost:" + port);
});
