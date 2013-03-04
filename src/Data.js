
L.cloneLatLngArray = function( a ){
	var b = new Array( a.length );
	var i = a.length;
	while(i--) b[i]=new L.LatLng(a[i].lat,a[i].lng);
	return b;
};

///////////////////////
// true trustable data ////
///////////////////////

var AbstractDataElement = Backbone.Model.extend({
    stamp:null,
	type:'abstract',
	parent:null,
	defaults: function() {
      return {
        name: null,
		classes:{},
		attributes:{},
      };
    },
	generateStamp: function(){
		return 'obj'+(AbstractDataElement.count++);
	},
    initialize: function() {
	  this.stamp=this.generateStamp();
	  if(!this.get('name'))
		this.set({'name':this.getStamp()});
    },
	getStamp:function(){
		return this.stamp;
	},
    getParent:function(){
		return this.parent;
	},
	hasClass:function(c){
		return this.get("classes")[c]===true;
	},
	addClass: function(c) {
		var cs=this.get("classes");
		cs[c]=true;
		this.set({"classes":cs});
		this.trigger('change');
		this.trigger('change:classes');
    },
	removeClass: function(c) {
		var cs=this.get("classes");
		cs[c]=null;
		delete cs[c];
		this.set({"classes":cs});
		this.trigger('change');
		this.trigger('change:classes');
    },
	clone:function(){
		return new AbstractDataElement({'name':this.get('name') , 'classes':_.clone( this.get('classes') ) , 'attributes':_.clone( this.get('attributes') ) } );
	},
});
AbstractDataElement.count=0;

var DataMap = AbstractDataElement.extend({
    children:null,
	
	defaults: _.extend({
      
    }, AbstractDataElement.prototype.defaults() ),
	initialize: function() {
		DataMap.__super__.initialize.call(this);
		this.children=new Backbone.Collection();
		this.children.model=DataPackage;
		this.type='map';
	},
	addPackage:function(datapackage){
		this.children.add(datapackage);
		datapackage.parent=this;
	},
	removePackage:function(p){
		if( typeof(p)=="string" )
			if( p.substr(0,3)=="obj" ){
				p=this.children.find( function(a){return a.getStamp()==p;}); 
			}else{
				console.log('deleting an element using backbone cid is not recommanded, because of the delaguator class midle data');
				p=this.children.get(p);
			}
		else
			p=this.children.get(p);
		if(p){
			this.children.remove(p);
			p.destroy();
		}
	},
});

var DataPackage = AbstractDataElement.extend({
    children:null,
	defaults: _.extend({
      
    }, AbstractDataElement.prototype.defaults() ),	
	initialize: function() {
		DataPackage.__super__.initialize.call(this);
		this.type='package';
		this.children=new Backbone.Collection();
		this.children.model=AbstractDataElement;
	},
	addElement:function(el){
		if(el instanceof AbstractDataElement ){
			this.children.add(el);
			el.parent=this;
		}else
			switch(el.type){
				case "polygon":
					var d=new DataPolygon(el);
					d.parent=this;
					this.children.add(d);
				break;
			}
	},
	removeElement:function(el){
		var el;
		if( typeof(el)=="string" )
			if( el.substr(0,3)=="obj" ){
				el=this.children.find( function(a){return a.getStamp()==el;}); 
			}else{
				console.log('deleting an element using backbone cid is not recommanded, because of the delaguator class midle data');
				el=this.children.get(el);
			}
		else
			el=this.children.get(el);
		if(el){
			this.children.remove(el);
			el.destroy();
		}
	},
	clone:function(cloneStamp){
		var c=new DataPackage({
			'name':this.get('name') , 
			'classes':_.clone( this.get('classes') ) , 
			'attributes':_.clone( this.get('attributes') ) 
		});
		var cl=[];
		this.children.each(function(e){
			var de=e.clone(cloneStamp)
			cl.push(de);
			de.parent=c;
		});
		c.children.reset(cl);
		if(cloneStamp!=null&&cloneStamp)
			c.stamp=this.stamp;
		return c;
		
	},
	destroy:function(){
		this.children.each(function(de){
			de.destroy();
		});	
		this.children.reset([],{silent:true});
		AbstractDataElement.prototype.destroy.call(this);
	},
});

var DataPolygon = AbstractDataElement.extend({
	defaults: _.extend(
	{
      structure:[],
    }, 
	AbstractDataElement.prototype.defaults()
	),	
	initialize: function() {
		DataPolygon.__super__.initialize.call(this);
		this.type='polygon';
	},
	clone:function(cloneStamp){
		var c=new DataPolygon({
			'name':this.get('name') ,
			'classes':_.clone( this.get('classes') ) ,
			'attributes':_.clone( this.get('attributes') ) ,
			'structure':L.cloneLatLngArray(this.get('structure') )
			});
		if(cloneStamp!=null&&cloneStamp)
			c.stamp=this.stamp;
		return c;
	},
});


///////////////////////
// forked data //////////
///////////////////////
/*
 * hold a true data
 * a data is destined to be hold by several middleData
 * middleData got additionnal value that it doesn't share with the true data ( and the others middle data)
 * for other usage, it act like a transparent delegator
 */

var MiddleData = Backbone.Model.extend({
	model:null,
	type:null,
	defaults:function(){
		return {
			selected:'none',
			visible:true,
		};
	},
	initialize:function(options){
		if(!options.model)throw 'model know found';
		this.model=options.model;
		var type=this.model.type;
		this.type=type;
		this.listenTo(this.model,'change',this._relayChange);	//simply relay the trigger function
	},
	getStamp:function(){
		return this.model.stamp;
	},
	set:function(a){
		if(!this.model)
			Backbone.Model.prototype.set.call(this,a);
		else
		_.each(a,function(value,key){
			var o={};
			o[key]=value;
			if( Backbone.Model.prototype.get.call(this,key) != null )
				Backbone.Model.prototype.set.call(this,o);
			else
				this.model.set(o);
		},this);
	},
	get:function(a){
		var r=Backbone.Model.prototype.get.call(this,a);
		return r || this.model.get(a);
	},
	_relayChange:function(e){
		this.trigger('change',this);
	},
});

var MiddleDataPackage = MiddleData.extend({
	children:null,
	initialize:function(options){
		MiddleData.prototype.initialize.call(this,options);
		
		this.listenTo(this.model.children,'add',this._relayAdd);	
		this.listenTo(this.model.children,'remove',this._relayRemove);	
				
		this.children=new Backbone.Collection();
		this.children.model=MiddleDataElement;
				
		this.model.children.each(this._relayAdd,this);
		
	},
	addElement:function(el){
		this.model.addElement(el);
	},
	removeElement:function(el){
		this.model.removeElement(el);
	},
	
	_relayAdd:function(a){
		this.children.add( new MiddleData( {'model':a} ) );
	},
	_relayRemove:function(a){
		el=this.children.find( function(b){return b.getStamp()==a.getStamp();});
		this.children.remove( el );
	},
});

var MiddleDataElement = MiddleData.extend({
	initialize:function(options){
		MiddleData.prototype.initialize.call(this,options);
		
	},
});



