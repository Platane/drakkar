
////apply patch
(function(){
var patternOptions={
	pattern:false,
	patternOpacity:1,
	patternPath:"M 0,0 L 10,0 L 10,10 L 0,10 z",
	patternColor:null,
	patternSize:10,
	patternScale:0.5,
};
L.Path.prototype.options=L.Util.extend({}, L.Path.prototype.options, patternOptions);
L.Polygon.prototype.options=L.Util.extend({}, L.Polygon.prototype.options, patternOptions);

/*
for(var i in patternOptions)
	L.Path.prototype.options[i] = patternOptions[i];
*/

L.Path.prototype._pattern=null;
	
var originalUpdate=L.Path.prototype._updateStyle;
L.Path.prototype._updateStyle=function(){
	originalUpdate.apply(this,arguments);
	if (this.options.pattern){
			if(!this._pattern){
				var defs=this._createElement('defs');
				this._pattern = this._createElement('pattern');
				this._pattern.setAttribute('id','myPattern'+this._leaflet_id);
				this._pattern.setAttribute('patternUnits',"userSpaceOnUse");
				this._pattern.setAttribute('x',"0");
				this._pattern.setAttribute('y',"0");
				this._pattern.setAttribute('width',"100");
				this._pattern.setAttribute('height',"100");
				
				var rect=this._createElement('rect');
				rect.setAttribute('x',"0");
				rect.setAttribute('y',"0");
				rect.setAttribute('width',"100");
				rect.setAttribute('height',"100");
				
				var path=this._createElement('path');
				
				this._pattern.appendChild(rect);
				this._pattern.appendChild(path);
				defs.appendChild(this._pattern);
				this._container.appendChild(defs);
			}
			var rect=this._pattern.getElementsByTagName('rect')[0];
			var path=this._pattern.getElementsByTagName('path')[0];
			
			if (this.options.fill) {
				rect.setAttribute('fill', this.options.fillColor || this.options.color);
				rect.setAttribute('fill-opacity', this.options.fillOpacity);
			} else {
				rect.setAttribute('fill', 'none');
			}
			path.setAttribute('fill',this.options.patternColor || this.options.color );
			path.setAttribute('fill-opacity',this.options.patternOpacity );
			path.setAttribute('d',this.options.patternPath );
			
			this._pattern.setAttribute('width', this.options.patternSize );
			this._pattern.setAttribute('height', this.options.patternSize );
			
			var scale=10/Math.min(1,Math.max(this.options.patternScale,0.1));
			this._pattern.setAttribute('viewBox',"0 0 "+scale+" "+scale+"");
			
			this._path.setAttribute('fill','url(#myPattern'+this._leaflet_id+')');
		}
};

	
})();

