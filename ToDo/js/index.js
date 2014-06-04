var main = {
	onLoad : function() {
		// Wait for device API libraries to load
		document.addEventListener("deviceready", main.onDeviceReady(), false);
	},
	onDeviceReady : function() {
	},
	mandatoryValidation : function() {
		// Validating all mandatory fields are filled
		var isValid = true;
		if ($("#title").val() == "") {
			alert("Title is a mandatory field!");
			isValid = false;
		} else if ($("#date").val() == "") {
			alert("Date is a mandatory field!");
			isValid = false;
		} else if ($("#time").val() == "") {
			alert("Time is a mandatory field!");
			isValid = false;
		}
		return isValid;
	},
	submitTask : function() {
		if (main.mandatoryValidation()) {
			var taskTitle = $("#title").val();
			var session = {
				id : window.localStorage.length,
				task : $("#task").val(),
				date : $("#date").val(),
				time : $("#time").val()
			};
			if (typeof (Storage) != "undefined") {
				// Store task at local storage 
				window.localStorage.setItem(taskTitle, JSON.stringify(session));
			} else {
				alert("Sorry, your browser does not support Web Storage...");
			}
			main.notification.addNotification(taskTitle, session);
			$.mobile.changePage($("#home"));
		}
	},
	notification : {
		addNotification : function(title, taskData) {
			// Create a new Date object according to the user's input
			var inputDate = (taskData.date).split("-");
			var inputTime = taskData.time;
			var finalDateString = (inputDate + ' ' + inputTime);
			var finalDate = new Date(finalDateString);
			var today = new Date();
			if (today.getTime() > finalDate.getTime()) {
				alert("The date you set is in the past.\nThe task was saved without notification!");
			} else {
				// Adding notification
				window.plugin.notification.local.add({
					id : taskData.id,
					title : title,
					message : taskData.task,
					date : finalDate,
					json : JSON.stringify(title),
					autoCancel : true,
					//icon :'images/Todo Icon.png',
					//smallIcon : 'images/Todo Icon.png'
				});
				// Show the singleTask page when the user clicks the notification
				window.plugin.notification.local.onclick = function(id, state,
						json) {
					$("#singleTask").attr("taskTitle", JSON.parse(json));
					$.mobile.changePage($("#singleTask"));
				};
			}
		},
		removeNotification : function(taskToDelete) {
			// Get the data of the specific task
			var dataToDelete = main.retrieveData(taskToDelete);
			window.plugin.notification.local.cancel(dataToDelete.id);
		}
	},
	clearFields : function() {
		// Clear the form's fields after submitting
		$("#title").val("");
		$("#task").val("");
		$("#date").val("");
		$("#time").val("");
	},
	updateTasksList : function() {
		// Empty the list of tasks
		$("#currentTasksList").empty();

		// Iterate over all of the tasks, populating the list
		for (i = 0; i < window.localStorage.length; i++) {
			$("#currentTasksList").append(
							"<li><a href='#singleTask'><img src='images/ToDo.png'><h2>"
							+ window.localStorage.key(i)
							+ "</h2><a href='#deleteDialog' data-rel='popup' data-position-to='window' data-transition='pop'></a></li>");
		}

		// Tell jQueryMobile to refresh the list
		$("#currentTasksList").listview('refresh');
		main.clearFields();
	},
	editTask : function() {
		// Find the taskTitle of the task the user wants to edit
		var taskToEdit = $("#singleTask div[data-role=header] h1").text();
		// Get the data of the specific task
		var dataToEdit = main.retrieveData(taskToEdit);
		$("#title").val(taskToEdit);
		$("#task").val(dataToEdit.task);
		$("#date").val(dataToEdit.date);
		$("#time").val(dataToEdit.time);
		window.localStorage.removeItem($(taskToEdit).text());
	},
	retrieveData : function(key) {
		// Get the data of the specific task
		var data = window.localStorage.getItem(key);
		// Turn the stringified data back into a JS object
		data = JSON.parse(data);
		return data;
	}
};

$(document).on("pageshow", "#home", main.updateTasksList);

$(document).on("click", "#home li ", function() {
	$("#singleTask").attr("taskTitle", $(this).text());
	$("#deleteApproved").attr("taskTitle", $(this).text());
});

// When the user views the singleTask page
$(document).on("pageshow", "#singleTask", function() {
	// Find the taskTitle of the task the user is viewing
	var currentTask = $(this).attr("taskTitle");
	// Update the singleTask page header to the taskTitle
	$("#singleTask div[data-role=header] h1").text(currentTask);
	// Get the data of the specific task
	var currentData = main.retrieveData(currentTask);
	// Update fields value
	$("#dateValue").text("Date: " + currentData.date);
	$("#timeValue").text("Time: " + currentData.time);
	$("#taskValue").text("Details: " + currentData.task);
});

// When the user chooses to delete a task
$(document).on("click", "#deleteApproved", function() {
	// Find the taskTitle of the task the user wants to delete
	var taskToDelete = $(this).attr("taskTitle");
	main.notification.removeNotification(taskToDelete);
	window.localStorage.removeItem(taskToDelete);
	main.updateTasksList();
});
