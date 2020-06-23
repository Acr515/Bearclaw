// Scripts for handling the submission of data

function submit_new_class() {
	var form = document.getElementById("new-class-form").elements;
	var isEditing = document.querySelector("#dialog-new-class h2").innerHTML == "Edit a class";
	try {
		if (form.namedItem("class-name").value == "") throw "Your class must have a name.";
		
		if ((form.namedItem("class-start-date").value == "" && form.namedItem("class-end-date").value != "") || (form.namedItem("class-start-date").value != "" && form.namedItem("class-end-date").value == "")) throw "Both or neither of the date fields must be filled.";
		
		var startDate = new Date(form.namedItem("class-start-date").value);
		var endDate = new Date(form.namedItem("class-end-date").value);
		convert_to_local_timezone(startDate);
		convert_to_local_timezone(endDate);
		endDate.setHours(23);
		endDate.setMinutes(59);
		
		if (form.namedItem("class-start-date").value == "") {
			startDate = null;
			endDate = null;
		}
		
		if (startDate > endDate) throw "The start date is after the end date.";
		
		// Submit the course to the list
		if (!isEditing) classes.push(new Class(form.namedItem("class-number").value, form.namedItem("class-name").value, form.namedItem("class-color").value, startDate, endDate)); else {
			currentClass.number = form.namedItem("class-number").value;
			currentClass.name = form.namedItem("class-name").value;
			currentClass.color = form.namedItem("class-color").value;
			currentClass.startDate = startDate;
			currentClass.endDate = endDate;
		}
		
		// Exit the dialog box and update the sidebar list
		update_class_sidebar();
		if (isEditing) update_class_overview();
		destroy_dialog("dialog-new-class", true);
	}
	catch(err) {
		document.getElementById("class-form-error").innerHTML = err;
	}
}

function submit_new_assignment() {
	var form = document.getElementById("new-assignment-form").elements;
	var isEditing = document.querySelector("#dialog-new-assignment h2").innerHTML == "Edit an assignment";
	try {
		if (isEditing && currentEditAssignment === undefined) throw "Something went wrong when trying to edit your assignment. Please close this dialog box and try again.";
		if (form.namedItem("assignment-name").value == "") throw "Your assignment must have a name.";
		if (form.namedItem("assignment-due-date").value == "") throw "Your assignment must have a due date.";
		
		var dueDate = new Date(form.namedItem("assignment-due-date").value);
		convert_to_local_timezone(dueDate);
		var time = form.namedItem("assignment-due-time").value;
		dueDate.setHours(time.substr(0, 2));
		dueDate.setMinutes(time.substr(3, 2));

		// Submit the assignment to the class object
		if (!isEditing) currentClass.addAssignment(new Assignment(generateID(), form.namedItem("assignment-name").value, dueDate, form.namedItem("assignment-description").value, form.namedItem("assignment-link").value, currentClass)); else {
			currentEditAssignment.name = form.namedItem("assignment-name").value;
			currentEditAssignment.dueDate = dueDate;
			currentEditAssignment.link = form.namedItem("assignment-link").value;
			currentEditAssignment.description = form.namedItem("assignment-description").value;
		}
		
		// Exit the dialog box, sort the new feed, and update the feed
		sort_class_assignments(currentClass.assignments);
		update_class_overview();
		destroy_dialog("dialog-new-assignment", true);
	}
	catch(err) {
		document.getElementById("assignment-form-error").innerHTML = err;
	}
}

