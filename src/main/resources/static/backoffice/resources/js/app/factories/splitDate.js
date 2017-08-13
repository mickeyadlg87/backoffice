//factoria separa fecha en tramos en caso de ser mayor a una semana
app.factory('splitDate', function() {

//	var dataDefault = function (startDate, endDate) {
//		console.log("startDate,  ", startDate, " endDate ",  endDate);
//	}
//
//	return dataDefault;
	
	 return {
	        split: function(startDate, endDate){
//	        	var startDateMili = startDate.getTime();
//	    		var endDateMili = endDate.getTime();
//	    		var oneDay = 24*60*60*1000;
//	    		var daysCount = (endDateMili - startDateMili) / oneDay;
//	    		daysCount = Math.floor(daysCount);
//	    		
//	    		//validacion si las fechas estan bien seleccionadas segun vehiculos consultados, retorna null
//	    		if( daysCount > 31 ){
//	    			$scope.showAletErrorMonth = true;
//	    			return null;
//	    		}
//	    		
//	    		var dayMili = 86399000;
//	    		var secondsMili = 1000;
//	    		var sixDay = 604799000;
//	    		var arraySectionDate = new Array();
//	    		
//	    		if (endDateMili - startDateMili > sixDay) {
//	    			var objAuxSectionDate = {};
//	    			var countWeek = Math.floor((endDateMili - startDateMili) / sixDay);
//	    			var startDateSection = startDateMili;
//	    			var endDateSection;
//	    			for (i = 0; i < countWeek; i++) { 
//	    				if (i > 0) {
//	    					startDateSection = (endDateSection + secondsMili);
//	    				}
//	    				endDateSection = startDateSection + sixDay;
//	    				objAuxSectionDate['start'] = startDateSection;
//	    				objAuxSectionDate['end'] = endDateSection;
//	    				arraySectionDate.push(objAuxSectionDate);
//	    				objAuxSectionDate = {}
//	    			}
//	    			var modDate = (endDateMili - startDateMili) % sixDay;
//	    			objAuxSectionDate['start'] = (endDateSection + secondsMili);
//	    			objAuxSectionDate['end'] = (endDateSection + secondsMili + modDate);
//	    			arraySectionDate.push(objAuxSectionDate);
//	    		} else {
//	    			objAuxSectionDate = {};
//	    			objAuxSectionDate['start'] = startDateMili;
//	    			objAuxSectionDate['end'] = endDateMili;
//	    			arraySectionDate.push(objAuxSectionDate);
//	    		}
	    		return null;
	        },
	        //Obtener fecha ayer Hora inicio
	        getYesterdayStart: function (date){
	        	date.setDate(date.getDate() - 1);
	    		date.setHours(0);
	    		date.setMinutes(0);
	    		date.setSeconds(0);
	    		
	    		return date;
	        },
	        //Obtener fecha ayer Hora final
	        getYesterdayEnd: function (date){
	        	date.setDate(date.getDate() - 1);
	    		date.setHours(23);
	    		date.setMinutes(59);
	    		date.setSeconds(59);
	    		
	    		return date;
	        },
	        //Obtiene inicio de la semana
	        getWeekNowStart: function (date){
	        	var day = date.getDay() || 7;  
	      	   	if( day !== 1 ) 
	      	       date.setHours(-24 * (day - 1));
		      	   
	      	   	date.setHours(0);
	      	   	date.setMinutes(0);
	      	   	date.setSeconds(0);
		      	   
	      	   	return date;
	        },
	        //Obtiene la fecha actual
	        getWeekNowEnd: function (date){
	        	return date;
	        },
	        //Obtiene fecha inicio semana anterior
	        getLastWeekStart: function (date){
	        	var day = date.getDay() || 7;  
   		 		if( day !== 1 ) 
	   		       date.setHours(-24 * (day - 1));
   		 		date.setMinutes(0);
   		 		date.setSeconds(0);
	   		   
   		 		date.setHours(-24 * (7));
   		 		return date;
	        },
	        //Obtiene fecha fin semana anterior
	        getLastWeekEnd: function (date){
	        	var day = date.getDay() || 7;  
	   		 	if( day !== 1 ) 
	   		       date.setHours(-24 * (day - 1));
	   		 
	   		 	date.setHours(-24 * (1));
	   		 	date.setHours(23);
	   		 	date.setMinutes(59);
	   		 	date.setSeconds(59);
	   		 	return date;
	        },
	        //Obtener inicio mes actual
	        getMonthNowStart: function (date) {
	        	date.setDate(1);
	    		date.setHours(0);
	    		date.setMinutes(0);
	    		date.setSeconds(0);
	    		
	    		return date;
	        },
	        //Obtener Mes anterior inicio
	        getLastDayMonthStart: function (date) {
	        	var firstDayLastMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
	    		return firstDayLastMonth;
	        },
	        //Obtiene mes anterior ultimo dia
	        getLastDayMonthEnd: function (date) {
	        	var lastDayLastMonth = new Date(date.getFullYear(), date.getMonth() , 0)
	    		lastDayLastMonth.setHours(23);
	    		lastDayLastMonth.setMinutes(59);
	    		lastDayLastMonth.setSeconds(59);
	    		return lastDayLastMonth;
	        }
	        
	    }               
});