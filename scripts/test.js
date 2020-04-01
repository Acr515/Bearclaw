// Tests some visual features of the app

var showDialog = false;

function create_new_class_dialog() {
	if (!showDialog) create_dialog("dialog-new-class");
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

function destroy_dialog(type) {
	showDialog = false;
	var overlay = document.getElementById("app-overlay");
	var box = document.getElementById(type);
	
	box.style.opacity = "0";
	overlay.style.opacity = "0";
	setTimeout(function() {
		box.style.display = "none";
		overlay.style.display = "none";
	}, 300);
}