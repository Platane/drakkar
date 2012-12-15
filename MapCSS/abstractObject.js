var extend = function( child , f ){
	for( var p in f )
		child.prototype[ p ] = f[ p ];
	if( !child.prototype.superDad )
		child.prototype.superDad = f;
};

/**  @class Abstract class that can retain several properties. Element that herit from this class can be attach to a style
 *
 */
AbstractAttributeHolder = function(){};
AbstractAttributeHolder.prototype = {
	_attributes : null,
	_classes: null,
	
	type : 0,
	id : null,
	
	removeAttribute:function( attributeName ){
		delete this._attributes[ attributeName ];
	},
	setAttribute:function( attributeName , value ){
		this._attributes[ attributeName ] = value;
	},
	getAttribute:function( attributeName ){
		return this._attributes[ attributeName ];
	},
	
	
	addClass:function( className ){
		this._classes[ className ]=true;
	},
	removeClass:function( className ){
		this._classes[ className ]=null;
		delete this._classes.className;
	},
	hasClass:function( className ){
		return ( this._classes[ className ] ? true : false );
	},
	getParent:function(){
		return null;
	},
};

/**  @class Element that know how to compute the style chain to apply render effect.
 *
 */
var AbstractElement = function(){};
extend( AbstractElement , AbstractAttributeHolder.prototype );
extend( AbstractElement , {
	_styleChain : null,
	_style : true,
	_dirtyMergedStyle : true,
	
	globalAttrChanged:function(){
		this._dirtyMergedStyle = true;
	},
	getStyle:function( globalAttr ){
		if( this._dirtyMergedStyle ){
			this._style = this._interpretStyle( this._mergeStyleChain( globalAttr ));
			this._dirtyMergedStyle = false;
		}
		return this._mergedStyle;
	},
	
	_interpretStyle:function( mergedStyle ){
		/* assuming there is no collision in the mergedStyle */
		var JSONstyle = {};
		for( var p in mergedStyle ){
			var value = mergedStyle[ p ];
			switch( p ){
				case "strocke-width" :
					/* TODO : throw error if the style is not applicable to this item */
					JSONstyle.strocke = true;
					JSONstyle.weight = value;
					if( !JSONstyle.color )
						JSONstyle.color = "#000000";
					if( !JSONstyle.opacity )
						JSONstyle.opacity = "1";
				break;
				case "strocke-opacity" :
					JSONstyle.strocke = true;
					JSONstyle.opacity = value;
					if( !JSONstyle.color )
						JSONstyle.color = "#000000";
					if( !JSONstyle.weight )
						JSONstyle.weight = 1;
				break;
				case "strocke-color" :
					JSONstyle.strocke = true;
					JSONstyle.color = value;
					if( !JSONstyle.opacity )
						JSONstyle.opacity = "1";
					if( !JSONstyle.weight )
						JSONstyle.weight = 1;
				break;
				
				case "fill-opacity" :
					JSONstyle.fill = true;
					JSONstyle.fillOpacity = value;
					if( !JSONstyle.fillColor )
						JSONstyle.fillColor = "#000000";
				break;
				case "fill-color" :
					JSONstyle.fill = true;
					JSONstyle.color = value;
					if( !JSONstyle.fillOpacity )
						JSONstyle.fillOpacity = 1;
				break;
				default : 
					throw 'unknow property "'+p+'" ';
			}
		}
		return JSONstyle;
	},
	_mergeStyleChain:function( globalAttr ){
		var style = {};
		var dec;
		for( var i = 0 ; i < this._styleChain.length ; i ++ ){
			dec = this._styleChain[i];
			if( dec.dynCondition && dec.dynCondition( globalAttr ) || !dec.dynCondition )
				for( var j = 0 ; dec.props.length ; j ++ )
					style[ dec.props[j].name ] = dec.props[j].value;
		}
		return style;
	},
});