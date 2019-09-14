@extends('layouts.front-end-app')

@section("title","Join Now")

@section("styles")
    <script src="/YTPlayer/jquery.mb.YTPlayer.js" type="application/javascript"></script>
    <link rel="stylesheet" type="text/css" href="/YTPlayer/css/jquery.mb.YTPlayer.min.css">
    <style>
        .panel-header {
            padding: 15px;
            border-bottom: transparent;
            text-align: center;
        }

        .btn {
            color: #fff;
            border: 0;
            border-radius: 5px;
            background-color: #FFAA0F;
        }

        .btn:hover {
            background-color: #F5960F !important;
            color: white;
        }

        /*// FACEBOOK social button*/
           .btn.facebook-btn {
               background-color: #3B5998;
               color: white;
           }

        /*// TWITTER social button*/
           .btn.twitter-btn {
               background-color: #1DA1F2;
               color: white;
           }

        /*// GOOGLE social button*/
           .btn.google-btn {
               background-color: #C13C31;
               color: white;
           }

        /*// Any button that includes an <i> icon will be left-padded*/
           .btn > i {
               padding-left: 10px;
           }

        .ac-form form button {
            width: 400px;
            height: 40px;
            text-transform: uppercase;
            font-weight: bold;
            color: #fff;
            border: 0;
            border-radius: 5px;
            cursor: pointer;
            background-color: #FFAA0F;
            margin-top: 25px;
        }

        .ac-form form button:hover {
            background-color: #F5960F !important;
        }
        .main {
            height: 110vh;
            width: 100%;
            position: fixed;
            margin-top: -20px;
            top: 0;
            left: 0;
        }
        .content {
            position: relative;
            left: 0;
            right: 0;
            margin-left: auto;
            margin-right: auto;
            color: white;
            z-index: 200;
        }
        p {
            color: white;
        }

        footer{
            position: relative;
        }
        .ac-form .input-group{
            top: 0;
            left: 0;
            right: 0;
            margin-left: auto;
            margin-right: auto;
            margin-bottom: 5px;
        }

        .follows label{
            padding-right: 15px;
            padding-left: 15px;
        }
    </style>
@endsection

@section('content')
    {{--AC = After checkout--}}
    <div class="main" style="background-image: url(/img/wall2.jpg); background-position-x: center">
        <div id="bgndVideo"
             data-property="{videoURL:'https://www.youtube.com/watch?v=PKc5qj2ZjQs',containment:'.main',showControls:false, autoPlay:true, loop:true, vol:50, mute:false, startAt:0, opacity:1, addRaster:true, quality:'default', optimizeDisplay:true}">
        </div>
        <div class="overlay" style="background-color: rgba(0,0,0,0.65);height: 100%"></div>

    </div>
    <div class="content">

        <div class="panel-header">
            <h1>Success - Thanks for joining the Investor Tube!</h1>

            <div style="text-align: center;" class="form-group follows" id="ACsubmitRegister">

                <br>
                <h4>Please select one category to follow up.</h4>
                <p>You can changes these preferences later.</p>
                <br>
                <label for="traders">
                    <input type="radio"
                           id="traders"
                           name="category"
                           value="traders">
                    Traders
                </label>
                <label for="investors">
                    <input type="radio"
                           id="investors"
                           name="category"
                           value="investors" checked>
                    Investors
                </label>
                <label for="entrepreneurs">
                    <input type="radio"
                           id="entrepreneurs"
                           name="category"
                           value="entrepreneurs">
                    Entrepreneurs
                </label>
                <br>
                <br>
            </div>

            <p>To log into the site, register with your Social Login below</p>
        </div>
        <div class="panel-body">
            <div style="text-align: center" class="social-buttons">
                <a href="/login/facebook" class="btn btn-default facebook-btn">Sign up with Facebook
                    <i class="fa fa-facebook" aria-hidden="true"></i></a>
                <a href="/login/twitter" class="btn btn-default twitter-btn">Sign up with Twitter
                    <i class="fa fa-twitter" aria-hidden="true"></i></a>
                <a href="/login/google" class="btn btn-default google-btn">Sign up with Google
                    <i class="fa fa-google" aria-hidden="true"></i></a>
            </div>
            <br>
            <br>

            <div style="text-align: center; font-family: Lato, Arial, sans-serif; font-size: 14pt; color: silver;">&mdash;
                OR sign up the old fashioned way &mdash;</div>

            <br>
            <br>

            <div class="container">
                <form class="ac-form" role="form" method="POST" action="{{ url('/after_checkout_register') }}" id="ACregisterForm">
                    {{ csrf_field() }}

                    <input type="hidden" name="user_id" value="{{$user->id}}" id="user_id">
                    <div class="input-group col-md-6">
                        <span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>
                        <input id="name"
                               type="text"
                               class="form-control"
                               name="name"
                               value="{{ old('name') }}"
                               placeholder="Your full name"
                               required
                               autofocus>
                    </div>
                    <div id="ACnameRegister" class="input-group col-md-6">

                    </div>
                    <div class="input-group col-md-6">
                        <span class="input-group-addon"><i class="glyphicon glyphicon-envelope"></i></span>
                        <input id="email" type="text" class="form-control" name="email"  value="{{$user->email}}">
                    </div>

                    <div id="ACemailRegister" class="input-group col-md-6">

                    </div>
                    <div class="input-group col-md-6">
                        <span class="input-group-addon"><i class="glyphicon glyphicon-lock"></i></span>
                        <input id="password" type="password" class="form-control" name="password" placeholder="Password">
                    </div>
                    <div id="ACpasswordRegister" class="input-group col-md-6">

                    </div>
                    <div class="input-group col-md-6">
                        <span class="input-group-addon"><i class="glyphicon glyphicon-lock"></i></span>
                        <input id="password-confirm"
                               type="password"
                               class="form-control"
                               name="password_confirmation"
                               placeholder="Re-enter your password"
                               required>
                    </div>



                    <div style="text-align: center;" class="form-group follows" id="ACsubmitRegister">

                        {{--<br>--}}
                        {{--<strong>Please select at least one category to follow up</strong><br>--}}
                        {{--<label for="traders">--}}
                            {{--<input type="checkbox"--}}
                                   {{--id="traders"--}}
                                   {{--name="traders"--}}
                                   {{--value="traders">--}}
                            {{--Traders--}}
                        {{--</label>--}}
                        {{--<label for="investors">--}}
                            {{--<input type="checkbox"--}}
                                   {{--id="investors"--}}
                                   {{--name="investors"--}}
                                   {{--value="investors">--}}
                            {{--Investors--}}
                        {{--</label>--}}
                        {{--<label for="entrepreneurs">--}}
                            {{--<input type="checkbox"--}}
                                   {{--id="entrepreneurs"--}}
                                   {{--name="entrepreneurs"--}}
                                   {{--value="entrepreneurs">--}}
                            {{--Entrepreneurs--}}
                        {{--</label>--}}
                        {{--<br>--}}
                        <br>

                        <button type="submit" class="btn btn-primary">
                            Sign up
                        </button>
                    </div>
                </form>
            </div>

        </div>
    </div>
