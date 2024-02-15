module.exports = function (RED) {
  function ReverseProxyNode(config) {
    RED.nodes.createNode(this, config);

    const express = require("express");
    const http = require("http");

    const app = express();
    const server = http.createServer(app);
  this.label = config.label || "Reverse Proxy"; // Default label if not configured

    const targetEndpoint = config.endpoint || "http://default-endpoint.com"; // Default endpoint if not configured

    // Middleware for proxying requests
    app.use("/invoke", (req, res) => {
      // Redirect /invoke to /
      res.redirect(302, "/");
    });

    app.use("/api", (req, res) => {
      // Proxy /api to the configured endpoint
      const targetUrl = `${targetEndpoint}${req.url}`;
      req.pipe(http.request(targetUrl, { method: req.method, headers: req.headers }), { end: true }).pipe(res);
    });

    app.use("/assets", express.static("/assets")); // Replace "path/to/assets" with the actual path

    // Start the server
    const port = config.port || 3000; // Default port if not configured
    server.listen(port, () => {
      this.status({ fill: "green", shape: "dot", text: `Listening on port ${port}` });
    });

    this.on("close", () => {
      server.close();
    });
  }

  RED.nodes.registerType("reverse-proxy-invoke", ReverseProxyNode);
};
