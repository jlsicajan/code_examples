App.blockUI({target: $('.task-todo-content-loading-portlet'), animate: true});
$(document).ready(function () {
    $('.badge_info_archived').parent().hide();//hide till decide relation between archive and completed
    $('.task_status_container, .comments-history-container, .archive_task, .cancel').hide();

    $('#assignedTo, .created_by, .assigned_filter_to, #modal_assignedTo').select2({
        allowClear: true,
        placeholder: 'Select user',
        width: '100%',
        tokenSeparators: [','],
        minimumInputLength: 3,
        formatSelectionTooBig: function (limit) {
            return 'No more than one user';
        },
        createTag: function (params) {
            return undefined;
        },
        ajax: {
            dataType: 'json',
            width: 'resolve',
            url: '/tasks/user/list/',
            delay: 250,
            data: function (params) {
                return {
                    term: params.term || '',
                    page_limit: 20,
                    page: params.page || 1
                };
            },
            processResults: function (data, params) {
                params.page = params.page || 1;
                return {
                    results: data.users, pagination: {more: (params.page * 20) < data.total}
                };
            }
        }, templateResult: function patientFormatResult(data) {
            if (data.loading) {
                return data.text;
            }
            return "<div value=" + data.id + ">" + data.text + "</div>";
        },
        escapeMarkup: function (m) {
            return m;
        }
    });

    $("#priority, #filter_by_priority, #filter_by_status, #modal_priority").select2({
        tags: true,
        allowClear: true,
        tokenSeparators: [','],
        width: '100%',
        placeholder: "Select priority",
    });

    $('.comment_current_user_avatar').text(current_user.firstName + ' ' + current_user.lastName);
    $('.search_task_submit').unbind('click').click(search_tasks);
    $('.search_task').on('input', search_tasks);

    $('#filter_by_assigned_to').val(null).trigger("change");
    $('#filter_by_assigned_to').append($("<option selected='selected' value='" + userId + "'>" + current_user.firstName + " " + current_user.lastName + "</option>")).trigger('change');

    $('#filter_by_status').val(null).trigger("change");
    $('#filter_by_status').val([1, 2]).trigger('change');

    load_task_list(false);

    if (localStorage.getItem('task_selected_from_notification')) {
        add_task_to_form(localStorage.getItem('task_selected_from_notification'), false);
        localStorage.removeItem('task_selected_from_notification');
    }
    $('#header_task_bar').unbind('click').click(reorder_notification_elements);
    $('.task_mark_all_as_read').unbind('click').click(function () {
        tasks_notifications_manager.markAsRead();
        tasks_notifications_manager.markCommentAsRead();
        mentions_notifications_manager.markMentionAsRead();
    });

    $('.create_new_task').unbind('click').click(function () {
        $('.task_main_form').attr('data-form-status', 'editing');
        cancel_edit();
        switch_main_containers();
        $('.task_edit_button_options').hide();
    });

    $('.task-todo_content').css('display', 'block');
    $('.task-todo-content-loading').css('display', 'none');
});

function build_task_list(el_id, objects, reload = false, generate_badge = true) {
    if (reload) $(el_id).empty();
    $('.animation_loading').remove();
    if (typeof objects == 'object') {
        const entries = Object.entries(objects);

        for (const [column, value] of entries) {
            create_new_task_list_item(el_id, value, generate_badge);
        }

    } else {
        for (let i = 0; i < objects.length; i++) {
            if (objects[i]) {
                create_new_task_list_item(el_id, objects[i], generate_badge);
            }
        }
    }

    $(el_id).append(add_task_loader());
    $(el_id).append(add_task_loader());
    $(el_id).append(add_task_loader());
    $(el_id).append(add_task_loader());

}

function add_task_loader() {
    let animation_loading = $('<div>').addClass('animation_loading mb-15');
    let animation_loading_container = $('<div>').addClass('animation_loading_container');

    $(animation_loading_container).append($('<div>').addClass('animation_col_two'));
    $(animation_loading_container).append($('<div>').addClass('animation_col_two'));

    $(animation_loading_container).append($('<div>').addClass('animation_col_five mt-10px'));
    $(animation_loading_container).append($('<div>').addClass('animation_col_five'));

    $(animation_loading_container).append($('<div>').addClass('animation_col_three mt-10px'));
    $(animation_loading_container).append($('<div>').addClass('animation_col_three'));

    $(animation_loading_container).append($('<div>').addClass('animation_col_two mt-10px'));
    $(animation_loading_container).append($('<div>').addClass('animation_col_two'));
    $(animation_loading_container).append($('<div>').addClass('animation_col_two'));

    $(animation_loading).append(animation_loading_container);

    return animation_loading;
}

function load_task_list(update_with_notifications = false) {
    App.blockUI({target: $('.todo-tasklist'), animate: true});
    $('.todo-tasklist').scrollTop(0);
    $('.todo-tasklist').css({overflow: 'hidden', height: '100%'});
    get_tasks_filtered(function () {
        App.unblockUI({target: $('.todo-tasklist'), animate: true});
        $('.todo-tasklist').css({overflow: 'auto', height: 'auto'});

        build_task_list('.todo-tasklist', current_visible_tasks, true);

        if (current_visible_tasks.length == 0) {
            $('.animation_loading').hide();
            let no_results = $('<h3 class="no_results_text">').text('No results for this filters.');
            $('.todo-tasklist').append(no_results);
        } else if (current_visible_tasks.length < 10) {
            $('.animation_loading').hide();
        } else {
            keep_loading_tasks = true;
            $('.todo-tasklist').bind('scroll', load_tasks_on_scroll);
            $('.no_results_text').remove();
        }

        add_click_event_to_task_items();
        get_panels_information();
        if (update_with_notifications) {
            update_general_notifications(true);
        }
    });
}

function search_tasks() {
    current_task_page = 1;
    $('.todo-tasklist').scrollTop(0);
    let value_to_search = $('.search_task').val();
    let objects_found = search_task_in_list(value_to_search, current_visible_tasks);
    build_task_list('.todo-tasklist', objects_found, true);
    add_click_event_to_task_items();
    $('.animation_loading').remove();
}