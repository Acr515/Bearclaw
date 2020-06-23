// Sorts, searches, and concatenates various arrays of information

// Sorts an array of assignments by due date
function sort_class_assignments(assignments) {
	assignments.sort(function(a, b){
		if (a.dueDate < b.dueDate) return -1;
			else if (a.dueDate > b.dueDate) return 1;
		else {
			if (a.name < b.name) return -1;
			else return 1;
		}
	});
}

// Sorts an array of TimeBased instances by their Date object values
function sort_time_based_instances(array) {
	array.sort(function(a, b){
		if (a.getDay() < b.getDay()) return -1;
			else if (a.getDay() > b.getDay()) return 1;
		else {
			// Tiebreakers
			if (a.getType() == "today") return -1;
			if (b.getType() == "today") return -1;
			if (a.getType() == "assignment" && b.getType() == "class-period") return -1;
			else if (a.getType() == "class-period" && b.getType() == "assignment") return 1;
			else if (a.getType() == "assignment" && b.getType() == "assignment") {
				if (a.name < b.name) return -1;
				else return 1;
			}
			else return -1;
		}
	});
}

// Searches an array of assignments for an ID, OR searches all assignments if an array is not given
function find_assignment_by_id(assignments, id) {
	if (id === undefined) {
		id = assignments;
		assignments = [];
		// Concatenate all assignment arrays for all classes
		for (var i = 0; i < classes.length; i ++) {
			assignments = assignments.concat(classes[i].assignments);
		}
	}
	for (var i = 0; i < assignments.length; i ++) {
		if (assignments[i].getID() == id) return assignments[i];
	}
	return null;
}

// Checks if two Date objects hold the same day and time
function identical_date_time(date1, date2) {
	return !(date1 > date2 || date1 < date2);
}

// Checks if two Date objects hold the same day, insensitive to time
function identical_date(date1, date2) {
	return (date1.getDate() == date2.getDate() && date1.getMonth() == date2.getMonth() && date1.getFullYear() == date2.getFullYear());
}