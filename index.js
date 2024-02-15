module.exports = function (RED) {
  function ReverseProxyNode(config) {
    RED.nodes.createNode(this, config);

    const express = require("express");
    const http = require("http");
    const request = require('request');

    const app = express();
    const server = http.createServer(app);
    this.label = config.label || "Reverse Proxy"; // Default label if not configured
    console.log(`Label: ${this.label}`);

    const targetEndpoint = config.endpoint || "http://default-endpoint.com"; // Default endpoint if not configured
    console.log(`Target Endpoint: ${targetEndpoint}`);

    // Middleware for proxying requests
    app.use("/invoke", (req, res) => {
      console.log("Redirecting /invoke to /");
      res.redirect(302, "/");
    });

    app.use("/api", (req, res) => {
      // Proxy /api to the configured endpoint
      const targetUrl = `${targetEndpoint}${req.url}`;
      console.log(`Proxying /api to: ${targetUrl}`);
      req.pipe(request(targetUrl)).pipe(res);
    });

    app.use("/assets", (req, res) => {
      // Proxy /assets to the configured endpoint
      const targetUrl = `${targetEndpoint}${req.url}`;
      console.log(`Proxying /assets to: ${targetUrl}`);
      req.pipe(request(targetUrl)).pipe(res);
    });

    // Start the server
    const port = config.port || 3000; // Default port if not configured
    server.listen(port, () => {
      this.status({ fill: "green", shape: "dot", text: `Listening on port ${port}` });
      console.log(`Server started. Listening on port ${port}`);
    });

    this.on("close", () => {
      server.close();
      console.log("Server closed");
    });
  }

  RED.nodes.registerType("reverse-proxy-invoke", ReverseProxyNode);
};
