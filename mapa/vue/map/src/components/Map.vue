<template>
  <div class="md-layout md-alignment-top-center">
    <md-toolbar class="md-primary">
      <h3 class="md-title">Zastávky v Bratislave a okolí</h3>
    </md-toolbar>
    <md-card class="md-layout-item md-size-85">
      <mapbox
          access-token="pk.eyJ1IjoiaW5kZWVkMTMiLCJhIjoiY2pvenN6eWFvMGJ1bjNybno3b253bnM4ZyJ9.f3-G0uZ9Rd1Tjd4WMddwUg"
          @map-load="mapLoaded"
           @geolocate-error="geolocateError"
          :map-options="{
              container: 'map',
              style: 'mapbox://styles/mapbox/light-v9',
              center: [17.107748, 48.148598],
              zoom: 10
          }"
          :geolocate-control="{
              show: true,
              position: 'top-left'
          }"
          :scale-control="{
              show: true,
              position: 'top-left'
          }"
          :fullscreen-control="{
              show: true,
              position: 'top-left'
          }"
          @geolocate-geolocate="getUserPosition"
      ></mapbox>
      <div class="md-layout md-alignment-top-center">
        <div class="md-layout-item md-size-30">
      <md-card
        class="md-layout md-alignment-top-center "
        
      >
        <md-field class="md-layout-item md-size-90">
          <label for="font">Oblasť</label>
          <md-select v-model="selectedPolygon">
            <md-option value="Všetko">Všetko</md-option>
            <md-option
              v-for="polygon in allPolygons"
              :key="polygon.name"
              :value="polygon.name"
              >{{ polygon.name }}</md-option
            >
          </md-select>
        </md-field>

        <div class="md-layout-item md-size-90">
          Vzdialenosť <br />
          <input type="range" min="0" max="10000" v-model.number="distance" />
          {{ distance }}m
        </div>
        <md-button
          class="md-layout-item  md-size-90 md-raised md-primary"
          @click="platformsInDistance(distance)"
          >Hľadaj vo vzdialenosti</md-button
        >
      </md-card>
      </div>
      </div>
      <br />
    </md-card>
  </div>
</template>

<script>
  import Mapbox from "mapbox-gl-vue";
  import VueMapboxMap from "vue-mapbox-map";
  export default {
    name: "HelloWorld",
    data() {
      return {
        userPosition: {
          lng: 17.107748,
          lat: 48.148598
        },
        distance: 100,
        polygonNames: [],
        selectedPolygon: "",
        allPolygons: [],
        pointFeature: {
          type: "Feature",
          geometry: null,
          properties: {
            title: null,
            icon: "harbor",
            id: null
          }
        },
        geoJsonData: []
      };
    },
    components: {
      mapbox: Mapbox,
      "vue-mapbox-map": VueMapboxMap
    },
    methods: {
      platformsInDistance(distance) {
        this.$http
          .post("http://localhost:3000/getPlatformsInDistance", {
            lng: this.userPosition.lng,
            lat: this.userPosition.lat,
            distance: this.distance
          })
          .then(function(data) {
            this.addPointsToMap(data);
          });
      },

      getUserPosition(p) {
        console.log(p._userLocationDotMarker._lngLat.lng);
        console.log(p._userLocationDotMarker._lngLat.lat);
        this.userPosition.lng = p._userLocationDotMarker._lngLat.lng;
        this.userPosition.lat = p._userLocationDotMarker._lngLat.lat;
        this.$http
          .post("http://localhost:3000/nearestPlatforms", {
            lng: p._userLocationDotMarker._lngLat.lng,
            lat: p._userLocationDotMarker._lngLat.lat
          })
          .then(function(data) {
            this.addPointsToMap(data);
          });
      },
      mapLoaded(m) {
        this.map = m;
      },

      addPointsToMap(data) {
        var i;
        this.geoJsonData = [];
        for (i = 0; i < data.body.length; i++) {
          var pointFeature = {
            type: "Feature",
            geometry: null,
            properties: {
              title: null,
              icon: "circle-15"
            }
          };
          pointFeature.geometry = JSON.parse(data.body[i].geometry);
          pointFeature.properties.title = data.body[i].name;

          this.geoJsonData.push(pointFeature);
        }
        console.log(this.geoJsonData);
        if (this.map.getLayer("points")) {
          this.map.removeLayer("points");
          this.map.removeSource("sourceee");
        }

        this.map.addSource("sourceee", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: this.geoJsonData
          }
        });

        var layer = {
          id: "points",
          type: "symbol",
          source: "sourceee",
          layout: {
            "icon-image": "circle-15",
            "text-field": "{title}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
          }
        };
        console.log(layer);
        this.map.addLayer(layer);
        console.log(data);
      },

      geolocateError(control, positionError) {
        console.log(positionError);
      },
      getNamesOfAllPolygons() {
        this.$http
          .get("http://localhost:3000/getPolygonNames")
          .then(function(data) {
            var i;
            this.allPolygons = data.body;
            for (i = 0; i < data.body.length; i++) {
              this.polygonNames.push(data.body[i].name);
            }
          });
      }
    },
    watch: {
      selectedPolygon: function(val) {
        this.selectedPolygon = val;
        if (val == "Všetko") {
          this.$http
            .post("http://localhost:3000/getAllPlatforms")
            .then(function(data) {
              this.addPointsToMap(data);
            });
        } else {
          this.$http
            .post("http://localhost:3000/getPlatformsByPolygon", {
              way: this.allPolygons[
                this.polygonNames.indexOf(this.selectedPolygon)
              ].way
            })
            .then(function(data) {
              this.addPointsToMap(data);
            });
        }
      }
    },
    created() {
      this.getNamesOfAllPolygons();
    }
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1,
  h2 {
    font-weight: normal;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    display: inline-block;
    margin: 0 10px;
  }
  a {
    color: #42b983;
  }

  #map {
    width: 100%;
    height: 500px;
  }
</style>
