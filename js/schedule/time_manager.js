var current_week = moment().format('w');
var current_year = moment().year();
var now = moment();

function start(){
  console.log("building with week data: ");
  console.dir(week_data);
  $('.day').each(function () {
    var day_name = $(this).find('h3').text();

    var date_of_time_slot = moment().day($('h3', $(this)).text()).week(current_week);
    $('.date_for_day', $(this)).text(date_of_time_slot.format('MMM D YYYY'));
    //Check if the day has time slots
    if(week_data[day_name]){
      setup_daily_blocks_with_data($(this), week_data[day_name]);
    }else{
      setup_daily_blocks($(this));
    }
  });
  $(window).resize(resize_time_blocks);
  update_week_indicator();
}

function clear_week(){
  //clean days
  $('.day').each(function () {
    setup_daily_blocks($(this));
  });
  $(window).resize(resize_time_blocks);
  update_week_indicator();
}

function update_week_indicator(){
  //Update the week number with the js objects
  $('.week-indicator').html(current_week + ' of ' + now.format('MMM') + ' ' + now.format('Y'));
}

function update_time_slots_objects(execute_after_update){
  $.ajax({
    url: '/schedules/week',
    type: 'GET',
    data: { week: current_week, year: now.format('Y') },
    success: function (data) {
      console.log('success');
      console.dir(data);
      week_data = data;
      execute_after_update();
    },
    error: function (error) {
      console.log('error');
    }
  });
}

function back_week(){
  // $('.day').toggleClass('move-week');
  // $('.time-block').remove();

  clean_schedule(function(){
    current_week = now.subtract(7, 'days').format('w');

    update_week_indicator();
    update_schedule_attributes();
    update_time_slots_objects(function(){start(); $('.schedule_cache').remove(); add_dnd_magic()});

  });//ver poque fuckins no cargan los schedule despues

  // update_time_slots_objects(function(){start(); add_dnd_magic()});
  // update_time_slots_objects(start);
  // start();
}

function move_week(){
  // $('.day').toggleClass('move-week');
  // $('.time-block').remove();
  clean_schedule(function(){
    current_week = now.add(7, 'days').format('w');

    update_week_indicator();
    update_schedule_attributes();
    update_time_slots_objects(function(){start(); $('.schedule_cache').remove(); add_dnd_magic()});
  });


  // update_time_slots_objects(function(){start(); add_dnd_magic()});
  // update_time_slots_objects(start);
  // start();
}

function clean_schedule(after_clean_all){
  $.each(time_slots, function(i, time_slot){
    clean_old_blocks(time_slot.id);
  });

  after_clean_all();
}

function update_schedule_attributes(){
  $('.time-block').each(function (i, obj) {
    $(this).attr('data-week-number', current_week);
    $(this).addClass('schedule_cache');
  });
}