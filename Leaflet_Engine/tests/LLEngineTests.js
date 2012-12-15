
var EngineTest = function(){};
EngineTest.prototype = {
    
    map : null,
    nb_map_errors : 0,
    nb_layer_errors : 0,
    nb_element_errors : 0,
    nb_util_errors : 0,
    
    map_errors : [],
    layer_errors : [],
    element_errors : [],
    util_errors : [],
    
    _addError : function( error_test_function, error_message, error_category){
        
        var str = "Error, test : "+error_test_function+", message : "+error_message;
        if(error_category == 'map'){
            this.map_errors.push(str);
            this.nb_map_errors++;
        }
        if(error_category == 'layer'){
            this.layer_errors.push(str);
            this.nb_layer_errors++;
        }
        if(error_category == 'element'){
            this.element_errors.push(str);
            this.nb_element_errors++;
        }
        if(error_category == 'util'){
            this.element_errors.push(str);
            this.nb_util_errors++;
        }
        
    },
    
    printErrors : function(){
        
        var mapdiv = $('div#map h2');
        var layerdiv = $('div#layer h2');
        var elementdiv = $('div#element h2');
        var utildiv = $('div#util h2');
        
        for(error in this.map_errors){
            mapdiv.after(error+'</br>');
        }
        mapdiv.after(this.nb_map_errors+' errors</br>');
        
        for(error in this.layer_errors){
            layerdiv.after(error+'</br>');
        }
        layerdiv.after(this.nb_layer_errors+' errors</br>');
        
        for(i = 0;i<this.nb_element_errors;i++){
            elementdiv.after(this.element_errors[i]+'</br>');
        }
        elementdiv.after(this.nb_element_errors+' errors</br>');
        
        for(error in this.util_errors){
            utildiv.after(error+'</br>');
        }
        utildiv.after(this.nb_util_errors+' errors</br>');
    },
    
    _setUp : function(){
        
        
    },
    
    runTests : function(){
        
        this.map = Map.createMap('leaflet', 'name', 'desc')
        for(elt in this){
            if(elt.indexOf('_test') == 0 && typeof(this[elt]) == 'function')this[elt]();
        }
        
        this.printErrors();
    },
    
    _testMap : function(){
        this._setUp();
        /*if(this.map.getName() != 'name')this._addError('Map.createMap', 'map.getName() != \'name\'', 'map');
        if(this.map.getDescription() != 'desc')this._addError('Map.createMap', 'map.getDescription() != \'desc\'', 'map');*/
    },
    
    _testLayer : function(){
        this._setUp();
        
        //test layer creation with params
        /*var layer = Layer.createLayer('name', 'desc');
        if(typeof(layer.getProperty('name')) == 'undefined')this._addError('Layer.createLayer(name, desc)', 'layer.getProperty("name") is undefined', 'layer');
        if(layer.getProperty('name') != 'name')this._addError('Layer.createLayer(name, desc)', 'layer.getProperty("name") != "name"', 'layer');
        
        if(typeof(layer.getProperty('desc')) == 'undefined')this._addError('Layer.createLayer(name, desc)', 'layer.getProperty("desc") is undefined', 'layer');
        if(layer.getProperty('desc') != 'desc')this._addError('Layer.createLayer(name, desc)', 'layer.getProperty("desc") != "desc"', 'layer');
        
        //test layer creation with no params
        layer = Layer.createLayer()
        if(typeof(layer.getProperty('name')) == 'undefined')this._addError('Layer.createLayer()', 'layer.getProperty("name") is undefined', 'layer');
        if(layer.getProperty('name') != 'Layer#0')this._addError('Layer.createLayer()', 'layer.getProperty("name") != "Layer#0"', 'layer');
        
        if(typeof(layer.getProperty('desc')) != 'undefined')this._addError('Layer.createLayer()', 'layer.getProperty("desc") should not exist ', 'layer');
        
        //test layer creation from geojson object*/
        
    },
    
    _testElement : function(){
        
        this._setUp();
        var elt = Element._createAbstractElement('name', 'desc');
        
        //abstract constructor with params
        if(typeof(elt.getProperty('name')) == 'undefined')this._addError('Element._createAbstractElement(name, desc)', 'element.getProperty(name) is undefined', 'element');
        if(elt.getProperty('name') != 'name')this._addError('Element._createAbstractElement(name, desc)', 'element.getProperty(name) != \'name\'', 'element');
        
        if(typeof(elt.getProperty('desc')) == 'undefined')this._addError('Element._createAbstractElement(name, desc)', 'element.getProperty(desc) is undefined', 'element');
        if(elt.getProperty('desc') != 'desc')this._addError('Element._createAbstractElement(name, desc)', 'element.getProperty(desc) != \'desc\'', 'element');
        
        //abstract constructor without params
        elt = Element._createAbstractElement();
        
        if(typeof(elt.getProperty('name')) == 'undefined')this._addError('Element._createAbstractElement()', 'element.getProperty(name) is undefined', 'element');
        if(elt.getProperty('name') != 'Element#0')this._addError('Element._createAbstractElement()', 'element.getProperty(name) != \'Element#0\'', 'element');
        
        if(typeof(elt.getProperty('desc')) != 'undefined')this._addError('Element._createAbstractElement()', 'element.getProperty(desc) is defined and should not', 'element');
        
        //test properties functions
        elt.addProperty('test', 'value');
        if(typeof(elt.getProperty('test')) == 'undefined')this._addError('Element.addProperty', 'element.getProperty(test) is undefined', 'element');
        if(elt.getProperty('test') != 'value')this._addError('Element.addProperty', 'element.getProperty(test) != \'value\'', 'element');
        
        //test remove properties functions
        elt.removeProperty('test');
        if(typeof(elt.getProperty('test')) != 'undefined')this._addError('Element.removeProperty', 'element.getProperty(test) is still defined', 'element');
        
        //test point creation
        var elt1 = Element.createPoint( new L.latLng(0, 0), {title: 'point test'});
        if(elt1.getType() != Element.geometry.POINT)this._addError('Element.createPoint(latlng)', 'element.getType() != Element.geometry.POINT', 'element');
        elt1.getLeafletElement().addTo(this.map.getLeafletMap());
        
        //test multipoint creation
        var elt2 = Element.createMultiPoint( [new L.LatLng(0, 20), new L.LatLng(10, 20)], {title: 'multipoint test'});
        if(elt2.getType() != Element.geometry.MULTIPOINT)this._addError('Element.createMultiPoint(latslngs)', 'element.getType() != Element.geometry.MULTIPOINT', 'element');
        elt2.getLeafletElement().addTo(this.map.getLeafletMap());
      
        
        //test line creation
        var elt3 = Element.createLine( [new L.LatLng(0, 30), new L.LatLng(0, 50)], {color: 'red'}  );
        if(elt3.getType() != Element.geometry.LINE)this._addError('Element.createLine(latslngs)', 'element.getType() != Element.geometry.LINE', 'element');
        elt3.getLeafletElement().addTo(this.map.getLeafletMap());
        
        //test multiline creation
        var elt4 = Element.createMultiLine( [[new L.LatLng(0, 70), new L.LatLng(0, 90)], [new L.LatLng(20, 70), new L.LatLng(20,90)]], {color: 'green'}  );
        if(elt4.getType() != Element.geometry.MULTILINE)this._addError('Element.createMultiLine(latslngs)', 'element.getType() != Element.geometry.MULTILINE', 'element');
        elt4.getLeafletElement().addTo(this.map.getLeafletMap());
        
        //test polygon creation (rectangle)
        var elt5 = Element.createPolygon( [new L.LatLng(0, 110), new L.LatLng(20, 130)], {color: 'black'}  );
        if(elt5.getType() != Element.geometry.POLYGON)this._addError('Element.createPolygon(latslngs)', 'element.getType() != Element.geometry.POLYGON', 'element');
        elt5.getLeafletElement().addTo(this.map.getLeafletMap());
        
        //test polygon creation
        var elt5 = Element.createPolygon( [new L.LatLng(0, 140), new L.LatLng(-10, 150), new L.LatLng(0, 160), new L.LatLng(10, 160) ], {color: 'purple'}  );
        if(elt5.getType() != Element.geometry.POLYGON)this._addError('Element.createPolygon(latslngs)', 'element.getType() != Element.geometry.POLYGON', 'element');
        elt5.getLeafletElement().addTo(this.map.getLeafletMap());
        
        //test multi polygon creation
        var elt6 = Element.createMultiPolygon( [[new L.LatLng(0, 170), new L.LatLng(-10, 175), new L.LatLng(0, 180)], [new L.LatLng(5, 170), new L.LatLng(15, 175), new L.LatLng(5, 180)]], {color: 'yellow'}  );
        if(elt6.getType() != Element.geometry.MULTIPOLYGON)this._addError('Element.createMultiPolygon(latslngs)', 'element.getType() != Element.geometry.MULTIPOLYGON', 'element');
        elt6.getLeafletElement().addTo(this.map.getLeafletMap());
        
        //test element creation from leaflet layer
        var elt7 = Element._createElementFromLeafletLayer(Element.geometry.LINE, new L.Polyline([new L.LatLng(-10, 0), new L.LatLng(-10,10)], {color: 'grey'}));
        elt7.getLeafletElement().addTo(this.map.getLeafletMap());
        
        //add property to see if geoJSON is well generated with several properties
        elt1.addProperty('test', 'value');
        elt2.addProperty('test', 'value');
        elt3.addProperty('test', 'value');
        elt4.addProperty('test', 'value');
        elt5.addProperty('test', 'value');
        elt6.addProperty('test', 'value');
        
        //test save as geoJSON
        //for point
        var str = JSON.stringify(elt1.saveAsGeoJSON());
        if(str != '{"type":"Feature","properties":{"name":"Element#1","test":"value"},"geometry":{"type":"Point","coordinates":[0,0]}}')this._addError('Element.saveAsGeoJSON()', 'bad geoJSON generated for Point Element', 'element');
        /*
        //for multi point
        var str = JSON.stringify(elt2.saveAsGeoJSON());
        if(str != '')this._addError('Element.saveAsGeoJSON()', 'bad geoJSON generated for MultiPoint Element', 'element');
        
        //for line
        var str = JSON.stringify(elt3.saveAsGeoJSON());
         if(str != '')this._addError('Element.saveAsGeoJSON()', 'bad geoJSON generated for Line Element', 'element');
        
        //for multiline
        var str = JSON.stringify(elt4.saveAsGeoJSON());
         if(str != '')this._addError('Element.saveAsGeoJSON()', 'bad geoJSON generated for Multiline Element', 'element');
        
        //for polygon
        var str = JSON.stringify(elt5.saveAsGeoJSON());
         if(str != '')this._addError('Element.saveAsGeoJSON()', 'bad geoJSON generated for Polygon Element', 'element');
        
        //for multi polygon
        var str = JSON.stringify(elt6.saveAsGeoJSON());
         if(str != '')this._addError('Element.saveAsGeoJSON()', 'bad geoJSON generated for MultiPolygon Element', 'element');
        */
        this.map.getLeafletMap().fitWorld();
    },
    
    _testUtil : function(){
        this._setUp();
        
        //test latlng to array
        /*var latlng = new L.LatLng('50.5', '40.5');
        var res = Util.latLngToArray(latlng);
        if(!(res instanceof Array))this._addError('Util.latLngToArray(latlng)', 'returned value is not an Array', 'util');
        else if(res.length != 2 || res[0] != 50.5 || res[1] != 40.5)this._addError('Util.latLngToArray(latlng)', 'returned Array contains wrong values', 'util');
        
        //test trim
        var word = ' ok ok ';
        var res = Util.trim(word);
        if(res != 'ok ok')this._addError('Util.trim(\' ok ok \')', 'waited : "ok ok", found : "'+res, 'util');*/
    }
    
    
};
