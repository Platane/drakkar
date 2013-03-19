

var Player=function(element,datamap,mcss,presentation){
	this.$el=element
	this.initialize(element,datamap,mcss,presentation);
};
Player.prototype={
	
	$el:null,
	datamcss:null,
	datamap:null,
	presentation:null,
	
	initialize:function(element,datamap,mcss,presentation){
		this.$el=element;
		
		this.datamap=new DataMap( datamap );
		this.datamcss=new DatamCSS({'mcss':mcss});
		
		
	},
	
	
	
};


$(document).ready(function(){

if(!Backbone.$)Backbone.$=window.jQuery;

var ViewChunks = Backbone.View.extend({
  tagName:'div',
  viewpackage:null,
  events:{
	'click .btn[data-contain=addChunk]'				:	"createChunk",
	'click a[data-contain=trash-intersection]'		:	"trashIntersection",
  },
  initialize: function(options) {
    options=options||{};
	this.middledata=options.middledata;
	
    this.$el.html( $('#panel-chunk-template').html() );
	
	this.listenTo( this.model , "add" , this.addOne  );
	this.listenTo( this.model , "remove" , this.render  );
	this.listenTo( this.model , "reset" , this.addAll  );
	
	this.listenTo( this.model , "change:intersection" , this.render );
	
	this.addAll();
	this.render();
  },
  trashIntersection:function(e){
	var datachunk1=$(e.target).data('ch1');
	var datachunk2=$(e.target).data('ch2');
	
	cmd.execute( cmd.RemoveIntersection.create( datachunk1 , datachunk2 ) );
	cmd.execute( cmd.RemoveIntersection.create( datachunk2 , datachunk1 ) );
	
  },
  createChunk:function(){
	this.model.add( new DataChunk({}) );
  },
  addOne:function(datachunk){
	 this.$el.find('[data-contain=list-chunk]').append( new ViewChunk({ 'model':datachunk , 'middledata':this.middledata }).$el );
	 this.render();
  },
  addAll:function() {
     this.model.each(this.addOne,this);
  },
  render:function() {
	
	var canvas=this.$el.find('canvas');
	var pa=canvas.parent();
	var w=this.$el.width(),
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
	
	pa.find("[data-contain=trash-intersection]").remove();
	
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
			ctx.strokeStyle="#888888";
		
		var dx=(i+1)*pas;
		var dy=(-line.length/2+i)*pasy;
		
		ctx.beginPath()
		ctx.moveTo( ax    , ay+dy );
		ctx.lineTo( ax+dx , ay+dy );
		ctx.lineTo( ax+dx , by+dy );
		ctx.lineTo( ax    , by+dy );
		ctx.stroke();
		
		$('<a class="icon-fire" data-contain="trash-intersection" ></a>')
		.css({'position':'absolute' , 'top':((ay+by)/2+dy-5)+'px' , 'left': (ax+dx-5)+'px' })
		.appendTo(pa)
		.data('ch1',line[i].a)
		.data('ch2',line[i].b)
		;
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
  events:{
	'change input[type=checkbox]'				:	"toggleVisibility",
	'click a[data-contain=trash-chunk]'			:	"trash",
  },
  
  toggleVisibility:function(e){
	var visible=$(e.target).is(":checked");
	
	if(visible){
		//toggle all the packages from chunk that are in conflict ( intersection ) to hidden
		_.each( this.model.get('intersection') , function(datachunk){
			_.each( datachunk.get('packages') , function(datapackage){
				this.middledata.hidePackage(datapackage);
			},this);
			//is bad :( but im too tired to make a model of this
			var cb=this.$el.parent().find('.chunk#'+ datachunk.getStamp() ).find('input[type=checkbox]');
			if(cb.is(':checked'))
				cb.click();
		},this);
	}
	//toggle all the packages to visible
	_.each( this.model.get('packages') , function(datapackage){
		if(visible)
			this.middledata.showPackage(datapackage);
		else
			this.middledata.hidePackage(datapackage);
	},this);
  },
  trash:function(e){
	var t=[];
	_.each( this.model.get('intersection') , function(datachunk){
			t.push( cmd.AddOrDelete.create( datachunk , 'removeIntersection' , 'addIntersection' , this.model ) );
	},this);
	t.push( cmd.AddOrDelete.create(this.model.collection,'remove','add',this.model) );
	cmd.execute( cmd.Multi.createWithTab(t) );
  },
  
  initialize: function(options) {
    options=options||{};
	this.middledata=options.middledata;
	
	this.model.on({
		'change:name'		:	$.proxy(this.render,this),
		'change:packages'	:	$.proxy(this.render,this),
		'destroy'			:	$.proxy(this.remove,this),
		'remove'			:	$.proxy(this.remove,this),
	});
	
    this.$el.html( $('#item-chunk-template').html() );
	
	this.$el.find('a[data-contain=tic-intersection]').linkable({'selector':'.chunk:not(#'+ this.model.getStamp() +')' , 'finish':this.finishLinkIntersection });
	this.$el.attr('id',this.model.getStamp());
	
	this.$el.data('datachunk',this.model);
	
	this.toggleVisibility( this.$el.find('input[type=checkbox]') );
	
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


window.ViewResults = ViewResults;
window.ViewPackages = ViewPackages;
window.ViewResultInfo = ViewResultInfo;
window.ViewLeafletMap = ViewLeafletMap;
window.ViewActionMap = ViewActionMap;
window.ViewAttributes = ViewAttributes;
window.ViewPropertyStack = ViewPropertyStack;
window.ViewChunks = ViewChunks;
window.ViewDataTools = ViewDataTools;
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


















