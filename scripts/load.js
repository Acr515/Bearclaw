// Initializes everything on first boot

// One individual class. Holds a list of assignments and a schedule for meeting times
class Class {
	constructor(number, name, color, startDate, endDate) {
		this.number = number;						// Course #
		this.name = name;							// Name of course
		this.color = color;							// Hexadecimal color for course
		this.startDate = startDate;					// First day of class
		this.endDate = endDate;						// Last day of class
		this.assignments = [];						// Assignments for this course
		this.schedule = new ClassSchedule(this);	// Times and days that the class meets
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
	constructor(myClass) {
		this.myClass = myClass;		// Reference to the Class object that holds this schedule
		this.classDays = [];		// Array of days of the week that classes take place during
		this.classStarts = [];		// Array of times when class begins. NOT A Date OBJECT
		this.classEnds = [];		// Array of times when class ends. ALSO NOT A Date OBJECT
	}
	clear() {
		this.classDays = [];
		this.classStarts = [];
		this.classEnds = [];
	}
	isEmpty() {
		return this.classDays.length == 0;
	}
	addMeetingTime(dayOfTheWeek, startTime, endTime) {
		this.classDays.push(dayOfTheWeek);
		this.classStarts.push(startTime);
		this.classEnds.push(endTime);
	}
	dayOfWeekToString(num) {
		switch (num) {
			case 0:
				return "Sunday";
			case 1:
				return "Monday";
			case 2:
				return "Tuesday";
			case 3:
				return "Wednesday";
			case 4:
				return "Thursday";
			case 5:
				return "Friday";
			case 6:
				return "Saturday";
			default:
				return "???";
		}
	}
	export(startDate, endDate) {
		// Delivers an array of ClassTime instances beginning and ending on specified days
		var classTimes = [];
		for (var day = startDate; day <= endDate; day.setDate(day.getDate() + 1)) {
			for (var inst = 0; inst < this.classDays.length; inst ++) {
				if (this.classDays[inst] == day.getDay()) {
					var localStart, localEnd;
					localStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
					localEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate());
					
					localStart.setHours(this.classStarts[inst].substr(0, 2));
					localStart.setMinutes(this.classStarts[inst].substr(3, 2));
					
					localEnd.setHours(this.classEnds[inst].substr(0, 2));
					localEnd.setMinutes(this.classEnds[inst].substr(3, 2));
					
					classTimes.push(new ClassTime(this.myClass, localStart, localEnd));
				}
			}
		}
		return classTimes;
	}
}

// Anything that would be displayed on the feed that is time-based
class TimeBased {
	constructor() {
		this.day;
		this.type;
	}
	getDay() {
		return this.day;
	}
	getType() {
		return this.type;
	}
}

class ClassTime extends TimeBased {
	constructor(myClass, startTime, endTime) {
		super();
		this.type = "class-period";
		this.myClass = myClass;				// Reference to this class time's Class holder
		this.startTime = startTime;			// A Date object for the time that this class begins
		this.endTime = endTime;				// A Date object for the time that this class ends
	}
	getDay() {
		return this.startTime;
	}
	getReadableTimes() {
		return readable_time(this.startTime) + " - " + readable_time(this.endTime);
	}
}

// One individual assignment. Holds information about due date, descriptions, and holds a Checklist object
class Assignment extends TimeBased {
	constructor(aid, name, dueDate, description, link) {
		super();
		this.type = "assignment";			// Identifies assignments from ClassTime instances
		this.aid = aid;						// Unique ID associated with assignment
		this.name = name;					// Name of assignment
		this.dueDate = dueDate;				// Due date stored in a Date object
		this.description = description;		// Description for the assignment
		this.link = link;					// Applicable link for assignment
		this.checklist = new Checklist();	// List of requisite activities that need to be completed for the assignment
		this.finished = false;				// Whether or not the assignment is complete
	}
	getDay() {
		return this.dueDate;
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