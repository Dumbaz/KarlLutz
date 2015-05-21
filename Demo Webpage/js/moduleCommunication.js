
var locations;
var photoSets = [];

window.onload = function() {

	async.parallel([

		function(callback) {
			parseLocations(function(parsedLocations) {		
				callback(null, parsedLocations);
			})
		},
		function(callback) {
			parsePhotoSets(function(parsedPhotosets) { 
				callback(null, parsedPhotosets);
			})
		}

	],function(error, results) {

		console.log('locations' + Object.keys(results[0]).length + " photoSets " + Object.keys(results[1]).length);				
		locations = results[0];
		photoSets = results[1];

		initMap(locations, photoSets);

		// Convert photosets object to an array.
		var arr = [];
		$.each(photoSets, function(k,v) {
			arr.push(v);
		});
		photoSets = arr;	

		React.render(React.createElement(PictureViewport, {photosets: photoSets}), document.getElementById('pictureViewport'));

	});

}

//test parsing

//Data type objects (prototype)
function photoSet (photoSetID, time, location, description, photos) {
	this.photoSetID = photoSetID;
	this.location = location;
	this.time = time;
	this.description = description;
	this.photos = photos;
}

function photo (link, width, height, location) {
	this.link = link;
	this.width = width;
	this.height = height;
	this.location = location;
}

function parseLocations(callback) {

  $.getJSON("./Data/locations.json", function( data ) {
    console.log("parsed number of locations " + Object.keys(data).length);
    callback(data);
  })
  .error(function(jqXHR, textStatus, errorThrown) {
      console.log("error " + textStatus);
      console.log("incoming Text " + jqXHR.responseText);
  });

}

function parsePhotoSets(callback) {

  $.getJSON("./Data/data.json", function( data ) {
    console.log("parsed number of photosets " + Object.keys(data).length);

    for (var photoset in data) {
    	// console.log(photoset.links);
    }

    callback(data);
  })
  .error(function(jqXHR, textStatus, errorThrown) {
      console.log("error " + textStatus);
      console.log("incoming Text " + jqXHR.responseText);
  });
}

//Module communication

function mapDidSelectLocation(location) {
	console.log("map did select location: ");
	
	var latitude = location.latitude;
	var longitude = location.longitude;

	console.log(latitude + " " + longitude);

	//Search OpenStreetMap Database for entries for tags 'historic battlefield'
	//output is not much though

	var apiCall1 = "http://overpass.osm.rambler.ru/cgi/interpreter?data=[out:json];node(around:100000,";
	var apiCall2 = latitude+","+longitude;
	var apiCall3 = ")['historic'='battlefield'];out body;";

	var apiURL = apiCall1 + apiCall2 + apiCall3

	console.log(apiURL);

	$.get(apiURL,function(data){
		console.log(data);
	});
}

function pictureViewportDidSelectLocation(location) {

}