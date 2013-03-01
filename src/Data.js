
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
			return _.find( this.elementSelected ,function(e){return dataelement.getStamp()==e.getStamp();}) == null;
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

///////////////////////
// css wraper  //////////
///////////////////////
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
	match:function(dataelement,selector,bubbling){
		var accept = true;
		bubbling = bubbling || false;
		selector = selector || this.selector;
		return true;
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
					if( !(dataelement.id == condition.id) )
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
		return ( bubbling && dataelement.getParent() && isConcernBy( dataelement.getParent() , selector , true ) );
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
});


return Sheet;
})();
 

$(document).ready(function(){

if(!Backbone.$)Backbone.$=window.jQuery;



var ViewLeafletMap= (function(){


var AdaptLeafletMap = Backbone.View.extend({
	lfe:null, //the leaflet element
	
	tagName:'div',
	
	middledata:null,
	mcssdata:null,
	
	
	stockedHiddenElement:null,
	
	children:null,
	
	//children:null,		//keep track of the children because leaflet doenst do so, and then its difficult t odelete something
	
	getLeafletAdapt:function(dataelement){
		
	},
	initialize: function(options) {
		options=options||{};
		this.middledata=options.middledata;
		this.mcssdata=options.mcssdata;
		
		this.listenTo(this.model.children, "add", this.addOne);
		this.listenTo(this.model.children, "remove", this.removeOne);
		
		
		this.stockedHiddenElement=[];
		this.children=[];
		
		this.initLfe(options);
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
			
		this.addAll();
		/*
		this.lfe.addLayer( new L.Polygon( [new L.LatLng(45,45),new L.LatLng(45,-45),new L.LatLng(-45,-45),new L.LatLng(-45,45)] ) );
		
		this.lfe.addLayer( new L.Rectangle( new L.LatLngBounds( new L.LatLng(-10,-10) , new L.LatLng(10,10) ) ) );
		*/
		this.lfe.fitWorld();
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
	
	fitToWorld2:function(){
		
		var b=this.computeWorldBound();
		// enlarger
		var marge= Math.max( b.getNorthWest().lat - b.getSouthEast().lat , b.getNorthWest().lng - b.getSouthEast().lng ) * 0.4;
		
		b=new L.LatLngBounds( new L.LatLng(b.getNorthEast().lat+marge , b.getNorthEast().lng+marge) , new L.LatLng(b.getSouthWest().lat-marge , b.getSouthWest().lng-marge) );
		
		this.lfe.setView( b.getNorthWest() , 3.5 );
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
		this.addAll();
		
		
		
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
	},
	changeStyle:function(){
		this.stylechain=this.mcssdata.computeChain(this.data);
		var style=this._mergeStyleChain(this.stylechain,this.middledata);
		var llstyle=this._interpretStyle(style);
		this.lfe.setStyle(llstyle);
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
			if( true ){		// condition on middledata ( on the zoom for example
				var p=dec.get('properties');
				for( var j in p )
					style[ j ] = p[j];
			}
		}
		return style;
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
		this.lfe.addLayer( new L.Polygon( L.cloneLatLngArray(this.data.get('structure')) ) );
		var s=L.cloneLatLngArray(this.data.get('structure'));
		for(var i=0;i<s.length;i++){
			var p=new L.Marker( s[i] );
			this.lfe.addLayer( p );
		}
		this.lfe=new L.Polygon( L.cloneLatLngArray(this.data.get('structure')) );
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


var ViewPackages = Backbone.View.extend({
  tagName:'div',
  toolmodel:null,
  middledatamap:null,
  initialize: function(option) {
  
	this.toolmodel=option.toolmodel;
	this.middledatamap=option.middledatamap;
	
	this.listenTo(this.model.children, "add", this.addOne);
    this.$el.html( $('#panel-package-template').html() );
	this.addAll();
  },
  addOne:function(pack){
	new ViewPackage({model:pack,toolmodel:this.toolmodel,middledatamap:this.middledatamap}).$el.appendTo( this.$el.find('table') );
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
  
  events: {
    "click [data-contain=visible]"          	  : "toggleVisibility",
    "click [data-contain=trash]"       		      : "trash",
    "click [data-contain=pop]"       		      : "pop",
  },
  initialize: function(option) {
    this.toolmodel=option.toolmodel;
    this.middledatamap=option.middledatamap;
	
	this.listenTo(this.model, "change:name", this.render);
    this.listenTo(this.model, "destroy", this.remove);
    this.listenTo(this.middledatamap , "change", this.render);
	
	this.$el.html( $('#item-package-template').html() );
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


window.ViewResults = ViewResults;
window.ViewPackages = ViewPackages;
window.ViewResultInfo = ViewResultInfo;
window.ViewLeafletMap = ViewLeafletMap;


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


















