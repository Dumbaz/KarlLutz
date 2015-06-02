var locations = [];
var photoSets = [];
var map;

var circleGroups = {};

var clickedPolygon;
var clickedPolygonMarker;

function initMap(parsedLocations,parsedPhotoSets) { 

  locations = parsedLocations;
  photoSets = parsedPhotoSets;

  var southWest = L.latLng(37.88905008, -11.01074219),
      northEast = L.latLng(61.60639637, 52),
      bounds = L.latLngBounds(southWest, northEast);

  map = L.map('map',{maxBounds: bounds,minZoom: 3.5}).setView([49.3208300, 8.4311100], 6);

  var stamen_TonerLite = L.tileLayer('http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
  });

  stamen_TonerLite.addTo(map);
    
  addMarkerToMap();
  addSlider();
}

function addMarkerToMap() {

  for (photoSetKey in photoSets){
    var photoSet = photoSets[photoSetKey];

    //If photoset has locations add markers
    if (photoSet.hasOwnProperty("locations")) {
      var photoSetLocations = photoSet.locations;
      var polygons = [];
      var names = [];

      for(photoSetLocationKey in photoSetLocations) {

        var photoSetLocation = photoSetLocations[photoSetLocationKey];
        var name = photoSetLocation.Ort;

        if(locations.hasOwnProperty(name)){
          var location = locations[name];

          if (location.latitude > 0 && location.longitude > 0) {
            polygons.push([location.latitude,location.longitude]);  
            names.push(name);
          };
  
        }

      }

      var hexColor = '#0015FF';

      var initialRadius = 1200;
      var mouseoverRadius = 15000;

      var circles = [];
      
      for (index in polygons){

          var name = names[index];        

          var circle = L.circle(polygons[index], initialRadius, {
                        color: hexColor,
                        fillColor: hexColor,
                        fillOpacity: 0.5
          }).addTo(map);

          
          circle.photoSetID = photoSetKey;
          circle.photoSet = photoSet;
          circle.locationName = name;
          circle.points = polygons;
          circle.bindPopup(name + "\n" + photoSet["unitdate"], {'offset': L.point(0,-5)});

          circles.push(circle);

          circle.on('click', function(e) {
            markerOnClick(e);
          });

          circle.on('mouseover', function(e) {
              console.log("mouseover");
              e.target.openPopup();   

              for (index in circleGroups[e.target.photoSetID]){
                var circle = circleGroups[e.target.photoSetID][index];
                circle.setRadius(mouseoverRadius);                
              }

          });

          circle.on('mouseout', function(e) {
              console.log("mouseout");
              console.log(e.target);
              e.target.closePopup();

              for (index in circleGroups[e.target.photoSetID]){
                var circle = circleGroups[e.target.photoSetID][index];
                circle.setRadius(initialRadius);                
              }
          });
      }

      circleGroups[photoSetKey] = circles;

    };

  }
}

function markerOnClick(e){

  var photoSetID = e.target.photoSetID;
  mapDidSelectLocation(photoSetID);

  console.log("circles");  
  console.log(e.target.circles);

  if (clickedPolygon) {
    map.removeLayer(clickedPolygon);
    map.removeLayer(clickedPolygonMarker);
  };

  clickedPolygon = L.polygon(e.target.points).addTo(map);
  clickedPolygon.bringToBack();
  clickedPolygon.setStyle({fillColor: '#454545',color: '#454545'});  

  var mapBoundNorthEast = map.getBounds().getNorthEast();
  var mapDistance = mapBoundNorthEast.distanceTo(map.getCenter());

  clickedPolygonMarker = L.marker(clickedPolygon.getBounds().getCenter()).addTo(map);

  map.setView(clickedPolygonMarker.getLatLng(), map.getZoom());

  if (e.target.circles) {

    var names = [];

    for(i in e.target.circles) {
      var circle = e.target.circles[i];
      names.push(circle.locationName);
    }

    clickedPolygonMarker.bindPopup(JSON.stringify(names), {'offset': L.point(0,-5)});
    clickedPolygonMarker.openPopup();
  };

}

function addSlider(){
  $('#App').append("<div id='slider'></div>");
  $("#slider").rangeSlider({
                            bounds:{min: 1916, max: 1945},
                            defaultValues:{min: 1916, max: 1945},
                            step: 1
                          
  });

  $("#slider").bind("valuesChanged", function(e, data){

    //remove all circlemarker from mapDistance
    if (clickedPolygon) {
      map.removeLayer(clickedPolygon);
      map.removeLayer(clickedPolygonMarker);
    };
    
    for(var key in circleGroups) {
      var circles = circleGroups[key];

      circles.forEach(function(circle){
        console.log(circle);
        map.removeLayer(circle);
      });
    }

    //filter circlemarker and add again 
    var min = new Date(data.values.min+"-1-1");
    var max = new Date(data.values.max+"-12-31");

    for(var key in circleGroups) {
      var circles = circleGroups[key];

      circles.forEach(function(circle){

        var photoSet = circle.photoSet;
        var dateString = photoSet["unitdate-normal"];
        var dates = dateString.split("/");

        if(dates.length > 1){

          var date1 = new Date(dates[0]);
          var date2 = new Date(dates[1]);

          var sortedDates = [date1,date2].sort(function(a,b) {
                              return a > b;
                            });

          var minDate = sortedDates[0];

          if (minDate >= min && minDate <= max) {
            circle.addTo(map);
          };

        } else if (dates.length === 1) {
          var date = new Date(dates[0]);

          if (date >= min && date <= max) {
            circle.addTo(map);
          };

        };

      });
    }


  });
}