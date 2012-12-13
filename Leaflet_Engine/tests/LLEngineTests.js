
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
    
    setUp : function(){
        
        
    },
    
    runTests : function(){
        this.map = Map.createMap('leaflet', 'name', 'desc')
        for(elt in this){
            if(elt.indexOf('test') == 0 && typeof(this[elt]) == 'function')this[elt]();
        }
        
        this.printErrors();
    },
    
    testMap : function(){
        this.setUp();
        /*if(this.map.getName() != 'name')this._addError('Map.createMap', 'map.getName() != \'name\'', 'map');
        if(this.map.getDescription() != 'desc')this._addError('Map.createMap', 'map.getDescription() != \'desc\'', 'map');*/
    },
    
    testLayer : function(){
        this.setUp();
        
    },
    
    testElement : function(){
        this.setUp();
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
        var elt1 = Element.createPoint( new L.latLng(30.5, 30.5), {title: 'point test'});
        if(elt1.getType() != Element.geometry.POINT)this._addError('Element.createPoint(latlng)', 'element.getType() != Element.geometry.POINT', 'element');
        elt1.getLeafletElement().addTo(this.map.getLeafletMap());
        
        //test multipoint creation
        var elt2 = Element.createMultiPoint( [new L.LatLng(50.5, 40.5), new L.LatLng(60.5, 40.5)], {title: 'multipoint test'});
        if(elt2.getType() != Element.geometry.MULTIPOINT)this._addError('Element.createMultiPoint(latslngs)', 'element.getType() != Element.geometry.MULTIPOINT', 'element');
        elt2.getLeafletElement().addTo(this.map.getLeafletMap());
      
        
        //test line creation
        var elt3 = Element.createLine( [new L.LatLng(20.5, 10.5), new L.LatLng(10.5, 5.5)], {color: 'red'}  );
        if(elt3.getType() != Element.geometry.LINE)this._addError('Element.createLine(latslngs)', 'element.getType() != Element.geometry.LINE', 'element');
        elt3.getLeafletElement().addTo(this.map.getLeafletMap());
        
        
        //test multiline creation
        var elt4 = Element.createMultiLine( [[new L.LatLng(80, 80), new L.LatLng(90, 90)], [new L.LatLng(100, 100), new L.LatLng(110,110)]], {color: 'green'}  );
        if(elt4.getType() != Element.geometry.MULTILINE)this._addError('Element.createMultiLine(latslngs)', 'element.getType() != Element.geometry.MULTILINE', 'element');
        elt4.getLeafletElement().addTo(this.map.getLeafletMap());
        this.map.getLeafletMap().fitWorld();
        
        //test save as geoJSON
        elt1.addProperty('test', 'value');
        var str = JSON.stringify(elt1.saveAsGeoJSON());
        if(str != '{"type":"Feature","properties":{"name":"Element#1","test":"value"},"geometry":{"type":"Point","coordinates":[30.5,30.5]}}')this._addError('Element.saveAsGeoJSON()', 'bad geoJSON generated for Point Element', 'element');
    }
    
    
    
};
