app.directive('sendMail', function (user, vehicle, $location, $rootScope, typeEvents, vehicleByCompany, usSpinnerService) {
    return {
    	scope: {
    		typeReport: '=report'
    	},
		templateUrl: '/backoffice/resources/js/app/directives/layout/send-email.html',
		restrict: 'E',
		link: function(scope, elem, attrs){
			
			//calida si es que fue seleccionada aunq sea una opcion de checkbox
			scope.handleChange = function () {
				scope.showRequired = !(scope.checkbox.xls || scope.checkbox.pdf);
			}
			
			//inicializa los datos del modal, es llamado de cada controlador de reporte
			scope.$on('callModal', function (event) {
				console.log("callModal");
				scope.checkbox = {};
				scope.checkbox = {pdf:false, xls:false};
				scope.showRequired = true;
				
			});
			
			scope.sendMails = function (emails, checkbox) {
				$rootScope.$broadcast('sendMails', emails, checkbox);
			}
			
			scope.checkbox = {};
			scope.checkbox = {pdf:false, xls:false};
			scope.showRequired = true;
		}
    };
  });
