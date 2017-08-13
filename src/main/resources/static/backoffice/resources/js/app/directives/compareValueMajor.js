app.directive('compareValueMajor', function () {
    return {
    	require: 'ngModel',
		link: function(scope, elm, attrs, ctrl){
			
			var validate = function(viewValue) {
		        var comparisonModel = attrs.compareValueMajor;
		        if(!comparisonModel){
		          // It's valid because we have nothing to compare against
		          ctrl.$setValidity('compareValueMajor', true);
		          return viewValue;
		        }
		        if (!viewValue.value){
		        	ctrl.$setValidity('compareValueMajor', parseInt(viewValue, 10) > parseInt(comparisonModel, 10) );
		        	return viewValue;
		        }
		        // It's valid if model is lower than the model we're comparing against
		        ctrl.$setValidity('compareValueMajor', parseInt(viewValue.value, 10) > parseInt(comparisonModel, 10) );
		        return viewValue;
	      };
		      
	      ctrl.$parsers.unshift(validate);
	      ctrl.$formatters.push(validate);

	      attrs.$observe('compareValueMajor', function(comparisonModel){
	        return validate(ctrl.$viewValue);
	      });
		}
    };
  });