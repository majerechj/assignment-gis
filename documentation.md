# Overview

Aplik�cia zobrazuje zast�vky v Bratislave a jej okol� (v okolit�ch dedin�ch). Hlavn� scen�re s�:

1. zobrazenie v�etk�ch zast�vok vo zvolenej mestskej �asti
	- Pri na��tan� str�nky sa najsk�r z datab�zy vybeu v�etky mestsk� �asti Bratislavy a dediny v okol� mesta. Ich n�zvy s� poskytnut� pou��vate�ovi na v�ber v selectboxe. Po v�bere mestskej �asti sa na mape zobrazia v�etky z�stavky v danej �asti na mape. Zobrazovan� s� z�stavky oboch smerov (reprezentuj�ce n�stupi�tia).
	- Select pre v�ber v�etk�ch mestsk�ch �astiach:
```sql
      select  o.name, o.way from planet_osm_point p 
       cross join planet_osm_polygon o 
       where p.public_transport like '%platform%' and o.name is not null and o.admin_level = '9' and ST_contains(o.way,p.way) 
       group by o.way, o.name 
       order by o.name
```
	- Select pre n�jdenie v�etk�ch zast�vok v mestskej �asti
```sql
select  p.name,  ST_AsGeoJSON(ST_Transform(p.way, 4326))as geometry from planet_osm_point p 
 cross join planet_osm_polygon o 
 where o.admin_level = '9' and st_equals(o.way, [zadan� way polyg�nu]) and p.public_transport like '%platform%' and ST_contains(o.way,p.way)
```

2. zobrazenie v�etk�ch zast�vok, ktor� sa nach�dzaj� na tej ceste, ku ktorej m� poz�cia pou��vate�a najbli��ie, a zobrazenie aj t�ch zast�vok ktor� sa nach�dzaj� na cest�ch, ktor� s� prepojen� s touto najbli��ou cestou.
	- Po stla�en� tla�idla na ozna�enie polohy pou��vate�a (v lavom hornom rohu obrazovky) sa vyh�ad� najbli��ia cesta, ktor� sa od pou��vate�a nach�dza. N�sledne sa n�jdu v�etky cesty, ktor� s� prepojen� s touto najbli��ou cestou. Na v�etk�ch t�chto cest�ch sa vyh�adaj� zast�vky a zobrazia na mape.
	- Pr�klad selectu pre dan� poz�ciu:

```sql
WITH nierest AS (
select  l.name,l.way, ST_AsGeoJSON(ST_Transform(l.way, 4326))as geometry, ST_distance(ST_GeomFromText('POINT(17.064271599999998 48.15826)',4326)::geography, ST_Transform(l.way,4326)::geography) as distance from planet_osm_line l
where l.highway   is not null
order by distance
limit 30)
SELECT p.name FROM nierest as n
cross join planet_osm_line k
cross join planet_osm_point p
where p.public_transport like '%platform%' 
and st_intersects(k.way, n.way)
and st_contains(k.way, p.way)
```

3. zobrazenie zast�vok v zadanej vzdialenosti od aktu�lnej poziicie pou��vate�a 
	- Poz�cia pou��vate�a je inicializovan� na stred mapy. Ak sa pou��vate� lokalizuje (ako v scen�ri 2) tak sa poz�cia od ktorej sa bud� vyyh�ad�va� najbli��ie zast�vky zmen�. N�sledne pou��vate� vyberie vzdialenos� a klikne na modr�y button (pod mapou). Syst�m vyh�ad� najbli��ie zast�vky od poz�cie pou��vate�a a zobraz� ich na mape. 
	- Pr�klad selectu pre dan� poz�ciu a vzdialenos� 300 metrov:

```sql
select  p.name, ST_AsGeoJSON(ST_Transform(p.way, 4326))as geometry, ST_distance(ST_GeomFromText('POINT(17.064271599999998 48.15826)',4326)::geography, ST_Transform(p.way,4326)::geography) from planet_osm_point p
where p.public_transport like '%platform%' 
and ST_distance(ST_GeomFromText('POINT(17.064271599999998 48.15826)',4326)::geography, ST_Transform(p.way,4326)::geography) < '300'
```


Takto vyzer� aplik�cia v akcii:

![Screenshot](map_screen.PNG)

Aplik�cia sa sklad� z dvoch �ast�. Frontend je naprogramovan� vo vue.js, v ktorom je vyu�it� mapbox API. Backend je naprogramovan� v node.js, ktor� predstavuje server operuj�ci nad datab�zou PostGIS. Frontend komunikuje s backendom pomocou REST volan�.

# Frontend

Frontend je naprogramovan� vo vue.js. Obsahuje mapbox, ktor� zobrazuje zast�vky v meste Bratislava ajej bl�zkom okol� pod�a dan�ho scen�ra. 
V�etok relevantn� k�d je v bal�ku `majerechj/assignment-gis/mapavue/map/` pri�om zobrazenie mapy a komunik�cia s backendom sa nach�dzaj� v s�bore `majerechj/assignment-gis/mapa/vue/map/src/components/Map.vue`

Frontend zabezpe�uje
- zobrazovanie mapy a jej aktualiz�cie na z�klade scen�rov
- zobrazenie jednoduch�ho filtra ktor� je umiestnen� pod mapou.
- zobrazenie zast�vok na mape je realizovan� pomocou geojson, ktor� sa vytv�ra priamo na frontende po volan� REST funkcii na backend, ktor� vracia d�ta z datab�zy

# Backend

Backend je zodpovedn� za dopyty nad datab�zou a v�sledn� vracanie v�sledkov t�chto dopytov na frontend.
Je naprogramovan� pomocou node.js. Jeho hlavn� k�d sa nach�dza v s�bore `majerechj/assignment-gis/mapa/API/server.js`

## Data

D�ta zast�vok poch�dzaj� priamo z OSM datab�zy, ktor� bola imporotvan� pomocou oms2pgsql. Obsahuje Bratislavu a jej �ir�ie okolie. Ve�kos� d�t je 0,35GB
Geojson je generovan� priamo pri dopytoch nad datab�zou pou�it�m funkcie `st_asgeojson`.


##Indexy
Pre zr�chlenie dopytov boli pou�it� indey nad v�etk�mi st�pcami `way` v tabu�k�ch `planet_osm_point`, `planet_osm_lines` a `planet_osm_polygon` a nad st�pcom `public_transport` v tabulke  `planet_osm_point`
`create index platforms_index on planet_osm_point (public_transport)
create index point_way_index on planet_osm_point (way)
create index polygon_way_index on planet_osm_polygon using gist (way)
create index line_way_index on planet_osm_line using gist (way)`
