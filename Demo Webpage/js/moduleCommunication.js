function mapDidSelectLocation(location) {
	console.log("map did select location: ");
	
	var latitude = location.latitude;
	var longitude = location.longitude;

	console.log(latitude + " " + longitude);

	var apiCallUrl = "http://overpass.osm.rambler.ru/cgi/interpreter?data=[out:json];node(around:100000,";
	var node = latitude+","+longitude;
	var out = ")['historic'='battlefield'];out body;";

	console.log(apiCallUrl + node + out);

	$.get(apiCallUrl + node + out,function(data){
		console.log(data);
	});
}

function pictureViewportDidSelectLocation(location) {

}