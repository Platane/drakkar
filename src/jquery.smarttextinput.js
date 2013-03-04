(function($){
	
	var SmartEdit = function (element, options) {
		this.$element = $(element)
		this.finish=options.finish||this.finish;
		this.correcter=options.correcter||this.correcter;
		this.completer=options.completer||this.completer;
		this.$input=$('<input type="text">');
		this.$element=element;
		this.listen();
	}
	
	SmartEdit.prototype={
		$element:null,
		$input:null,
		prevDisplayMode:null,
		prevValue:null,
		listen:function(){
			this.$element.bind('click',$.proxy(this.transform, this));
		},
		transform:function(){
				
				this.$input
				.removeClass()
				.empty().val( this.$element.text() )
				.attr('style' , this.$element.attr('style'))
				.attr('class' , this.$element.attr('class'))
				.unbind()
				.bind('focusout',$.proxy(function(e){
					if(!this.$input.data('typeahead').shown)
						this.transformBack();
					else
						this.$input.focus().select();
				},this))
				.bind('keydown',$.proxy(function(e){
							if(event.which==13)
								if(!this.$input.data('typeahead').shown)
									this.transformBack();
				},this))
				.insertBefore(this.$element)
				.typeahead({
					source:this.completer,
					minLength:2,
					updater:function(v){
						this.$element.val(v);
						var sm=this.$element.data('SmartEdit');
						sm.adjustSize.call( sm );
						sm.transformBack();
						return v;
					}
				})
				.data('SmartEdit',this)
				.focus();
				
				this.$input.get(0).oninput = $.proxy(this.adjustSize,this);
				
				
				this.prevDisplayMode = this.$element.css('display');
				try{
					this.maxWidth = parseInt(this.$element.css('max-width'));
					if(this.maxWidth+''=="NaN")
						this.maxWidth=null;
				}catch(e){
					this.maxWidth=null;
				}
				this.$element.css({'display':'none'});
				this.prevValue=this.$element.text();
				this.adjustSize();
		},
		adjustSize:function(){
				this.$element.empty().wrapInner(this.$input.val()+'&nbsp;&nbsp;');
				var width=this.$element.width();
				if(this.maxWidth)
					width=Math.min(this.maxWidth,width);
				this.$input.width(width);
		},
		transformBack:function(){
				
				this.$input.data('typeahead').hide();
				
				this.$element
				.empty().wrapInner( this.correcter(this.$input.val()) )
				.css({'display':this.prevDisplayMode});
				
				this.$input
				.unbind()
				.remove();
				
				this.finish(this.$element,this.prevValue);
		},
		correcter:function(v){
			return v;
		},
		finish:function(){
		
		},
		completer:[],
	};
	/*
	 *	finish
	 *	correcter
	 *	completer
	 */
	$.fn.smartlyEditable=function( options ){
		return this.each(function(){
			var el=$(this);
			el.data('SmartEdit', new SmartEdit(el,options||{}));
		});
	};
})(window.jQuery);