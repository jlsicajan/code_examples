var priorities = [
    {'id': 1, 'name': 'HIGH', 'value': '1', 'class': 'todo-tasklist-item-border-red', 'button_color': 'button-color-high', 'background_color': 'background-high'},
    {'id': 2, 'name': 'MEDIUM', 'value': '2', 'class': 'todo-tasklist-item-border-yellow', 'button_color': 'button-color-medium', 'background_color': 'background-medium'},
    {'id': 3, 'name': 'LOW', 'value': '3', 'class': 'todo-tasklist-item-border-low', 'button_color': 'button-color-low', 'background_color': 'background-low'},
    {'id': 4, 'name': 'NO PRIORITY', 'value': '4', 'class': 'todo-tasklist-item-border-purple', 'button_color': '', 'background_color': 'bg-blue-ebonyclay bg-font-blue-ebonyclay'},
];

var statutes = {1: 'pending', 2: 'in progress', 3: 'completed', 4: 'archived'};
var statutes_colors = {
    1: 'bg-grey-salt bg-font-grey-salt',
    2: 'bg-blue bg-font-blue',
    3: 'bg-green-jungle bg-font-green-jungle',
    4: 'bg-dark bg-font-dark'
};

$(document).ready(function () {
    $('.project-item').unbind('click').click(function () {
        $(this).parent().siblings().removeClass('active');
        $(this).parent().addClass('active');
        $('.caption-helper').text($(this).text() + ' Tasks:');
    });
});

var get_object_by_value = function (array, key, value) {
    let priority_information = {
        'id': 4,
        'name': 'NO PRIORITY',
        'value': '0',
        'class': 'todo-tasklist-item-border-purple'
    };

    priority_information = array.filter(function (object) {
        return object[key] === value;
    });
    return priority_information;
};


function filter_obj(key, value_to_search, objects) {
    var results = [];
    for (let i = 0; i < objects.length; i++) {
        if (key in objects[i]) {
            if (objects[i][key].toLowerCase().indexOf(value_to_search.toLowerCase()) != -1) results.push(objects[i]);
        }
    }
    return results;
}

function search_task_in_list(value_to_search, objects) {
    var results = [];
    for (let i = 0; i < objects.length; i++) {
        if (objects[i]['name'].toLowerCase().indexOf(value_to_search.toLowerCase()) != -1 || objects[i]['description'].toLowerCase().indexOf(value_to_search.toLowerCase()) != -1) {
            results.push(objects[i])
        }
    }
    return results;
}

function add_click_event_to_task_items() {
    $('.todo-tasklist-item').unbind('click').click(function () {
        let task_id = $(this).attr('data-task-id');
        $('.task_main_form').attr('data-form-status', 'editing');
        $('.save_changes').show().text('Update');
        $('#assignedTo').attr('disabled', 'disabled'); // disable edit assignations, TODO edit with assignations and send notification to new users or deleted users
        add_task_to_form(task_id, false);
    });
}
