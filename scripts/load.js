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
		this.jsClassName = "Class";
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
	hasDateRange() {
		return !(this.startDate == null || this.endDate == null);
	}
	hasCourseNumber() {
		return this.number != "";
	}
}

// Holds meeting times for a Class object
class ClassSchedule {
	constructor(myClass) {
		this.myClass = myClass;		// Reference to the Class object that holds this schedule
		this.classDays = [];		// Array of days of the week that classes take place during
		this.classStarts = [];		// Array of times when class begins. NOT A Date OBJECT
		this.classEnds = [];		// Array of times when class ends. ALSO NOT A Date OBJECT
		this.classTimes = [];		// Array of ClassTime objects created by export() method
		this.jsClassName = "ClassSchedule";
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
	// Run this when something in the schedule is changed
	export(startDate, endDate) {
		// Delivers an array of ClassTime instances beginning and ending on specified days
		var refStartDate = new Date(startDate);
		var referenceList = [];
		for (var day = refStartDate; day <= endDate; day.setDate(day.getDate() + 1)) {
			for (var inst = 0; inst < this.classDays.length; inst ++) {
				if (this.classDays[inst] == day.getDay()) {
					// Create new event
					var localStart, localEnd;
					localStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
					localEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate());
					
					localStart.setHours(this.classStarts[inst].substr(0, 2));
					localStart.setMinutes(this.classStarts[inst].substr(3, 2));
					
					localEnd.setHours(this.classEnds[inst].substr(0, 2));
					localEnd.setMinutes(this.classEnds[inst].substr(3, 2));
					
					referenceList.push(new ClassTime(this.myClass, localStart, localEnd));
				}
			}
		}
		// Delete anything from the original list that wasn't modified or hidden
		var markForDeletion = [];
		for (var inst = 0; inst < this.classTimes.length; inst ++) {
			if (!this.classTimes[inst].hidden && !this.classTimes[inst].modified) markForDeletion.push(inst);
		}
		for (var inst = 0; inst < referenceList.length; inst ++) {
			if (markForDeletion.indexOf(inst) != -1) this.classTimes.splice(inst, 1);
		}
		// Delete anything from the new list if it matches the day of a modified or hidden day
		markForDeletion = [];
		for (var inst = 0; inst < referenceList.length; inst ++) {
			for (var checkDay = 0; checkDay < this.classTimes.length; checkDay ++) {
				if (!identical_date(this.classTimes[checkDay].getDay(), referenceList[inst].getDay())) markForDeletion.push(inst);
			}
		}
		for (var inst = 0; inst < referenceList.length; inst ++) {
			if (markForDeletion.indexOf(inst) != -1) referenceList.splice(inst, 1);
		}
		// Delete anything from the original list that was hidden
		for (var inst = 0; inst < this.classTimes.length; inst ++) {
			if (this.classTimes[inst].hidden) this.classTimes.splice(inst, 1);
		}
		// Concatenate arrays
		this.classTimes = this.classTimes.concat(referenceList);
	}
	deleteAll() {
		this.classTimes = [];
	}
}

// Anything that would be displayed on the feed that is time-based
class TimeBased {
	constructor() {
		this.day;
		this.type;
		this.jsClassName = "TimeBased";
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
		this.hidden = false;				// Whether or not the user has opted to hide this time (i.e. for a break, cancelled class)
		this.modified = false;				// Whether or not the user has manually adjusted the time on this specific class date
		this.link = "";						// A link for a web meeting to associate with this class period
		this.jsClassName = "ClassTime";
	}
	getClassName() {
		return "ClassTime";
	}
	getDay() {
		return this.startTime;
	}
	getReadableTimes() {
		return readable_time(this.startTime) + " - " + readable_time(this.endTime);
	}
	getReadableDayAndTimes(showToday) {
		return readable_date(this.startTime, showToday) + ", " + this.getReadableTimes();
	}
	changeTimes(newStartTime, newEndTime) {
		this.startTime = newStartTime;
		this.endTime = newEndTime;
		this.modified = true;
	}
}

