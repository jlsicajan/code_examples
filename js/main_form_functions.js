var main_form = $('.task_main_form');
var main_form_fields = $('.task_main_form select, .task_main_form input, .task_main_form textarea');
var main_form_submit = $('.save_changes');
var filter_form = $('#tasks_filter_form');

$(document).ready(function () {
    $(main_form).on('submit', function (e) {
        e.preventDefault();  //prevent form from submitting
        let form_status = $(this).attr('data-form-status');
        if (form_status == 'editing') {
            $('.save_changes').prop("disabled", true);

            let task_updates = {};
            $(main_form_fields).each(function () {
                let el_value = $(this).val();
                if (Array.isArray(el_value)) {
                    task_updates[$(this).attr('name')] = JSON.stringify(el_value);
                } else {
                    task_updates[$(this).attr('name')] = el_value;
                }
            });
            task_updates['task_id'] = task_selected_for_edit.id;
            task_updates['dueDate'] = moment(task_updates.dueDate, 'MM/DD/YYYY').format('YYYY-MM-DD');

            update_task_in_db(task_updates, function () {
                load_task_list(false);
                $('.save_changes').removeAttr('disabled').text('Update');
                add_click_event_to_task_items();
                toastr.info('Task updated successfully.');
            }, function () {
                // tasks_notifications_manager.assign_task_user(from_db_users_assigned, task_id); TODO notifications for updates
            });
        } else if (form_status == 'create') {

            $(main_form_submit).prop("disabled", true);
            let new_task = {};
            $(main_form_fields).each(function () {
                let el_value = $(this).val();
                if (Array.isArray(el_value)) {
                    new_task[$(this).attr('name')] = JSON.stringify(el_value);
                } else {
                    new_task[$(this).attr('name')] = el_value;
                }
            });
            save_task_in_db(new_task, function (info_save_in_db) {
                load_task_list(true);
                $(main_form).trigger('reset');
                $('.task_description_field').val('');
                $('#assignedTo').empty().trigger("change");
                $('#priority').val(null).trigger("change");
                $(main_form_submit).removeAttr('disabled');
                add_click_event_to_task_items();
            });
        }
    });

    $(filter_form).on('submit', function (e) {
        e.preventDefault();
        current_task_page = 1;
        task_general_filters = {};
        $('.badge_info_item').each(function () {
            $(this).parent().removeClass('item_selected_in_panel');
        });
        keep_loading_tasks = true;
        $('.todo-tasklist').bind('scroll', load_tasks_on_scroll);
        load_task_list();
    });

    $('.clear_filters').unbind('click').click(function () {
        $(this).parents('form').find('select').val(0).trigger('change');
        $(this).parents('form').find('input').val('');
        appliedFilters = '';
        load_task_list();
    });
});

function create_new_task_list_item(el_id, form_data, generate_badge = true) {
    let priority = '';
    if (form_data.priority != 0) {
        priority = get_object_by_value(priorities, 'value', String(form_data.priority))[0];
    } else {
        // It means that it does not have priority, display the no priority badge
        priority = get_object_by_value(priorities, 'value', '4')[0];
    }

    let task_list_item = $('<div>').addClass('todo-tasklist-item ' + priority.class + ' ' + priority.background_color);

    task_list_item.attr('data-task-id', form_data.id);

    let task_list_title = $('<div>').addClass('todo-tasklist-item-title');
    let task_list_text = $('<div>').addClass('todo-tasklist-item-text');
    let task_list_controls = $('<div>').addClass('todo-tasklist-controls pull-left');

    let dueDateMonthAsWord = 'No due date';
    if (form_data.dueDate != '') {
        dueDateMonthAsWord = moment(form_data.dueDate).format('MMM DD YYYY');
    }
    let createdDateMonthAsWord = moment(form_data.created).format('MMM DD YYYY');

    task_list_controls.append($('<span class="todo-tasklist-date mb-1"><i class="fa fa-calendar-plus-o"></i>' + createdDateMonthAsWord + '</span>'));
    task_list_controls.append($('<span class="font-red mb-1"><i class="fa fa-calendar-times-o font-red"></i> ' + dueDateMonthAsWord + '</span><br>'));
    task_list_controls.append($('<span class="todo-tasklist-badge badge badge-roundless ' + priority.button_color + '">' + priority.name + '</span>'));

    if (form_data.status) {
        task_list_controls.append($('<span class="ml-10 todo-tasklist-badge badge badge-roundless ' + statutes_colors[form_data.status] + '"> ' + statutes[form_data.status].toUpperCase() + ' </span>'));
    }
    task_list_text.text(form_data.description);

    task_list_title.append($('<strong>').text(form_data.name));
    task_list_item.append([task_list_title, task_list_text, task_list_controls]);
    $(el_id).append(task_list_item);
}