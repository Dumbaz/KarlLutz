
var locations;
var photoSets = [];

window.onpageshow = function() {
	console.log("onpageshow");
}

window.onload = function() {
	console.log("onload");
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
		for (var i=0;i<162;i++) {
			arr.push({});
		}
		$.each(photoSets, function(k,v) {
			v.id = k;
			var idx = parseInt(k.split('_')[1])-1;
			arr.splice(idx, 1, v);
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

function mapDidSelectLocation(photoSetID) {
	publish('/photoset/select',[photoSetID]);
	console.log("map did select photoset: ",photoSetID);
}

function pictureViewportDidSelectLocation(location) {

}