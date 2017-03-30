const http = require("http");
const serveStatic = require("serve-static");
const url = require("url");

let serveRunner = serveStatic(__dirname + "/runner");
let outputRunner = serveStatic(__dirname + "/output");
let serveMocha = serveStatic(__dirname + "/../node_modules/mocha");

function slowSendFile(req, res, parsed) {
  let size = parsed.query.size ? parseInt(parsed.query.size) : 1000;

  res.setHeader("Content-Length", size);

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  let sentSoFar = 0;

  function sendPiece() {
    res.write("aaaaaaaaaa");
    sentSoFar += 10;
    if (sentSoFar === size) {
      res.end();
    } else {
      setTimeout(sendPiece, 50);
    }
  }

  sendPiece();
}

function handleRequest(req, res) {
  serveRunner(req, res, function() {
    outputRunner(req, res, function() {
      serveMocha(req, res, function() {
        let parsed = url.parse(req.url, true);
        if (parsed.pathname === "/test-file") {
          slowSendFile(req, res, parsed);
        }
      });
    });
  });
}

const server = http.createServer(handleRequest);

server.listen(4000);
