const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function setupProxy(app) {
  const target = process.env.REACT_APP_PROXY_TARGET || "http://127.0.0.1:8000";
  app.use(
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathFilter: ["/rfq", "/bids", "/health", "/docs", "/openapi.json"],
    })
  );
};