'use strict';

var _ = require('underscore'),
	fs = require('fs'),
	url = require('url'),
	https = require('https'),
	gm = require('gm').subClass({imageMagick: true}),
	data = require('./192-20.json');

function parseFlickrPhotoId(link) {
	 return link.substring(link.lastIndexOf('/')+1).split('_')[0];
}

function getSizes(link, callback) {
	return new Promise(function(resolve,reject) {
		var id = parseFlickrPhotoId(link),
				options = {
					host: 'api.flickr.com',
					path: '/services/rest/?method=flickr.photos.getSizes&api_key=b2fbcde54379c607e0516aff52dd3839&photo_id='+id+'&format=json&nojsoncallback=1',
				};

		https.request(options, function(resp) {
			var str = '';
			resp.on('data', function(data) {
				str += data;
			});
			resp.on('end', function() {
				var result = JSON.parse(str),
						sizes = {};
				if (!result.sizes) {
					reject('getSizes(): result.sizes undefined for '+JSON.stringify({link: link, options:options}));
					return resolve(null);
				}
				_.each(result.sizes.size, function(v,k) {
					if (v.label === 'Medium' || v.label === 'Large' || v.labe === "Original") {
						sizes[v.label] = {
							'source': v.source,
							// 'url': v.url,
							'width': v.width,
							'height': v.height,
							'media': v.media
						};
					}
					return resolve(sizes);
				});
			});
		}).end();
	});
}

function generateImagesJSON(link) {
	return new Promise(function(resolve) {

		var o = {};
		o.id = link;

		getSizes(link)
		.then(function(result) {
			o.sizes = result;
			resolve(o);
		})
		.catch(function(reason) {
			console.log('caught reject for getSizes:', reason);
		});

	});
}

function parsePhotoset(value, key) {
	console.log('parsePhotoset() called on ' + key);
	return new Promise(function(resolve) {
		var o = value;

		if (o.links[0] === null) {
			delete o.links;
			o.image = null;
			return resolve({'key': key, 'set': o});
		}

		Promise.all(_.map(o.links, generateImagesJSON))
		.then(function(stuff) {
			o.images = stuff;
			delete o.links;
			return resolve({'key': key, 'set': o});
		})
		.catch(function(reason) {
			console.log('mapping links promise error:', reason);
		});
	});
}

var keys = [];
for (var key in data) {
  if (data.hasOwnProperty(key)) {
    keys.push(key);
  }
}

var i = 0;
var newData = {};

function doIt() {
	var limit = keys.length-1;
	if (i === limit) {
		clearInterval(processSets);
		setTimeout(function() { 
			fs.writeFile('./eth-data.json', JSON.stringify(newData, null, 2), function(err) {
				if(err) {
					console.log('Error writing file.');
				}
				console.log('Wrote the new data file.');
			})
		}, 5000);
		setTimeout(function() { 
			fs.writeFile('./eth-data.min.json', JSON.stringify(newData), function(err) {
				if(err) {
					console.log('Error writing file.');
				}
				console.log('Wrote the new data file.');
			})
		}, 5000);
		return;
	}
	parsePhotoset(data[keys[i]], keys[i]).then(function(result) {
		newData[result.key] = result.set;
	});
	i++;
}

var fStream = fs.createWriteStream('./eth-test.json');
fStream.on('finish', function() {
	console.log('wrote the new file.');
});
var processSets = setInterval(doIt, 600);

// For debugging a particular set
// parsePhotoset(data['192-20_151'], '192-20_151').then(function(result) {
// 	console.log({result:result});
// });

// To run this using functional mapping, but was too much for Flickr Servers.
// function parseAll() {
// 	return Promise.all(_.map(data, parsePhotoset));
// }

// parseAll().then(function(result) {
// 	console.log(result);
// });
// 






