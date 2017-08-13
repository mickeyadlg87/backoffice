//data default report list of events
app.factory('getListadoEventosDefaultData', function() {

	var dataDefault = {
		title : "Listado de Eventos",
		header : {
			Vehiculo : "veh",
			Grupo : " gro",
			Fecha : "date",
		},
		table_model : [],
		config : {
			loading_data : true,
			pagination : {
				model : 1,
				total_items : 15,
				limit : 5,
				data : []
			}
		}
	}

	return dataDefault;
});