var MiddleDataMap=Backbone.Model.extend({
		elementSelected:null,		//array of dataelement
		packageHidden:null,			//array of datapackage
		defaults:function(){
			return {
			};
		},
		initialize:function(attr,option){
			this.elementSelected=[];
			this.packageHidden=[];
		},
		
		isElementSelected:function(dataelement){
			return _.find( this.elementSelected ,function(e){return dataelement.getStamp()==e.getStamp();})!=null;
		},
		addSelectedElement:function(dataelement,option){
			option=option||{};
			if( this.isElementSelected(dataelement) )		//already in
				return;
			this.elementSelected.push( dataelement );
			if(!option.silent){
				this.trigger('change:elementSelected');
				this.trigger('change');
			}
		},
		removeSelectedElement:function(dataelement,option){
			option=option||{};
			var index=0;
			if(_.find( this.elementSelected ,function(e,i){index=i;return dataelement.getStamp()==e.getStamp();}) == null )
				return;
			this.elementSelected.splice(index,1);
			if(!option.silent){
				this.trigger('change:elementSelected');
				this.trigger('change');
			}
		},
		removeAllSelectedElement:function(option){
			option=option||{};
			this.elementSelected=[];
			if(!option.silent){
				this.trigger('change:elementSelected');
				this.trigger('change');
			}
		},
	
		isPackageHidden:function(datapackage,option){
			return _.find( this.packageHidden ,function(e){return datapackage.getStamp()==e.getStamp();}) != null;
		},
		hidePackage:function(datapackage,option){
			option=option||{};
			if( this.isPackageHidden(datapackage) )		//already in
				return;
			this.packageHidden.push(datapackage);
			if(!option.silent){
				this.trigger('change:packageHidden');
				this.trigger('change');
			}
		},
		showPackage:function(datapackage,option){
			option=option||{};
			var index=0;
			if(_.find( this.packageHidden ,function(e,i){index=i;return datapackage.getStamp()==e.getStamp();}) == null )
				return;
			this.packageHidden.splice(index,1);
			if(!option.silent){
				this.trigger('change:packageHidden');
				this.trigger('change');
			}
		},
		toggleVisibility:function(datapackage,option){
			option=option||{};
			var index=0;
			if(_.find( this.packageHidden ,function(e,i){index=i;return datapackage.getStamp()==e.getStamp();}) == null )
				this.packageHidden.push(datapackage);
			else
				this.packageHidden.splice(index,1);
			if(!option.silent){
				this.trigger('change:packageHidden');
				this.trigger('change');
			}
		},
});

/////////////////////////
// css wraper  //////////
/////////////////////////
/*
 *	
 *	strocke : 				[width:Number] [color:Color];				//compact version
 *	strocke-color : 		[color:Color];
 *	strocke-opacity : 		[opacity:Number];
 *	strocke-width : 		[width:Number];
 *	
 *	fill : 					[color:Color];								//compact version		
 *	fill-color : 			[color:Color];	
 *	fill-opacity : 			[opacity:Number];
 *	
 */

/*
 * declaration follow this :
 * 
 * dec = {
 *		stamp : {string}, 		// lol?
 *		selectors : [
 * 					selector : [
 *								condition : { class : {string}  } || { id : {string}  }  ||  { tag : {string}  } || { parent : {condition} } || { attributeQuery : {function} , attribute : {string} }
 *						     ]
 *			       ]
 *		props : [
					prop : {
 *							name : {string}
 *							value : [
 *										set of value : [
 *														value : ...
 *												]
 *								]
 *					         }
 *			]
 *	}
 */
