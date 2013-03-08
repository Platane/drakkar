/*script pour vider la bdd
 *deleteAll = function(){
    db.objects.drop();
    db.maps.drop();
    db.layers.drop();
    db.objectConcept.drop();
    db.layerConcept.drop();
    db.mapConcept.drop();
 }
 
 //info : mongodb TIENT COMPTE de la case des lettres

/**Variable contenant l'adresse de la BDD distante*/
var mongoManager = "http://localhost/mongodb_test/RequestHandler.php";

/**
 *Function that return a CORS object to allow AJAX request on a remote website
 */
function getCORSRequest() {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {

  } else if (typeof XDomainRequest != "undefined") {

    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    xhr = null;
  }
  return xhr;
}

/**
 *Function that transform parameters (JSON object) into a String containing those parameters (to use it in an URL)
 *exemple : {"type" : "value", "object" : "something"} => "type=value&object=something"
 *@param {Object} parameters The parameters to encode (JSON format)
 *@returns {String} the encoded String corresponding to the parameters given
 */
function encodeParameters(parameters){

	var string_params = "";
	for(p in parameters){
		
		var tmp = typeof parameters[p] == 'object' || typeof parameters[p] == 'array' ? JSON.stringify(parameters[p]) : parameters[p];
		
		string_params += p+"="+encodeURIComponent(tmp)+"&";
	}
	return string_params.substring(0, string_params.length-1);
	
}

/**
 *Function that send an AJAX request (CORS) to the mongoDB server.
 *To change the destination of the request, change the URL contained in the mongoManager variable
 *@param {String} type THe type of the request (post, get, put, ...)
 *param {Object} params the parameter of the request, JSON format
 **/
function sendRequest(type, params){

	var xhr   = getCORSRequest();
	
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {

			readData(xhr.responseText);

			
		}
	};
	
	if(type == "GET"){
	    var temp = mongoManager+"?"+encodeParameters(params);
		xhr.open("GET", temp , true);
		//alert(temp);
		xhr.send();
	}
	else if(type == "POST"){
		xhr.open("POST", mongoManager, true);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.send(encodeParameters(params));
	}
	
}

/**
 *Function that insert the given Layer (geoJSON object) into the mongo Database
 *@param {Object} geoJSON_Layer The Layer to insert into the Mongo Database
 */
function save(geoJSON_layer){

	sendRequest("POST", {"data": JSON.stringify(geoJSON_layer), "type" : "save"});
}

function get( options ){
  sendRequest("GET",  options  );
}


/**
 *Function that read the informations sent by the server, the mongo Database, responding to AJAX requests.
 *@param {String} data The data sent by the server (should be JSON String).
 */
function readData(data){
	
	
	document.getElementById("res").innerHTML = document.getElementById("res").innerHTML+" </br> "+data;
}
