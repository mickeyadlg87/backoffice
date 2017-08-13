var datePickerDefaultOptions = {
	closeText: 'Cerrar',
	prevText: '<Ant',
	nextText: 'Sig>',
	showOn: 'focus',
	currentText: 'Hoy',
	monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
	monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
	dayNames: ['Domingo', 'Lunes', 'Martes', 'Mi&eacute;rcoles', 'Jueves', 'Viernes', 'S&aacute;bado'],
	dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mi&eacute;r', 'Juv', 'Vie', 'S&aacute;b'],
	dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'S&aacute;'],
	weekHeader: 'Sm',
	dateFormat: 'dd/mm/yy',
	firstDay: 1,
	isRTL: false,
	showMonthAfterYear: false,
	yearSuffix: '',
	currentText: 'Ahora',
	closeText: 'Listo',
	amNames: ['AM', 'A'],
	pmNames: ['PM', 'P'],
	timeFormat: 'HH:mm',
	timeSuffix: '',
	timeOnlyTitle: 'Elige Tiempo',
	timeText: 'Tiempo',
	hourText: 'Hora',
	minuteText: 'Minuto',
	secondText: 'Segundo',
	millisecText: 'Milisegundo',
	microsecText: 'Microsegundo',
	timezoneText: 'Huso Horario',
	minDate: "-6M",
	maxDate: getToday().end
};

String.prototype.toHHMMSS = function () {
	var sec_num = parseInt(this, 10), hours = Math.floor(sec_num / 3600), minutes = Math
			.floor((sec_num - (hours * 3600)) / 60), seconds = sec_num
			- (hours * 3600) - (minutes * 60);
	if (hours < 10) {
		hours = "0" + hours;
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	return hours + ':' + minutes + ':' + seconds;
};

if (!Date.prototype.toISOString) {
	(function () {
		function pad(number) {
			var r = String(number);
			if (r.length === 1) {
				r = '0' + r;
			}
			return r;
		}
		Date.prototype.toISOString = function () {
			return this.getUTCFullYear()
					+ '-'
					+ pad(this.getUTCMonth() + 1)
					+ '-'
					+ pad(this.getUTCDate())
					+ 'T'
					+ pad(this.getUTCHours())
					+ ':'
					+ pad(this.getUTCMinutes())
					+ ':'
					+ pad(this.getUTCSeconds())
					+ '.'
					+ String((this.getUTCMilliseconds() / 1000).toFixed(3))
							.slice(2, 5) + 'Z';
		};
	}());
}

function openNewWindow(url) {
	var popup = window.open(
			url,
			"_blank",
			"location=no, menubar=no, resizable=no, scrollbars=no, status=no, titlebar=no, toolbar=no, top=0, left=0, width=1, height=1",
			false);
	popup.blur();
	window.focus();
}

function openFormReport(verb, url, data, target) {
	var form = document.createElement("form");
	form.action = url;
	form.method = verb;
	form.target = target || "_self";
	if (data) {
		for (var key in data) {
			var input = document.createElement("textarea");
			input.name = key;
			input.value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
			form.appendChild(input);
		}
	}
	form.style.display = 'none';
	document.body.appendChild(form);
	form.submit();
}

function getToday() {
	var init = new Date(), end = new Date();
	init.setHours(0);
	init.setMinutes(0);
	init.setSeconds(0);
	end.setHours(23);
	end.setMinutes(59);
	end.setSeconds(59);
	return {"init" : init, "end" : end};
}

function validDates(from, to) {
	if(from == null || to == null)
		return false;
	else
		if(to < from)
			return false;
		else
			return true;
}

function notify(text) {
	$('.top-right').notify({
		message : {
			text : text + "  "
		},
		type : "info"
	}).show();
}