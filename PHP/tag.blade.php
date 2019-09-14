@extends('layouts.front-end-app')

@section("title",ucfirst($tag->description))

@section('styles')
    <style>
        a:hover{
            text-decoration: none;
        }
        .hovereffect h2 {
            -webkit-transform: none;
            -ms-transform: none;
            transform: none;
            -webkit-transition: none;
            transition: none;
        }
        .all-videos .categories{
            display: none;
        }
    </style>
@endsection

@section('content')
    <div class="container-fluid table-responsive" style="margin-top: -20px;">
        <div id="site">

            @if($videos && $videos->count()>0)
                @include('frontend.partials.all-authors-videos',["recent_videos"=>$videos,"popular"=>true,"title"=>ucfirst($tag->description)." Videos"])
            @endif

        </div>
    </div>
@endsection

@section("scripts")
    <script>

        $(".channel .left-mv").on("click", function () {
            var parent = $(this).parent().parent();
            var slideTo = parseInt(parent.data("slide-to"));
            var grid = parent.prev();
            var indicators = $(this).parent().next();
            var filter = parent.data("filter");
            if (parseInt(slideTo) - 1 >= 0)
                slideTo -= 1;
            $.ajax({
                type: "get",
                url: "{{action('FrontEndController@getMoreVideosWithTag')}}",
                dataType: "json",
                data: {
                    tag_id: {{$tag->id}},
                    slide_to: slideTo,
                    filter: filter
                },
                success: function (data) {
                    var overlay = $("body").css("overflow-x");
                    $("body").attr("style", "overflow-x: hidden !important");

                    $(grid).hide("slide", {direction: "right"}, function () {
                        $(this).html(data.html).show("slide", {direction: "left"}, function () {
                            $("body").css("overflow-x", overlay);
                        });
                    });

//                        $(grid).toggle( "slide",function () {
//                            $(this).html("").append(data.html).toggle( "slide" )
//                        });
                    $(parent).data("slide-to", slideTo);

                    indicators.find("li.active").prev().addClass("active").siblings().removeClass('active');

                },
                error: function (data) {
                    console.log("error ", data);
                }
            });
        });
        $(".channel .right-mv").on("click", function () {
//                console.log("right of " + $(this).data("author-id"));
            var parent = $(this).parent().parent();
            var slideTo = parseInt(parent.data("slide-to"));
            var grid = parent.prev();
            var indicators = $(this).parent().prev();
            var filter = parent.data("filter");
            slideTo += 1;
            $.ajax({
                type: "get",
                url: "{{action('FrontEndController@getMoreVideosWithTag')}}",
                dataType: "json",
                data: {
                    tag_id: {{$tag->id}},
                    slide_to: slideTo,
                    filter: filter
                },
                success: function (data) {
//                        console.log("success");
                    var overlay = $("body").css("overflow-x");
                    $("body").attr("style", "overflow-x: hidden !important");

                    $(grid).hide("slide", {direction: "left"}, function () {
                        var height = $(this).css("height");

                        $(this).html(data.html).show("slide", {direction: "right"}, function () {
                            $("body").css("overflow-x", overlay);
                        });
                    });
//                        $(grid).toggle( "slide",function () {
//                          $(this).html("").append(data.html).toggle( "slide" )
//                        });
                    $(parent).data("slide-to", slideTo);

                    indicators.find("li.active").next().addClass("active").siblings().removeClass('active');

                },
                error: function (data) {
                    console.log("error ", data);
                }
            });
        });
        $(".channel .indicators li").on("click", function () {
            var previous = $(this).siblings(".active");
            $(this).addClass("active").siblings().removeClass('active');
            var parent = $(this).parent().parent().parent();
            var slideTo = parseInt($(this).data("slide-to"));
            var grid = parent.prev();
            var filter = $(parent).data("filter");
            $.ajax({
                type: "get",
                url: "{{action('FrontEndController@getMoreVideosWithTag')}}",
                dataType: "json",
                data: {
                    tag_id: {{$tag->id}},
                    slide_to: slideTo,
                    filter: filter
                },
                success: function (data) {
                    var overlay = $("body").css("overflow-x");
                    $("body").attr("style", "overflow-x: hidden !important");

                    if (parseInt($(previous).data("slide-to")) > slideTo)
                        $(grid).hide("slide", {direction: "right"}, function () {
                            $(this).html("").append(data.html).show("slide", {direction: "left"}, function () {
                                $("body").css("overflow-x", overlay);
                            });
                        });
                    else
                        $(grid).hide("slide", {direction: "left"}, function () {
                            $(this).html("").append(data.html).show("slide", {direction: "right"}, function () {
                                $("body").css("overflow-x", overlay);
                            });
                        });
//                        $(grid).toggle( "slide",function () {
//                            $(this).html("").append(data.html).toggle( "slide" )
//                        });
                    $(parent).data("slide-to", slideTo);
                },
                error: function (data) {
                    console.log("error ", data);
                }
            });
        });

        $(".most-recent-videos .left-mv").on("click", function () {
            var parent = $(this).parent().parent();
            var slideTo = parseInt(parent.data("slide-to"));
            var grid = parent.prev();
            var indicators = $(this).parent().next();
            var filter = parent.data("filter");
            if (parseInt(slideTo) - 1 >= 0)
                slideTo -= 1;
            $.ajax({
                type: "get",
                url: "{{action('FrontEndController@getMoreVideosWithTag')}}",
                dataType: "json",
                data: {
                    slide_to: slideTo,
                    filter: filter
                },
                success: function (data) {
                    var overlay = $("body").css("overflow-x");
                    $("body").attr("style", "overflow-x: hidden !important");

                    $(grid).hide("slide", {direction: "right"}, function () {
                        $(this).html(data.html).show("slide", {direction: "left"}, function () {
                            $("body").css("overflow-x", overlay);
                        });
                    });

//                        $(grid).toggle( "slide",function () {
//                            $(this).html("").append(data.html).toggle( "slide" )
//                        });
                    $(parent).data("slide-to", slideTo);

                    indicators.find("li.active").prev().addClass("active").siblings().removeClass('active');

                },
                error: function (data) {
                    console.log("error ", data);
                }
            });
        });
        $(".most-recent-videos .right-mv").on("click", function () {
//                console.log("right of " + $(this).data("author-id"));
            var parent = $(this).parent().parent();
            var slideTo = parseInt(parent.data("slide-to"));
            var grid = parent.prev();
            var indicators = $(this).parent().prev();
            var filter = parent.data("filter");
            slideTo += 1;
            $.ajax({
                type: "get",
                url: "{{action('FrontEndController@getMoreVideosWithTag')}}",
                dataType: "json",
                data: {
                    tag_id: {{$tag->id}},
                    slide_to: slideTo,
                    filter: filter
                },
                success: function (data) {
//                        console.log("success");
                    var overlay = $("body").css("overflow-x");
                    $("body").attr("style", "overflow-x: hidden !important");

                    $(grid).hide("slide", {direction: "left"}, function () {
                        var height = $(this).css("height");

                        $(this).html(data.html).show("slide", {direction: "right"}, function () {
                            $("body").css("overflow-x", overlay);
                        });
                    });
//                        $(grid).toggle( "slide",function () {
//                          $(this).html("").append(data.html).toggle( "slide" )
//                        });
                    $(parent).data("slide-to", slideTo);

                    indicators.find("li.active").next().addClass("active").siblings().removeClass('active');

                },
                error: function (data) {
                    console.log("error ", data);
                }
            });
        });
        $(".most-recent-videos .indicators li").on("click", function () {
            var previous = $(this).siblings(".active");
            $(this).addClass("active").siblings().removeClass('active');
            var parent = $(this).parent().parent().parent();
            var slideTo = parseInt($(this).data("slide-to"));
            var grid = parent.prev();
            var filter = $(parent).data("filter");
            $.ajax({
                type: "get",
                url: "{{action('FrontEndController@getMoreVideosWithTag')}}",
                dataType: "json",
                data: {
                    tag_id: {{$tag->id}},
                    slide_to: slideTo,
                    filter: filter
                },
                success: function (data) {
                    var overlay = $("body").css("overflow-x");
                    $("body").attr("style", "overflow-x: hidden !important");

                    if (parseInt($(previous).data("slide-to")) > slideTo)
                        $(grid).hide("slide", {direction: "right"}, function () {
                            $(this).html("").append(data.html).show("slide", {direction: "left"}, function () {
                                $("body").css("overflow-x", overlay);
                            });
                        });
                    else
                        $(grid).hide("slide", {direction: "left"}, function () {
                            $(this).html("").append(data.html).show("slide", {direction: "right"}, function () {
                                $("body").css("overflow-x", overlay);
                            });
                        });
//                        $(grid).toggle( "slide",function () {
//                            $(this).html("").append(data.html).toggle( "slide" )
//                        });
                    $(parent).data("slide-to", slideTo);
                },
                error: function (data) {
                    console.log("error ", data);
                }
            });
        });

        $(".filter-buttons button").on("click", function () {
            $(this).addClass("active").siblings().removeClass('active');
            var filter = $(this).data("filter");

            var grid = $(this).parent().parent().next();
            grid.next().data("filter", filter);
            $.ajax({
                type: "get",
                url: "{{action('FrontEndController@getMoreVideosWithTag')}}",
                dataType: "json",
                data: {
                    tag_id: {{$tag->id}},
                    slide_to: 0,
                    filter: filter
                },
                success: function (data) {
                    $(grid).next().find(".central-controls ol.indicators li.active").removeClass("active");
                    $(grid).next().find(".central-controls ol.indicators li:nth-child(1)").addClass("active");
                    $(grid).hide("slide", {direction: "up"}, function () {
                        $(this).html(data.html).show("slide", {direction: "down"})
                    });
                },
                error: function (data) {
                    console.log("error ", data);
                }
            });
        });
    </script>

@endsection