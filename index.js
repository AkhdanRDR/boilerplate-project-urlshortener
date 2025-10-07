require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");
const urlparser = require("url");
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI);
client.connect();
const db = client.db("urlshortener");
const urls = db.collection("test");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
  var link = req.body.url;
  dns.lookup(urlparser.parse(link).hostname, async (err, address) => {
    if (!address) {
      res.json({ error: "invalid url" });
    } else {
      const urlCount = await urls.countDocuments({});
      const urlDoc = {
        link,
        shorturl: urlCount,
      };
      const result = await urls.insertOne(urlDoc);
      console.log(result);
      res.json({ original_url: link, short_url: urlCount });
    }
  });
});

app.get("/api/shorturl/:short_url", async function (req, res) {
  const shorturl = req.params.short_url;
  const urlDoc = await urls.findOne({ shorturl: +shorturl });
  res.redirect(urlDoc.link);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
