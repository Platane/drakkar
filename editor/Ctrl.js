function MapCtrl($scope) {
	
	$scope.addLayer = function() {
		$scope.map;
	};
	
	$scope.layers = function() {
		return map.getLayers();
	};
	
	$scope.name = function(){
		return map._name;
	};
	
	$scope.layerCount = function(){
		return $scope.getLayers().length;
	};
}



