var locations = [];
var map;

function initMap(parsedLocations) { 

  locations = parsedLocations;

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

  for (var i = 0;i < locations.length; i++){
    var location = locations[i];
    var marker = L.marker([location.latitude, location.longitude]).addTo(map);

    marker.on('click', function(e) {
      markerOnClick(e);
    });
  }
}

function markerOnClick(e){

  var latitude = e.latlng.lat;
  var longitude = e.latlng.lng;

  var object = locations.filter(function(v){
      return (v.latitude == latitude) && (v.longitude == longitude);
  });

  var description = object[0].name;

  if (object[0].alternativeName.length > 0){
    description = description + " ,alternative Namen " + object[0].alternativeName;
  }

  var popup = L.popup(closeButton = false)
        .setLatLng(e.latlng)
        .setContent(description)
        .openOn(map);

  mapDidSelectLocation(object[0]);
}

