function select_task_from_notification(task_id, info = false) {
    if (window.location.href.indexOf("tasks") > -1) {
        if (info) {
            add_task_to_form(task_id, info);
        } else {
            add_task_to_form(task_id, false);
        }
    } else {
        localStorage.setItem('task_selected_from_notification', Number(task_id));
        $('#task_nav_link').find('span').trigger('click');
    }
}

function add_el_task_notification_box(task_id) {

    get_task_by_id(task_id, function (task_to_load, tz) {
        if (task_to_load.length > 0) {
            task_to_load = task_to_load[0];
            if (task_to_load) {
                let el_li = $('<li>').addClass('task_item_notification item_notification').attr({
                    'time': moment(task_to_load.lastModified).unix(),
                    'data-task-id': task_to_load.id
                });
                let el_a = $('<a>').attr('href', '#');

                let h_task_name = $('<span>').addClass('desc h_task_name col-md-8').text(task_to_load.name);
                let date_creation = moment(task_to_load.lastModified + 'Z').tz(tz).fromNow();
                let h_task_extra = $('<span>').addClass('time h_task_extra col-md-3').text(date_creation);
                let task_icon = $('<span>').addClass('label label-sm label-icon label-info col-md-1').append('<i class="fa fa-bell"></i>');
                let content = $('<div>').addClass('task row').append([task_icon, h_task_name, h_task_extra]);

                el_a.append(content);

                el_li.append(el_a).unbind('click').click(function (e) {
                    e.preventDefault();
                    tasks_notifications_manager.markAsRead(task_to_load.id);
                    $(this).remove();
                    select_task_from_notification(task_to_load.id, task_to_load);
                });

                if ($('.task_header_list').find('.item_notification[data-task-id="' + task_to_load.id + '"]').length < 1) {
                    $('.task_header_list').append(el_li);
                }
            }
        } else {
            return;
        }
    });
}

function add_comment_notification_box(comment_info) {

    get_comment_by_id(comment_info.id, function (comment_information, tz) {
        let el_li = $('<li>').addClass('comment_item_notification item_notification').attr({
            'time': moment(comment_information.created).unix(), 'data-comment-id': comment_info.id
        });

        let el_a = $('<a>').attr('href', 'javascript:;');
        let h_comment_name = $('<span>').addClass('desc h_comment_name col-md-8').append('New comment: ' + '<strong>' + comment_info.task_info.name + '</strong>');
        let date_creation = moment(comment_information.created + 'Z').tz(tz).fromNow();

        let h_comment_extra = $('<span>').addClass('time h_comment_extra col-md-3').text(date_creation);
        let comment_icon = $('<span>').addClass('label label-sm label-icon label-warning col-md-1').append('<i class="fa fa-comment"></i>');
        let content = $('<div>').addClass('comment row').append([comment_icon, h_comment_name, h_comment_extra]);

        el_a.append(content);
        el_li.append(el_a).unbind('click').click(function (e) {
            e.preventDefault();
            tasks_notifications_manager.markCommentAsRead(comment_info.key);
            select_task_from_notification(comment_information.task_id, false);
            $(this).remove();
        });

        if ($('.task_header_list').find('.item_notification[data-comment-id="' + comment_info.id + '"]').length < 1) {
            $('.task_header_list').append(el_li);
        }

    });

}

function add_status_notification_box(status_info) {
    let el_li = $('<li>').addClass('status_item_notification item_notification').attr('time', status_info.updated_at);
    let el_a = $('<a>').attr('href', '');
    let h_status_name = $('<span>').addClass('desc h_status_name  col-md-8').append(status_info.description);
    let date_creation = moment.unix(status_info.updated_at).fromNow();
    let h_status_extra = $('<span>').addClass('time h_comment_extra col-md-3').text(date_creation);
    let status_icon = $('<span>').addClass('label label-sm label-icon label-warning col-md-1').append('<i class="fa fa-dashcube"></i>');
    let content = $('<div>').addClass('comment row').append([status_icon, h_status_name, h_status_extra]);

    el_a.append(content);
    el_li.append(el_a).unbind('click').click(function (e) {
        e.preventDefault();
        status_notifications_manager.markStatusAsRead(status_info);
        select_task_from_notification(status_info.task_id, false);
        $(this).remove();
    });
    $('.task_header_list').append(el_li);
}

