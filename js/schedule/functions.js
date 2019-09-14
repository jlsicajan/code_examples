var Globals = {
  day_hours: 24,
  awake_hours: 16,
  time_block_duration_minutes: 15,

  work_hours: 12,
  day_starts_at: 6,

  block_class: 'time-block',
  odd_class: 'odd',
  even_class: 'even',
  empty_block: true,
  draggable: false,
  id: 0,

  is_selecting: false
};

var Slot_data = {};
var time_slots = {};

function setup_daily_blocks(day_el) {
  var odd_or_even = [Globals.odd_class, Globals.even_class];
  var available_minutes = Globals.work_hours * 60;
  var index = 0;

  while (available_minutes > 0) {

    Globals.start_time = get_time(index);
    Globals.end_time = get_time(index + 1);
    Globals.color = null;
    // Create the block
    let block = create_block(Globals, $('h3', day_el).text());
    block.addClass(odd_or_even[index % 2]);

    let block_title = $('<div class="time-day">').html($('<span>').html(get_time(index) + ' &mdash; ' + get_time(index + 1)));
    block.append(block_title);
    block.attr('data-start-time', get_time(index));
    block.attr('data-end-time', get_time(index + 1));

    // Append the block to the day
    $(day_el).append(block);

    index++;
    available_minutes -= Globals.time_block_duration_minutes;
  }
}

function setup_daily_blocks_with_data(day_el, schedule_data) {
  var odd_or_even = [Globals.odd_class, Globals.even_class];
  var available_minutes = Globals.work_hours * 60;
  var index = 0;
  var schedule_data_index = 0;
  // console.dir(schedule_data);
  // console.log("------");
  console.log("DAY: " + $('h3', day_el).text());

  while (available_minutes > 0) {

    var options = $.extend({}, {}, Globals);
    var schedule_text = $('<div class="time-day">').html(get_time(index) + ' &mdash; ' + get_time(index + 1));

    if (schedule_data_index < schedule_data.length) { //schedule_data_index is for check if all the schedules were displayed. schedule_data.length is the quantity of schedules in a day of the week
      var active_item = schedule_data[schedule_data_index];

      options.id = 0;
      options.empty_block = true;
      options.draggable = false;

      if (index == active_item.block_index) {
        console.log("~~~~");
        console.log("START SCHEDULE [" + index + "]", active_item);
        options.block_class += ' scheduled start-time';
        options.color = active_item['categories'][0]['color'];
        options.id = active_item.id;
        options.empty_block = false;
        options.draggable = true;
        options.add_schedule_buttons = true;
        options.block_class += " " + active_item.status;
        options.status = active_item.status == "completed" ? true : false;

        var schedule_text = $('<div class="time-day">').html('').attr('data-time-slot-title', options.id);
        var block_title = get_time(index)
      }
      else if (index > active_item.block_index) {
        options.empty_block = false;
        options.draggable = true;
        options.color = active_item['categories'][0]['color'];
        options.block_class += ' scheduled';
        options.id = active_item.id;
        options.block_class += " " + active_item.status;
        options.status = active_item.status == "completed" ? true : false;

        var schedule_text = $('<div class="time-day">').html('').attr('data-time-slot-title', options.id);
      }

      if (index == active_item.block_index + active_item.block_count - 1) {
        console.log("last if");
        options.empty_block = false;
        options.draggable = true;
        console.log("END SCHEDULE [" + index + "]", active_item);
        options.block_class += ' scheduled end-time';
        options.color = active_item['categories'][0]['color'];
        options.id = active_item.id;
        options.block_class += " " + active_item.status;
        options.status = active_item.status == "completed" ? true : false;


        time_slots[options.id] = active_item;
        last_category = active_item['categories'];

        schedule_data_index++;

        let schedule_title = $('<h5 class="block_title">').attr('data-id', options.id).html(active_item.title);
        let schedule_time_range = $('<h5 class="time_range">').attr('data-id', options.id).html(block_title + '  &mdash; ' + get_time(index + 1));

        var schedule_text = $('<div class="time-day">').append([schedule_title, schedule_time_range]);
        var block_title = '';
      }
    }

    var block = create_block(options, $('h3', day_el).text());
    block.addClass(odd_or_even[index % 2]);
    block.append(schedule_text);
    block.attr('data-start-time', get_time(index));
    block.attr('data-end-time', get_time(index + 1));

    // Append the block to the day
    $(day_el).append(block);

    index++;
    available_minutes -= Globals.time_block_duration_minutes;
  }
}

function get_time(index) {
  var hour = Math.floor((Globals.day_starts_at * 60 + Globals.time_block_duration_minutes * index) / 60.0);
  var minutes = '' + Math.ceil(((Globals.day_starts_at - Math.floor(Globals.day_starts_at)) * 60 + (Globals.time_block_duration_minutes * index)) % 60.0);
  while (minutes.length < 2)
    minutes = '0' + minutes;

  return hour + ':' + minutes;
}

