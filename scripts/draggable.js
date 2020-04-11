// Code and necessary event listeners for dragging and dropping things

var elm = null;
var boundingBoxes = {
	boxes: [],
	absolute_top: window.outerHeight,
	absolute_bottom: 0,
	absolute_left: window.outerWidth,
	absolute_right: 0
};

// Event handler for when the mouse is pressed down on an object
var mouse_down_check_drag = function(e) {
	e.target.addEventListener("mouseup", mouse_up_cancel_drag);
	e.target.addEventListener("mouseout", mouse_out_begin_drag);
}

// Event handler for when the mouse is lifted up on an object, cancelling the drag
var mouse_up_cancel_drag = function(e) {
	e.target.removeEventListener("mouseup", mouse_up_cancel_drag);
	e.target.removeEventListener("mouseout", mouse_out_begin_drag);
}

// Event handler for when the mouse leaves an object, beginning the drag
var mouse_out_begin_drag = function(e) {
	elm = e.target;
	if (elm.tagName == "LABEL") {	// this is a checklist label, so move the li instead of defaulting to the label element
		elm = e.target.parentNode;
		e.target.removeEventListener("mouseup", mouse_up_cancel_drag);
		e.target.removeEventListener("mouseout", mouse_out_begin_drag);
	} else if (elm.tagName == "INPUT") { // this is a sneaky little invisible bastard input item, so move the li instead of defaulting to the checkbox element
		elm = e.target.parentNode.parentNode;
		e.target.removeEventListener("mouseup", mouse_up_cancel_drag);
		e.target.removeEventListener("mouseout", mouse_out_begin_drag);
	}
	elm.removeEventListener("mouseup", mouse_up_cancel_drag);
	elm.removeEventListener("mouseout", mouse_out_begin_drag);
	
	elm.style.width = elm.scrollWidth + "px";
	elm.classList.add("transit");
	elm.style.top = (e.pageY - (elm.scrollHeight / 2)) + "px";
	elm.style.left = (e.pageX - (elm.scrollWidth / 2)) + "px";
	document.addEventListener("mousemove", mouse_move_adjust_position);
	elm.addEventListener("mouseup", mouse_up_end_dragging);
	
	// Calculate bounding box boundaries for all elements EXCEPT this one and dump them into boundingBoxes array
	var allElements = document.getElementsByClassName("checklist-li");
	var someElements = [];
	for (var i = 0; i < allElements.length; i ++) {
		if (!allElements[i].classList.contains("transit")) someElements.push(allElements[i]);
	}
	for (var i = 0; i < someElements.length; i ++) {
		var rect = someElements[i].getBoundingClientRect();
		boundingBoxes.boxes.push({
			top: rect.top,
			right: rect.right,
			left: rect.left,
			bottom: rect.bottom,
			element: someElements[i],
			style: someElements[i].style
		});
		if (rect.top < boundingBoxes.absolute_top) boundingBoxes.absolute_top = rect.top;
		if (rect.bottom > boundingBoxes.absolute_bottom) boundingBoxes.absolute_bottom = rect.bottom;
		if (rect.left < boundingBoxes.absolute_left) boundingBoxes.absolute_left = rect.left;
		if (rect.right > boundingBoxes.absolute_right) boundingBoxes.absolute_right = rect.right;
	}
}

// Event handler for adjusting the position of the element during the move
var mouse_move_adjust_position = function(e) {
	elm.classList.add("transit");
	elm.style.top = (e.pageY - (elm.scrollHeight / 2)) + "px";
	elm.style.left = (e.pageX - (elm.scrollWidth / 2)) + "px";
	
	// Move elements that are being hovered over
	var collision = check_mouse_inside_bounding_boxes(e.pageX, e.pageY);
	for (var i = 0; i < boundingBoxes.boxes.length; i ++) {
		if (boundingBoxes.boxes[i].element == collision) {
			collision.style.paddingTop = elm.scrollHeight + "px";
		} else {
			boundingBoxes.boxes[i].style.paddingTop = '';
		}
	}
}

// Event handler for when the mouse is lifted up while an object is being dragged, ending the drag
var mouse_up_end_dragging = function(e) {
	elm.classList.remove("transit");
	elm.style.width = '';
	elm.style.top = '';
	elm.style.left = '';
	document.removeEventListener("mousemove", mouse_move_adjust_position);
	elm.removeEventListener("mouseup", mouse_up_end_dragging);
	
	// Process input accordingly to the type of dragging that's taking place here
	move_checklist_item(elm, check_mouse_inside_bounding_boxes(e.pageX, e.pageY));
	
	// Reset everything
	elm = null;
	boundingBoxes = {
		boxes: [],
		absolute_top: window.outerHeight,
		absolute_bottom: 0,
		absolute_left: window.outerWidth,
		absolute_right: 0
	};
}

// Returns the element that the mouse is inside of
function check_mouse_inside_bounding_boxes(x, y) {
	if (x > boundingBoxes.absolute_right || x < boundingBoxes.absolute_left) return null;
	if (y < boundingBoxes.absolute_top || y > boundingBoxes.absolute_bottom) return null;
	
	// Mouse is within possible range, test each bounding box
	const boxes = boundingBoxes.boxes;
	for (var i = 0; i < boxes.length; i ++) {
		if (x < boxes[i].right && x > boxes[i].left && y > boxes[i].top && y < boxes[i].bottom) return boxes[i].element;
	}
	return null;
}

// Processing for moving a checklist item
function move_checklist_item(item, target) {
	if (target != null) {
		var assignment = find_assignment_by_id(currentClass.assignments, item.getAttribute("aid"));		// TODO THIS WILL NOT WORK IN A UNIVERSAL CLASS VIEW! NEEDS A REFERENCE TO CORRELATING CLASS!
		if (assignment != null) {
			var itemSlot = item.getAttribute("slot");
			var targetSlot = target.getAttribute("slot");
			if (targetSlot == -1) {
				// Move item to the end
				assignment.checklist.reorderEntry(itemSlot, assignment.checklist.list.length);
			} else {
				assignment.checklist.reorderEntry(itemSlot, targetSlot);
			}
		}
	}
	// Render checklist again
	if (assignment != null) render_checklist(assignment, item.parentNode.parentNode.parentNode);	// pls don't make big dom changes :)
}