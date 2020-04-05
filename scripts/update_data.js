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

// Prints all relevant information to the class onto the class overview screen (name, assignments, etc.)
function update_class_overview() {
	document.getElementById("class-overview-title").innerHTML = currentClass.getCourseName();
	document.getElementById("class-feed").innerHTML = "";
	
	for (var i = 0; i < currentClass.assignments.length; i ++) {
		var assignment = currentClass.assignments[i];
		
		// Create feed item
		var feedItem = document.createElement("li");
		feedItem.id = "feed-item-" + i;
		feedItem.classList.add("feed-item", "feed-assignment");
		document.getElementById("class-feed").appendChild(feedItem);
		
		// Create completion checkbox
		var checkbox = document.createElement("div");
		checkbox.classList.add("completed-checkbox");
		checkbox.addEventListener("click", function() {
			toggle_assignment_complete(event)
		});
		var input = document.createElement("input");
		input.type = "checkbox";
		input.setAttribute("aid", assignment.getID());
		if (assignment.finished) input.setAttribute("checked", "checked");
		checkbox.appendChild(input);
		checkbox.innerHTML += '<div></div><span>&#10003;</span>';
		feedItem.appendChild(checkbox);
		
		// Create edit button
		// TODO give this button functionality
		var editButton = document.createElement("button");
		editButton.classList.add("form-button", "feed-button");
		feedItem.appendChild(editButton);
		
		// Create assignment name
		var name = document.createElement("h3");
		name.innerHTML = assignment.name + " ";
		var span = document.createElement("span");
		span.setAttribute("aid", assignment.getID());
		span.classList.add("assignment-status");
		/*if (assignment.isLate() && !assignment.finished) {
			span.classList.add("overdue-text");
			span.innerHTML = "(OVERDUE)";
		} else if (assignment.finished) {
			span.classList.add("completion-text");
			span.innerHTML = "(COMPLETE)";
		}*/
		name.appendChild(span);
		feedItem.appendChild(name);
		react_to_assignment_status(assignment, span);
		
		// Create due date
		var due = document.createElement("h4");
		due.innerHTML = "Due " + readable_date_show_time(assignment.dueDate, true);
		feedItem.appendChild(due);
		
		// Create float clearer
		var clearer = document.createElement("div");
		clearer.classList.add("clear-float");
		feedItem.appendChild(clearer);
		
		// Create collapse button
		var collapseButton = document.createElement("button");
		collapseButton.id = "feed-expander-" + i;
		collapseButton.classList.add("expansion-button", "form-button");
		collapseButton.addEventListener("click", collapse_feed_item.bind(null, event, i));
		collapseButton.innerHTML = "&#9207;";
		feedItem.appendChild(collapseButton);
		
		// Now that the first feed item is done, create the SECOND feed item for the correspondent collapsible
		feedItem = document.createElement("li");
		feedItem.classList.add("feed-item", "feed-expansion", "collapsed");
		feedItem.id = "feed-item-" + i + "-expansion";
		document.getElementById("class-feed").appendChild(feedItem);
		
		// Create the parent div container
		var div = document.createElement("div");
		div.classList.add("expansion-container");
		feedItem.appendChild(div);
		
		// Create the checklist
		if (!assignment.checklist.hasNoEntries()) {
			// Develop the checklist if the assignment has one
			var checklistDiv = document.createElement("div");
			checklistDiv.classList.add("assignment-checklist");
			div.appendChild(checklistDiv);
			var header = document.createElement("span");
			header.classList.add("bold");
			header.innerHTML = "Checklist";
			checklistDiv.appendChild(header);
			
			// Begin to create actual list
			var ul = document.createElement("ul");
			for (var i = 0; i < assignment.checklist.list.length; i ++) {
				var li = document.createElement("li");
				ul.appendChild(li);
				
				var label = document.createElement("label");
				label.classList.add("checklist-item");
				label.innerHTML = assignment.checklist.list[i];
				li.appendChild(label);
				
				var input = document.createElement("input");
				input.type = "checkbox";
				label.appendChild(input);
				
				checkbox = document.createElement("span");
				checkbox.classList.add("assignment-checkbox");
				label.appendChild(checkbox);
			}
			checklistDiv.appendChild(ul);
		}
		
		// Create the description
		var description = document.createElement("p");
		if (assignment.description != "") {
			description.classList.add("assignment-description");
			span = document.createElement("span");
			span.classList.add("bold");
			span.innerHTML = "Description: ";
			description.appendChild(span);
			description.innerHTML += assignment.description;
		} else {
			description.classList.add("assignment-description", "italic");
			description.innerHTML = "No description provided.";
		}
		div.appendChild(description);
		
		// Create the link
		if (assignment.link != "") {
			var link = document.createElement("p");
			link.classList.add("assignment-link");
			span = document.createElement("span");
			span.classList.add("bold");
			span.innerHTML = "Link: ";
			link.appendChild(span);
			
			var anchor = document.createElement("a");
			anchor.href = assignment.link;
			anchor.target = "_blank";
			anchor.innerHTML += assignment.link;
			link.appendChild(anchor);
			
			div.appendChild(link);
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