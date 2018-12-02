# Overview

Aplikácia zobrazuje zastávky v Bratislave a jej okolí. Hlavné scenáre sú:
- zobrazenie všetkých zastávok vo zvolenej mestskej èasti
- zobrazenie zastávok v zadanej vzdialenosti od aktuálnej poziicie používate¾a 
- zobrazenie všetkých zastávok, ktoré sa nachádzajú na tej ceste, ku ktorej má pozícia používateåa najbližšie, a zobrazenie aj tých zastávok ktoré sa nachádzajú na cestách, ktoré sú prepojené s touto najbližšou cestou.

Takto vyzerá aplikácia v akcii:

![Screenshot](map_screen.PNG)

Aplikácia sa skladá z dvoch èastí. Frontend je naprogramovaný vo vue.js, v ktorom je využitý mapbox API. Backend je naprogramovaný v node.js, ktorý predstavuje server operujúci nad databázou PostGIS. Frontend komunikuje s backendom pomocou REST volaní.

# Frontend

Frontend je naprogramovaný vo vue.js. Obsahuje mapbox, ktorý zobrazuje zastávky v meste Bratislava ajej blízkom okolí pod¾a daného scenára. 
Všetok relevantný kód je v balíku `majerechj/assignment-gis/mapavue/map/` prièom zobrazenie mapy a komunikácia s backendom sa nachádzajú v súbore `majerechj/assignment-gis/mapa/vue/map/src/components/Map.vue`

Frontend zabezpeèuje
- zobrazovanie mapy a jej aktualizácie na základe scenárov
- zobrazenie jednoduchého filtra ktorý je umiestnený pod mapou.
- zobrazenie zastávok na mape je realizované pomocou geojson, ktorý sa vytvára priamo na frontende po volaní REST funkcii na backend, ktorý vracia dáta z databázy

# Backend

Backend je zodpovedný za dopyty nad databázou a výsledné vracanie výsledkov týchto dopytov na frontend.
Je naprogramovaný pomocou node.js. Jeho hlavný kód sa nachádza v súbore `majerechj/assignment-gis/mapa/API/server.js`

## Data

Dáta zastávok pochádzajú priamo z OSM databázy, ktorá bola imporotvaná pomocou oms2pgsql. Obsahuje Bratislavu a jej širšie okolie.
Pre zrýchlenie dopytov boli použité indey nad všetkými ståpcami `way` v tabu¾kách `planet_osm_point`, `planet_osm_lines` a `planet_osm_polygon` a nad ståpcom `public_transport` v tabulke  `planet_osm_point`
Geojson je generovaný priamo pri dopytoch nad databázou použitím funkcie `st_asgeojson`.



