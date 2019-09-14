$(document).ready(function () {
    $('.todo-tasklist').bind('scroll', load_tasks_on_scroll);
});

var has_next_page = true;

var load_tasks_on_scroll = function () {
    if (($('.todo-tasklist').scrollTop() * 90) > ($('.todo-tasklist').height() - ($('.portlet-body').height() * 2))) {
        $('.todo-tasklist').unbind();
        setTimeout(function () {
            load_more_tasks_items();
        }, 1000);
    }
};

var load_more_tasks_items = function () {
    if (has_next_page === false) {
        return false;
    }
    current_task_page = current_task_page + 1;

    if (keep_loading_tasks) {
        load_more_tasks_filtered(function (data) {

            if (data.result.length == 0) {
                keep_loading_tasks = false;
                $('.animation_loading').remove();
                return;
            }

            build_task_list('.todo-tasklist', data.result, false);

            for (let i = 0; i < data.result.length; i++) {
                if (data.result[i]) {
                    current_visible_tasks.push(data.result[i]);
                }
            }

            add_click_event_to_task_items();
            $('.todo-tasklist').bind('scroll', load_more_tasks_items);

        });
    }
};