function submit_schedule() {
	var form = document.getElementById("schedule-form").elements;
	try {
		// Validate each entry on the list
		var units = document.getElementsByClassName("schedule-unit");
		for (var i = 0; i < units.length; i ++) {
			var thisid = units[i].getAttribute("myid");
			var startTime = form.namedItem("start-time-" + thisid).value;
			var endTime = form.namedItem("end-time-" + thisid).value;
			if (startTime == "" && endTime == "" && form.namedItem("day-" + thisid).value == "" && units.length == 1) {
				// User is deleting their schedule
				currentClass.schedule.clear();
				currentClass.schedule.deleteAll();
				update_class_overview();
				destroy_dialog('dialog-schedule', true);
				return;
			} 
			if (startTime == "" || endTime == "") throw "One of your times is blank.";
			if (form.namedItem("day-" + thisid).value == "") throw "One of your days did not get filled out.";
			if (startTime > endTime) throw "One of your start times is after its end time.";
		}
		
		// All valid, good to proceed
		currentClass.schedule.clear();
		for (var i = 0; i < units.length; i ++) {
			var thisid = units[i].getAttribute("myid");
			var startTime = form.namedItem("start-time-" + thisid).value;
			var endTime = form.namedItem("end-time-" + thisid).value;
			currentClass.schedule.addMeetingTime(Number(form.namedItem("day-" + thisid).value), startTime, endTime);
		}
		currentClass.schedule.export(currentClass.startDate, currentClass.endDate);
		
		update_class_overview();
		destroy_dialog('dialog-schedule', true);
	}
	catch(err) {
		document.getElementById("schedule-form-error").innerHTML = err;
	}
}

// Deletes a class from memory
function delete_class(course) {
	if (currentClass == course) currentClass = undefined;
	classes.splice(classes.indexOf(course), 1);
	update_class_sidebar();
}

// Sets an assignment complete or incomplete based on the value of its checkbox. Updates the feed with completion information
function toggle_assignment_complete(event) {
	var assignment = find_assignment_by_id(event.target.getAttribute("aid"));
	assignment.finished = event.target.checked;
	react_to_assignment_status(assignment, null);
}

// Adds a checklist item to an assignment
function submit_checklist_item(event) {
	try {
		var assignment = null;
		assignment = find_assignment_by_id(event.target.parentElement.parentElement.getAttribute("aid"));
		if (assignment == null) {
			throw "For some reason, the assignment wasn't found. Refresh the window and try again.";
		}
		if (document.getElementById("input-checklist-name").value == "") {
			throw "Your checklist item cannot be empty.";
		}
		assignment.checklist.addEntry(document.getElementById("input-checklist-name").value);
		// Locate the right checklist element to update
		var thisChecklist = null;
		var allChecklists = document.querySelectorAll(".assignment-checklist");
		for (var i = 0; i < allChecklists.length; i ++) {
			if (allChecklists[i].getAttribute("aid") == assignment.getID()) thisChecklist = allChecklists[i];
		}
		render_checklist(assignment, thisChecklist.parentElement);
		destroy_dialog("dialog-checklist", true);
	}
	catch (err) {
		document.getElementById("checklist-form-error").innerHTML = err;
	}
}

// If an assignment is overdue, changes feed prompt. Overriden if assignment is completed
function react_to_assignment_status(assignment, span) {
	// Locate span element if necessary
	if (span == null) {
		var allSpans = document.querySelectorAll("span.assignment-status");
		for (var i = 0; i < allSpans.length; i ++) {
			if (allSpans[i].getAttribute("aid") == assignment.getID()) span = allSpans[i];
		}
	}
	
	if (assignment.isLate() && !assignment.finished) {
		// OVERDUE
		span.classList.add("overdue-text");
		span.classList.remove("completion-text");
		span.classList.remove("near-due-text");
		span.innerHTML = "(OVERDUE)";
	} else if (assignment.isWithinOneDay() && !assignment.finished) {
		// DUE SOON
		span.classList.remove("overdue-text");
		span.classList.remove("completion-text");
		span.classList.add("near-due-text");
		span.innerHTML = "(DUE SOON)";
	} else if (assignment.finished) {
		// COMPLETE
		span.classList.remove("overdue-text");
		span.classList.add("completion-text");
		span.classList.remove("near-due-text");
		span.innerHTML = "(COMPLETE)";
	} else {
		// Erase contents
		span.classList.remove("overdue-text");
		span.classList.remove("completion-text");
		span.classList.remove("near-due-text");
		span.innerHTML = "";
	}
}

// Generates a string ID of random characters 12 long beginning with an A
function generateID() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return "A" + S4() + S4() + S4();
}