// One individual assignment. Holds information about due date, descriptions, and holds a Checklist object
class Assignment extends TimeBased {
	constructor(aid, name, dueDate, description, link, myClass) {
		super();
		this.type = "assignment";			// Identifies assignments from ClassTime instances
		this.aid = aid;						// Unique ID associated with assignment
		this.name = name;					// Name of assignment
		this.dueDate = dueDate;				// Due date stored in a Date object
		this.description = description;		// Description for the assignment
		this.link = link;					// Applicable link for assignment
		this.checklist = new Checklist();	// List of requisite activities that need to be completed for the assignment
		this.finished = false;				// Whether or not the assignment is complete
		this.myClass = myClass;				// Reference to this assignment's Class object
		this.jsClassName = "Assignment";
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
		this.jsClassName = "Checklist";
	}
	setFinished(slot, val) {
		this.finished[slot] = val;
	}
	addEntry(description) {
		this.list.push(description);
		this.finished.push(false);
	}
	removeEntry(slot) {
		this.list.splice(slot, 1);
		this.finished.splice(slot, 1);
	}
	reorderEntry(slot, newSlot) {
		var tempItem = this.list.splice(slot, 1);
		var tempBool = this.finished.splice(slot, 1);

		if (newSlot == this.list.length + 1) {
			this.list.push(tempItem);
			this.finished.push(tempBool);
		} else {
			if (slot <= newSlot) newSlot --;	// fixes problem with array size changing on splices
			this.list.splice(newSlot, 0, tempItem);
			this.finished.splice(newSlot, 0, tempBool);
		}
	}
	hasNoEntries() {
		return this.list.length == 0;
	}
}

// Assigns a class object from a JSON parse its methods in order to be used as a class object again
function set_protos(obj) {
	if (typeof obj !== 'object' || obj === null) return;
	if (Object.keys(obj).length > 0) for (var key in obj) {
		if (typeof obj[key] === 'object') {
			set_protos(obj[key]);
		} else if (typeof obj[key] === 'string' && isIsoDate(obj[key])) {
			obj[key] = new Date(obj[key]);
		}
	}
	if (obj.jsClassName !== undefined) obj.__proto__ = (new (get_class_from_string(obj.jsClassName))).__proto__;
	return;
}

// Returns a class from a string in order to reconstruct an object's methods
function get_class_from_string(str) {
	switch (str) {
		case "Class": return Class;
		case "ClassSchedule": return ClassSchedule;
		case "TimeBased": return TimeBased;
		case "ClassTime": return ClassTime;
		case "Assignment": return Assignment;
		case "Checklist": return Checklist;
		default: return null;
	}
}

// Checks if a value is a date
function isIsoDate(str) {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false; else return true;
}

// Reconstructs objects and loads them into memory
function load_data() {
	classes = JSON.parse(localStorage.classes);
	set_protos(classes[0]);
	setTimeout(function() {reconstruct_data();}, 100);
}

// Deconstructs objects and saves them into memory
function save_data() {
	deconstruct_data();
	localStorage.classes = JSON.stringify(classes);
	reconstruct_data();
}

// Deconstructs the classes object tree, stripping its children of references to its various parents
function deconstruct_data() {
	for (var i = 0; i < classes.length; i ++) {
		let c = classes[i];
		c.schedule.myClass = {};
		for (var j = 0; j < c.schedule.classTimes.length; j ++) {
			c.schedule.classTimes[j].myClass = {};
		}
		for (var j = 0; j < c.assignments.length; j ++) {
			c.assignments[j].myClass = {};
		}
	}
}

// Reconstructs the classes object tree, giving its children references to its parent classes
function reconstruct_data() {
	for (var i = 0; i < classes.length; i ++) {
		let c = classes[i];
		c.schedule.myClass = c;
		for (var j = 0; j < c.schedule.classTimes.length; j ++) {
			c.schedule.classTimes[j].myClass = c;
		}
		for (var j = 0; j < c.assignments.length; j ++) {
			c.assignments[j].myClass = c;
		}
	}
}


var classes = [];						// List of all classes, stems out further with all assignments, checklists, and schedules
var currentClass = undefined;			// The current class object that is being focused on, if any
var currentEditAssignment = undefined;	// A reference to the current assignment that is being edited, if any
var currentEditPeriod = undefined;		// A reference to the current class period that is being edited, if any
var currentView = 0;					// The current view (0 = overview feed, 1 = calendar view, 2 = specific class view)

document.getElementById("class-options").style.visibility = "hidden";	// Workaround
document.getElementById("input-checklist-name").addEventListener("keyup", function(event) {
	if (event.keyCode == 13) {
		document.getElementById("new-checklist-submit").click();
	}
});

// Load data from localStorage
if (localStorage.classes !== undefined && localStorage.classes != "") {
	load_data();
	set_protos(classes);
} else {
	localStorage.classes = "";
}

// First-time renders of sidebar, others
setTimeout(function() {
	update_class_sidebar();
}, 250);