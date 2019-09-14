var global_time_block_selected;

function handleDragStart(e) {
  $(this).addClass('dragstart');

  global_time_block_selected = time_slots[$(this).attr('data-schedule-id')];
  let time_block_brothers = $('.time-block[data-schedule-id = ' + global_time_block_selected.id + ']');
  time_block_brothers.addClass('selected-sides');

  time_block_brothers.first().addClass('selected-first');
  time_block_brothers.last().addClass('selected-last');

  el_time_block = this;

  // e.dataTransfer.effectAllowed = 'move';
  // e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }// Necessary. Allows us to drop.

  e.dataTransfer.dropEffect = 'move';

  return false;
}

function handleDragEnter(e) {
  // this / e.target is the current hover target.
  console.log("handleDragEnter");

  delete_over(draw_over, $(this));
}

function handleDragLeave(e) {
  // $('.time-block.over').each(function(i, obj){
  //   obj.classList.remove('over');
  // });
  let last_element = $(this);
  for (x = 1; x < global_time_block_selected.block_count; x++) {
    last_element = (last_element).next().removeClass('over');
  }
  this.classList.remove('over');  // this / e.target is previous target element.
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation(); // stops the browser from redirecting.
  }


  if ($(this).hasClass('over-stripe-error')) {
    alert("Sorry, you can't put the time block there");
    $('.time-block.over-stripe-error').each(function () {
      $(this).removeClass('over-stripe-error')
    });
    return false;
  }
  // Don't do anything if dropping the same column we're dragging.
  if (el_time_block != this) {
    // Set the source column's HTML to the HTML of the column we dropped on.
    // el_time_block.innerHTML = this.innerHTML;
    // this.innerHTML = e.dataTransfer.getData('text/html');
    move($(this));
  }

  return false;
}

function handleDragEnd(e) {
  // this/e.target is the source node.
  let time_block_brothers = $('.time-block[data-schedule-id = ' + global_time_block_selected.id + ']');
  time_block_brothers.removeClass('selected-sides selected-last selected-first');
}

function draw_over(time_block_selected) {
  let last_element = time_block_selected;
  for (x = 1; x < global_time_block_selected.block_count; x++) {
    last_element = (last_element).next().addClass('over-stripe');
  }
  $(time_block_selected).addClass('over-stripe');

  let error = false;
  $('.over-stripe').each(function () {
    if ($(this).hasClass('scheduled')) {
      if ($(this).attr('data-schedule-id') != global_time_block_selected.id) {
        error = true;
        $('.over-stripe').removeClass('over-stripe').addClass('over-stripe-error');
      }
    }
  });
}

function delete_over(after_delete_over, time_block_selected) {
  $('.time-block.over-stripe').each(function (i, obj) {
    obj.classList.remove('over-stripe');
  });

  $('.time-block.over-stripe-error').each(function (i, obj) {
    obj.classList.remove('over-stripe-error');
  });
  after_delete_over(time_block_selected);
}

