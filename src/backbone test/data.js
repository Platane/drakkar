



var AbstractDataElement = Backbone.Model.extend({
    stamp:null,
	type:'abstract',
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
    addClass: function(c) {
		var cs=this.get("classes");
		cs[c]=true;
		this.set({"classes":cs});
    },
	removeClass: function(c) {
		var cs=this.get("classes");
		cs[c]=null;
		delete cs[c];
		this.set({"classes":cs});
    },
});
AbstractDataElement.count=0;

var DataMap = AbstractDataElement.extend({
    children:null,
	
	defaults: _.extend({
      
    }, AbstractDataElement.prototype.defaults() ),
	
	initialize: function() {
		Package.__super__.initialize.call(this);
		this.children=new Backbone.Collection();
		this.children.model=DataPackage;
		this.type='map';
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
		if(el instanceof AbstractDataElement )
			this.children.add(el);
		else
			switch(el.type){
				case "polygon":
					this.children.add(new DataPolygon(el));
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
});

var DataPolygon = AbstractDataElement.extend({
	defaults: _.extend(
	{
      struct:[],
    }, 
	AbstractDataElement.prototype.defaults()
	),	
	initialize: function() {
		DataPolygon.__super__.initialize.call(this);
		this.type='polygon';
	},
});



MiddleData = Backbone.Model.extend({
	model:null,
	children:null,
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
		switch(type){	//link the event proxy
			case 'package':
				
				this.listenTo(this.model,'change',this.relayChange);	//simply relay the trigger function
				this.listenTo(this.model.children,'add',this.relayAdd);	
				this.listenTo(this.model.children,'remove',this.relayRemove);	
				
				this.children=new Backbone.Collection();
				this.children.model=MiddleData;
				
				this.model.children.each(this.relayAdd,this);
					
			break;
		};
		
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
			if( this.defaults.prototype[key] != null )
				Backbone.Model.prototype.set.call(this,o);
			else
				this.model.set(o);
		},this);
	},
	get:function(a){
		var r=Backbone.Model.prototype.get.call(this,a);
		return r || this.model.get(a);
	},
	relayChange:function(e){
		this.trigger('change',this);
	},
	relayAdd:function(a){
		this.children.add( new MiddleData( {'model':a} ) );
	},
	relayRemove:function(a){
		el=this.children.find( function(b){return b.getStamp()==a.getStamp();});
		this.children.remove( el );
	},
});



var pack=new DataPackage();
pack.addElement( new DataPolygon({'name':'maki'}) );
pack.addElement( new DataPolygon({'name':'makal'}) );



window.onload=function(){

if(!Backbone.$)Backbone.$=window.jQuery;

var PackageMgr = Backbone.View.extend({
 
initialize: function() {
	this.model=this.model.children;
	this.listenTo(this.model, "add", this.addOne);
    this.el=$( $('#panel-pack-template').html());
	this.addAll();
  },
  
  addOne:function(pack){
	new PackageItem({model:pack}).el.appendTo( this.el.find('table') );
  },
  
  addAll: function() {
     this.model.each(this.addOne, this);
  },
  
  render: function() {
      
  },
  
});

var PackageItem = Backbone.View.extend({
	
  initialize: function() {
    this.listenTo(this.model, "change:name", this.render);
    this.listenTo(this.model, "destroy", this.remove);
	this.el=$( $('#item-pack-template').html());
	this.render();
  },

  remove:function(){
	this.el.remove();
  },

  render: function() {
	this.el.find('.name').html(this.model.get('name'));
   return this;
  },

});




var AdaptLeafletMap = Backbone.View.extend({
	lfe:null, //the leaflet element
	
	tagName:'div',
	
	initialize: function() {
		this.listenTo(this.model.children, "add", this.addOne);
		this.listenTo(this.model.children, "remove", this.removeOne);
		
		this.initLfe();
	},
	initLfe :function(w,h){
		var w=w||500,
			h=h||500;
		
		this.el.children().remove();		//clean the element
		this.el.attr('width',w).attr('height',h).css({'width':w+'px','height':h+'px'});		//set the dimension
		
		var tmpAppend=false;	
		if(!this.el.parent()){				//the element given in param to the leaflet constructor must be in the DOW flow
			this.el.appendTo($('body'));	//if not, add it temporaly
			tmpAppend=true;
		}
		
		//this.lfe=new L.Map(this.el.get(0));		//int the lfe
		
		if( tmpAppend )
			this.el.detach();
	},
	addOne:function(dataElement){
		var type=dataElement.get('type');
		var adaptLeafletElement;
		switch(type){	// set up the adaptLeafletElement according to the type of the dataElement added
			case 'polygon':
				adaptLeafletElement = new AdaptLeafletPolygon({'model':dataElement});
			break;
			default: throw 'unkonw type';
		}
		
		this.lfe.addLayer( adaptLeafletElement.lfe );	// add the element to mine leaflet element
	}
});

var AdaptLeafletPolygon = Backbone.View.extend({
	lfe:null, //the leaflet element
});


window.PackageMgr = PackageMgr;

}







