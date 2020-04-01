// Functions for updating various interfaces with new data

function update_class_sidebar() {
	if (classes.length > 0) {
		// Remove warning if it still exists
		if (document.getElementById("no-classes-warning") !== null) document.getElementById("classes-sidebar-list").removeChild(document.getElementById("no-classes-warning"));
		
		// Remove any existing classes from the list
		/*for (var i = 0; i < document.querySelector("#classes-sidebar-list ul").childNodes.length; i ++) {
			document.querySelector("#classes-sidebar-list ul").removeChild(document.querySelector("#classes-sidebar-list ul").childNodes[i]);
		}*/
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
			//item.addEventListener("click", check_out_class(course));

			document.querySelector("#classes-sidebar-list ul").appendChild(item);
		}
	} else {
		document.getElementById("classes-sidebar-list").innerHTML = "<ul></ul><p id='no-classes-warning' style='text-align: center'>You do not have any courses yet.</p>";
	}
}

// Prints all relevant information to the class onto the class overview screen (name, assignments, etc.)
function update_class_overview() {
	
}

// Pulls up a course on the main view
function check_out_class(course) {
	currentClass = course;
	currentView = 2;
}