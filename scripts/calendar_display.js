// Contains all functions pertaining to creating the calendar view and interacting with it

// Renders all elements of the calendar
function update_calendar(today = (new Date())) {
	flush_feeds();
	document.getElementById("calendar-overlay").style.display = "none";

	// Get relevant information to create calendar
	var elements = get_all_elements();
	var currentMonth = today.getMonth();// TODO remove the +1, only for testing
	var daysInMonth = days_in_month(currentMonth + 1, today.getFullYear());
	var hour = today.getHours();
	var min = today.getMinutes();
	var calendar = document.getElementById("calendar-days");

	// Fill in header of calendar
	document.querySelector("#calendar-month .calendar-month-text").innerHTML = get_readable_month(currentMonth) + " " + today.getFullYear();

	// Set up buttons that switch months
	let sampleMonth = currentMonth + 1;
	let sampleYear = today.getFullYear();
	if (sampleMonth >= 12) {
		sampleYear ++;
		sampleMonth = 0;
	}
	let rightPreview = document.getElementById("calendar-preview-right");
	rightPreview.innerHTML = get_readable_month(sampleMonth) + " " + sampleYear;
	let rightButton = document.getElementById("calendar-shift-right");
	rightButton.onmouseover = function() {
		rightPreview.classList.add("shown");
	}
	rightButton.onmouseout = function() {
		rightPreview.classList.remove("shown");
	}
	rightButton.onclick = update_calendar.bind(null, (new Date(sampleYear, sampleMonth, 1)));

	sampleMonth = currentMonth - 1;
	sampleYear = today.getFullYear();
	if (sampleMonth < 0) {
		sampleYear --;
		sampleMonth = 11;
	}
	let leftPreview = document.getElementById("calendar-preview-left");
	leftPreview.innerHTML = get_readable_month(sampleMonth) + " " + sampleYear;
	let leftButton = document.getElementById("calendar-shift-left");
	leftButton.onmouseover = function() {
		leftPreview.classList.add("shown");
	}
	leftButton.onmouseout = function() {
		leftPreview.classList.remove("shown");
	}
	leftButton.onclick = update_calendar.bind(null, (new Date(sampleYear, sampleMonth, 1)));

	// Fill table with empty table cells until day one of the week is reached
	let dateHelper = new Date(today.getFullYear(), currentMonth, 1);
	let dotw = 0;
	let weekTemp = document.createElement("tr");
	weekTemp.classList.add("calendar-week");
	calendar.appendChild(weekTemp);
	while (dotw != dateHelper.getDay()) {
		weekTemp.appendChild(document.createElement("td"));
		dotw ++;
	}

	// Iterate through each day on the calendar
	var currentWeek = weekTemp;		// the tr element holding the week's days
	var index = 0;					// the current index of elements that we're in
	for (var date = new Date(today.getFullYear(), currentMonth, 1); date < (new Date(today.getFullYear(), currentMonth + 1, 1)); date.setDate(date.getDate() + 1)) {
		// Add a new table row (week) if necessary
		if (date.getDay() == 0 && date.getDate() != 1) {
			currentWeek = document.createElement("tr");
			currentWeek.classList.add("calendar-week");
			calendar.appendChild(currentWeek);
		}

		// Create the day
		var dayElement = document.createElement("td");
		dayElement.classList.add("calendar-day");
		dayElement.setAttribute("m", currentMonth.toString());
		dayElement.setAttribute("d", date.getDate().toString());
		dayElement.setAttribute("y", today.getFullYear().toString());
		if (identical_date((new Date()), date)) dayElement.classList.add("today");
		var dayLabel = document.createElement("span");
		dayLabel.classList.add("day");
		dayLabel.innerHTML = date.getDate().toString();
		dayElement.appendChild(dayLabel);
		dayMarkerContainer = document.createElement("div");

		// Add markers based on the contents of the current day
		var itemsPerClass = [];
		for (var i = 0; i < classes.length; i ++) {
			itemsPerClass.push(0);
		}
		var itemsToday = get_items_from_day(elements, date);
		for (var i = 0; i < itemsToday.length; i ++) {
			for (var j = 0; j < classes.length; j ++) {
				if (classes[j] == itemsToday[i].myClass) itemsPerClass[j] ++;
			}
		}
		for (var i = 0; i < classes.length; i ++) {
			if (itemsPerClass[i] > 0) {
				var dayMarker = document.createElement("span");
				dayMarker.classList.add("calendar-day-marker");
				dayMarker.innerHTML = itemsPerClass[i].toString();
				dayMarker.style.backgroundColor = classes[i].color;
				dayMarker.style.color = get_black_or_white(hexToRgb(classes[i].color));
				dayMarkerContainer.append(dayMarker);
			}
		}

		// Add listener to day and append to the week
		dayElement.addEventListener("click", function(e) {
			var target = e.target;
			if (target.classList.contains("calendar-day-marker")) target = target.parentElement.parentElement; else if (!target.classList.contains("calendar-day")) target = target.parentElement;
			check_out_calendar_date(target);
		});
		dayElement.appendChild(dayMarkerContainer);
		currentWeek.appendChild(dayElement);
	}
}

