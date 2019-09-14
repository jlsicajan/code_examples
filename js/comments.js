$(document).ready(function () {
    $('.make_comment').unbind('click').click(function () {
        if (task_selected_for_edit != 0) {
            $(this).prop("disabled", true);
            let new_comment_to_save = '';
            let mentions = '';
            $('.comment_mention').mentionsInput('val', function (new_comment) {
                new_comment_to_save = new_comment;
            });

            $('.comment_mention').mentionsInput('getMentions', function (new_mentions) {
                mentions = JSON.stringify(new_mentions);
            });

            save_comment_in_db({
                'taskId': task_selected_for_edit.id,
                'text': new_comment_to_save,
                'mentions': mentions
            }, function (data) {
                send_comment_notification(data);
                load_comments_for_task(task_selected_for_edit.id);
            });
        }
    });

    $('.toggle_comments_on_modal').unbind('click').click(function () {
        $('.modal_comments').toggle();
        if ($(this).attr('data-status') == '1') {
            $(this).text('Hide all comments');
            $(this).attr('data-status', '2');
            $('.comments-history-container').hide();
        } else {
            $(this).attr('data-status', '1');
            $(this).text('Show all comments');
            $('.comments-history-container').show();
        }

    });
});

function send_comment_notification(comment_info) {
    comment_info = comment_info.result;
    let task_selected_for_edit_to_send = task_selected_for_edit;
    delete comment_info.text;
    delete task_selected_for_edit_to_send.description;
    comment_info.task_info = task_selected_for_edit_to_send;
    get_users_for_task_general(comment_info.taskId, function (users_founded) {
        for (let x = 0; x < users_founded.length; x++) {
            if (users_founded[x][0]) {
                tasks_notifications_manager.assign_comment_task(comment_info, users_founded[x][0]);
            }
        }
        if (task_selected_for_edit) {
            tasks_notifications_manager.assign_comment_task(comment_info, task_selected_for_edit.createdBy);
        }
    });
}

function add_comment(comment_info) {
    let el_comment = $('<li>').addClass('media');
    let comment_body = $('<div>').addClass('media-body todo-comment');
    let created = moment(comment_info.created + 'Z').tz(current_user.tz).fromNow();

    let patient_avatar = $('<div>' + comment_info.created_by_info + '</div>').addClass('patientAvatar pull-left');
    patient_avatar.nameBadge(badge_main_conf);

    let user_info = $('<p class="todo-comment-head"><span class="todo-comment-username">' + comment_info.created_by_info + '</span><span class="todo-comment-date">' + created + '</span></p>');
    let comment_transformed = comment_info.text.replace(/[/[](\w+ \w+(]))/g, '<strong>$1</strong>');
    comment_transformed = comment_transformed.replace(/]/g, '');
    comment_transformed = comment_transformed.replace(/\(|(\w+):(\w+)\)/g, '');
    let comment_text = $('<p>').addClass('todo-text-color comment_element_power').html(comment_transformed);

    comment_body.append([user_info, comment_text]);
    el_comment.append([patient_avatar, comment_body]);

    $('.comment_list').append(el_comment);
    $('.text_comment').mentionsInput('reset');
    $('.make_comment').removeAttr('disabled');
}

function build_comments(comments) {
    $('.comment_list').empty();
    for (let key in comments.results) {
        add_comment(comments.results[key]);
    }
}

function load_comments_for_task(task_id) {
    load_comments(task_id, build_comments);
}