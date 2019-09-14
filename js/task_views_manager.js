$('.main_taskform_container').hide(); //hide at the first time
function switch_main_containers() {
    if ($('.main_task_container').hasClass('hidden_to_create')) {

        $('.main_tasklist_container').show();
        $('.main_taskform_container').hide();

        $('.main_task_container').removeClass('hidden_to_create');

    } else {
        $('.main_task_container').addClass('hidden_to_create');
        $('.main_tasklist_container').hide();
        $('.main_taskform_container').show();
    }
}

function show_task_form_view() {
    $('.main_task_container').addClass('hidden_to_create');
    $('.main_tasklist_container').hide();
    $('.main_taskform_container').show();
}

$(document).ready(function () {
    $('.back_to_list_main_button').unbind('click').click(function () {
        switch_main_containers();
        cancel_edit();
    });
});