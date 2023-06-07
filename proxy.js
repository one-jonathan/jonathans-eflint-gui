import { createServer } from "http";
import request from "request";

// main purpose of this proxy is to allow CORS requests

const getHeaderValue = (header) => {
  const value = process.argv[header] || "";
  return !isNaN(parseInt(value)) ? `http://localhost:${value}` : value;
};

const origin = getHeaderValue(2) || "http://localhost:3000";
const proxyTo = getHeaderValue(3) || "http://localhost:8080";
const proxyServerPort = process.argv[4] || 8000;

const proxy = createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const targetUrl = `${proxyTo}${req.url}`;
  req.pipe(request(targetUrl, (error, response, body) => {
    if (error) {
      console.error("Error:", error);
      res.end();
    }
    else {
      res.end(body);
    }
  }));
});

proxy.listen(proxyServerPort, () => {
  console.log(`Proxy server listening on port ${proxyServerPort}`);
});