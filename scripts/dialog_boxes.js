// Tests some visual features of the app

var showDialog = false;

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
		
		data.namedItem("class-start-date").value = course.startDate.getYear() + "-" + sdMonth + "-" + sdDate;
		data.namedItem("class-end-date").value = course.endDate.getYear() + "-" + edMonth + "-" + edDate;
		
		create_dialog("dialog-new-class");
	}
}

function create_new_assignment_dialog() {
	if (!showDialog) create_dialog("dialog-new-assignment");
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
		overlay.style.opacity = "1";
	}, 50);
}

function destroy_dialog(type, clearFormControls) {
	showDialog = false;
	var overlay = document.getElementById("app-overlay");
	var box = document.getElementById(type);
	
	box.style.opacity = "0";
	overlay.style.opacity = "0";
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

function toggle_active(e) {
	e.target.classList.toggle("active");
}