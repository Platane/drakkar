importScripts( "TileRender.js" );

var drawer = mrc.Drawer.create();

self.onmessage = function(event) {
	
    var data = event.data;
	
	// specific message to pass the elements
	if( data.type == "SendElements" ) {
		
		drawer.appendElements( data.elements );
		
		return;
	}
	
    self.postMessage( data );

};