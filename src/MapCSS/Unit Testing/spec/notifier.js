describe("Notifier", function() {
	var not = null;
	var l1 = null,
		l2 = null,
		l3 = null,
		l4 = null,
		l5 = null;
	beforeEach( function(){
		not = new AbstractNotifier();
		
		l1 = { update:function(){ return "l1"; } };
		l2 = { update:function(){ return "l2"; } };
		l3 = { update:function(){ return "l3"; } };
		l4 = { update:function(){ return "l4"; } };
		l5 = { update:function(){ return "l5"; } };
		
	});
	describe("registerListerner", function() {
		describe("passing callBack param ",function(){
			describe("with param : [object] , [function] ", function() {
				beforeEach( function(){
					not.registerListener( l1 , l1.update );
				});
				it('"all" class should be instancied', function() {
					expect( not._listener ).not.toBeNull();
					expect( not._listener ).not.toBeUndefined();
					expect( not._listener['all'] ).not.toBeNull();
					expect( not._listener['all'] ).not.toBeUndefined();
				});
				it('should register in the "all" class', function() {
					expect( not._listener['all'][0].o ).toBe( l1 );
					expect( not._listener['all'][0].f ).toBe( l1.update );
				});
			});
			describe("with param : [object] ", function() {
				beforeEach( function(){
					not.registerListener( l1 );
				});
				it('"all" class should be instancied', function() {
					expect( not._listener ).not.toBeNull();
					expect( not._listener ).not.toBeUndefined();
					expect( not._listener['all'] ).not.toBeNull();
					expect( not._listener['all'] ).not.toBeUndefined();
				});
				it('should register in the "all" class', function() {
					expect( not._listener['all'][0].o ).toBe( l1 );
					expect( not._listener['all'][0].f ).toBe( l1.update );
				});
			});
			describe("with param : {o:object , f:function} ", function() {
				beforeEach( function(){
					not.registerListener( {o:l1 , f:l1.update} );
				});
				it('"all" class should be instancied', function() {
					expect( not._listener ).not.toBeNull();
					expect( not._listener ).not.toBeUndefined();
					expect( not._listener['all'] ).not.toBeNull();
					expect( not._listener['all'] ).not.toBeUndefined();
				});
				it('should register in the "all" class', function() {
					expect( not._listener['all'][0].o ).toBe( l1 );
					expect( not._listener['all'][0].f ).toBe( l1.update );
				});
			});
		});
		describe("passing classes ",function(){
			describe("with one class ", function() {
				beforeEach( function(){
					not.registerListener( "classA" , l1 );
				});
				it('class should be instancied', function() {
					expect( not._listener ).not.toBeNull();
					expect( not._listener ).not.toBeUndefined();
					expect( not._listener["classA"] ).not.toBeNull();
					expect( not._listener["classA"] ).not.toBeUndefined();
				});
				it('should register in the class', function() {
					expect( not._listener["classA"][0].o ).toBe( l1 );
					expect( not._listener["classA"][0].f ).toBe( l1.update );
				});
			});
			describe("with multiple class", function() {
				beforeEach( function(){
					not.registerListener( "classA" , "classB" , "classC" , l1 );
				});
				it('class should be instancied', function() {
					expect( not._listener ).not.toBeNull();
					expect( not._listener ).not.toBeUndefined();
					expect( not._listener["classA"] ).not.toBeNull();
					expect( not._listener["classA"] ).not.toBeUndefined();
					expect( not._listener["classB"] ).not.toBeNull();
					expect( not._listener["classB"] ).not.toBeUndefined();
					expect( not._listener["classC"] ).not.toBeNull();
					expect( not._listener["classC"] ).not.toBeUndefined();
				});
				it('should register in the class', function() {
					expect( not._listener["classA"][0].o ).toBe( l1 );
					expect( not._listener["classA"][0].f ).toBe( l1.update );
					expect( not._listener["classB"][0].o ).toBe( l1 );
					expect( not._listener["classB"][0].f ).toBe( l1.update );
					expect( not._listener["classC"][0].o ).toBe( l1 );
					expect( not._listener["classC"][0].f ).toBe( l1.update );
				});
			});
		});
		describe("register multiple elements",function(){
			beforeEach( function(){
				not.registerListener( l1 );
				not.registerListener( l2 );
				not.registerListener( l3 );
			});
			it('should register in the class', function() {
				expect( not._listener["all"][0].o ).toBe( l1 );
				expect( not._listener["all"][0].f ).toBe( l1.update );
				expect( not._listener["all"][1].o ).toBe( l2 );
				expect( not._listener["all"][1].f ).toBe( l2.update );
				expect( not._listener["all"][2].o ).toBe( l3 );
				expect( not._listener["all"][2].f ).toBe( l3.update );
			});
		});
	});
	describe("notify", function() {
		beforeEach( function(){
		
			spyOn( l1 , 'update' );
			spyOn( l2 , 'update' );
			spyOn( l3 , 'update' );
			spyOn( l4 , 'update' );
			spyOn( l5 , 'update' );
			
		});
		describe(" notify all", function() {
			beforeEach( function(){
				not.registerListener( "classA" , "classB",  l1 );
				not.registerListener( "classA" , l2 );
				not.registerListener( "classB" , l3 );
				not.registerListener( l4 );
				
				not.notify();
			});
			it('element concerned should have been update', function() {
				expect( l1.update ).toHaveBeenCalled();
				expect( l2.update ).toHaveBeenCalled();
				expect( l3.update ).toHaveBeenCalled();
				expect( l4.update ).toHaveBeenCalled();
				
			});
			it('element concerned should have been update width correct param', function() {
				expect( l1.update.mostRecentCall.args[1] ).toBe("all");
				expect( l2.update.mostRecentCall.args[1] ).toBe("all");
				expect( l4.update.mostRecentCall.args[1] ).toBe("all");
				expect( l3.update.mostRecentCall.args[1] ).toBe("all");
			});
			it('element not concerned should not have been update', function() {
				expect( l5.update ).not.toHaveBeenCalled();
			});
		});
		describe(" notify a class", function() {
			beforeEach( function(){
				not.registerListener( "classA" , "classB",  l1 );
				not.registerListener( "classA" , l2 );
				not.registerListener( "classB" , l3 );
				not.registerListener( l4 );
				
				not.notify( "classA" );
			});
			it('element concerned should have been update', function() {
				expect( l1.update ).toHaveBeenCalled();
				expect( l2.update ).toHaveBeenCalled();
				
			});
			it('element concerned should have been update width correct param', function() {
				expect( l1.update.mostRecentCall.args[1] ).toBe("classA");
				expect( l2.update.mostRecentCall.args[1] ).toBe("classA");
			});
			it('element not concerned should not have been update', function() {
				expect( l5.update ).not.toHaveBeenCalled();
				expect( l3.update ).not.toHaveBeenCalled();
				expect( l4.update ).not.toHaveBeenCalled();
			});
		});
		describe(" notify multiple class", function() {
			beforeEach( function(){
				not.registerListener( "classA" , "classB",  l1 );
				not.registerListener( "classA" , l2 );
				not.registerListener( "classB" , l3 );
				not.registerListener( l4 );
				
				not.notify( "classA" , "classB" );
			});
			it('element concerned should have been update', function() {
				expect( l1.update ).toHaveBeenCalled();
				expect( l2.update ).toHaveBeenCalled();
				expect( l3.update ).toHaveBeenCalled();
			});
			it('element not concerned should not have been update', function() {
				expect( l5.update ).not.toHaveBeenCalled();
				expect( l4.update ).not.toHaveBeenCalled();
			});
		});
	});
	xdescribe("removeListener", function() {
		beforeEach( function(){
			not.registerListener( "classA" , l1 );
			not.registerListener( "classA" , "classB" , l2 );
			not.registerListener( "classB" ,l3 );
			not.registerListener( l4 );
			not.registerListener( l5 );
		});
		describe("passing callBack param ",function(){
			describe("with param : [object] , [function] ", function() {
				beforeEach( function(){
					not.registerListener( l1 , l1.update );
				});
				it('"all" class should be instancied', function() {
					expect( not._listener ).not.toBeNull();
					expect( not._listener ).not.toBeUndefined();
					expect( not._listener['all'] ).not.toBeNull();
					expect( not._listener['all'] ).not.toBeUndefined();
				});
				it('should register in the "all" class', function() {
					expect( not._listener['all'][0].o ).toBe( l1 );
					expect( not._listener['all'][0].f ).toBe( l1.update );
				});
			});
			describe("with param : [object] ", function() {
				beforeEach( function(){
					not.registerListener( l1 );
				});
				it('"all" class should be instancied', function() {
					expect( not._listener ).not.toBeNull();
					expect( not._listener ).not.toBeUndefined();
					expect( not._listener['all'] ).not.toBeNull();
					expect( not._listener['all'] ).not.toBeUndefined();
				});
				it('should register in the "all" class', function() {
					expect( not._listener['all'][0].o ).toBe( l1 );
					expect( not._listener['all'][0].f ).toBe( l1.update );
				});
			});
			describe("with param : {o:object , f:function} ", function() {
				beforeEach( function(){
					not.registerListener( {o:l1 , f:l1.update} );
				});
				it('"all" class should be instancied', function() {
					expect( not._listener ).not.toBeNull();
					expect( not._listener ).not.toBeUndefined();
					expect( not._listener['all'] ).not.toBeNull();
					expect( not._listener['all'] ).not.toBeUndefined();
				});
				it('should register in the "all" class', function() {
					expect( not._listener['all'][0].o ).toBe( l1 );
					expect( not._listener['all'][0].f ).toBe( l1.update );
				});
			});
		});
		describe("passing classes ",function(){
			describe("with one class ", function() {
				beforeEach( function(){
					not.registerListener( "classA" , l1 );
				});
				it('class should be instancied', function() {
					expect( not._listener ).not.toBeNull();
					expect( not._listener ).not.toBeUndefined();
					expect( not._listener["classA"] ).not.toBeNull();
					expect( not._listener["classA"] ).not.toBeUndefined();
				});
				it('should register in the class', function() {
					expect( not._listener["classA"][0].o ).toBe( l1 );
					expect( not._listener["classA"][0].f ).toBe( l1.update );
				});
			});
			describe("with multiple class", function() {
				beforeEach( function(){
					not.registerListener( "classA" , "classB" , "classC" , l1 );
				});
				it('class should be instancied', function() {
					expect( not._listener ).not.toBeNull();
					expect( not._listener ).not.toBeUndefined();
					expect( not._listener["classA"] ).not.toBeNull();
					expect( not._listener["classA"] ).not.toBeUndefined();
					expect( not._listener["classB"] ).not.toBeNull();
					expect( not._listener["classB"] ).not.toBeUndefined();
					expect( not._listener["classC"] ).not.toBeNull();
					expect( not._listener["classC"] ).not.toBeUndefined();
				});
				it('should register in the class', function() {
					expect( not._listener["classA"][0].o ).toBe( l1 );
					expect( not._listener["classA"][0].f ).toBe( l1.update );
					expect( not._listener["classB"][0].o ).toBe( l1 );
					expect( not._listener["classB"][0].f ).toBe( l1.update );
					expect( not._listener["classC"][0].o ).toBe( l1 );
					expect( not._listener["classC"][0].f ).toBe( l1.update );
				});
			});
		});
});
			