function move(new_position) {
  // remove_schedule(global_time_block_selected.id, function(){});
  clean_old_blocks(global_time_block_selected.id);

  let new_time_blocks = $('.time-block.over-stripe');

  let new_week = new_time_blocks.first().attr('data-week-number');
  let new_year = new_time_blocks.first().attr('data-year');
  let new_day = new_time_blocks.first().attr('data-day-of-week');

  let new_start_time = moment().day(new_day).week(new_week).year(new_year).format('YYYY-MM-D');
  let new_end_time = moment().day(new_day).week(new_week).year(new_year).format('YYYY-MM-D');

  global_time_block_selected.day_of_week = new_day;
  global_time_block_selected.week_of_year = new_week;
  global_time_block_selected.year = new_year;

  global_time_block_selected.start_time = new_start_time + ' ' + new_time_blocks.first().attr('data-start-time') + ':00';
  global_time_block_selected.end_time = new_end_time + ' ' + new_time_blocks.last().attr('data-end-time') + ':00';

  global_time_block_selected.block_index = new_time_blocks.first().index() - 2; //we have to reduce 2 for the .date and h3 -> monday, two elements that affects the index
  global_time_block_selected.category = global_time_block_selected.categories[0].id;

  console.log("updated");
  console.dir(global_time_block_selected);

  update_slot_time(update_data_info, global_time_block_selected.id, global_time_block_selected);

  new_time_blocks.first().addClass('start-time');
  new_time_blocks.last().addClass('end-time');


  let edit_button = $('<button type="button" class="close edit_schedule"><i class="fa fa-edit white-color"></i></button>').click(time_block_click_for_edit);
  let delete_button = $('<button type="button" class="close remove_schedule"><i class="fa fa-close white-color"></i></button>').click(remove_schedule_petition);

  let block_title = $('<h5 class="white-color block_title">').attr('data-id', global_time_block_selected.id).html(global_time_block_selected.title);
  let schedule_time_range = $('<h5 class="white-color time_range">').attr('data-id', global_time_block_selected.id).html(new_time_blocks.first().attr('data-start-time') + '  &mdash; ' + new_time_blocks.last().attr('data-end-time'));

  let incomplete_button = $('<button type="button" data-schedule-id="' + global_time_block_selected.id + '" class="close incomplete_schedule"><i class="fa fa-check-circle activate"></i></button>').click(incomplete_schedule);
  let complete_button = $('<button type="button"  data-schedule-id="' + global_time_block_selected.id + '" class="close complete_schedule"><i class="fa fa-clock-o inactivate"></i></button>').click(complete_schedule);

  if(global_time_block_selected.status == "completed"){//if is completed
    incomplete_button.css('visibility', 'visible');
    complete_button.css('visibility', 'hidden');
  }else{//else is not completed
    complete_button.css('visibility', 'visible');
    incomplete_button.css('visibility', 'hidden');
  }

  new_time_blocks.each(function (i, obj) {
    $(this).addClass('scheduled');
    $(this).removeClass('over-stripe');
    $(this).find('.time-day').empty();
    $(this).attr({
      'draggable': true,
      'data-schedule-id': global_time_block_selected.id
    });
    $(this).css({
      'background-color': global_time_block_selected.categories[0].color,
    });
  });
  new_time_blocks.first().append([edit_button, delete_button, incomplete_button, complete_button]);
  new_time_blocks.last().find('.time-day').append([block_title, schedule_time_range]);
  update_time_slots_objects(function () {
    $('.time-block').remove();
    start();
    add_dnd_magic();
  });
}

function clean_old_blocks(schedule_id) {
  let old_blocks = $('.time-block[data-schedule-id = ' + schedule_id + ']');
  old_blocks.each(function () {
    $(this).attr({
      'style': '',
      'data-schedule-id': '',
      'draggable': false,
    });
    let schedule_default_text = $('<span>');
    schedule_default_text.html($(this).attr('data-start-time') + ' &mdash; ' + $(this).attr('data-end-time'));

    $(this).find('.time-day').attr('data-time-slot-title', '').empty().html(schedule_default_text);
    $(this).find('.edit_schedule').remove();
    $(this).find('.remove_schedule').remove();

    $(this).find('.incomplete_schedule').remove();
    $(this).find('.complete_schedule').remove();

    $(this).removeClass('scheduled start-time end-time selected-first selected-last selected-sides');
    $(this).click(time_block_click  );//add the old click
  });
}

function add_dnd_magic() {
  $('.time-block').each(function (i, obj) {
    obj.addEventListener('dragstart', handleDragStart, false);
    obj.addEventListener('dragenter', handleDragEnter, false);
    obj.addEventListener('dragover', handleDragOver, false);
    obj.addEventListener('dragleave', handleDragLeave, false);
    obj.addEventListener('drop', handleDrop, false);
    obj.addEventListener('dragend', handleDragEnd, false);
    console.log("dnd event listener");
  });
}

$(document).ready(function () {
  add_dnd_magic();
});