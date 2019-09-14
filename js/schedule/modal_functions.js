//if the id is null means that is creating a new schedule, otherwise is updating one
function build_modal(id = null) {
  if (id) {
    build_edit_modal(time_slots[id]);
  } else {
    build_quick_modal(Slot_data);
  }
  $('#time-block-info').modal("show");
  return;
}

function build_quick_modal(time_slot) {
  Slot_data = time_slot;

  console.dir('Quick modal builder');
  console.dir(Slot_data);

  //view changes
  $('.quick_add').addClass('row');
  $('.quick_title').addClass('col-md-7');
  $('.quick_category').addClass('col-md-5');
  $('.optional_description').hide();
  $('#time-block-info .modal-subtitle').text('');

  $('#update_timeslot, #delete_timeslot').hide();
  $('.save_timeslot').show();

  $('#slot_form').trigger("reset");
  $("#category_for_schedule").val("");
  $("#category_for_schedule").trigger('change');

  set_default_select2_categories(last_category, '#category_for_schedule');

  $('#time-block-info .modal-title').text(Slot_data.day_of_week + " " + Slot_data.start_date + " - " + Slot_data.end_date);

  $('#start_time').val(Slot_data.start_date);
  $('#end_time').val(Slot_data.end_date);
  $('#day_of_week').val(Slot_data.day_of_week);

  $('#week_of_year').val(Slot_data.week_of_year);
  $('#year').val(Slot_data.year);

  $('#block_count').val(Slot_data.block_count);
  $('#block_index').val(Slot_data.block_index);

}

function build_edit_modal(time_slot) {

  //view changes
  $('.quick_add').removeClass('row');
  $('.quick_title').removeClass('col-md-7');
  $('.quick_category').removeClass('col-md-5');
  $('.optional_description').show();

  $('#delete_ts').show();
  Slot_data = time_slot;
  console.log("Selected");
  console.dir(Slot_data);

  for (var id in Slot_data) {
    if ($('#' + id).length) {
      $('#' + id).val(Slot_data[id]);
    }
  }
  set_default_select2_categories(Slot_data['categories'], '#category_for_schedule');

  var start_time = moment(Slot_data.start_time).format('HH:mm a');
  var end_time = moment(Slot_data.end_time).format('HH:m a');

  var date_of_time_slot = moment().day(Slot_data.day_of_week).week(Slot_data.week_of_year);

  $('#time-block-info .modal-title').html('<span class="time-slot-title">' + Slot_data['title'] + '</span>');
  $('#time-block-info .modal-subtitle').html(date_of_time_slot.format('dddd D MMM') + " " + start_time + " - " + end_time);

  $('#update_timeslot, #delete_timeslot').attr('data-id', Slot_data.id).show();

  $('.save_timeslot').hide();
}

function get_form_info_by_id(form_id) {
  var form_data = {};
  $("#" + form_id + " input, #" + form_id + " select, #" + form_id + " textarea").each(function () {
    var input = $(this);
    form_data[input.attr('name')] = input.val();
  });

  console.log("get_form_info_by_id");
  console.dir(form_data);
  return form_data;
}