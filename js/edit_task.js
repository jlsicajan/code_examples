var main_form_fields = $('.task_main_form select, .task_main_form input, .task_main_form textarea');

function add_task_to_form(task_id_selected, info = false) {
    if (info) {
        add_info_to_form(info)
    } else {
        let task_selected_info = get_object_by_value(current_visible_tasks, 'id', Number(task_id_selected));
        if (task_selected_info.length > 0) {
            add_info_to_form(task_selected_info[0]);
        } else {
            get_task_by_id(Number(task_id_selected), function (task_info, tz) {
                if (task_info.length > 0) {
                    add_info_to_form(task_info[0]);
                }
            });
        }
    }
}


function add_info_to_form(task_selected_info) {
    if (task_selected_info) {
        $('.save_changes').text('Update').show();
        $('.comments-history-container').show();
        $('.cancel').text('Create new task').show();
        $('.task_status_container').show();

        $('.todo-taskbody-tasktitle').val(task_selected_info.name);
        $('.todo-taskbody-taskdesc').val(task_selected_info.description);

        let due_date_selected = task_selected_info.dueDate;
        if (due_date_selected) {
            due_date_selected = due_date_selected.replace(' 00:00:00', '');
            let due_date_selected_splited = due_date_selected.split('-');
            if (due_date_selected_splited[1] && due_date_selected_splited[2] && due_date_selected_splited[0]) {
                $('.todo-taskbody-due').val(due_date_selected_splited[1] + '/' + due_date_selected_splited[2] + '/' + due_date_selected_splited[0]);
            } else {
                $('.todo-taskbody-due').val(due_date_selected);
            }
        }

        if (task_selected_info.priority != 0) {
            $('#priority').val(Number(task_selected_info.priority)).trigger('change');
        } else {
            $('#priority').val(null).trigger("change");
        }

        task_selected_for_edit = task_selected_info; //add important attribute data-form-status

        $('.delete_task').attr('data-task-id', task_selected_info.id);
        load_comments_for_task(task_selected_info.id);
        get_users_assigned_from_db_for_task(task_selected_info.id, '#assignedTo');

        $('.status_action.status_action_' + task_selected_info.status).addClass('active').siblings().removeClass('active');
        $('.task_edit_button_options').show();
        $('.delete_task, .update_task_changes').show();
        show_task_form_view();
    }
}

function cancel_edit() {
    let form_status = $('.task_main_form').attr('data-form-status');

    if (form_status == 'editing') {
        $('.task_main_form').attr('data-form-status', 'create');
        $('.save_and_create').text('Save & create');
        $('.comments-history-container').hide();
        task_selected_for_edit = 0;
        $(main_form).trigger('reset');
        $('#assignedTo').empty().trigger("change");
        $('#priority').val(null).trigger("change");
        $('.task_main_form').find('input, textarea, select').removeAttr('disabled');
        $('.cancel, .task_status_container').hide();
        $('.save_changes').show().text('Save & create');
        $('.delete_task').attr('data-task-id', 0);
        $('.delete_task, .update_task_changes').hide();
        $('#assignedTo').removeAttr('disabled');
    } else if (form_status == 'create') {
        $('.task_main_form').attr('data-form-status', 'editing');
        $('.save_changes').text('Update');
        $('.delete_task, .update_task_changes').show();
    }
}

$(document).ready(function () {
    $('.cancel').unbind('click').click(cancel_edit);
    add_click_event_to_task_items();
    $('.archive_task').unbind('click').click(function () {
        update_task_status(task_selected_on_modal.id, 4, function () {
            toastr.info('Task archived successfully.');
            load_task_list();
        });
    });
    $('.delete_task').unbind('click').click(function () {
        let task_id = $(this).attr('data-task-id');
        if (confirm("Are you sure that you want to delete this task?")) {
            rm_del_task(task_id, function () {
                toastr.info('Task deleted successfully.');
                switch_main_containers();
                $('.todo-tasklist-item[data-task-id="' + task_id + '"]').remove();
            });
        }
    });
});

//add tags with select2
function add_tags_default(tags, el_id) {
    $(el_id).val(null).trigger("change");
    for (let key in tags) {
        $(el_id).append($("<option selected='selected' value='" + key + "'>" + tags[key] + "</option>")).trigger('change');
    }
}

function get_users_assigned_from_db_for_task(task_id, el_id) {
    load_users_for_task(task_id, add_tags_default, el_id);
}
