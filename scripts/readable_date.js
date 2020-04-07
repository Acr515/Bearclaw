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

// Takes a Date object and makes its contents human-readable
function readable_date_show_time(date, showToday) {
	let current = new Date();
	let dateString = "";
	let dow, m;
	
	if (showToday && date.getDate() == current.getDate() && date.getMonth() == current.getMonth() && current.getYear() == date.getYear()) dateString = "Today";
	current.setDate(current.getDate() - 1);
	if (showToday && date.getDate() == current.getDate() && date.getMonth() == current.getMonth() && current.getYear() == date.getYear()) dateString = "Yesterday";
	current.setDate(current.getDate() + 2);
	if (showToday && date.getDate() == current.getDate() && date.getMonth() == current.getMonth() && current.getYear() == date.getYear()) dateString = "Tomorrow";
	
	if (dateString == "") {
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
		switch (date.getMonth() + 1) {
			case 1:
				m = "January";
				break;
			case 2:
				m = "February";
				break;
			case 3:
				m = "March";
				break;
			case 4:
				m = "April";
				break;
			case 5:
				m = "May";
				break;
			case 6:
				m = "June";
				break;
			case 7:
				m = "July";
				break;
			case 8:
				m = "August";
				break;
			case 9:
				m = "September";
				break;
			case 10:
				m = "October";
				break;
			case 11:
				m = "November";
				break;
			case 12:
				m = "December";
				break;
			default:
				m = "???";
		}
		dateString = dow + ", " + m + " " + date.getDate() + ", " + date.getFullYear();
	}
	
	return dateString + " (" + readable_time(date) + ")";
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