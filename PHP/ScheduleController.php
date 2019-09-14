<?php
/**
 * Created by PhpStorm.
 * User: mjwunderlich
 * Date: 10/12/17
 * Time: 3:13 PM
 */

namespace App\Http\Controllers;


use App\Category;
use App\Schedule;
use Carbon\Carbon;
use Faker\Provider\DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ScheduleController extends Controller
{
    private $week_time_blocks = [];
    private $time_block_duration_minutes = 15;
    private $days = ['Monday' => 1, 'Tuesday' => 2, 'Wednesday' => 3, 'Thursday' => 4, 'Friday' => 5];
    
    public function __construct()
    {
        $this->initialize_time_blocks();
        $this->middleware('auth');
    }

    public function index()
    {
        $date = Carbon::now("America/Guatemala");
//        $time = Carbon::create("2019", "12", "2", "07", "15", 0, "America/Guatemala");
//
//        print_r($time);die();
        $week = $date->weekOfYear;
        $year = $date->year;
        
        $workweek = $this->load_week_schedule($week, $year);
        $categories = Auth::user()->categories;
//        if (empty($workweek)) {
//            $workweek = $this->generate_week_schedule();
//        }
//        print_r($workweek);die();
        return view('schedule', ['week_schedule' => $workweek, 'categories' => $categories]);
    }

    private function initialize_time_blocks()
    {
        $block_minutes = 15;
        $workday_hours = 12;
        $workday_block_count = (60.0 / $block_minutes) * $workday_hours;
        $this->week_time_blocks = [];
        foreach ($this->days as $day => $index) {
            $this->week_time_blocks[$day] = [];
            for ($i=0; $i<$workday_block_count; ++$i) {
                $this->week_time_blocks[$day][] = false;
            }
        }
    }

    private function load_week_schedule($week, $year)
    {
        //ahora que tenemos el numero de semana y anio, hay que filtrarlo en el where, y en el js actualizar week data cada vez que se cambia de semana
//        $schedules = Schedule::orderBy('start_time', 'asc')->get();
        
//        print_r($week . " with year " . $year);die();
//        $query = "SELECT * FROM schedules WHERE DATE_FORMAT(start_time, '%v') = " . $week . " AND DATE_FORMAT(start_time, '%Y') = " . $year . " ORDER BY start_time ASC";
        $query = "SELECT * FROM schedules WHERE week_of_year = " . $week . " AND year = " . $year . " AND user_id = " . Auth::id() . " ORDER BY start_time ASC";
        $schedules = DB::select($query);
//        $schedules = Schedule::where('week_of_year', $week)->where('year', $year)->orderBy('start_time', 'asc')->get()->toArray();
        $workweek = [];
        foreach ($schedules as $schedule) {
            if (!array_key_exists($schedule->day_of_week, $workweek)) {
                $workweek[$schedule->day_of_week] = [];
            }
            
            $schedule_categories = Schedule::find($schedule->id)->categories()->get()->toArray();
            $schedule_array = (array)$schedule;
            $schedule_array['categories'] = $schedule_categories;
            
            $workweek[$schedule->day_of_week][] = $schedule_array;
        }
        return $workweek;
    }
    
    public function get_week_data_ajax(Request $request){
        $week = $request->input('week');
        $year = $request->input('year');
        return $this->load_week_schedule($week, $year);
    }

    private function generate_week_schedule($block_time = true)
    {
        $workweek = [];
        foreach ($this->days as $day => $index) {
            $workweek[$day] = $this->generate_day_schedule($day, $block_time);
        }
        return $workweek;
    }

    private function generate_day_schedule($day, $block_time = true)
    {
        if (!array_key_exists($day, $this->days))
            throw new \Exception("Invalid weekday: `$day`");

        $blocks = [];
        $start_index = 0;
        while (($block = $this->generate_schedule_record($day, $start_index, $block_time)) !== false) {
            $start_index = $block['block_index'] + $block['block_count'] + 1;
            $blocks[] = $block;
        }

        usort($blocks, function ($a, $b) {
            return $a['block_index'] - $b['block_index'];
        });

        return $blocks;
    }

    private function generate_schedule_record($day = false, $start_index = 0, $block_time = true)
    {
        if (!$day || !array_key_exists($day, $this->days)) {
            // TODO: This needs to be changed
            $day = array_random($this->days);
        }

        // Find an open slot for this day
        $num_time_slots = count($this->week_time_blocks[$day]);

        if ($start_index >= $num_time_slots)
            return false;

        $i = mt_rand($start_index, min($start_index+mt_rand(1,15), $num_time_slots));
        $start_time = false;
        $end_time = false;
        $max_duration = mt_rand(1, 5);
        for ( ; $i < $num_time_slots; ++$i) {
            if ($this->week_time_blocks[$day][$i] === false) {
                if ($start_time === false)
                    $start_time = $i;
                else {
                    if ($i - $start_time >= $max_duration || $i == $num_time_slots) {
                        $end_time = $i;
                        break;
                    }
                }
            }
            elseif ($start_time !== false) {
                // We just encountered a used time-block
                $end_time = max($start_time, $i - 1);
                break;
            }
        }

        if ($start_time === false || $end_time === false) {
            // Record could not be generated
            return false;
        }

        $block = [
            'id' => md5(uniqid('schedule_', true)),
            'day' => $day,
            'block_index' => $start_time,
            'block_count' => $end_time - $start_time
        ];

        if ($block_time) {
            // Block out the time so it's not re-assigned
            $this->schedule_time_block($block);
        }

        $this->save_time_block($block);
        return $block;
    }

    private function schedule_time_block($block)
    {
        for ($i=$block['block_index']; $i <= $block['block_index'] + $block['block_count']; ++$i) {
            $this->week_time_blocks[$block['day']][$i] = $block['id'];
        }
    }

    private function save_time_block($block)
    {
        try {
            // Make a new copy of the block array
            $block = array_merge([], $block);
            $block_day = $this->days[ $block['day'] ] - 1;

            $start_hour = 6;
            $hour_of_day = $start_hour + floor($block['block_index']*15/60);
            $minute_of_hour = ($block['block_index'] * 15) % 60;

            $now = Carbon::now("America/Guatemala");
            $time = Carbon::create($now->year, $now->month, $now->copy()->startOfWeek()->day + $block_day, $hour_of_day, $minute_of_hour, 0, "America/Guatemala");

            $block['start_time'] = $time->toDateTimeString();
            $block['end_time'] = $time->addMinutes($block['block_count'] * 15)->toDateTimeString();
            $block['title'] = "This is a title";
            $block['description'] = "This is a description";
            $block['category'] = 0;
            $block['day_of_week'] = $block['day'];
            unset($block['day']);
            unset($block['id']);

            $schedule = new Schedule($block);
            $schedule->user()->associate(Auth::user());
            $schedule->save();
//
//            $start = Carbon::createFromTimestamp($block['start_time'], "America/Guatemala");
//            $end = Carbon::createFromTimestamp($block['end_time'], "America/Guatemala");
//
            file_put_contents("php://stderr", "Timestamp: " . $time->format("l j, G:i") . "\n");
//            file_put_contents("php://stderr", "Start: " . $start->format("l, G:i") . "\n");
//            file_put_contents("php://stderr", "End: " . $end->format("l, G:i") . "\n");
        } catch (\Exception $error) {
            error_log($error->getMessage());
        }
    }
    
    public function save_time_block_ajax(Request $request){
        try{
            $slot_data = $request->input('slot_data');
            $categories = $slot_data['category'];
            unset($slot_data['category']);
            unset($slot_data['undefined']);
            unset($slot_data['categories']);
            unset($slot_data['id']);
            
            $time = $this->build_time_from_to($slot_data);
            $slot_data['start_time'] = $time[0]->toDateTimeString();
            $slot_data['end_time'] = $time[1]->toDateTimeString();

            $schedule = new Schedule($slot_data);
            $schedule->user()->associate(Auth::user());
            $schedule->save();
    
            $schedule->categories()->attach($categories);
            
            return response(["status" => "success", "color" => $categories, "schedule" => $schedule], 200);
        } catch (\Exception $exception) {
            return response(["message" => $exception->getMessage()], 400);
        }
        
    }
    
    public function edit_time_block(Request $request){
        try{
            $slot_data = $request->input('slot_data');
            $id = $request->input('slot_id');
            $categories = $slot_data['category'];
            unset($slot_data['category']);
            unset($slot_data['undefined']);
            unset($slot_data['categories']);
            unset($slot_data['user']);
            
            $shedule_save = Schedule::find($id);
            $schedule_updated = Schedule::where('id', $id)
                    ->update($slot_data);
            
            $shedule_save->categories()->detach(); //delete all the categories in the pivot table
            $shedule_save->categories()->attach($categories);
            
            return response(["status" => "success", "scheduleid" => $id], 200);
        }
        catch(\Exception $exception){
            return response(["message" => $exception->getMessage()], 400);
        }
    }
    
    public function build_time_from_to($time_slot){
        $start_time = explode(':', $time_slot['start_time']);
        $end_time = explode(':', $time_slot['end_time']);
    
    
        $now = Carbon::now("America/Guatemala");
        $now->setISODate($time_slot['year'],$time_slot['week_of_year']);
        
        $time[0] = Carbon::create($time_slot['year'], $now->month, date('N', strtotime($time_slot['day_of_week'])), $start_time[0], $start_time[1], 0, "America/Guatemala");
        $time[1] = Carbon::create($time_slot['year'], $now->month, date('N', strtotime($time_slot['day_of_week'])), $end_time[0], $end_time[1], 0, "America/Guatemala");
        return $time;
    }
    
    public function delete_time_block(Request $request)
    {
        try{
            $schedule = Schedule::findOrFail($request->get('schedule_id'));
            $schedule->delete();
            return response(["status" => "success"], 200);
        }catch(Exception $exception){
            return response(["message" => $exception->getMessage()], 400);
        }
    }
}
