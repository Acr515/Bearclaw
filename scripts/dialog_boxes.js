// Tests some visual features of the app

var showDialog = false;

function create_new_class_dialog() {
	if (!showDialog) create_dialog("dialog-new-class");
}

function create_new_assignment_dialog() {
	if (!showDialog) create_dialog("dialog-new-assignment");
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
			}
		}
	}, 300);
}