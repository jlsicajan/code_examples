<?php

namespace App\Http\Controllers;

use App\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('categories.index');
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
        try{
            $category_data = $request->input('category_data');
            
            $category = new Category($category_data);
            $category->user()->associate(Auth::user());
            $category->save();
        
            return response(["status" => "success", "category_id" => $category->id], 200);
        } catch (\Exception $exception) {
            return response(["message" => $exception->getMessage()], 400);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Category  $category
     * @return \Illuminate\Http\Response
     */
    public function show(Category $category)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Category  $category
     * @return \Illuminate\Http\Response
     */
    public function edit(Category $category)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Category  $category
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Category $category)
    {
        //
        //
        try{
            $category_data = $request->input('category_data');
            $id = $request->input('category_id');
        
            $category_updated = $category::where('id', $id)
                    ->update($category_data);
            
            return response(["status" => "success"], 200);
        }
        catch(\Exception $exception){
            return response(["message" => $exception->getMessage()], 400);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Category  $category
     * @return \Illuminate\Http\Response
     */
    public function destroy(Category $category)
    {
        //
    }
    
    public function get_categories_list(Request $request){
        $term = $request->term ?: '';
        $categories = Category::where('display_name', 'like', $term . '%')->where('user_id', Auth::id())->get();
        $valid_categories = [];
        foreach ($categories as $category) {
            $valid_categories[] = ['id' => $category->id, 'name' => $category->name, 'text' => $category->display_name, 'display_name' => $category->display_name, 'parent_id' => $category->parent_id, 'color' => $category->color];
        }
        return \Response::json($valid_categories);
    }
    
    public function set_default(Request $request){
        $category_id = $request->input('category_id');
        try{
            $this->change_default_category($category_id);
            return response(["status" => "success"], 200);
        } catch (\Exception $exception) {
            return response(["message" => $exception->getMessage()], 400);
        }
    }
    
    protected function change_default_category($category_id){
        $user_id = Auth::id();
        $old_default_category = Category::where('user_id', $user_id)->where('default', 1)->first();
        if(!is_null($old_default_category)){
            $old_default_category->default = 0;
            $old_default_category->save();
        }
    
        $new_default_category = Category::find($category_id);
        if(!is_null($new_default_category)){
            $new_default_category->default = 1;
            $new_default_category->save();
        }
    }
}
