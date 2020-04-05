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

// Searches an array of assignments for an ID
function find_assignment_by_id(assignments, id) {
	for (var i = 0; i < assignments.length; i ++) {
		if (assignments[i].getID() == id) return assignments[i];
	}
	return null;
}