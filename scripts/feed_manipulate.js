// Adds elements to a feed... mostly this file is just making the update_data.js one smaller and less complicated

// Adds a marker for today to the feed
function feed_add_today(feed, id) {
	// Create feed item
	var feedItem = document.createElement("li");
	feedItem.id = "feed-item-" + id;
	feedItem.classList.add("feed-item", "feed-today");
	feed.appendChild(feedItem);
	
	var label = document.createElement("h3");
	label.innerHTML = "Today";
	label.classList.add("feed-today-heading");
	feedItem.appendChild(label);
	return feedItem;
}

// Adds a class period to the feed
function feed_add_class_period(period, feed, id) {
	// Create feed item
	var feedItem = document.createElement("li");
	feedItem.id = "feed-item-" + id;
	feedItem.classList.add("feed-item", "feed-class-period");
	feed.appendChild(feedItem);
	
	// Create hide button
	var hideButton = document.createElement("button");
	hideButton.classList.add("form-button", "feed-button", "hide-button");
	hideButton.addEventListener("click", () => {
		create_hide_class_confirmation(period);
	});
	feedItem.appendChild(hideButton);
	
	// Create edit button
	var editButton = document.createElement("button");
	editButton.classList.add("form-button", "feed-button");
	editButton.addEventListener("click", () => {
		create_edit_period_dialog(period);
	});
	editButton.style.marginRight = "0";
	feedItem.appendChild(editButton);
	
	// Create heading
	var heading = document.createElement("h3");
	heading.innerHTML = "Go to class: " + period.myClass.getCourseName();
	feedItem.appendChild(heading);
	
	// Create time
	var time = document.createElement("h4");
	time.innerHTML = period.getReadableDayAndTimes(true);
	feedItem.appendChild(time);
	
	// Create pretty colored label
	var label = create_color_label(period);
	label.style.bottom = "58px";
	feedItem.appendChild(label);
}

// Adds an assignment to the feed
function feed_add_assignment(assignment, feed, id) {
	// Create feed item
	var feedItem = document.createElement("li");
	feedItem.id = "feed-item-" + id;
	feedItem.classList.add("feed-item", "feed-assignment");
	feed.appendChild(feedItem);

	// Create completion checkbox
	var checkbox = document.createElement("div");
	checkbox.classList.add("completed-checkbox");
	checkbox.addEventListener("click", function() {
		toggle_assignment_complete(event);
	});
	var input = document.createElement("input");
	input.type = "checkbox";
	input.setAttribute("aid", assignment.getID());
	if (assignment.finished) input.setAttribute("checked", "checked");
	checkbox.appendChild(input);
	checkbox.innerHTML += '<div></div><span>&#10003;</span>';
	feedItem.appendChild(checkbox);

	// Create edit button
	var editButton = document.createElement("button");
	editButton.classList.add("form-button", "feed-button");
	editButton.addEventListener("click", () => {
		create_edit_assignment_dialog(assignment);
		currentEditAssignment = assignment;
	});
	feedItem.appendChild(editButton);

	// Create assignment name
	var name = document.createElement("h3");
	name.innerHTML = assignment.name + " ";
	var span = document.createElement("span");
	span.setAttribute("aid", assignment.getID());
	span.classList.add("assignment-status");
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
	collapseButton.id = "feed-expander-" + id;
	collapseButton.classList.add("expansion-button", "form-button");
	collapseButton.addEventListener("click", collapse_feed_item.bind(null, event, id));
	collapseButton.innerHTML = "&#9207;";
	feedItem.appendChild(collapseButton);

	// Create pretty colored label
	feedItem.appendChild(create_color_label(assignment));


	// Now that the first feed item is done, create the SECOND feed item for the correspondent collapsible
	feedItem = document.createElement("li");
	feedItem.classList.add("feed-item", "feed-expansion", "collapsed");
	feedItem.id = "feed-item-" + id + "-expansion";
	feed.appendChild(feedItem);

	// Create the parent div container
	var div = document.createElement("div");
	div.classList.add("expansion-container");
	feedItem.appendChild(div);

	// Create the checklist
	render_checklist(assignment, div);

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

function render_checklist(assignment, parent) {
	// Delete the old checklist
	var oldChecklist = parent.firstChild;
	if (oldChecklist != null && oldChecklist.classList.contains("assignment-checklist")) oldChecklist.remove();
	
	var checklistDiv = document.createElement("div");
	checklistDiv.classList.add("assignment-checklist");
	checklistDiv.setAttribute("aid", assignment.getID());
	parent.insertBefore(checklistDiv, parent.firstChild);
	var header = document.createElement("span");
	header.classList.add("bold");
	header.innerHTML = "Checklist";
	checklistDiv.appendChild(header);

	// Begin to create actual list
	var ul = document.createElement("ul");
	for (var i = 0; i < assignment.checklist.list.length; i ++) {
		var li = document.createElement("li");
		li.addEventListener("mousedown", mouse_down_check_drag);
		li.classList.add("checklist-li");
		li.setAttribute("slot", i);
		li.setAttribute("aid", assignment.getID());
		ul.appendChild(li);

		var kill = document.createElement("span");
		kill.innerHTML = "&#128473;";
		kill.classList.add("checklist-remove-item");
		var remove = function() {
			this.a.checklist.removeEntry(this.id);
			render_checklist(this.a, this.p);
		}.bind({id: i, a: assignment, p: parent});
		kill.addEventListener("click", remove);
		li.appendChild(kill);

		var label = document.createElement("label");
		label.classList.add("checklist-item");
		label.innerHTML = assignment.checklist.list[i];
		li.appendChild(label);

		var input = document.createElement("input");
		var check = function() {
			this.a.checklist.setFinished(this.id, this.i.checked);
		}.bind({id: i, i: input, a: assignment});
		input.addEventListener("change", check);
		input.type = "checkbox";
		input.checked = assignment.checklist.finished[i];
		label.appendChild(input);

		var checkbox = document.createElement("span");
		checkbox.classList.add("assignment-checkbox");
		label.appendChild(checkbox);
	}
	var addEntry = document.createElement("li");
	var addEntryText = document.createElement("span");
	addEntry.appendChild(addEntryText);
	addEntry.classList.add("checklist-li");
	addEntry.setAttribute("slot", -1);
	addEntryText.classList.add("checklist-item", "checklist-add-item");
	addEntryText.innerHTML = "Add item...";
	addEntry.addEventListener("click", () => create_checklist_item_dialog(assignment.getID()));
	ul.appendChild(addEntry);
	checklistDiv.appendChild(ul);
}

function create_color_label(assignment) {
	// Create pretty colored label
	var label = document.createElement("span");
	label.classList.add("number-label-assignment");
	if (assignment.myClass.hasCourseNumber()) label.innerHTML = assignment.myClass.number; else label.innerHTML = assignment.myClass.name;
	let color = assignment.myClass.color;
	label.style.backgroundColor = color;
	let rgb = hexToRgb(color);
	if ((rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 186) label.style.color = "black"; else label.style.color = "white";
	return label;
}