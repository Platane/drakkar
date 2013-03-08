var object1 = {"type" : "Feature",
			"tags" : ["ville", "city", "france"],
			"properties" : "",
			"geometry" : {
				"type" : "Point",
				"coordinates" : [1, 1]
			},
			"name" : "Paris",
			"start_date" : {
				"year" : 1900
			}
			};

var object2 = {"type" : "Feature",
			"tags" : ["ville", "city", "usa"],
			"properties" : "",
			"geometry" : {
				"type" : "Point",
				"coordinates" : [2, 2]
			},
			"name" : "New York",
			"start_date" : {
				"year" : 1900
			}
			};


var object3 = {"type" : "Feature",
			"tags" : ["ville", "city", "angleterre", "england"],
			"properties" : "",
			"geometry" : {
				"type" : "Point",
				"coordinates" : [3, 3]
			},
			"name" : "London",
			"start_date" : {
				"year" : 1900
			}
		};
			
	
var layer1 = {"type" : "FeatureCollection",
		"name" : "Cities_Big",
		"features" : [object1, object2, object3]
};	
			
			
var layer2 = {"type" : "FeatureCollection",
		"name" : "Cities_USA",
		"tags" : ["cities", "usa"],
		"features" : [object2]
};

var layer3 = {"type" : "FeatureCollection",
		"name" : "Cities_France",
		"tags" : ["cities", "france"],
		"features" : [object1]
};

var layer4 = {"type" : "FeatureCollection",
		"name" : "Cities_England",
		"tags" : ["cities", "england"],
		"features" : [object3]
};

var map1 = {"type" : "Collections",
		"name" : "Popular_cities",
		"author" : "Benoit",
		"tags" : ["cities", "england", "popular", "usa", "france"],
		"collections" : [layer1]
		
	
}

var map2 = {"type" : "Collections",
		"name" : "France",
		"author" : "Benoit",
		"tags" : ["cities", "popular", "france"],
		"collections" : [layer3]
		
	
}

var map3 = {"type" : "Collections",
		"name" : "England",
		"author" : "Benoit",
		"tags" : ["cities", "england", "popular"],
		"collections" : [layer4]
		
	
}

var map4 = {"type" : "Collections",
		"name" : "USA",
		"author" : "Benoit",
		"tags" : ["cities", "popular", "usa"],
		"collections" : [layer2]
		

}
			
			