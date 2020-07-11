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
		document.getElementById("classes-sidebar-list").innerHTML = "<ul></ul><p id='no-classes-warning' style='text-align: center'>You do not have any courses yet. Press the + to get started!</p>";
	}
}

// Runs an update depending on what mode that the view is in
function update(scrollPos) {
	// TODO scrollPos should be used to send the scroll position to the item that just got changed if applicable
	if (currentView == 0) update_full_overview(); else if (currentView == 2) update_class_overview();
}

// Flushes the contents of every view
function flush_feeds() {
	document.getElementById("class-feed").innerHTML = "";
	document.getElementById("full-feed").innerHTML = "";
}

// Prints all relevant information to the class onto the class overview screen (name, assignments, schedule, etc.)
function update_class_overview() {
	flush_feeds();
	document.getElementById("class-overview-title").innerHTML = currentClass.getCourseName();
	document.getElementById("class-feed").scrollTop = 0;

	var elements = currentClass.assignments.concat(currentClass.schedule.classTimes);
	var today = populate_feed(document.getElementById("class-feed"), elements);
	
	document.getElementById("class-overview").scrollTop = Math.max(0, today.offsetTop - (window.innerHeight / 2));
}

// Prints feed items from every class onto the full overview screen (assignments, scheduling, etc.)
function update_full_overview() {
	flush_feeds();
	document.getElementById("full-feed").scrollTop = 0;
	
	var elements = [];
	for (var i = 0; i < classes.length; i ++) {
		elements = elements.concat(classes[i].assignments.concat(classes[i].schedule.classTimes));
	}
	populate_feed(document.getElementById("full-feed"), elements);
}

// Populates an element with an array of feed items and returns the today element if it needs to be used
function populate_feed(feed, elements) {
	elements.push({
		getType: function() {
			return "today";
		},
		getDay: function() {
			return new Date();
		}
	});
	sort_time_based_instances(elements);
	
	var today = undefined;
	for (var i = 0; i < elements.length; i ++) {
		var element = elements[i];
		if (element.getType() == "assignment") {
			feed_add_assignment(elements[i], feed, i);
		} else if (element.getType() == "class-period") {
			if (!element.hidden) feed_add_class_period(elements[i], feed, i);
		} else if (element.getType() == "today") {
			today = feed_add_today(feed, i);
		}
	}
	return today;
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
	document.getElementById("class-overview").style.display = "block";
	document.getElementById("full-overview").style.display = "none";
	update();
}

// Goes back to full feed
function check_out_full_feed() {
	currentClass = undefined;
	currentView = 0;
	document.getElementById("class-overview").style.display = "none";
	document.getElementById("full-overview").style.display = "block";
	update();
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

// Opens up the settings menu
function settings() {
	document.getElementById("class-overview").style.display = "none";
	document.getElementById("full-overview").style.display = "none";
	document.getElementById("settings").style.display = "block";
	settings_switch_tab("general");
	populate_settings();
}

// Switches settings tabs
function settings_switch_tab(tab) {
	document.getElementById("settings-content-general").style.display = (tab == "general" ? "block" : "none");
	document.getElementById("settings-content-about").style.display = (tab == "about" ? "block" : "none");
	document.getElementById("settings-content-theme").style.display = (tab == "theme" ? "block" : "none");
	
	document.getElementById("settings-tab-general").classList.remove("tab-open");
	document.getElementById("settings-tab-about").classList.remove("tab-open");
	document.getElementById("settings-tab-theme").classList.remove("tab-open");
	document.getElementById("settings-tab-" + tab).classList.add("tab-open");
}

// Flips a settings switch
function settings_flip_switch(e) {
	e.target.classList.toggle("on");
	if (e.target.classList.contains("switch-container")) e.target.firstElementChild.classList.toggle("on"); else e.target.parentElement.classList.toggle("on");
	save_settings();
}

// Leaves the settings menu using the back button
function leave_settings() {
	save_settings();
	document.getElementById("class-overview").style.display = "none";
	document.getElementById("full-overview").style.display = "block";
	document.getElementById("settings").style.display = "none";
}

// Write to options variable and save data
function save_settings() {
	var form = document.getElementById("settings-form-general").querySelectorAll(".input-float-right, div.switch-container");
	for (var i = 0; i < form.length; i ++) {
		let elm = form[i];
		if (elm.classList.contains("switch-container")) {
			options[elm.getAttribute("name")] = elm.classList.contains("on");
		} else {
			options[elm.getAttribute("name")] = elm.value;
		}
	}
	save_options();
}

// Populates settings field with settings data
function populate_settings() {
	var form = document.getElementById("settings-form-general").querySelectorAll(".input-float-right, div.switch-container");
	for (var i = 0; i < form.length; i ++) {
		let elm = form[i];
		if (elm.classList.contains("switch-container")) {
			if (options[elm.getAttribute("name")]) {
				elm.classList.add("on"); 
				elm.firstElementChild.classList.add("on");
			} else {
				elm.classList.remove("on");
				elm.firstElementChild.classList.remove("on");
			}
		} else {
			elm.value = options[elm.getAttribute("name")];
		}
	}
}