
// Data
var frameNavigator = new (Backbone.Model.extend({
	defaults: function() {
      return {
        frame:"header",
      };
    },
	setFrame:function(f) {
		this.set({'frame':f});
		this.trigger('goto');
	},
	instanciate:function(){},
}))();

var Scrollor = function( model , flow ){
	this.model=model;
	this.flow=flow;
	this.model.on( 'goto' , this.changeFrame ,this );
};
Scrollor.prototype={
	power:0.34,		//% of window height
	wait:670,		//ms
	model:null,
	flow:null,
	timeout:null,
	changeFrame:function(){
		var id='frame-'+this.model.get('frame');
		var frame=this.flow.find('#'+id );
		$("body").scrollTo( frame , 100 , {over:-0.04} );
	},
	scheduleToCheckScroll:function(){
		window.clearTimeout(this.timeout);
		this.timeout=window.setTimeout($.proxy(function(){
			if(this.down)
				$("body").one('mouseup.magnetism.release mouseenter.magnetism.release',$.proxy(this.checkScroll,this));
			else
				this.checkScroll();
		},this),this.wait);
	},
	checkScroll:function(){
		if( this.timeout )
			window.clearTimeout(this.timeout);
		var power = this.power;
		$(".frame").each(function(){
			var f=$(this);
			if( f.attr('id') == "frame-header" || f.attr('id') == "frame-footer" )
				return;
			if( Math.abs( f.position().top + window.innerHeight*0.04 - window.scrollY ) < window.innerHeight * power ){
				var frame=f.attr('id').substr(6);
				frameNavigator.setFrame(frame);
			}
		});
	},
	mousedown:function(e){
		this.down=true;
	},
	mouseup:function(e){
		this.down=false;
	},
	unableMagnetism:function(unable){
		if( unable ){
			$(document).off('scroll.magnetism').on('scroll.magnetism',$.proxy(this.scheduleToCheckScroll,this) )
			.off('mousedown.magnetism').on('mousedown.magnetism',$.proxy(this.mousedown,this) )
			.off('mouseenter.magnetism mouseup.magnetism').on('mouseenter.magnetism mouseup.magnetism',$.proxy(this.mouseup,this) );
			this.checkScroll();
		}else
			$(document).off('scroll.magnetism')
			.off('mousedown.magnetism')
			.off('mouseenter.magnetism mouseup.magnetism');
	},
}

$(document).ready(function(){
	var sc = new Scrollor( frameNavigator , $('#flow') );
	
	var nav=$('nav#frame-navigator');
	nav.find('[data-action=goto-search]').on('click',function(){ frameNavigator.setFrame('search'); } );
	nav.find('[data-action=goto-data]').on('click',function(){ frameNavigator.setFrame('data'); } );
	nav.find('[data-action=goto-presentation]').on('click',function(){ frameNavigator.setFrame('presentation'); } );
	nav.find('[data-action=goto-decoration]').on('click',function(){ frameNavigator.setFrame('decoration'); } );
	
	nav.find('[type=checkbox]').on('change',function(e){ sc.unableMagnetism( $(e.target).is(':checked') ); } )
	.change();
	
	
});
