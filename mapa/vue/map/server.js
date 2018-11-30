const express = require('express');
var bodyParser = require("body-parser");
const port = /*process.env.PORT ||*/ 8080;
//const hostname = '82.119.108.164';
const app = express();




app.use(express.static(__dirname + "/dist/"));
app.get(/.*/, function (req, res) {
  res.sendFile(__dirname + "/dist/index.html")
});

app.listen(port);

console.log("Server started...");