// Tests some visual features of the app

var showDialog = false;
var moduleCount = 0;

function create_new_class_dialog() {
	if (!showDialog) create_dialog("dialog-new-class");
}

function create_edit_class_dialog(course) {
	if (!showDialog) {
		document.querySelector("#dialog-new-class h2").innerHTML = "Edit a class";
		document.querySelector("#new-class-form fieldset .form-button").value = "Update";
		
		// Prefill form data
		var data = document.getElementById("new-class-form").elements;
		data.namedItem("class-name").value = course.name;
		data.namedItem("class-number").value = course.number;
		data.namedItem("class-color").value = course.color;
		
		var sdMonth = course.startDate.getMonth() + 1;
		if (sdMonth < 10) sdMonth = "0" + sdMonth;
		
		var sdDate = course.startDate.getDate();
		if (sdDate < 10) sdDate = "0" + sdDate;
		
		var edMonth = course.endDate.getMonth() + 1;
		if (edMonth < 10) edMonth = "0" + edMonth;
		
		var edDate = course.endDate.getDate();
		if (edDate < 10) edDate = "0" + edDate;
		
		data.namedItem("class-start-date").value = course.startDate.getFullYear() + "-" + sdMonth + "-" + sdDate;
		data.namedItem("class-end-date").value = course.endDate.getFullYear() + "-" + edMonth + "-" + edDate;
		
		create_dialog("dialog-new-class");
	}
}

function create_new_assignment_dialog() {
	if (!showDialog) create_dialog("dialog-new-assignment");
}

function create_schedule_dialog(course) {
	if (!showDialog) {
		schedule_clear_units();
		if (!course.schedule.isEmpty()) {
			var form = document.getElementById("schedule-form").elements;
			for (var i = 0; i < course.schedule.classDays.length; i ++) {
				schedule_add_unit();
				form.namedItem("day-" + (i + 1)).value = course.schedule.classDays[i];
				form.namedItem("start-time-" + (i + 1)).value = course.schedule.classStarts[i];
				form.namedItem("end-time-" + (i + 1)).value = course.schedule.classEnds[i];
			}
			schedule_remove_unit(0);	// clear always adds a blank unit. removes this unit
		}
		create_dialog("dialog-schedule");
	}
}

// Creates a new schedule unit within which to add a new date and time of a class
function schedule_add_unit() {
	var fieldset = document.createElement("fieldset");
	var myid = moduleCount;
	fieldset.classList.add("schedule-unit");
	fieldset.id = "unit-" + myid;
	fieldset.setAttribute("myid", myid);
	fieldset.innerHTML = '<select name="day-' + myid + '" required><option value="" disabled selected hidden>Choose a day</option><option value="0">Sunday</option><option value="1">Monday</option><option value="2">Tuesday</option><option value="3">Wednesday</option><option value="4">Thursday</option><option value="5">Friday</option><option value="6">Saturday</option></select><label for="start-time-' + myid + '">Start Time</label><input type="time" name="start-time-' + myid + '" class="type-input"/><label for="end-time-' + myid + '">End Time</label><input type="time" name="end-time-' + myid + '" class="type-input"/>';
	document.querySelector("#schedule-form div").appendChild(fieldset);
	
	var button = document.createElement("button");
	button.innerHTML = "X";
	button.classList.add("form-button", "x-button");
	button.addEventListener("click", schedule_remove_unit.bind(null, myid));
	fieldset.appendChild(button);
	
	moduleCount ++;
}

// Tosses out one of the schedule units
function schedule_remove_unit(num) {
	document.getElementById("unit-" + num).remove();
	if (document.getElementsByClassName("schedule-unit").length == 0) schedule_add_unit();
}

// Clears every unit and leaves only one, blank unit behind
function schedule_clear_units() {
	document.querySelector("#schedule-form div").innerHTML = "";
	moduleCount = 0;
	schedule_add_unit();
}

function create_warning_dialog(warningText) {
	document.getElementById("dialog-warning-text").innerHTML = warningText;
	if (!showDialog) create_dialog("dialog-warning");
}

function create_dialog(type) {
	showDialog = true;
	var overlay = document.getElementById("app-overlay");
	var box = document.getElementById(type);
	
	box.style.display = "block";
	overlay.style.display = "block";
	setTimeout(function() {
		box.style.opacity = "1";
		box.style.transform = "translate(-50%, -50%)";
		overlay.style.opacity = "1";
	}, 50);
}

function destroy_dialog(type, clearFormControls) {
	showDialog = false;
	var overlay = document.getElementById("app-overlay");
	var box = document.getElementById(type);
	
	box.style.opacity = "0";
	overlay.style.opacity = "0";
	box.style.transform = "translate(-50%, -40%)";
	setTimeout(function() {
		box.style.display = "none";
		overlay.style.display = "none";
		
		// Clear out form controls on dialog box if necessary
		if (clearFormControls === true) {
			if (type == "dialog-new-class") {
				for (var i = 0; i < document.getElementById("new-class-form").elements.length; i ++) {
					var elm = document.getElementById("new-class-form").elements[i];
					if (elm.type != "button") elm.value = "";
					if (elm.type == "color") elm.value = "#FF0000";
				}
				document.getElementById("class-form-error").innerHTML = "";
				
				// Revert changes made to the box to accomodate editing
				document.querySelector("#dialog-new-class h2").innerHTML = "Create a class";
				document.querySelector("#new-class-form fieldset .form-button").value = "Create";
			}
			if (type == "dialog-new-assignment") {
				for (var i = 0; i < document.getElementById("new-assignment-form").elements.length; i ++) {
					var elm = document.getElementById("new-assignment-form").elements[i];
					if (elm.type != "button") elm.value = "";
					if (elm.type == "time") elm.value = "23:59";
				}
				document.getElementById("assignment-form-error").innerHTML = "";
				
				// Revert changes made to the box to accomodate editing
				document.querySelector("#dialog-new-assignment h2").innerHTML = "Create an assignment";
				document.querySelector("#new-assignment-form fieldset .form-button").value = "Create";
			}
		}
	}, 300);
}

function toggle_class_overview_tools() {
	var box = document.getElementById("class-options");
	if (box.style.visibility == "hidden") {
		box.style.visibility = "visible";
		box.style.opacity = "1";
	} else {
		destroy_class_overview_tools();
	}
}

function destroy_class_overview_tools() {
	var box = document.getElementById("class-options");
	box.style.opacity = "0";
	setTimeout(function() {
		box.style.visibility = "hidden";
	}, 300);
}

function toggle_feed_item_expansion(feedItem) {
	var item = document.querySelector("#" + feedItem + "-expansion.feed-expansion");
	var arrow = document.querySelector("#" + feedItem + "-expansion.feed-expansion");
	item.classList.toggle("collapsed");
}

function toggle_active(target) {
	target.classList.toggle("active");
}