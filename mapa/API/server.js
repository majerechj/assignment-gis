var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const { Pool, Client } = require("pg");

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "gis",
  password: "123456",
  port: 5432
});
client.connect();


app.get("/getPolygonNames", function(req, sres) {
  client
    .query(
      "select  o.name, o.way from planet_osm_point p " +
        "cross join planet_osm_polygon o " +
        "where p.public_transport like '%platform%' " +
        "and o.name is not null " +
        "and o.admin_level = '9' " +
        "and ST_contains(o.way,p.way) " +
        "group by o.way, o.name " +
        "order by o.name"
    )
    .then(response => {
      sres.send(response.rows);
    });
});

app.post("/getPlatformsByPolygon", function(req, sres) {
  client
    .query(
      "select  p.name,  ST_AsGeoJSON(ST_Transform(p.way, 4326))as geometry from planet_osm_point p " +
        "cross join planet_osm_polygon o " +
        "where o.admin_level = '9' and st_equals(o.way, '" +
        req.body.way +
        "') " +
        "and p.public_transport like '%platform%' " +
        "and ST_contains(o.way,p.way)"
    )
    .then(response => {
      sres.send(response.rows);
    });
});

app.post("/getAllPlatforms", function(req, sres) {
  client
    .query(
      "select  p.name,  ST_AsGeoJSON(ST_Transform(p.way, 4326))as geometry from planet_osm_point p " +
        "where  p.public_transport like '%platform%'"
    )
    .then(response => {
      sres.send(response.rows);
    });
});

app.post("/getPlatformsInDistance", function(req, sres) {
  client
    .query(
      "select  p.name, ST_AsGeoJSON(ST_Transform(p.way, 4326))as geometry from planet_osm_point p " +
        "where p.public_transport like '%platform%' " +
        "and ST_distance(ST_GeomFromText('POINT(" +
        req.body.lng +
        " " +
        req.body.lat +
        ")',4326)::geography, ST_Transform(p.way,4326)::geography) < '" +
        req.body.distance +
        "'"
    )
    .then(response => {
      sres.send(response.rows);
    });
});

app.post("/nearestPlatforms", function(req, sres) {
  client
    .query(
      "WITH nierest AS ( " +
        "select  l.name,l.way, ST_AsGeoJSON(ST_Transform(l.way, 4326))as geometry, ST_distance(ST_GeomFromText('POINT(" +
        req.body.lng +
        " " +
        req.body.lat +
        ")',4326)::geography, ST_Transform(l.way,4326)::geography) as distance from planet_osm_line l " +
        "where l.highway is not null " +
        "order by distance " +
        "limit 1) " +
        "SELECT p.name, ST_AsGeoJSON(ST_Transform(p.way, 4326))as geometry FROM nierest as n " +
        "cross join planet_osm_line k " +
        "cross join planet_osm_point p " +
        "where p.public_transport like '%platform%' " +
        "and st_intersects(k.way, n.way) " +
        "and st_contains(k.way, p.way)"
    )
    .then(response => {
      sres.send(response.rows);
    });
});

/*app.get('/', function (req, sres) {
    client.query("SELECT  ST_AsGeoJSON(ST_Transform(l.way, 4326))as geometry  from planet_osm_line l cross join planet_osm_polygon p where l.public_transport like '%platform%'  and ST_intersects(p.way,l.way) and p.name like '%Mlynská dolina%'").then(
        response => {
            console.log(response.rows[0].geometry);
            sres.send(response.rows[2].geometry);
            //client.end()
          });
    }
  )  */

app.listen(3000);
console.log("server listening");
