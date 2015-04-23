'use sctrict';

var invoice = angular.module('invoice', [ 'ngMaterial', 'ngCookies' ]);

invoice.config([ '$mdThemingProvider', function ($mdThemingProvider) {
	// $mdThemingProvider.theme('default').primaryPalette('blue').accentPalette('blue-grey');
}]);


invoice.filter('siret', function () {
	return (function (input) {
		return (input.slice(0, 3) + " " + input.slice(3, 6) + " " + input.slice(6, 9) + " " + input.slice(9, 14));
	});
});

// TODO :
// Chqnge theme
// Verify print
// Look why newItem is not updating

invoice.directive('invoiceTotal', function () {
	return ({
		restrict : 'E',
		templateUrl : 'templates/invoice-total.html',
		scope : {
			items : '=toSum',
			opt : '=options'
		},
		link : function (scope, elem, attrs) {
			scope.subTotal = 0;
			scope.totalTva = 0;
			scope.total = 0;

			updateTotals = function (newValue) {
				scope.subTotal = 0;
				angular.forEach(scope.items, function (v, k) {
					scope.subTotal += v.unit * v.quantity;
				});

				scope.subTotal = Math.round(scope.subTotal * 100) / 100;
				scope.totalTva = Math.round((scope.subTotal * scope.opt.tva / 100) * 100) / 100;
				scope.total = Math.round((scope.subTotal + scope.totalTva) * 100) / 100;
			}

			scope.$watch(attrs.toSum, function (newValue) {
				scope.items = newValue;
				updateTotals();
			}, true);

			scope.$watch(attrs.options, function (newValue) {
				scope.opt = newValue;
				updateTotals();
			}, true);
		}
	});
});

invoice.controller('invoiceCtrl', [ '$scope', '$cookies', function ($scope, $cookies) {
	var months = [ 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Décembre' ];

	$scope.items = [ ];
	$scope.opt = {
		tva : 0,
		type : false,
		number : 1,
		startDate : new Date(),
		endDate : new Date(),
		paid : 0,
		devise : '€'
	};

	try {
		$scope.seller = JSON.parse($cookies.seller);
	} catch (e) {
		$scope.seller = {
			name : 'Nicolas BRIDOUX',
			siret : '81006118400018',
			address : '43 Rue Denise',
			city : 'Bordeaux',
			zipcode : '33300',
			country : 'france'
		};
	}

	$scope.formatDate = function (date) {
		return (date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear());
	};

	$scope.calcLine = function (newItem) {
		var sum = parseFloat(newItem.unit) * parseInt(newItem.quantity);

		sum += sum * ($scope.opt.tva / 100);
		sum = Math.round(sum * 100) / 100;
		return (sum + $scope.opt.devise);
	};

	$scope.genNewItem = function () {
		return ({
			description : '',
			unit : 0,
			quantity : 1,
		});
	};

	$scope.genNewClient = function () {
		return ({
			name : '',
			siret : '',
			address : '',
			city : '',
			zipcode : '',
			country : ''
		});
	};

	$scope.addItem = function (newItem) {
		$scope.items.push(angular.copy(newItem));
		$scope.newItem = $scope.genNewItem();
	};

	$scope.removeItem = function (item) {
		$scope.items.splice($scope.items.indexOf(item), 1);
	};

	$scope.print = function () {
		$cookies.seller = JSON.stringify($scope.seller);
		window.print();
	};

}]);
