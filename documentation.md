# Overview

Aplik�cia zobrazuje zast�vky v Bratislave a jej okol�. Hlavn� scen�re s�:
- zobrazenie v�etk�ch zast�vok vo zvolenej mestskej �asti
- zobrazenie zast�vok v zadanej vzdialenosti od aktu�lnej poziicie pou��vate�a 
- zobrazenie v�etk�ch zast�vok, ktor� sa nach�dzaj� na tej ceste, ku ktorej m� poz�cia pou��vate�a najbli��ie, a zobrazenie aj t�ch zast�vok ktor� sa nach�dzaj� na cest�ch, ktor� s� prepojen� s touto najbli��ou cestou.

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

D�ta zast�vok poch�dzaj� priamo z OSM datab�zy, ktor� bola imporotvan� pomocou oms2pgsql. Obsahuje Bratislavu a jej �ir�ie okolie.
Pre zr�chlenie dopytov boli pou�it� indey nad v�etk�mi st�pcami `way` v tabu�k�ch `planet_osm_point`, `planet_osm_lines` a `planet_osm_polygon` a nad st�pcom `public_transport` v tabulke  `planet_osm_point`
Geojson je generovan� priamo pri dopytoch nad datab�zou pou�it�m funkcie `st_asgeojson`.



