<?php

namespace App\Http\Controllers\Admin;

use App\Tag;
use Illuminate\Http\Response;
use View;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class TagController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }
    
    /**
     * @return mixed
     */
    public function index()
    {
        $tags = Tag::all();
        return View('admin.tags.index')
                ->with('tags', $tags);
    }
    
    /**
     * @param Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function create(Request $request)
    {
        $id = $request->get('tag_id');
        $description = $request->get('description');
        if (!$id) {
            $tag = new Tag();
            $tag->description = $description;
        }
        else {
            $tag = Tag::query()
                    ->where('description', $description)
                    ->first();
            if ($tag && $tag->id != $id)
                return \Illuminate\Support\Facades\Response::json([
                        'state' => 'true',
                        'description' => 'That description is in use'
                ], 403);
            
            $tag = Tag::find($id);
            $tag->description = $description;
        }
        
        
        $tag->save();
        
        $tag->slug = \Helpers::slugify($tag->description) . "-" . $tag->id;
        if ($request->hasFile("file"))
            $tag->thumbnail_url = $this->uploadFile($request, $request->get("description"), "file", $tag->id);
        
        $tag->save();
        
        return json_encode($tag);
    }
    
    /**
     * @param Request $request
     *
     * @return string
     */
    public function find(Request $request)
    {
        $id = $request->get('id');
        
        $tag = Tag::find($id);
        
        return json_encode($tag);
    }
    
    public function uploadFile(Request $request, $title, $file_param = "file", $id)
    {
        try {
            $upload_dir = public_path(sprintf("uploaded/tags/%03d", $id), false);
            // Get the file
            if (!$request->hasFile($file_param)) {
                throw new HttpException(404, "No file to upload");
            }
            
            $file = $request->file($file_param);
            $uuid = sha1(sha1_file($file->getRealPath()) . "$title");
            
            
            if (!is_dir($upload_dir))
                \Helpers::mkdirRecursive($upload_dir);
            
            $file_mime = str_replace("/", ".", $file->getMimeType());
            
            $file_name = strtolower("$uuid.$file_mime");
            
            $file = $file->move($upload_dir, $file_name);
            
            return sprintf("/uploaded/tags/%03d", $id) . "/" . $file_name;
            
            
        }
        catch (\Exception $error) {
            // Just re-throw the error
            throw $error;
        }
    }
    
    public function delete(Request $request)
    {
        try {
            $tag = Tag::find($request->get("id"));
            $tag->videos()->detach();
            $tag->delete();
            
            return response(["state" => "successful"], 200);
        }
        catch (\Exception $e) {
            return response(["state" => $e->getMessage()], $e->getCode());
        }
    }
}
