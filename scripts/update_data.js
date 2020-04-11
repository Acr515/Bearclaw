// Functions for updating various interfaces with new data

function update_class_sidebar() {
	if (classes.length > 0) {
		// Remove warning if it still exists
		if (document.getElementById("no-classes-warning") !== null) document.getElementById("classes-sidebar-list").removeChild(document.getElementById("no-classes-warning"));
		
		// Remove any existing classes from the list
		document.querySelector("#classes-sidebar-list ul").innerHTML = "";
		
		// Add all classes to the list
		for (var i = 0; i < classes.length; i ++) {
			var course = classes[i];
			var item = document.createElement("li");
			var color = document.createElement("span");

			color.classList.add("class-color");
			color.style.backgroundColor = course.color;

			item.appendChild(color);
			item.innerHTML += course.getCourseName();
			item.addEventListener("click", check_out_class.bind(null, course));

			document.querySelector("#classes-sidebar-list ul").appendChild(item);
		}
	} else {
		document.getElementById("classes-sidebar-list").innerHTML = "<ul></ul><p id='no-classes-warning' style='text-align: center'>You do not have any courses yet.</p>";
	}
}

// Prints all relevant information to the class onto the class overview screen (name, assignments, schedule, etc.)
function update_class_overview() {
	document.getElementById("class-overview-title").innerHTML = currentClass.getCourseName();
	document.getElementById("class-feed").innerHTML = "";
	
	// Compile and sort all relevant elements
	var elements = currentClass.assignments.concat(currentClass.schedule.classTimes);
	sort_time_based_instances(elements);
	
	for (var i = 0; i < elements.length; i ++) {
		var element = elements[i];
		if (element.getType() == "assignment") {
			feed_add_assignment(elements[i], document.getElementById("class-feed"), i);
		} else if (element.getType() == "class-period") {
			if (!element.hidden) feed_add_class_period(elements[i], document.getElementById("class-feed"), i);
		}
	}
}

// This short function is the event handler for clicking the collapse button
function collapse_feed_item(event, id) {
	toggle_active(document.getElementById('feed-expander-' + id));
	toggle_feed_item_expansion('feed-item-' + id); 
}

// Pulls up a course on the main view
function check_out_class(course) {
	currentClass = course;
	currentView = 2;
	update_class_overview();
}

// Converts hex color to RGB
function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}