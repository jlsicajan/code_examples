function task_filters(callback) {
    current_task_page = 1;
    $('.todo-tasklist').unbind();
    $('.todo-tasklist').scrollTop(0);
    load_task_list();
    callback();
}

function clear_filters() {
    $('.created_by').val(null).trigger("change");
    $('.assigned_filter_to').val(null).trigger("change");
    $('#filter_by_status').val(null).trigger("change");
    $('#filter_by_priority').val(null).trigger("change");
}

function mark_unmark_element_in_panel(el_object) {
    if (el_object.hasClass('item_selected_in_panel')) {
        el_object.removeClass('item_selected_in_panel').css('background-color', 'white').blur();
    } else {
        el_object.addClass('item_selected_in_panel').removeAttr('style');
    }
    keep_loading_tasks = true;
    $('.todo-tasklist').bind('scroll', load_tasks_on_scroll);

}

function get_selected_priority_filters() {
    let priorities_selected = [];
    $('#filter_by_priority').val(null).trigger("change");
    $('.badge_info_priority.item_selected_in_panel').each(function () {
        let filter_id = $(this).attr('data-filter-id');
        priorities_selected.push(filter_id);
    });
    $('#filter_by_priority').val(priorities_selected).trigger('change');

    if (priorities_selected.length > 0) {
        return JSON.stringify(priorities_selected);
    } else {
        return false;
    }
}

function get_selected_status_filters() {
    let statuses_selected = [];
    $('#filter_by_status').val(null).trigger("change");
    $('.badge_info_status.item_selected_in_panel').each(function () {
        let filter_id = $(this).attr('data-filter-id');
        statuses_selected.push(filter_id);
    });
    $('#filter_by_status').val(statuses_selected).trigger('change');

    if (statuses_selected.length > 0) {
        return JSON.stringify(statuses_selected);
    } else {
        return false;
    }
}

function update_selected_classification_filters() {
    $('.badge_info_classification.item_selected_in_panel').each(function () {
        let filter_id = $(this).attr('data-filter-id');
        write_in_classification_filter(filter_id);
    });
}

function write_in_classification_filter(filter_id) {
    if (filter_id == 'filter_by_created_by') {
        $('#filter_by_created_by').val(null).trigger("change");
        $('#filter_by_created_by').append($("<option selected='selected' value='" + userId + "'>" + current_user.firstName + " " + current_user.lastName + "</option>")).trigger('change');
        task_general_filters = {
            'filter_by_created_by': JSON.stringify([userId])
        };
    } else if (filter_id == 'filter_by_assigned_to') {
        task_general_filters = {
            'filter_by_assigned_to': JSON.stringify([userId])
        };

    } else if (filter_id == 'filter_by_unassigned') {
        task_general_filters = {
            'current_task_page': 1,
            'filter_by_unassigned': JSON.stringify([userId])
        };
    } else if (filter_id == 'filter_by_archived') {
        task_general_filters = {
            'current_task_page': 1,
            'filter_by_archived': "[4]"
        };
    } else {
        send_error_to_sentry('No classification found, you selected an incorrect option from the panel', 'Something went wrong, please try again later or contact support staff.')
    }
}

function update_task_general_filters() {
    let priority_filters = get_selected_priority_filters();
    let status_filters = get_selected_status_filters();

    if (priority_filters) {
        task_general_filters['filter_by_priority'] = priority_filters;
    }

    if (status_filters) {
        task_general_filters['filter_by_status'] = status_filters;
    }

    update_selected_classification_filters();

    task_filters(function () {
        keep_loading_tasks = true;
        $('.todo-tasklist').bind('scroll', load_tasks_on_scroll);
    });
}

function add_click_events_to_panels() {
    $('.badge_info_item').parent().unbind('click').click(function () {
        mark_unmark_element_in_panel($(this));
        update_task_general_filters();
        keep_loading_tasks = true;
        $('.todo-tasklist').bind('scroll', load_tasks_on_scroll);
    });
}