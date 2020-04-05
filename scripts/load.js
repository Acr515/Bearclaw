// Initializes everything on first boot

// One individual class. Holds a list of assignments and a schedule for meeting times
class Class {
	constructor(number, name, color, startDate, endDate) {
		this.number = number;				// Course #
		this.name = name;					// Name of course
		this.color = color;					// Hexadecimal color for course
		this.startDate = startDate;			// First day of class
		this.endDate = endDate;				// Last day of class
		this.assignments = [];				// Assignments for this course
		this.schedule = new ClassSchedule();// Times and days that the class meets
	}
	getCourseName() {
		if (this.number != "") return this.number + " - " + this.name; else return this.name;
	}
	addAssignment(a) {
		this.assignments.push(a);
	}
	deleteAssignment(slot) {
		this.assignments.splice(slot, 1);
	}
}

// Holds meeting times for a Class object
class ClassSchedule {
	constructor() {
		this.classDays = [];	// Array of days of the week that classes take place during
		this.classStarts = [];	// Array of times when class begins
		this.classEnds = [];	// Array of times when class ends
	}
	addMeetingTime(dayOfTheWeek, startTime, endTime) {
		this.classDays.push(dayOfTheWeek);
		this.classStarts.push(startTime);
		this.classEnds.push(endTime);
	}
}

// One individual assignment. Holds information about due date, descriptions, and holds a Checklist object
class Assignment {
	constructor(aid, name, dueDate, description, link) {
		this.aid = aid;
		this.name = name;					// Name of assignment
		this.dueDate = dueDate;				// Due date stored in a Date object
		this.description = description;		// Description for the assignment
		this.link = link;					// Applicable link for assignment
		this.checklist = new Checklist();	// List of requisite activities that need to be completed for the assignment
		this.finished = false;				// Whether or not the assignment is complete
	}
	isLate() {
		var current = new Date();
		if (current > this.dueDate) return true; else return false;
	}
	isWithinOneDay() {
		var current = new Date();
		current.setDate(current.getDate() + 1);
		if (current > this.dueDate && !this.isLate()) return true; else return false;
	}
	getID() {
		return this.aid;
	}
}

// A Checklist of activites to complete for an Assignment object
class Checklist {
	constructor() {
		this.list = [];
		this.finished = [];
	}
	addEntry(description) {
		this.list.push(description);
		this.finished.push(false);
	}
	removeEntry(slot) {
		this.list.splice(slot, 1);
		this.finished.splice(slot, 1);
	}
	hasNoEntries() {
		return this.list.length == 0;
	}
}

var classes = [];				// List of all classes, stems out further with all assignments, checklists, and schedules
var currentClass = undefined;	// The current class object that is being focused on, if any
var currentView = 0;			// The current view (0 = overview feed, 1 = calendar view, 2 = specific class view)

document.getElementById("class-options").style.visibility = "hidden";	// Workaround

// Load data from localStorage
if (localStorage.classes !== undefined && localStorage.classes != "") {
	classes = JSON.parse(localStorage.classes);
} else {
	localStorage.classes = "";
}

// First-time renders of sidebar, others
update_class_sidebar();