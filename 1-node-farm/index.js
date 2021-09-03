const fs = require("fs");
const http = require("http");
const url = require("url");
const replaceTemplate = require("./modules/replaceTemplate");

/** Creating a web server & send file data */
const fileData = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");

const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);

const dataObj = fileData;
const products = JSON.parse(dataObj);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  if (pathname === "/" || pathname === "/overview") {
    const cardsHTML = products
      .map((product) => replaceTemplate(tempCard, product))
      .join("");
    const overview = tempOverview.replace(/{%PRODUCT_CARDS%}/g, cardsHTML);
    res.writeHead(200, {
      "Content-type": "text/html",
    });
    res.end(overview);
  } else if (pathname === "/product") {
    const product = products[query.id];
    const productDetailPage = replaceTemplate(tempProduct, product);

    res.end(productDetailPage);
  } else if (pathname === "/api") {
    res.writeHead(200, {
      "Content-type": "application/json",
    });

    res.end(dataObj);
  } else {
    res.writeHead(
      //Status Code
      404,
      {
        //headers
        "Content-type": "text/html",
        "my-own-header": "sample",
      }
    );
    res.end("<h1>Error Page</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("listening at 8000..");
});
//utf-8 encoding is necessarry otherwise we will get buffer
/** Synchronous / Blocking code */
/* const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
console.log(textIn);
const textOut = `Here is something we know about avacado :${textIn}. \n Created on ${Date.now()}`;
fs.writeFileSync("./txt/output.txt", textOut);
console.log("File content has been written"); */

/** Asynchronous /Non- Blocking way */
/* fs.readFile("./txt/start.txt", "utf-8", (err, data) => {
  if (err) console.log("Error! 🧨");
  fs.readFile(`./txt/${data}.txt`, "utf-8", (err, data) => {
    const starttext = data;
    fs.readFile("./txt/append.txt", "utf-8", (err, data) => {
      const endtext = data;
      fs.writeFile("./txt/output.txt", `${starttext}\n${endtext}`, (err) => {});
    });
  });
});

console.log("Will read file 📑"); */