// Returns items from an array that take place during a certain day
function get_items_from_day(elements, date) {
	var items = [];
	for (var i = 0; i < elements.length; i ++) {
		if (identical_date(elements[i].getDay(), date)) {
			// This item takes place on the same day so we should add to the count
			items.push(elements[i]);
		}
	}
	sort_time_based_instances(items);
	return items;
}

// Checks out a calendar date with an overlay and populates it with items
function check_out_calendar_date(elm) {
	if (document.getElementById("calendar-expansion-item") !== null || document.getElementById("calendar-overlay").style.display != "none") return;

	// Create date object from elm attributes
	var date = new Date(Number(elm.getAttribute("y")), Number(elm.getAttribute("m")), Number(elm.getAttribute("d")));

	// Create and populate element
	var expand = document.createElement("div");
	expand.classList.add("day-expand");
	expand.id = "calendar-expansion-item";
	var button = document.createElement("button");
	button.addEventListener("click", function() {
		destroy_calendar_date_check_out();
	});
	button.classList.add("form-button", "calendar-x");
	button.innerHTML = "&#128473;";
	expand.appendChild(button);
	var heading = document.createElement("h3");
	heading.classList.add("day-expand-date");
	heading.innerHTML = "Activities for " + get_readable_month(Number(elm.getAttribute("m"))) + " " + elm.getAttribute("d") + ", " + elm.getAttribute("y");
	expand.appendChild(heading);

	// Create "mini-feed" list of items
	var feed = document.createElement("ul");
	feed.classList.add("calendar-mini-feed");
	var elements = get_items_from_day(get_all_elements(), date);
	var today = new Date();
	for (var i = 0; i < elements.length; i ++) {
		var feedItem = document.createElement("li");
		if (elements[i].getDay() < today) feedItem.classList.add("old");
		feedItem.appendChild(create_color_label(elements[i]));	// color label
		if (elements[i].getType() == "class-period") {
			// Style as class period
			var subject = document.createElement("h3");
			subject.innerHTML = "Go to class";
			feedItem.appendChild(subject);
			var time = document.createElement("h4");
			time.innerHTML = elements[i].getReadableDayAndTimes(true);;
			feedItem.appendChild(time);
		} else {
			// Style as assignment
			var subject = document.createElement("h3");
			subject.innerHTML = "Due: " + elements[i].name;
			feedItem.appendChild(subject);
			var time = document.createElement("h4");
			time.innerHTML = "Due " + readable_date_show_time(elements[i].dueDate, true);
			feedItem.appendChild(time);
		}
		feed.appendChild(feedItem)
	}
	if (elements.length == 0) {
		var prompt = document.createElement("p");
		prompt.innerHTML = "No due dates or class periods. Enjoy your day off!";
		expand.appendChild(prompt);
	} else expand.appendChild(feed);

	// Position expansion next to the day that was selected
	let checkHeight = innerHeight - 100;//document.getElementById("calendar-content").clientHeight;
	let arrowUp = true;
	let topVal = 0;
	if (elm.getBoundingClientRect().top < checkHeight / 2) {
		topVal = Math.min(checkHeight - expand.clientHeight, elm.getBoundingClientRect().top - 16 + document.getElementById("calendar-body").scrollTop);
		arrowUp = false;
	} else {
		topVal = Math.max(0, (elm.getBoundingClientRect().top - checkHeight / 2 + document.getElementById("calendar-body").scrollTop - 6));
	}
	expand.style.top = topVal + "px";

	// Position arrow horizontally to the correct item
	var arrow = document.createElement("div");
	arrow.classList.add("day-expand-arrow");
	document.getElementById("calendar-overlay").appendChild(arrow);
	if (arrowUp) {
		arrow.style.top = topVal + 300 + 20 - document.getElementById("calendar-body").scrollTop + "px";
	} else {
		arrow.style.borderTop = "unset";
		arrow.style.borderBottom = "13px solid #CCC";
		arrow.style.top = topVal + 100 - 12 - document.getElementById("calendar-body").scrollTop + "px";
	}
	arrow.style.left = elm.getBoundingClientRect().left + elm.getBoundingClientRect().width / 2 + "px"

	document.getElementById("calendar-body").appendChild(expand);

	// Show overlay and fix the body if necessary
	document.getElementById("calendar-overlay").style.display = "block";
	document.getElementById("calendar-body").style.width = Math.round(document.getElementById("calendar-body").clientWidth) + "px";
	document.getElementById("calendar-body").classList.add("fixed");

	// Destroy expansion if the window size is changed
	window.addEventListener("resize", destroy_calendar_date_check_out);
}

// Returns to normal calendar view
function destroy_calendar_date_check_out() {
	var item = document.getElementById("calendar-expansion-item");
	if (item !== null) item.parentElement.removeChild(item);
	setTimeout(function() {
		document.getElementById("calendar-overlay").style.display = "none";
		document.getElementById("calendar-overlay").innerHTML = "";
	}, 20);
	document.getElementById("calendar-body").classList.remove("fixed");
	document.getElementById("calendar-body").style.width = "unset";

	window.removeEventListener("resize", destroy_calendar_date_check_out);
}