@endsection

@section("scripts")

    <script>
        var save_changes_v = false;
        var category = "investors";
        $(function () {
            $("#bgndVideo").css("display", "block").YTPlayer();

            $("#ACregisterForm input").on("change",function () {
                console.log("need save");
                save_changes_v = false;
            });

            $(".follows input").on("change",function () {
                category = $(this).val();
                //save category selected
                console.log("checkbox change "+category);
            });

            $(".social-buttons a").on("click",function (e) {
                //Save preferences
                save_subscriptions_changes();
                save_changes_v = true;
            });

            $(window).bind('beforeunload', function(e){
                //
                if(save_changes_v == false){
                    show_alert("You don't save the changes!");
                    return "";
                }
            });
        });

        $("#ACregisterForm").on("submit", function (e) {
            e.preventDefault();
            save_subscriptions_changes();
            var data = $(this).serialize();
            $.ajax({
                type: "post",
                url: "/after_checkout_register",
                data: data,
                dataType: "json",
                success: function (data) {
                    console.log("success data",data);
                    clean_form();
                    $("#ACsubmitRegister").addClass("has-success").html('<strong class="help-block">Sign up Successful</strong>').delay(3000);
                    save_changes_v = true;
                    window.location.replace("/");
                },
                error: function (data) {
                    clean_form();
                    console.log("error ",data.responseText);
                    data = JSON.parse(data.responseText);
                    $.each(data,function (i, o) {

                        if (i == "name") {
                            $("#ACnameRegister").html("<span class='help-block'><strong>" + o + "</strong> </span>").parent().parent().addClass("has-error");
                        } else if (i == "email") {
                            $("#ACemailRegister").html("<span class='help-block'><strong>" + o + "</strong> </span>").parent().parent().addClass("has-error");
                        } else if (i == "password") {
                            if(o.length == 2){
                                $("#ACpasswordRegister").html("<span class='help-block'><strong>" + o[0] + "</strong> </span>").append("<span class='help-block'><strong>" + o[1] + "</strong> </span>").addClass("has-error");
                            }else{
                                $("#ACpasswordRegister").html("<span class='help-block'><strong>" + o + "</strong> </span>").parent().parent().addClass("has-error");
                            }
                        }
                    });
                }
            });

            function clean_form() {
                $("#ACnameRegister").text('').parent().parent().removeClass("has-error").removeClass("has-success");
                $("#ACemailRegister").text('').parent().parent().removeClass("has-error").removeClass("has-success");;
                $("#ACpasswordRegister").text('').parent().parent().removeClass("has-error").removeClass("has-success");;
            }
        });

        function save_subscriptions_changes(){
            var user_id = $("#user_id").val();
            $.ajax({
                url: "/default_subscriptions",
                type: "post",
                data: {
                    category: category,
                    user_id: user_id
                },
                success: function (data) {
                    console.log("succes");
                },
                error: function (error) {
                    console.log("error" +error.responseText);
                }
            });
        }
    </script>
@endsection
