// Scripts for handling the submission of data

function submit_new_class() {
	var form = document.getElementById("new-class-form").elements;
	try {
		if (form.namedItem("class-name").value == "") throw "Your class must have a name.";
		
		if ((form.namedItem("class-start-date").value == "" && form.namedItem("class-end-date").value != "") || (form.namedItem("class-start-date").value != "" && form.namedItem("class-end-date").value == "")) throw "Both or neither of the date fields must be filled.";
		
		var startDate = new Date(form.namedItem("class-start-date").value);
		var endDate = new Date(form.namedItem("class-end-date").value);
		
		if (startDate.getMilliseconds() > endDate.getMilliseconds()) throw "The start date is after the end date.";
		
		// Submit the course to the list
		classes.push(new Class(form.namedItem("class-number").value, form.namedItem("class-name").value, form.namedItem("class-color").value, startDate, endDate));
		
		// Exit the dialog box and update the sidebar list
		update_class_sidebar();
		destroy_dialog("dialog-new-class", true);
	}
	catch(err) {
		document.getElementById("class-form-error").innerHTML = err;
	}
}