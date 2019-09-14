$(document).ready(function () {
    $('.status_action').unbind('click').click(function () {
        let status_pressed = Number($(this).attr('data-status'));

        $(this).siblings().removeClass('active');
        $(this).removeClass('active');

        if (task_selected_for_edit) {
            update_task_status(task_selected_for_edit.id, status_pressed, send_notification_status_change);
        }
    });
});

function send_notification_status_change(task_info) {
    let users_involved = '';
    for (let i = 0; i < users_involved_to_task_selected.length; i++) {
        if (users_involved_to_task_selected[i][0]) {
            users_involved = users_involved + users_involved_to_task_selected[i][0] + '|';
        }
    }
    delete task_info.description;
    task_info['users_involved'] = users_involved + userId + '|';
    task_info['users_seen'] = userId + '|';

    status_notifications_manager.update_task_status(task_info)
}