var locations = [];
var photoSets = [];
var map;

function initMap(parsedLocations,parsedPhotoSets) { 

  locations = parsedLocations;
  photoSets = parsedPhotoSets;

  console.log("number of photoSets in map.js "+ Object.keys(photoSets).length);

  map = L.map('map').setView([49.3208300, 8.4311100], 6);
  var marker = L.marker([49.3208300, 8.4311100]).addTo(map);

  var standardTileLayer = L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'examples.map-i875mjb7'
  });

  // id: 'mapbox.mapbox-terrain-v2'

  var stamen_TonerLite = L.tileLayer('http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
  });

  var Thunderforest_Outdoors = L.tileLayer('http://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });

  standardTileLayer.addTo(map);
    
  addMarkerToMap();

}

function addMarkerToMap() {

  var i = 0;

  for (photoSetKey in photoSets){
    var photoSet = photoSets[photoSetKey];

    if (photoSet.hasOwnProperty("locations")) {
      var photoSetLocations = photoSet.locations;
      console.log("locations " + photoSetLocations.length);

      //has to be in form of [
      //   [51.509, -0.08],
      //   [51.503, -0.06],
      //   [51.51, -0.047]
      // ]

      var polygons = [];

      for(photoSetLocationKey in photoSetLocations) {

        var photoSetLocation = photoSetLocations[photoSetLocationKey];
        var name = photoSetLocation.Ort;

        if(locations.hasOwnProperty(name)){
          var location = locations[name];

          if (location.latitude > 0 && location.longitude > 0) {
            polygons.push([location.latitude,location.longitude]);  

            var marker = L.marker([location.latitude, location.longitude]).addTo(map);
            marker.photoSetID = photoSetKey;

            marker.on('click', function(e) {
              markerOnClick(e);
            });
          };
  
        }

      }

      console.log("location polygon string " + JSON.stringify(polygons) + "key" + photoSetKey);
      var polygon = L.polygon(polygons).addTo(map);
      i++;

      var hexString = i.toString(16);      
      var hexColor = '#00'+hexString+'FF';
      console.log(hexColor);

      polygon.setStyle({fillColor: hexColor,color: hexColor});  
      polygon.photoSetID = photoSetKey;

      polygon.on('click', function(e) {
          markerOnClick(e);
      });

      
    };

  }
}

function markerOnClick(e){
  var photoSetID = e.target.photoSetID;
  mapDidSelectLocation(photoSetID);
}