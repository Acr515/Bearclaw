// Performs various conversions on Date objects to make their contents readable

// Takes a Date object and converts its time to a readable format
function readable_time(date) {
	var diem = "AM";
	var hh = date.getHours();
	var mm = date.getMinutes();

	// Convert from military time
	if (hh == 0) {
		hh = 12;
	} else if (hh > 12) {
		hh -= 12;
		diem = "PM";
	}

	// Add 0 on the end of minute if needed
	if (mm < 10) {
		mm = "0" + mm;
	}
	
	return hh + ":" + mm + " " + diem;
}

// Takes a Date object and converts its date to a readable format
function readable_date(date, showToday) {
	let current = new Date();
	let dow, m;
	
	if (showToday && date.getDate() == current.getDate() && date.getMonth() == current.getMonth() && current.getYear() == date.getYear()) return "Today";
	current.setDate(current.getDate() - 1);
	if (showToday && date.getDate() == current.getDate() && date.getMonth() == current.getMonth() && current.getYear() == date.getYear()) return "Yesterday";
	current.setDate(current.getDate() + 2);
	if (showToday && date.getDate() == current.getDate() && date.getMonth() == current.getMonth() && current.getYear() == date.getYear()) return "Tomorrow";

	switch (date.getDay()) {
		case 0:
			dow = "Sunday";
			break;
		case 1:
			dow = "Monday";
			break;
		case 2:
			dow = "Tuesday";
			break;
		case 3:
			dow = "Wednesday";
			break;
		case 4:
			dow = "Thursday";
			break;
		case 5:
			dow = "Friday";
			break;
		case 6:
			dow = "Saturday";
			break;
		default:
			dow = "???";
	}
	m = get_readable_month(date.getMonth());

	return dow + ", " + m + " " + date.getDate() + ", " + date.getFullYear();
}

// Takes in a numerical month and returns a string. Month is straight from date object so should start at 0 (i.e. May = 4)
function get_readable_month(month) {
	switch (month + 1) {
		case 1:
			return "January";
		case 2:
			return "February";
		case 3:
			return "March";
		case 4:
			return "April";
		case 5:
			return "May";
		case 6:
			return "June";
		case 7:
			return "July";
		case 8:
			return "August";
		case 9:
			return "September";
		case 10:
			return "October";
		case 11:
			return "November";
		case 12:
			return "December";
		default:
			return "???";
	}
}

// Takes a Date object and makes its contents human-readable
function readable_date_show_time(date, showToday) {
	return readable_date(date, showToday) + " (" + readable_time(date) + ")";
}

// Gets the number of days in a month
function days_in_month(month, year) {
    return new Date(year, month, 0).getDate();
}

// Converts a Date object to the local timezone. Specifically used for converting the time/date from a form input that defaults a date to UTC
function convert_to_local_timezone(d) {
	var newMinutes = d.getUTCMinutes();
	var newHours = d.getUTCHours();
	var newDate = d.getUTCDate();
	var newMonth = d.getUTCMonth();
	var newYear = d.getUTCFullYear();
	
	d.setMinutes(newMinutes);
	d.setHours(newHours);
	d.setDate(newDate);
	d.setMonth(newMonth);
	d.setFullYear(newYear);
}