function create_block(options, day = null) {
  options = options || Globals;
  var total_height = $('#schedule').height();
  var hour_height = total_height / options.work_hours;
  var block_height = (options.time_block_duration_minutes / 60.0) * hour_height;

  let block_div = $('<div>')
    .attr('data-day-of-week', day)
    .attr('data-week-number', now.format('w'))
    .attr('data-year', now.format('Y'))
    .addClass(options.block_class)
    .css({
      // height: block_height + 'px'
      backgroundColor: options.color
    });

  if (options.draggable) {
    block_div.attr('draggable', 'true');
  }

  if (options.empty_block) {
    block_div.click(time_block_click);
  }


  if (options.add_schedule_buttons) {
    let edit_button = $('<button type="button" class="close edit_schedule"><i class="fa fa-edit white-color"></i></button>').click(time_block_click_for_edit);
    let delete_button = $('<button type="button" class="close remove_schedule"><i class="fa fa-close white-color"></i></button>').click(remove_schedule_petition);

    let incomplete_button = $('<button type="button" data-schedule-id="' + options.id + '" class="close incomplete_schedule"><i class="fa fa-check-circle activate"></i></button>').click(incomplete_schedule);
    let complete_button = $('<button type="button"  data-schedule-id="' + options.id + '" class="close complete_schedule"><i class="fa fa-clock-o inactivate"></i></button>').click(complete_schedule);

    if(options.status){//if is completed
      incomplete_button.css('visibility', 'visible');
      complete_button.css('visibility', 'hidden');
    }else{//else is not completed
      complete_button.css('visibility', 'visible');
      incomplete_button.css('visibility', 'hidden');
    }

    block_div.append([edit_button, delete_button, complete_button, incomplete_button]);

  }

  if (options.id != 0) {
    block_div.attr('data-schedule-id', options.id);
  }

  return block_div;

}

function resize_time_blocks() {
  var total_height = $('#schedule').height();
  var hour_height = total_height / Globals.work_hours;
  var block_height = (Globals.time_block_duration_minutes / 60.0) * hour_height;
  $('.' + Globals.block_class).each(function () {
    $(this).css({
      // height: block_height + 'px'
    });
  });
}

function time_block_click() {
  console.log("time block click");
  if (Globals.is_selecting) {
    $('.' + Globals.block_class, Globals.is_selecting)
      .unbind('mousemove');
    $('.selected', Globals.is_selecting)
      .last()
      .addClass('end-time');

    Globals.is_selecting = null;
    Slot_data.block_count = ($(this).index() - Slot_data.block_count) + 1;

    console.log("Sloting inside is selecting: " + Slot_data.block_index);
    Slot_data.end_date = $(this).attr('data-end-time');
    Slot_data.day_of_week = $(this).attr('data-day-of-week');

    Slot_data.week_of_year = $(this).attr('data-week-number');
    Slot_data.year = $(this).attr('data-year');

    build_modal();

    return;
  }
  else if ($(this).hasClass('scheduled')) {
    console.log("on click in schedule");
    return;
    // console.log("Building modal " + $(this).attr('data-schedule-id'));
    // build_modal($(this).attr('data-schedule-id'));
    // return;
  }

  Globals.is_selecting = $(this).closest('.day');
  $('.' + Globals.block_class, Globals.is_selecting).unbind('mousemove');


  Slot_data.start_date = $(this).attr('data-start-time');
  Slot_data.block_count = $(this).index();
  Slot_data.block_index = $(this).index() - 2; //we have to reduce 2 for the .date and h3 -> monday, two elements that affects the index

  console.log("Sloting outside the selecting: " + Slot_data.block_index);


  $(this)
    .addClass('selected start-time')
    .mousemove(day_mouse_move)
    .nextUntil('.scheduled')
    .mousemove(day_mouse_move);
}

function time_block_click_for_edit() {
  console.log("Building modal " + $(this).parent().attr('data-schedule-id'));
  build_modal($(this).parent().attr('data-schedule-id'));
  return;
}

function complete_schedule() {
  let schedule_id = $(this).parent().attr('data-schedule-id');
  $(this).css('visibility', 'hidden');
  $('.incomplete_schedule[data-schedule-id="' + schedule_id  + '"]').css('visibility', 'visible');

  console.log("Complete the schedule: ");
  console.dir(time_slots[schedule_id]);

  time_slots[schedule_id].status = "completed";
  time_slots[schedule_id].category = time_slots[schedule_id].categories[0].id;

  update_slot_time(function () {
    $('.scheduled[data-schedule-id="' + schedule_id + '"]').each(function (i, obj) {
      $(this).addClass('completed');
    });
  }, schedule_id, time_slots[schedule_id]);
}

function incomplete_schedule(){
  let schedule_id = $(this).parent().attr('data-schedule-id');
  $(this).css('visibility', 'hidden');
  $('.complete_schedule[data-schedule-id="' + schedule_id  + '"]').css('visibility', 'visible');

  console.log("Incomplete the schedule: ");
  console.dir(time_slots[schedule_id]);

  time_slots[schedule_id].status = "scheduled";

  time_slots[schedule_id].category = time_slots[schedule_id].categories[0].id;

  update_slot_time(function () {
    $('.scheduled[data-schedule-id="' + schedule_id + '"]').each(function (i, obj) {
      $(this).removeClass('completed');
    });
  }, schedule_id, time_slots[schedule_id]);
}

function day_mouse_move() {
  console.log("day mouse move");
  if (!Globals.is_selecting)
    return;

  if ($(this).hasClass('selected start-time')) {
    $(this).nextAll().removeClass('selected');
    return;
  }

  var state = 'select';
  var self = $(this)[0];
  $('.' + Globals.block_class + '.selected.start-time', Globals.is_selecting).nextAll().each(function () {
    if ($(this)[0] == self) {
      state = 'end';
    }

    switch (state) {
      case 'end':
        state = 'deselect';
      case 'select':
        $(this).addClass('selected');
        return;
      case 'deselect':
        $(this).removeClass('selected');
        return;
    }
  });
}

function reload_blocks() {
  $('.time-block').remove();
  update_time_slots_objects(start);
}