(function($){
	
	var Linkable = function (element, options) {
		this.$element=$(element);
		this.$container=options.container||$('body');
		this.finish=options.finish||this.finish;
		this.target=options.target||$();
		this.selector=options.selector||null;
		this.listen();
	};
	Linkable.prototype={
		$element:null,
		target:null,
		
		ontarget:null,
		
		listen:function(){
			
			this.$element
			.attr( 'draggable' , 'true' )
			.on( 'dragstart' , $.proxy(this.dragstart,this) );
			
			
			
			return this;
		},
		dragstart:function(e){
			if( this.selector )
				this.target=this.$container.find(this.selector);
			

			this.target
			.on('dragover' , this.dragover)
			.on('dragenter',$.proxy(this.overTarget,this))
			.on('dragleave',$.proxy(this.outTarget,this))
			.on('drop',$.proxy(this.drop,this))
			;
		},
		dragover:function(e){
			if (e.preventDefault) e.preventDefault(); // allows us to drop
			//e.dataTransfer.dropEffect = 'copy';
			return false;
		},
		drop:function(e){
			this.target
			.off('dragover' , this.dragover)
			.off('dragenter',$.proxy(this.overTarget,this))
			.off('dragleave',$.proxy(this.outTarget,this))
			.off('drop',$.proxy(this.drop,this))
			
			if( this.ontarget )
				this.ontarget.removeClass('drag-hover');
			this.finish(this.$element,this.ontarget);
		},
		
		overTarget:function(e){
			if(this.ontarget)
				this.ontarget.removeClass('drag-hover');
			this.ontarget=$(e.target)
			.addClass('drag-hover');
		},
		outTarget:function(e){
			$(e.target).removeClass('drag-hover');
			if(this.ontarget==$(e.target))
				this.ontarget=null;
		},
		
		finish:function(){
		
		},
	};
	/*
	 *	finish
	 *	target
	 *  selector
	 *	container
	 */
	$.fn.linkable=function( options ){
		return this.each(function(){
			var el=$(this);
			el.data('Linkable', new Linkable(el,options||{}));
		});
	};
})(window.jQuery);