var DatamCSS=(function(){

// util function
var rvb2hex = function( r , v , b ){
	return "#"+new Number(r).toString( 16 )+new Number(v).toString( 16 )+new Number(b).toString( 16 );
}

var isHex=function(s){
	return s.match( /^#[0-9abcdef]{6}$/ )!=null;
};
var isNumber=function(s){
	return s.match( /^[0-9.]$/ )!=null;
};

// structure
var Selector = function( selector ){
	this.selector=selector;
};
Selector.prototype={
	selector:null,
	priority:null,
	computePriority:function(selector){
		
		selector=selector||this.selector;
		
		var nId =0,
			nClass =0,
			nTag =0,
			special=0;
			
		for( var i = 0 ; i < selector.length ; i ++ ){
			var condition = selector[i];
			if( condition.class || condition.attributeQuery )
				nClass++;
			if( condition.id )
				nId++;
			if( condition.tag )
				nTag++;
			if( condition.parent ){
				var prioP = priorite( condition.parent );
				nTag += prioP%10;
				nClass += Math.floor( prioP / 10 )%10;
				nId += Math.floor( prioP / 100 );
			}
			// editor field have priority
			if( condition.class && condition.class.slice(0,9)=="reserved-" )
				special++;
		}
		return special*1000+nId*100 + nClass*10 + nTag;
	},
	getPriority:function(){
		if(this.priority==null)
			this.priority=this.computePriority();
		return this.priority;
	},
	
	/** 
	 * @description test if the dataelement is matched by one of the selector
	 * @param dataelement { AbstractDataElement } a elelment that implement AbstractDataElement methods
	 * @param bubbling { boolean } should be let to null, used for reccursive call when the selector match the parent ( yeah never used so )
	 * @return {boolean}
	 */
	match:function(dataelement,selectors,bubbling){
		var accept = true;
		bubbling = bubbling || false;
		selectors = selectors || this.selector;
		for( var j = 0 ; j < selectors.length ; j ++ ){
				var condition = selectors[j];
				
				// condition on class
				if( condition.class ){
					if( !dataelement.hasClass( condition.class ) )
						accept = false;
					continue;
				}
				
				// condition on id
				if( condition.id ){
					if( !(dataelement.get('name') == condition.id) )
						accept = false;
					continue;
				}
				
				// condition on attribute
				if( condition.attributeQuery ){
					if( !condition.attributeQuery.testFunction( dataelement.getAttribute( condition.attributeQuery.attribute ) )  )
						accept = false;
					continue;
				}
				
				// condition on ancestor
				if( condition.parent ){
					if( !dataelement.getParent() || !isConcernBy( dataelement.getParent() , condition.parent , true ) )
						accept = false;
					continue;
				}
				
				// condition on tag
				if( condition.tag ){
					if( !(dataelement.type == condition.tag) )
						accept = false;
					continue;
				}
		}
		if( accept )
			return true;
		return ( bubbling && dataelement.getParent() && isConcernBy( dataelement.getParent() , selectors , true ) );
	},
	toHTML:function(selector){
		selector = selector || this.selector;
		var c=$("<span>").addClass("css-selector");
		for(var i=0;i<selector.length;i++){
			var d=$("<span>").addClass("css-condition");
			var condition = selector[i];
			if( condition.class )
				d.wrapInner("."+condition.class ).addClass("css-class");
			if( condition.attributeQuery )
				d.wrapInner("["+condition.attribute+"]" ).addClass("css-attribute");		//TODO
			if( condition.id )
				d.wrapInner("#"+condition.id ).addClass("css-id");
			if( condition.tag )
				d.wrapInner(""+condition.tag ).addClass("css-tag");
			if( condition.parent ){
				d.wrapInner(" " ).addClass("css-ancestor");			//TODO
			}
			d.appendTo( c );
		}
		return c;
	},
};

var SetOfSelector = function(selectors){
	if( selectors.length==0 || selectors[0] instanceof Selector )
		this.selectors=selectors;
	else{
		this.selectors=[];
		for( var i=0;i<selectors.length;i++)
			this.selectors.push( new Selector( selectors[i] ) );
	}
};
SetOfSelector.prototype={
	selectors:null,
	
	/** 
	 * @description test if the dataelement is matched by one of the selector
	 * @param dataelement { AbstractDataElement } a elelment that implement AbstractDataElement methods
	* @return {Selector} the matched selector
	 */
	match:function(dataelement){
		var pmax=0;
		var d=null;
		var p;
		for(var i=0;i<this.selectors.length;i++)
			if(this.selectors[i].match(dataelement) && (p=this.selectors[i].getPriority()) > pmax ){
				pmax=p;
				d=this.selectors[i];
			}
		return d;
	},
	toHTML:function(){
		var c=$("<span>").addClass("css-selectors");
		for(var i=0;i<this.selectors.length;i++)
			this.selectors[i].toHTML().appendTo(c);
		return c;
	},
};

var Declaration = Backbone.Model.extend({
	stamp:null,
	selectors:null,
	defaults: function() {
      return {
		properties:{},
      };
    },
	/** 
	 * @description test if the dataelement is matched by one of the selector
	 * @param dataelement { AbstractDataElement } a elelment that implement AbstractDataElement methods
	* @return {Selector} the matched selector
	 */
	match:function(dataelement){
		return this.selectors.match(dataelement);
	},
	initialize:function(attributes,options){
		this.selectors=new SetOfSelector( options.selectors||[] );
		if(!this.getStamp())
			this.stamp=this.generateStamp();
	},
	removeProperty:function(key,options){
		options=options||{};
		this.get('properties')[key]=null;
		delete this.get('properties')[key];
		if( !options.silent ){
			this.trigger('change:properties');
			this.trigger('change');
		}
	},
	setProperty:function(key,value,options){
		options=options||{};
		this.get('properties')[key]=value;
		if( !options.silent ){
			this.trigger('change:properties');
			this.trigger('change');
		}
	},
	destroy:function(){
		this.trigger('destroy');
	},
	generateStamp: function(){
		return 'dec'+(Declaration.count++);
	},
	parse:function(string){
		//declaration
	},
	getStamp:function(){
		return this.stamp;
	},
	toHTML:function(){
		var declaration=$("<span>").addClass("css-declaration");
		this.selectors.toHTML().appendTo(declaration);
		var props=$("<div>").addClass("css-properties");
		var properties=this.get("properties");
		for( var j in properties ){
			var prop=$("<span>").addClass("css-property");
			$("<span>").addClass("css-property-name").wrapInner(j).appendTo(prop);
			$("<span>").addClass("css-property-separator").wrapInner(":").appendTo(prop);
			$("<span>").addClass("css-property-value").wrapInner(properties[j]).appendTo(prop);
			$("<span>").addClass("css-property-end").wrapInner(";").appendTo(prop);
			prop.appendTo( props );
		};
		$("<span>").addClass("css-bracket").wrapInner("{").appendTo(declaration);
		props.appendTo( declaration );
		$("<span>").addClass("css-bracket").wrapInner("}").appendTo(declaration);
		return declaration;
	},
});
Declaration.count=0;

var Sheet = Backbone.Collection.extend({
	model:Declaration,
	initialize:function(models,options){
		options=options||{};
		if(options.mcss)
			this.parse(options.mcss);
	},
	/**
	 * @description know how symbols must be interpret, build the declaration tree starting from the ast  /!\ effet de bord sur raw tree
	 */
	_semanticBuild : function( rawTree ){
		for(var i=0;i<rawTree.length;i++){
			var props = {};
			for(var j=0;j<rawTree[i].props.length;j++){
				var p = rawTree[i].props[j];
				switch(p.name){
					case "strocke" :
						props[ "strocke-width" ] = p.value[0][0].value;
						var e = p.value[0][1];
						props[ "strocke-color" ] = rvb2hex( e.r , e.v , e.b );
						props[ "strocke-opacity" ] = e.a;
					break;
					case "strocke-width" :
						props[ "strocke-width" ] = p.value[0][0].value;
					break;
					case "strocke-opacity" :
						props[ "strocke-opacity" ] = p.value[0][0].value;
					break;
					case "strocke-color" :
						var e = p.value[0][0];
						props[ "strocke-color" ] = rvb2hex( e.r , e.v , e.b );
					break;
					case "fill" :
						var e = p.value[0][0];
						props[ "fill-color" ] = rvb2hex( e.r , e.v , e.b );
						props[ "fill-opacity" ] = e.a;
					break;
					case "fill-color" :
						var e = p.value[0][0];
						props[ "fill-color" ] = rvb2hex( e.r , e.v , e.b );
					break;
					case "fill-opacity" :
						props[ "fill-opacity" ] = p.value[0][0].value;
					break;
					default : 
						//throw ( 'unknown property "' + p.name + '" ' );
					break;
				}	
			}
			rawTree[i].props = props;
		}
		return rawTree;
	},
	parse : function( string ){
		if( !mCSS._parser )
			throw "missing dependancy MapCSSParser.js";
		var p=this._semanticBuild( mCSS._parser.parse( string , "start" ) );
		
		
		var struct=[];
		for(var i=0;i<p.length;i++){
			var d=new Declaration({'properties':p[i].props},{'selectors':p[i].selectors});
			struct.push(d);
		}
		
		this.reset(struct);
	},
	
	/**
	 * @description build the list of declaration that match the dataelement, ordered by priority
	 * @param dataelement { AbstractDataElement } a elelment that implement AbstractDataElement methods
	 */
	computeChain : function( dataelement ){
		var styleChain = [];
		this.each(function(declaration){
			var s;
			if( (s=declaration.match(dataelement)) )
				styleChain.push({'declaration':declaration,'matched':s});
		});
		styleChain = styleChain.sort( function( a , b ){ return(a.matched.getPriority()>b.matched.getPriority())?1:-1; } );
		return styleChain;
	},
	toHTML:function(){
		var c=$("<span>").addClass("css-sheet");
		this.each(function(declaration,e,a,f){
			declaration.toHTML().appendTo(c);
		});
		return c;
	},
	
	syntaxChecker:function(key,value){
		switch(key){
			case 'strocke-color' :
				return isHex(value);
			break;
			case 'strocke-opacity' :
				return isNumber(value);
			break;
			case 'strocke-width' :
				return isNumber(value);
			break;
			case 'fill-color' :
				return isHex(value);
			break;
			case 'fill-opacity' :
				return isNumber(value);
			break;
			default:
				return false;
		}
	},
});


return Sheet;
})();
 
var DataChunk=Backbone.Model.extend({
	stamp:null,
	defaults:function(){
		return {
			name:null,
			intersection:[],
			dependancy:[],
			packages:[],
		};
	},
	initialize:function(attr,options){
		this.stamp=this.generateStamp();
		if(!this.get('name'))
			this.set('name',this.getStamp());
	},
	addPackage:function(datapackage){
		var d=this.get('packages');
		if( !_.find(d,function(dp){ return ( dp.getStamp() == datapackage.getStamp() ); } ) ){
			d.push( datapackage );
			this.trigger('change');
			this.trigger('change:packages');
		}
	},
	removePackage:function(datapackage){
		var d=this.get('packages');
		var index=0;
		if( _.find(d,function(dp,i){index=i;return ( dp.getStamp() == datapackage.getStamp() ); } ) ){
			d.splice(index,1);
			this.trigger('change');
			this.trigger('change:packages');
		}
	},
	addDependancy:function(chunkdata){
		var d=this.get('dependancy');
		if( !_.find(d,function(cd){ return ( cd.getStamp() == chunkdata.getStamp() ); } ) ){
			d.push( chunkdata );
			this.trigger('change');
			this.trigger('change:dependancy');
		}
	},
	removeDependancy:function(chunkData){
		var d=this.get('dependancy');
		var index=0;
		if( _.find(d,function(cd,i){index=i;return ( cd.getStamp() == chunkdata.getStamp() ); } ) ){
			d.splice(index,1);
			this.trigger('change');
			this.trigger('change:dependancy');
		}
	},
	addIntersection:function(chunkdata){
		var d=this.get('intersection');
		if( !_.find(d,function(cd){ return ( cd.getStamp() == chunkdata.getStamp() ); } ) ){
			d.push( chunkdata );
			this.trigger('change');
			this.trigger('change:intersection');
			this.collection.trigger('change:intersection');
		}
	},
	removeIntersection:function(chunkData){
		var d=this.get('intersection');
		var index=0;
		if( _.find(d,function(cd,i){index=i;return ( cd.getStamp() == chunkdata.getStamp() ); } ) ){
			d.splice(index,1);
			this.trigger('change');
			this.trigger('change:intersection');
			this.collection.trigger('change:intersection');
		}
	},
	getStamp:function(){
		return this.stamp;
	},
	generateStamp:function(){
		return 'chk'+(DataChunk.count++);
	},
});
DataChunk.count=0;

var DataChunks=Backbone.Collection.extend({
	model:DataChunk,
	initialize:function(attr,options){
	
	},
});

$(document).ready(function(){

if(!Backbone.$)Backbone.$=window.jQuery;



var ViewLeafletMap= (function(){

var AdaptLeafletMap = Backbone.View.extend({
	lfe:null, //the leaflet element
	
	tagName:'div',
	
	middledata:null,
	mcssdata:null,
	data:null,
	
	stockedHiddenElement:null,
	
	children:null,  //keep track of the children because leaflet doenst do so, and then its difficult t odelete something
	
	listening:false,
	_event:null,
	
	getLeafletAdapt:function(dataelement){
		
	},
	initialize: function(options) {
		options=options||{};
		this.middledata=options.middledata;
		this.mcssdata=options.mcssdata;
		this.data=this.model;
		
		this.stockedHiddenElement=[];
		this.children=[];
		
		this._event=[];
		
		this.initLfe(options);
		
		this.lfe.ctrl=this;
		this.listen(true);
	},
	initLfe :function(options){
		
		var zoomControl			=	options.zoomControl==null	?		true :	options.zoomControl,
			attributionControl	=	options.attributionControl==null	?		true :	options.attributionControl;
		
		
		var w=options.width||500,
			h=options.height||500;
		
		this.$el.children().remove();		//clean the element
		this.$el.attr('width',w).attr('height',h).css({'width':w+'px','height':h+'px'});		//set the dimension
		
		var tmpAppend=false;	
		if(!this.$el.parent()){				//the element given in param to the leaflet constructor must be in the DOW flow
			this.$el.appendTo($('body'));	//if not, add it temporaly
			tmpAppend=true;
		}
		
		this.lfe=new L.Map(this.$el.get(0),{
			zoomControl:zoomControl,
			attributionControl:attributionControl,
		});		//init the lfe
		
		if( tmpAppend )
			this.$el.detach();
	},
	getLfe:function(){
		return this.lfe;
	},
	addOne:function(dataElement){
		var type=dataElement.type;
		var al;
		switch(type){	// set up the adaptLeafletElement according to the type of the dataElement added
			case 'polygon':
				al = new AdaptLeafletPolygon({'data':dataElement , 'middledata':this.middledata , 'mcssdata':this.mcssdata , 'parentlfe' : this.lfe});
			break;
			case 'package':
				al = new AdaptLeafletPackage({'data':dataElement , 'middledata':this.middledata , 'mcssdata':this.mcssdata , 'parentlfe' : this.lfe});
			break;
			default: throw 'unkonw type';
		}
		this.lfe.addLayer(al.lfe);
		this.children.push( al );
		
		for(var i=0;i<this._event.length;i++)
			al.on( this._event[i].types , this._event[i].fn , this._event[i].ctx );
		
		
		if( this.fitToWorld2 )
			this.fitToWorld2();
	},
	addAll:function(){
		this.model.children.each(this.addOne,this);
	},
	removeOne:function(data){
		var index=0;
		var al=_.find( this.children , function( al , i ){
			index=i;
			return al.data.getStamp() == data.getStamp();
		});
		this.lfe.removeLayer(al.lfe);
		this.children.splice(index,1);
	},
	listen:function(enable){
		if(enable==this.listening)
			return;
		this.listening=enable;
		
		if( enable){
			this.listenTo(this.model.children, "add", this.addOne);
			this.listenTo(this.model.children, "remove", this.removeOne);
			this.addAll();
		}else{
			this.stopListening(this.model.children);
		}
	},
	fitToWorld2:function(){
		
		var b=this.computeWorldBound();
		// enlarger
		var marge= Math.max( b.getNorthWest().lat - b.getSouthEast().lat , b.getNorthWest().lng - b.getSouthEast().lng ) * 0.4;
		
		b=new L.LatLngBounds( new L.LatLng(b.getNorthEast().lat+marge , b.getNorthEast().lng+marge) , new L.LatLng(b.getSouthWest().lat-marge , b.getSouthWest().lng-marge) );
		
		this.lfe.setView( b.getNorthWest() , 3.5 , true );
	},
	
	//since i can get the leaflet function work, i write my own
	computeWorldBound:function(){
		if(this.children.length==0)
			return new L.LatLngBounds( new L.LatLng(-0.1,-0.1) , new L.LatLng(0.1,0.1) );
		var bound = this.children[0].computeWorldBound();
		for(var i=1;i<this.children.length;i++)
			bound=bound.extend( this.children[i].computeWorldBound() );
		return bound;
	},
	
	on:function(types, fn, ctx , options ){ 
		this.lfe.on(types, fn, ctx); 
		if(options.propage){
			_.each( this.children , function( e ){ e.on(types, fn, ctx); } );
			this._event.push( {types:types , fn:fn , ctx:ctx} );
		}
		return this;
	},
	off:function(types, fn, ctx , options ){
		this.lfe.off(types, fn, ctx); 
		if(options.propage){
			_.each( this.children , function( e ){ e.off(types, fn, ctx); } );
			this._event=_.filter( this._event , function( e ){return (e.types!=types||e.fn!=e.fn);  } );
		}
		return this;
	},
});

var AdaptLeafletPackage = function(){
	this.initialize.apply(this,arguments);
};
_.extend( AdaptLeafletPackage.prototype,{
	
	//models
	model:null,		//alias
	data:null,
	middledata:null,
	mcssdata:null,
	
	lfe:null,
	parentlfe:null,
	
	hidden:false,
	
	children:null,
	
	_event:null,
	
	initialize:function(option){
		this.data=option.data;
		this.model=this.data		//alias
		this.middledata=option.middledata;
		this.mcssdata=option.mcssdata;
		
		this.parentlfe=option.parentlfe;
		
		this.data.children.on({
			"add"			:	$.proxy(this.addOne,this),
			"remove"		:	$.proxy(this.removeOne,this),
		});
		if( this.middledata )
			this.middledata.on( "change:packageHidden" , $.proxy(this.changeHidden,this) );
		
		this.lfe=new L.LayerGroup();
		this.children=[];
		this._event=[];
		this.addAll();
		this.lfe.ctrl=this;
		
	},
	addOne: AdaptLeafletMap.prototype.addOne,
	addAll: AdaptLeafletMap.prototype.addAll,
	removeOne: AdaptLeafletMap.prototype.removeOne,
	changeHidden:function(){
		if( this.hidden==this.middledata.isPackageHidden( this.data ))
			return;
		this.hidden=!this.hidden;
		if(this.hidden)
			this.parentlfe.removeLayer(this.lfe);
		else
			this.parentlfe.addLayer(this.lfe);
	},
	
	computeWorldBound: AdaptLeafletMap.prototype.computeWorldBound,
	
	
	on:function(types, fn, ctx , options ){ 
		_.each( this.children , function( e ){ e.on(types, fn, ctx); } );
		this._event.push( {types:types , fn:fn , ctx:ctx} );
		return this;
	},
	off:function(types, fn, ctx , options ){
		_.each( this.children , function( e ){ e.off(types, fn, ctx); } );
		this._event=_.filter( this._event , function( e ){return (e.types!=types||e.fn!=e.fn);  } );
		return this;
	},
});

var AdaptLeafletElement = function(){
	this.initialize.apply(this,arguments);
};
_.extend( AdaptLeafletElement.prototype,{
	
	//models
	data:null,
	middledata:null,
	mcssdata:null,
	
	lfe:null,
	
	dirty:false,
	
	selected:false,
	
	stylechain:null,  	//can be hold by the dataelement
	llstyle:null,
	initialize:function(option){
		this.data=option.data;
		this.middledata=option.middledata;
		this.mcssdata=option.mcssdata;
		
		/*
		// not working
		this.data.on({
			"change:structure" 			: $.proxy(this.changeStructure,this),
			"change:attributes" 		: $.proxy(this.changeStyle,this),
			"change:name" 				: $.proxy(this.changeStyle,this),
			"change:classes" 			: $.proxy(this.changeStyle,this),
			"destroy"					: $.proxy(this.remove,this),
		});
		*/
		this.data
		.on("change:structure", 	this.changeStructure,this )
		.on("change:attributes", 	this.changeStyle,this )
		.on("change:name", 			this.changeStyle,this )
		.on("change:classes", 		this.changeStyle,this )
		.on("destroy", 				this.remove,this )
		;
		if( this.middledata )
		this.middledata.on({
			"change:elementSelected"	: $.proxy(this.changeSelected,this),
		});
		
		this.mcssdata.on({
			"change"					: $.proxy(this.changeStyle,this),
		});
	},
	needRedraw:function(){
		this.dirty=true;
		this.lfe.redraw();
	},
	changeStructure:function(){
		
	},
	changeSelected:function(){
		if(this.middledata.isElementSelected(this.data)==this.selected)
			return;
		this.selected=!this.selected;
		this.needRedraw();
		
		if(this.selected)
			this.lfe.setStyle({'fillColor':'#faefe1'});
		else
			this.lfe.setStyle(this.llstyle);
	},
	changeStyle:function(){
		this.stylechain=this.mcssdata.computeChain(this.data);
		var style=this._mergeStyleChain(this.stylechain,this.middledata);
		this.llstyle=this._interpretStyle(style);
		this.lfe.setStyle(this.llstyle);
		if(this.selected)
			this.lfe.setStyle({'fillColor':'#faefe1'});
	},
	remove:function(){
		// ..
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
					JSONstyle.fillColor = value;
					if( !JSONstyle.fillOpacity )
						JSONstyle.fillOpacity = 1;
				break;
				default : 
					throw 'unknow property "'+p+'" ';
			}
		}
		return JSONstyle;
	},
	_mergeStyleChain:function( stylechain , middledata ){
		var style = {};
		var dec;
		for( var i = 0 ; i < stylechain.length ; i ++ ){
			dec = stylechain[i].declaration;
			if( true ){		// condition on middledata ( on the zoom for example )
				var p=dec.get('properties');
				for( var j in p )
					style[ j ] = p[j];
			}
		}
		return style;
	},
	on:function(types, fn, context ){ 
		this.lfe.on(types, fn, context);
		return this;
	},
	off:function(types, fn, context ){
		this.lfe.off(types, fn, context);
		return this;
	},
});

var AdaptLeafletPolygon = function(){
	this.initialize.apply(this,arguments);
};
_.extend( AdaptLeafletPolygon.prototype,AdaptLeafletElement.prototype);
_.extend( AdaptLeafletPolygon.prototype,{
	initialize:function(option){
		AdaptLeafletElement.prototype.initialize.call(this,option);
		
		this.lfe = new L.LayerGroup();
		var r= new L.Polygon( L.cloneLatLngArray(this.data.get('structure')) );
		r.ctrl=this;
		this.lfe.addLayer( r );
		var s=L.cloneLatLngArray(this.data.get('structure'));
		for(var i=0;i<s.length;i++){
			var p=new L.Marker( s[i] );
			p.ctrl=this;
			this.lfe.addLayer( p );
		}
		this.lfe=new L.Polygon( L.cloneLatLngArray(this.data.get('structure')) );
		this.lfe.ctrl=this;
		
		this.changeStyle();
	},
	changeStructure:function(){
		this.lfe.setLatLngs( L.cloneLatLngArray(this.data.get('structure')) );
		this.needRedraw();
	},
	computeWorldBound:function(){
		var s=this.data.get('structure');
		var bound=new L.LatLngBounds( new L.LatLng(s[0].lat,s[0].lng) , new L.LatLng(s[0].lat,s[0].lng) );
		_.each(s,function(p){ bound=bound.extend(p); });
		return bound;
	},
});

/*
noneed
var AdaptLeafletPackage = function(){
	this.initialize(arguments);
};
_.extend( AdaptLeafletPackage.prototype,{
	datapackage:null,
	middledata:null,
	lfe:null,
	initialize:function(option){
		this.datapackage=option.datapackage;
		this.middledata=option.middledata;
		
		this.listenTo(this.model.children, "add", this.addOne);
		this.listenTo(this.model.children, "remove", this.removeOne);
	},
});
*/
/*
var AbstractAdaptLeafletElement = Backbone.View.extend({
	model : null,
	_event : null,
	_eventDirty : false,
	lfe : null,
	initialize:function(){
		this._event=[];
	},
	on : function( s , f ){
		this._event.push( {s:s , f:f} );
		this._eventDirty = true;
		return this;
	},
	off : function( s , f ){
		for( var i=0;i<this._event.length;i++)
			if( this._event[ i ].s == s && ( f == null || this._event[ i ].f == this._event[ i ].f ) ){
				this._event.splice( i , 1 );
				i--;
			}
		this._eventDirty = true;
		return this;
	},
	getStamp : function(){
		return this.model.getStamp();
	},
} );

var AdaptLeafletPolygon = AbstractAdaptLeafletElement.extend({
	lfe:null, //the leaflet element
	initialize: function() {
		
		//this.listenTo(this.model , "remove", this.removeOne);
		
		this.initLfe();
	},
	initLfe :function(){
		var l=new L.LayerGroup();
		var s=L.cloneLatLngArray(this.model.get('struct') );
		for(var i=0;i<s.length;i++)
			l.addLayer( new L.Marker( s[i] ) );
		l.addLayer( new L.Polygon( L.cloneLatLngArray(this.model.get('struct') ) ) , {color: "#ff7800", weight: 1} );
		//this.lfe = new L.Polygon( L.cloneLatLngArray(this.model.get('struct') ) ); 	//init the lfe
		this.lfe=l;
	},
});
*/
return AdaptLeafletMap;

})();


var ViewActionMap=function(){
	this.initialize.apply(this,arguments);
};
_.extend( ViewActionMap.prototype ,{
	lfe:null,
	$el:null,
	viewleafletmap:null,
	
	middledata:null,
	data:null,
	mcssdata:null,
	
	initialize:function(options){
		options=options||{};
		
		this.middledata=options.middledata;
		this.mcssdata=options.mcssdata;
		this.data=options.model;
		
		var vlm=new ViewLeafletMap(options);
		this.lfe=vlm.lfe;
		this.$el=vlm.$el;
		this.viewleafletmap=vlm;
		this.initInteraction();
	},
	listen:function(enable){
		this.viewleafletmap.listen(enable);
	},
	initInteraction:function(){
		
		//elementSelectionnable
		(function( scope , data , middledata , viewleafletmap ){
			
			var acte = function(e){
				var dataelement = e.target.ctrl.data;
				switch( dataelement.type ){
					case 'map' :
						middledata.removeAllSelectedElement();
						return;
					break;
					default:
						if(!e.originalEvent.ctrlKey)
							middledata.removeAllSelectedElement({'silent':true});
						middledata.addSelectedElement(dataelement);
					break;
				}
			};
			var bindAllLayer=function(){
				var i=viewleafletmap.children.length;
				while(i--)
					viewleafletmap.children[i].off('click',acte).on('click',acte);
				
			};
			var elementSelectionnable = function( unable ){	
				if( unable ){			
					viewleafletmap.on( "click" , acte , this , {propage:true} );
				}else{
					viewleafletmap.on( "click" , acte , this , {propage:true} );
				}
				return scope;
			};	
			scope.elementSelectionnable = elementSelectionnable;
			
		})( this , this.data , this.middledata , this.viewleafletmap );
		
	},
	elementSelectionnable:function(){return this;},
});



var ViewPackages = Backbone.View.extend({
  tagName:'div',
  toolmodel:null,
  middledatamap:null,
  
  hiddable:true,
  deletable:true,
  infoable:true,
  
  linkage:null,
  
  initialize: function(options) {
	options=options||{};
	this.hiddable = options.hiddable!=null ? options.hiddable : this.hiddable;
	this.deletable = options.deletable!=null ? options.deletable : this.deletable;
	this.infoable = options.infoable!=null ? options.infoable : this.infoable;
	
	this.linkage=options.linkage;
	
	this.toolmodel=options.toolmodel;
	this.middledatamap=options.middledatamap;
	
	this.listenTo(this.model.children, "add", this.addOne);
    this.$el.html( $('#panel-package-template').html() );
	this.addAll();
  },
  addOne:function(pack){
	var vp =new ViewPackage({
			model:pack,
			toolmodel:this.toolmodel,
			middledatamap:this.middledatamap,
			hiddable:this.hiddable,
			deletable:this.deletable,
			infoable:this.infoable,
		}).$el.appendTo( this.$el.find('table') );
	if(this.linkage)
		vp.linkable(this.linkage);
  },
  addAll: function() {
     this.model.children.each(this.addOne, this);
  },
  render: function() {
      
  },
});

var ViewPackage = Backbone.View.extend({
  tagName:'tr',
  className:'item-package',
  toolmodel:null,
  middledatamap:null,
  
  hiddable:true,
  deletable:true,
  infoable:true,
  
  events: {
    "click [data-contain=visible]"          	  : "toggleVisibility",
    "click [data-contain=trash]"       		      : "trash",
    "click [data-contain=pop]"       		      : "pop",
  },
  initialize: function(options) {
    options=options||{};
	this.hiddable = options.hiddable!=null ? options.hiddable : this.hiddable;
	this.deletable = options.deletable!=null ? options.deletable : this.deletable;
	this.infoable = options.infoable!=null ? options.infoable : this.infoable;
	
	this.toolmodel=options.toolmodel;
    this.middledatamap=options.middledatamap;
	
	this.listenTo(this.model, "change:name", this.render);
    this.listenTo(this.model, "destroy", this.remove);
    this.listenTo(this.middledatamap , "change", this.render);
	
	this.$el.html( $('#item-package-template').html() );
	this.$el.data('datapackage',this.model);
	this.render();
  },
  
  pop:function(){
	var e=this.$el.find('[data-contain=pop]');
	if(!e.data('popover'))
		e.popover({
			'animation' : true,
			'placement' : 'right',
			'html'		: new ViewPackageInfo({model:this.model,container:e}).$el,
		});
	e.popover('show');
  },
  toggleVisibility:function(){
	this.middledatamap.toggleVisibility(this.model);
  },
  trash:function(){
	cmd.execute( cmd.RemovePackage.create(this.model.getParent(),this.model) );
  },
  
  
  remove:function(){
	this.$el.remove();
  },
  visibilityChange:function(){
	if( this.middledatamap.isPackageHidden(this.model) )
		this.$el.find('[data-contain=visible]').removeClass('icon-eye-open').addClass('icon-eye-close');
	else
		this.$el.find('[data-contain=visible]').removeClass('icon-eye-close').addClass('icon-eye-open');
  },
  render: function() {
  
	if(!this.hiddable)this.$el.find('[data-contain=visible]').remove();
	if(!this.deletable)this.$el.find('[data-contain=trash]').remove();
	if(!this.infoable)this.$el.find('[data-contain=pop]').remove();
	
	this.$el.find('[data-contain=name]').html(this.model.get('name'));
	this.visibilityChange();
    return this;
  },

});

var ViewPackageInfo = Backbone.View.extend({
	initialize: function(option) {
		this.$el.html( $('#item-package-info-template').html() );
		this.render();
	 },
});

///////////////////////////////////
////  result displayer

var ViewResults = Backbone.View.extend({
  initialize: function() {
	this.listenTo(this.model.results, "reset", this.render);
	this.addAll();
  },
  addOne:function(result){
	new ViewResult({model:result,resultsmgr:this.model}).$el.appendTo( this.$el.find('#list-result') );
  },
  addAll: function() {
     this.model.results.each(this.addOne, this );
  },
  removeAll:function(){
	this.$el.find('#list-result').children().remove();
  },
  render: function() {
      this.removeAll();
	  this.addAll();
  },
});

var ViewResult = Backbone.View.extend({
  tagName:'div',
  className:'result',
  resultsmgr:null,
  initialize: function(options) {
	options=options||{};
	this.resultsmgr=options.resultsmgr;
    this.$el.html( $('#item-result-template').html() );
	this.render();
  },
  events: {
    "click"                : "select",
  },
  select:function(){
	 this.resultsmgr.set({'selected':this.model});
  },
  remove:function(){
	this.$el.remove();
  },
  render: function() {
	this.$el.find('[data-contain=name]').html(this.model.get('name'));
	this.$el.find('[data-contain=author]').html(this.model.get('author'));
    return this;
  },
});

var ViewResultInfo = Backbone.View.extend({
  tagName:'div',
  mcssdata:null,
  initialize: function(options) {
	this.mcssdata=options.mcssdata||new DatamCSS();
	this.listenTo(this.model, "change:selected", this.render);
	this.render();
  },
  events: {
    "click .btn"                : "add",
  },
  add:function(){
	 this.$el.find('.btn').hide();
	 
	 var datamap=this.model.datamap;
	 var datapackage=this.model.get('selected').datapackage.clone();
	 cmd.execute( cmd.AddPackage.create(datamap,datapackage) );
  },
  render: function() {
	this.$el.empty();
	var r=this.model.get('selected');
	if(!r)
		return null;
	
	
	
	
	this.$el.html( $('#item-result-info-template').html() );
	this.$el.find('[data-contain=name]').html(r.get('name'));
	this.$el.find('[data-contain=author]').html(r.get('author'));
	this.$el.find('[data-contain=description]').html(r.get('description'));
	this.$el.find('img').attr('src','http://www.gravatar.com/avatar/'+r.get('hashMail')+'?s=60&d=mm');
	this.$el.find('.btn').show();
	
	var cm=this.$el.find('[data-contain=map]');
	var map=new ViewLeafletMap({ 
		'model':r.datamap ,
		'mcssdata':this.mcssdata ,
		'width':cm.width() ,
		'height':cm.height(),
		'zoomControl':false,
		'attributionControl':false,
		});
	cm
	.empty()
	.append( map.$el );
	
	window[ 'map'+r.get('name') ]=map;
	
    return this;
  },
});



var ViewAttributes = Backbone.View.extend({
  tagName:'div',
  toolmodel:null,
  middledatamap:null,
  binded:null,
  initialize: function(option) {
  
	this.toolmodel=option.toolmodel;
	this.middledatamap=option.middledatamap;
	
    this.$el.html( $('#panel-attributes-template').html() );
	
	this.listenTo( this.middledatamap , "change:elementSelected" , this.listenSelectedChange  );
	
	this.binded=[];
	this.render();
  },
  listenSelectedChange:function(){
	var i=this.binded.length;
	while(i--)
		this.binded[i].off({
			"change:name"	:	$.proxy(this.render,this),
			"change:attributes"	:	$.proxy(this.render,this),
			"change:classes"	:	$.proxy(this.render,this),
		});
		
	this.binded=[];
	for(var i=0;i<this.middledatamap.elementSelected.length;i++)
		this.binded.push( this.middledatamap.elementSelected[i] );
	
	var i=this.binded.length;
	while(i--)
		this.binded[i].on({
			"change:name"	:	$.proxy(this.render,this),
			"change:attributes"	:	$.proxy(this.render,this),
			"change:classes"	:	$.proxy(this.render,this),
		});
	this.render();
  },
  computeIntersectElement:function(){
	var intersect={
		name:null,
		classes:{},
	};
	if( this.middledatamap.elementSelected.length==0 )
		return intersect;
		
	for( var c in this.middledatamap.elementSelected[0].get('classes') )
		intersect.classes[c]=true;
	intersect.name = this.middledatamap.elementSelected[0].get('name');
	
	for(var i=1;i<this.middledatamap.elementSelected.length;i++){
		for( var c in intersect.classes )
			if( !this.middledatamap.elementSelected[i].get('classes')[c] ){
				intersect.classes[c]=null;
				delete intersect.classes[c];
			}
		intersect.name=null;
	}
	
	return intersect;
  },
  render: function() {
      
	  var o=this.computeIntersectElement();
	  
	  this.$el.find('[data-contain=name]')
	  .empty()
	  .append( $('<span>'+ o.name +'</span>').smartlyEditable({'finish':$.proxy(this.finishName,this) , 'correcter':this.correcter})  ); 
	  
	  var cc = this.$el.find('[data-contain=class]')
	  .empty();
	  
	  for(var c in o.classes )
		cc.append( $('<span>'+ c +'</span>').smartlyEditable({'finish':$.proxy(this.finishClass,this) , 'correcter':this.correcter}) );
	  
	  cc.append( $('<span>&nbsp;&nbsp;&nbsp;+&nbsp;&nbsp;&nbsp;</span>').smartlyEditable({'finish':$.proxy(this.finishNewClass,this) , 'correcter':this.correcter}) );
  },
  correcter:function(v){
	return v.trim().toLowerCase().replace(" ","-");
  },
  finishName:function(element,prevValue){
	cmd.execute( cmd.Set.create( this.middledatamap.elementSelected[0] , 'name' , element.text() ) );
  },
  finishNewClass:function(element,prevValue){
	var cmds=[];
	var className=element.text();
	if( className == "" ){
		this.render();
		return;
	}
	for(var i=0;i<this.middledatamap.elementSelected.length;i++)
		cmds.push( cmd.AddClass.create( this.middledatamap.elementSelected[i] , className ) );
	cmd.execute( cmd.Multi.createWithTab( cmds ) );
  },
  finishClass:function(element,prevValue){
	var cmds=[];
	var className=element.text();
	if( className != "" )
		for(var i=0;i<this.middledatamap.elementSelected.length;i++)
			cmds.push( cmd.ModifyClass.create( this.middledatamap.elementSelected[i] , prevValue , className ) );
	else
		for(var i=0;i<this.middledatamap.elementSelected.length;i++)
			cmds.push( cmd.RemoveClass.create( this.middledatamap.elementSelected[i] , prevValue  ) );
	cmd.execute( cmd.Multi.createWithTab( cmds ) );
  },
});


var ViewPropertyStack = Backbone.View.extend({
  tagName:'div',
  toolmodel:null,
  middledatamap:null,
  initialize: function(option) {
  
	this.toolmodel=option.toolmodel;
	this.middledatamap=option.middledatamap;
	
    this.$el.html( $('#panel-property-stack-template').html() );
	
	this.listenTo( this.model , "add" , this.addOne  );
	this.listenTo( this.model , "reset" , this.addAll  );
	
	this.addAll();
  },
  addOne:function(declaration){
	 this.$el.find('[data-contain=stack]').append( new ViewProperty({ 'model':declaration , 'mcssdata':this.model}).$el );
  },
  addAll:function() {
     this.model.each(this.addOne,this);
  },
});

ViewProperty = Backbone.View.extend({
  tagName:'div',
  toolmodel:null,
  middledatamap:null,
  binded:null,
  _missSpell:null,
  initialize: function(options) {
	options=options||{};
	this.mcssdata=options.mcssdata;
	this.toolmodel=options.toolmodel;
	this.middledatamap=options.middledatamap;
	
	this.listenTo( this.model , "change" , this.render  );
	this.listenTo( this.model , 'destroy' , this.remove );
	
	this.listenTo( this.model , 'change:properties' , this.render );
	
	this._missSpell=[];
	this.render();
  },
  remove:function(){
	this.$el.remove();
  },
  render:function(){
	
	this.$el
	.empty()
	.append( this.model.toHTML() );		//append the property from the data
	
	for(var i=0;i<this._missSpell.length;i++){		//append the invalid properties, they are waiting for correction
		var prop=$("<span>").addClass("css-property").addClass('invalid');
		$("<span>").addClass("css-property-name").wrapInner(this._missSpell[i].name).appendTo(prop);
		$("<span>").addClass("css-property-separator").wrapInner(":").appendTo(prop);
		$("<span>").addClass("css-property-value").wrapInner(this._missSpell[i].value).appendTo(prop);
		$("<span>").addClass("css-property-end").wrapInner(";").appendTo(prop);
		this.$el.find('.css-properties').append( prop );
	}
	
	
	
	this.$el.find('.css-property-value').smartlyEditable({'finish':$.proxy(this.finishValue,this) });
	this.$el.find('.css-property-name').smartlyEditable({'finish':$.proxy(this.finishName,this) })
	
	
	var nameSpan=$("<span>&nbsp;&nbsp;&nbsp;+&nbsp;&nbsp;&nbsp;</span>").addClass("css-property-name")
	var prop=$("<span>")			//append the '+' property, form add
	.addClass("css-property")
	.append(nameSpan)
	.appendTo( this.$el.find('.css-properties') );
	
	nameSpan.smartlyEditable({'finish':$.proxy(this.finishNewName,this) });
	
	
	return this;
  },
  finishValue:function(element,prevValue){
	var value=element.text();
	var name=element.parents('.css-property').find('.css-property-name').text();
	
	if( element.parents('.css-property').hasClass('invalid') )
		this._missSpell=_.filter( this._missSpell , function(o){ return (o.name!=name||o.value!=prevValue); } );
	
	if( this.mcssdata.syntaxChecker(name,value) )
		cmd.execute( cmd.SetProperty.create( this.model , name , value ) );
	else{
		element.parents('.css-property').addClass('invalid');
		this._missSpell.push({name:name, value:value});
		cmd.execute( cmd.RemoveProperty.create( this.model , name ) );
	}
  },
  finishName:function(element,prevValue){
	var name=element.text();
	var value=element.parents('.css-property').find('.css-property-value').text();
	
	if( element.parents('.css-property').hasClass('invalid') )
		this._missSpell=_.filter( this._missSpell , function(o){ return (o.name!=prevValue||o.value!=value); } );
	
	if(name=="")
		cmd.execute( cmd.RemoveProperty.create( this.model , prevValue ) );
	else{
		if( this.mcssdata.syntaxChecker(name,value) )
			cmd.execute( cmd.SetProperty.create( this.model , name , value ) );
		else{
			element.parents('.css-property').addClass('invalid');
			this._missSpell.push({name:name, value:value});
			cmd.execute( cmd.RemoveProperty.create( this.model , prevValue ) );
		}
	}
  },
  finishNewName:function(element,prevValue){
	var name=element.text();
	var valSpan=$("<span>").addClass("css-property-value");
	
	element.parents('.css-property')
	.append( $("<span>").addClass("css-property-separator").wrapInner(":") )
	.append( valSpan )
	.append( $("<span>").addClass("css-property-end").wrapInner(";") );
	
	valSpan.smartlyEditable({'finish':$.proxy(this.finishValue,this) })
	.click();
  },
});



var ViewChunks = Backbone.View.extend({
  tagName:'div',
  viewpackage:null,
  events:{
	'click .btn[data-contain="addChunk"]'				:	"createChunk",
  
  },
  initialize: function(options) {
    options=options||{};
	this.viewpackage=options.viewpackage;
	
    this.$el.html( $('#panel-chunk-template').html() );
	
	this.listenTo( this.model , "add" , this.addOne  );
	this.listenTo( this.model , "reset" , this.addAll  );
	
	this.listenTo( this.model , "change:intersection" , this.render );
	
	this.addAll();
	this.render();
  },
  createChunk:function(){
	this.model.add( new DataChunk({}) );
  },
  addOne:function(datachunk){
	 this.$el.find('[data-contain=list-chunk]').append( new ViewChunk({ 'model':datachunk }).$el );
	 this.render();
  },
  addAll:function() {
     this.model.each(this.addOne,this);
  },
  render:function() {
	
	var canvas=this.$el.find('canvas');
	var pa=canvas.parent();
	var w=pa.width(),
		h=pa.height();
	
	canvas
	.css({ 'width':w+'px' , 'height':h+'px'}).attr('width',w).attr('height',h);
	
	var ctx=canvas[0].getContext('2d');
	ctx.clearRect(0,0,w,h);
	ctx.lineWidth=2;
	
	
	var line=[];
	this.model.each(function(ch1){
		_.each(ch1.get('intersection'),function(ch2){
			if(ch1.getStamp()<ch2.getStamp())
				line.push({a:ch1,b:ch2,type:'intersection'});
		},this)
	},this);
	
	var pas=12;
	var pasy=6;
	for(var i=0;i<line.length;i++){
		var ela=this.$el.find('#'+line[i].a.getStamp());
		var elb=this.$el.find('#'+line[i].b.getStamp());
		
		var ax=ela.offset().left-pa.offset().left+ela.outerWidth(),
			ay=ela.offset().top -pa.offset().top +ela.outerHeight()/2;
			
		var bx=elb.offset().left-pa.offset().left+elb.outerWidth(),
			by=elb.offset().top -pa.offset().top +elb.outerHeight()/2;
		
		if(line[i].type=='intersection')
			ctx.strokeStyle="#486ade";
		
		ctx.beginPath()
		ctx.moveTo( ax , ay+(-line.length/2+i)*pasy );
		ctx.lineTo( (ax+(i+1)*pas) , ay+(-line.length/2+i)*pasy );
		ctx.lineTo( (ax+(i+1)*pas) , by+(-line.length/2+i)*pasy );
		ctx.lineTo( ax , by+(-line.length/2+i)*pasy );
		ctx.stroke();
		
	}
	/*
	var c=svg.parent();
	var s=c[0].innerHTML;
	svg.remove();
	c[0].innerHTML=s;
	*/
	return this;
  },
});

var ViewChunk = Backbone.View.extend({
  tagName:'div',
  className:'chunk',
  initialize: function(options) {
    options=options||{};
	
	this.model.on({
		'change:name'		:	$.proxy(this.render,this),
		'change:packages'	:	$.proxy(this.render,this),
		'destroy'			:	$.proxy(this.remove,this),
	});
	
    this.$el.html( $('#item-chunk-template').html() );
	
	this.$el.find('a[data-contain=tic-intersection]').linkable({'selector':'.chunk:not(#'+ this.model.getStamp() +')' , 'finish':this.finishLinkIntersection });
	this.$el.attr('id',this.model.getStamp());
	
	this.$el.data('datachunk',this.model);
	
	this.render();
  },
  remove:function() {
	this.$el.remove();
  },
  render:function() {
	
	var cl=this.$el.find('[data-contain=list-package]');
	cl.children().remove();
	
	_.each( this.model.get('packages') , function(datapackage){
			cl.append( new ViewPackageChunk( {'model':datapackage , 'datachunk':this.model } ).$el );
	},this)
	
	this.$el.find('[data-contain=name-chunk]')
	.html( this.model.get('name') )
	.smartlyEditable({'finish':$.proxy(this.finishName,this) } );
	
	return this;
  },
  finishName:function(el,prevValue){
	var name=el.text().trim();
	if(name=="")
		this.render();
	else
		cmd.execute( cmd.Set.create( this.model , 'name' , name ) );
  },
  finishLinkIntersection:function(el,elchunk2){
	var datachunk1=el.parents('.chunk').data('datachunk');
	var datachunk2=elchunk2.data('datachunk');
	
	cmd.execute( cmd.AddIntersection.create( datachunk1 , datachunk2 ) );
	cmd.execute( cmd.AddIntersection.create( datachunk2 , datachunk1 ) );
	
  },
 });
 
var ViewPackageChunk = Backbone.View.extend({
  tagName:'tr',
  events: {
    "click [data-contain=trash-package]"       		      : "trash",
  },
  initialize: function(options) {
	options=options||{};
	this.datachunk=options.datachunk;
	
	this.model.on({
		'change:name'	:	$.proxy(this.render,this),
		'destroy'		:	$.proxy(this.remove,this),
	});
	
    this.$el.html( $('#item-package-chunk-template').html() );
	this.render();
  },
  trash:function() {
	cmd.execute( cmd.RemovePackageToChunk.create( this.datachunk , this.model ) );
  },
  remove:function() {
	this.$el.remove();
  },
  render:function() {
	this.$el.find('[data-contain=name-package]').html( this.model.get('name') );
	return this;
  },
});




window.ViewResults = ViewResults;
window.ViewPackages = ViewPackages;
window.ViewResultInfo = ViewResultInfo;
window.ViewLeafletMap = ViewLeafletMap;
window.ViewActionMap = ViewActionMap;
window.ViewAttributes = ViewAttributes;
window.ViewPropertyStack = ViewPropertyStack;
window.ViewChunks = ViewChunks;
/*
map=new AdaptLeafletMap({'model':middle});
map.$el.appendTo( $('body') )
.css({'display':'inline-block'});

map2=new AdaptLeafletMap({'model':new MiddleDataPackage({'model':pack})});
map2.$el.appendTo( $('body') )
.css({'display':'inline-block'});

/*
var w=500,
	h=500;
var el=$('<div>')
.attr('width',w).attr('height',h).css({'width':w+'px','height':h+'px'});
new L.Map(el.get(0));
el.appendTo($('body'));
*/

});


