function add_mentions_notification_box(mention_info) {
    get_task_by_id(mention_info.taskId, function (task_to_load, tz) {
        if (task_to_load.length > 0) {
            task_to_load = task_to_load[0];
            if (task_to_load) {
                let el_li = $('<li>').addClass('mention_item_notification item_notification').attr({
                    'time': moment(mention_info.created).unix(),
                    'data-mention-id': task_to_load.id
                });
                let el_a = $('<a>').attr('href', 'javascript:;');

                let h_mention_name = $('<span>').addClass('desc h_mention_name col-md-8').html('You have been mentioned in task: ' + '<strong>' + task_to_load.name + '</strong>');

                let date_creation = moment(mention_info.created + 'Z').tz(tz).fromNow();
                let h_mention_extra = $('<span>').addClass('time h_mention_extra col-md-3').text(date_creation);
                let mention_icon = $('<span>').addClass('label label-sm label-icon label-info col-md-1').append('<i class="fa fa-bullhorn"></i>');
                let content = $('<div>').addClass('mention row').append([mention_icon, h_mention_name, h_mention_extra]);

                el_a.append(content);

                el_li.append(el_a).unbind('click').click(function (e) {
                    e.preventDefault();
                    mentions_notifications_manager.markMentionAsRead(mention_info.key);
                    $(this).remove();
                    select_task_from_notification(task_to_load.id, task_to_load);
                });

                if ($('.task_header_list').find('.item_notification[data-mention-id="' + task_to_load.id + '"]').length < 1) {
                    $('.task_header_list').append(el_li);
                }
            }
        } else {
            return;
        }
    });

}

function update_general_notifications(update_favicon = false) {
    $('.task_header_list').empty();
    let real_badge_count = 0;
    for (let x = 0; x < notifications['tasks'].length; x++) {
        if (notifications['tasks'][x]) {
            add_el_task_notification_box(notifications['tasks'][x].unread_task);
            real_badge_count = real_badge_count + 1;
        }
    }

    for (let x = 0; x < notifications['comments'].length; x++) {
        if (notifications['comments'][x]) {
            add_comment_notification_box(notifications['comments'][x].unread_comment);
            real_badge_count = real_badge_count + 1;
        }
    }

    for (let x = 0; x < notifications['status'].length; x++) {
        if (notifications['status'][x]) {
            add_status_notification_box(notifications['status'][x].unread_status);
            real_badge_count = real_badge_count + 1;
        }
    }

    for (let x = 0; x < notifications['mentions'].length; x++) {
        if (notifications['mentions'][x]) {
            add_mentions_notification_box(notifications['mentions'][x].unread_mentions);
            real_badge_count = real_badge_count + 1;
        }
    }

    if (update_favicon) {
        update_badge(real_badge_count);
    }

    reorder_notification_elements();
}

function reorder_notification_elements() {
    var task_header_list = $('.task_header_list');
    task_header_list.find('.item_notification').sort(function (a, b) {
        return +$(b).attr('time') - +$(a).attr('time');
    }).appendTo(task_header_list);
}

function update_badge(real_badge_count) {
    if (real_badge_count > 0) {
        favicon_task_notificacion_value = real_badge_count;
        favicon.badge(favicon_task_notificacion_value + favicon_msg_notificacion_value);
        $(".badge_tasks").text(real_badge_count).addClass('badge badge-success').css('display', 'inline-block');
    } else {
        favicon_task_notificacion_value = 0;
        favicon.badge(favicon_task_notificacion_value + favicon_msg_notificacion_value);
        $(".badge_tasks_inside").text('No');
        $(".badge_tasks").text('').removeClass('badge badge-success').css('display', 'none');
    }
}