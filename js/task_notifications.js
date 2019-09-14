var firebase_user_task, user_firebase_tasks_seen, user_firebase_task_seen_comments,
    user_firebase_task_comments, firebase_task_status, firebase_mentions, firebase_mentions_seen;

var notifications = [];
notifications['tasks'] = [];
notifications['comments'] = [];
notifications['status'] = [];
notifications['mentions'] = [];

firebase.auth().signInWithEmailAndPassword(firebase_task_config.email, firebase_task_config.password).then(function (user) {
    // user signed in
    dbRef = firebase.database();

    firebase_user_task = dbRef.ref('tasks_assigned/' + userId + '/' + customerId);
    user_firebase_tasks_seen = dbRef.ref('tasks_seen/' + userId + '/' + customerId);

    user_firebase_task_comments = dbRef.ref('task_comments/' + userId + '/' + customerId);
    user_firebase_task_seen_comments = dbRef.ref('comments_seen/' + userId + '/' + customerId);

    firebase_task_status = dbRef.ref('task_status');
    firebase_mentions = dbRef.ref('mentions/' + userId + '/' + customerId);
    firebase_mentions_seen = dbRef.ref('mentions_seen/' + userId + '/' + customerId);

    firebase_task_status.orderByChild('customer_id').equalTo(Number(customerId)).on("value", function (snapshot) {
        notifications['status'] = [];
        snapshot.forEach(function (childSnapshot) {
            let task_information = childSnapshot.val();

            let users_seen = task_information.users_seen.split('|');
            let users_involved = task_information.users_involved.split('|');
            //check for both, string or int
            if (users_involved.includes(userId) || users_involved.includes(Number(userId))) {
                if (users_seen.includes(userId) == false && users_seen.includes(Number(userId)) == false) {
                    notifications['status'].push({'unread_status': task_information});
                    if (task_information.task_id == task_selected_for_edit.id) {
                        $('.status_action_' + task_information.new_status).addClass('active').siblings().removeClass('active');
                        add_task_to_form(task_information.task_id, false); //reload information and comments for the selected task
                    }
                }
            }
        });
    });

    firebase_user_task.on('value', function (snapshot) {
        if (snapshot.val()) {
            let tasks_assigned_to_me = '';
            if (snapshot.val().assigned) {
                tasks_assigned_to_me = snapshot.val().assigned.toString().split("|");
            } else if (snapshot.val().assignations) {
                tasks_assigned_to_me = snapshot.val().assignations.toString().split("|");
            }

            tasks_notifications_manager.load_badge();
            tasks_notifications_manager.filterDataAndLoadData(tasks_assigned_to_me);
        }
    });
    user_firebase_task_comments.on("value", function (snapshot) {
        let result = [];
        snapshot.forEach(function (childSnapshot) {
            x = childSnapshot.val();
            x.key = childSnapshot.key;
            result.push({'comment_info': x});
        });
        tasks_notifications_manager.filterCommentsAndLoadData(result);
    });

    firebase_mentions.on('value', function (snapshot) {
        let result = [];
        snapshot.forEach(function (childSnapshot) {
            x = childSnapshot.val();
            x.key = childSnapshot.key;
            result.push({'mentions_info': x});
        });
        mentions_notifications_manager.filterMentionsAndLoadData(result);
    });

}).catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    $.ajax({
        type: "POST",
        url: "/messaging/log_error_on_sentry/",
        dataType: 'json',
        data: {'data': JSON.stringify(error)},
        success: function (res) {
            toastr.error("Something went wrong please try again later or contact support staff.")
        }
    });
});

var tasks_notifications_manager = new function () {
    var set_up_elements = function () {
        tasks_notifications_manager.load_badge();
    };

    return {
        init: function () {
            set_up_elements();
        },
        load_badge: function () {
            $('.badge_tasks_dropdown').removeClass('d-none');
        },
        loadData: function (data) {
            $('.task_header_list').empty();
            data = data.reverse();
            notifications['tasks'] = [];
            for (let i = 0; i < data.length; i++) {
                notifications['tasks'].push({'unread_task': data[i]});
            }

            if (if_in_task_page()) {
            } else {
                update_general_notifications(true);
            }
        },
        loadCommentsData: function (data, callback) {
            data = data.reverse();
            notifications['comments'] = []; //clear for each iteration
            for (let i = 0; i < data.length; i++) {
                if (Number(data[i].created_by) != userId) {
                    notifications['comments'].push({'unread_comment': data[i]});
                    if (data[i].task_info.id) {
                        if (if_in_task_page() && data[i].task_info.id == task_selected_for_edit.id) {
                            add_task_to_form(data[i].task_info.id, false);
                        }
                    }
                }
            }
            callback();
        },

        filterDataAndLoadData: function (data) {
            notifications['tasks'] = [];
            user_firebase_tasks_seen.once("value", function (snapshot) {
                if (snapshot.val() != null) {
                    let seen_ids = snapshot.val().tasks_seen.toString().split("|");
                    for (let x = 0; x < seen_ids.length; x++) {
                        let index = data.indexOf(seen_ids[x]);
                        if (index > -1) {
                            data.splice(index, 1);
                        }
                    }
                }

                tasks_notifications_manager.loadData(data);
            });
        },

        filterCommentsAndLoadData: function (data) {
            user_firebase_task_seen_comments.once("value", function (snapshot) {
                if (snapshot.val() != null) {
                    let seen_ids = snapshot.val().comments_seen.split("|");
                    tasks_notifications_manager.findAndRemove(data, seen_ids, function (data_filtered) {
                        tasks_notifications_manager.loadCommentsData(data_filtered, function () {
                            update_general_notifications(true);
                        });
                    });
                } else {
                    user_firebase_task_seen_comments.set({'comments_seen': ""}).then(function () {
                        tasks_notifications_manager.loadCommentsData(data, function () {
                            update_general_notifications(true);
                        });
                    }).catch(function (error) {
                        send_error_to_sentry(JSON.stringify(error), "Something went wrong please try again later or contact support staff.");
                    });
                }
            });
        },

        markAsRead: function (task_id) {
            if (!task_id) { //then mark all as read
                $('.task_item_notification').remove();
                firebase_user_task.once('value', function (snapshot) {
                    if (snapshot.val()) {
                        let tasks_assigned_to_me = '';

                        if (snapshot.val().assigned) {
                            tasks_assigned_to_me = snapshot.val().assigned.toString();
                        } else if (snapshot.val().assignations) {
                            tasks_assigned_to_me = snapshot.val().assignations.toString();
                        }

                        user_firebase_tasks_seen.once("value", function (snapshot) {
                            if (snapshot.val() == null) {
                                user_firebase_tasks_seen.set({'tasks_seen': tasks_assigned_to_me}).catch(function (error) {
                                    send_error_to_sentry(JSON.stringify(error), "Something went wrong please try again later or contact support staff.");
                                });
                            } else {
                                var firebase_tasks_seen = snapshot.val().tasks_seen + "|" + tasks_assigned_to_me;
                                user_firebase_tasks_seen.update({'tasks_seen': firebase_tasks_seen}).catch(function (error) {
                                    send_error_to_sentry(JSON.stringify(error), "Something went wrong please try again later or contact support staff.");
                                });
                            }
                        });
                        notifications['tasks'] = [];
                        update_badge(0);
                    }
                });

                return;

            } else {
                user_firebase_tasks_seen.once("value", function (snapshot) {
                    if (snapshot.val() == null) {
                        user_firebase_tasks_seen.set({'tasks_seen': task_id}).catch(function (error) {
                            send_error_to_sentry(JSON.stringify(error), "Something went wrong please try again later or contact support staff.");
                        });
                    } else {
                        var firebase_tasks_seen = snapshot.val().tasks_seen + "|" + task_id;
                        user_firebase_tasks_seen.update({'tasks_seen': firebase_tasks_seen}).catch(function (error) {
                            send_error_to_sentry(JSON.stringify(error), "Something went wrong please try again later or contact support staff.");
                        });
                    }
                });

                for (let x = 0; x < notifications['tasks'].length; x++) {
                    if (notifications['tasks'][x]) {
                        if (notifications['tasks'][x].unread_task == task_id) {
                            notifications['tasks'].splice(x, 1);
                        }
                    }
                }

                update_general_notifications(true);
            }

        },

        markCommentAsRead: function (comment_key) {
            let unseen_comments = '';
            if (!comment_key) { //then mark all as read
                $('.comment_item_notification').remove();
                user_firebase_task_comments.once("value", function (snapshot) {
                    snapshot.forEach(function (childSnapshot) {
                        x = childSnapshot.val();
                        x.key = childSnapshot.key;
                        unseen_comments = unseen_comments + '|' + x.key
                    });
                });

                user_firebase_task_seen_comments.once("value", function (snapshot) {
                    if (snapshot.val() == null) {
                        user_firebase_task_seen_comments.set({'comments_seen': unseen_comments}).catch(function (error) {
                            send_error_to_sentry(JSON.stringify(error), "Something went wrong please try again later or contact support staff.");
                        });
                    } else {
                        var comments_seen = snapshot.val().comments_seen + "|" + unseen_comments;
                        user_firebase_task_seen_comments.update({'comments_seen': comments_seen}).catch(function (error) {
                            send_error_to_sentry(JSON.stringify(error), "Something went wrong please try again later or contact support staff.");
                        });

                    }
                    notifications['comments'] = [];
                    update_badge(0);
                });

                return;

            } else {
                user_firebase_task_seen_comments.once("value", function (snapshot) {

                    if (snapshot.val() == null) {
                        user_firebase_task_seen_comments.set({'comments_seen': comment_key}).catch(function (error) {
                            send_error_to_sentry(JSON.stringify(error), "Something went wrong please try again later or contact support staff.");
                        });
                    } else {
                        var comments_seen = snapshot.val().comments_seen + "|" + comment_key;
                        user_firebase_task_seen_comments.update({'comments_seen': comments_seen}).catch(function (error) {
                            send_error_to_sentry(JSON.stringify(error), "Something went wrong please try again later or contact support staff.");
                        });

                    }

                    for (let x = 0; x < notifications['comments'].length; x++) {
                        if (notifications['comments'][x]) {
                            if (notifications['comments'][x].unread_comment.key == comment_key) {
                                notifications['comments'].splice(x, 1);
                            }
                        }
                    }

                    update_general_notifications(true);

                });
            }
        },
        assign_comment_task: function (comment_info, user_id) {
            let firebase_specific_user_comments = dbRef.ref('task_comments/' + user_id + '/' + customerId);
            firebase_specific_user_comments.push(comment_info);
        },
        clearTaskNotifications: function () {
            $('.task_header_list').empty();
            favicon_task_notificacion_value = 0;
            favicon.badge(favicon_msg_notificacion_value + favicon_task_notificacion_value);
            $(".badge_tasks_inside").text('No');
            $(".badge_tasks").text('').removeClass('badge badge-success');
        },
        findAndRemove: function (data, seen_ids, callback) {
            let to_display_on_notifications = [];

            for (let x = 0; x < data.length; x++) {
                let key_founded = data[x].comment_info.key;
                if (!seen_ids.includes(key_founded)) {
                    to_display_on_notifications.push(data[x].comment_info);
                }
            }
            callback(to_display_on_notifications);
        }
    };
}();

var status_notifications_manager = new function () {
    return {
        init: function () {
        },
        markStatusAsRead: function (status_info) {
            firebase_task_status.orderByChild("task_id").equalTo(status_info.task_id).once("value", function (snapshot) {
                snapshot.forEach(function (task_info_from_firebase) {
                    task_info_from_firebase.ref.child('users_seen').set(status_info.users_seen + userId + '|');
                });
            });
        },
        update_task_status: function (task_info) {
            task_selected_for_edit.status = Number(task_info['new_status']);
            firebase_task_status.orderByChild("task_id").equalTo(task_info['task_id']).once("value", function (snapshot) {
                if (snapshot.val() == null) {
                    firebase_task_status.push(task_info);
                } else {
                    snapshot.forEach(function (task_info_from_firebase) {
                        task_info_from_firebase.ref.child('new_status').set(task_info['new_status']);
                        task_info_from_firebase.ref.child('old_status').set(task_info['old_status']);
                        task_info_from_firebase.ref.child('users_seen').set(task_info['users_seen']);
                        task_info_from_firebase.ref.child('updated_at').set(task_info['updated_at']);
                        task_info_from_firebase.ref.child('updated_by').set(task_info['updated_by']);
                        task_info_from_firebase.ref.child('users_seen').set(task_info['users_seen']);
                    });
                }
                load_task_list(true);
            });
        }
    };
}();

var mentions_notifications_manager = new function () {
    return {
        init: function () {
        },

        loadMentionsData: function (data, callback) {
            data = data.reverse();
            notifications['mentions'] = []; //clear for each iteration
            let tasks_id = [];
            for (let i = 0; i < data.length; i++) {
                tasks_id.push(data[i].taskId);
                notifications['mentions'].push({'unread_mentions': data[i]});
            }
            mentions_notifications_manager.loadInClassification(data, tasks_id);
            callback();
        },

        filterMentionsAndLoadData: function (data) {
            firebase_mentions_seen.once("value", function (snapshot) {
                if (snapshot.val() != null) {
                    let seen_ids = snapshot.val().mentions_seen.split("|");

                    mentions_notifications_manager.findAndRemove(data, seen_ids, function (data_filtered) {
                        mentions_notifications_manager.loadMentionsData(data_filtered, function () {
                            update_general_notifications(true);
                        });
                    });
                } else {
                    firebase_mentions_seen.set({'mentions_seen': ""}).then(function () {
                        mentions_notifications_manager.loadMentionsData(data, function () {
                            update_general_notifications(true);
                        });
                    }).catch(function (error) {
                        send_error_to_sentry(JSON.stringify(error), "Something went wrong please try again later or contact support staff.");
                    });
                }
            });
        },

        loadInClassification: function (mentions_quantity, mentions) {
            filter_uncompleted_tasks(JSON.stringify(mentions), function (tasks_ids_filtered) {
                let quantity = (tasks_ids_filtered.count) ? tasks_ids_filtered.count : 0;
                $('.badge_info_mentions').show().html('<span class="badge button-color-high"> ' + quantity + ' </span> Mentions ');
                $('.badge_info_mentions').unbind('click').click(function () {
                    $('.badge_info_item').each(function () {
                        $(this).parent().removeClass('item_selected_in_panel');
                    });
                    build_task_list('.todo-tasklist', tasks_ids_filtered.mentions_list, true);
                    if (quantity < 1) {
                        let no_results = $('<h3 class="no_results_text">').text('No unread mentions.');
                        $('.todo-tasklist').append(no_results);
                    }
                    has_next_page = false;
                    add_click_event_to_task_items();
                    $('.animation_loading').remove();
                });
            });
        },

        markMentionAsRead: function (mention_key) {
            let unseen_mentions = '';
            if (!mention_key) { //then mark all as read
                $('.mention_item_notification').remove();
                firebase_mentions.once("value", function (snapshot) {
                    snapshot.forEach(function (childSnapshot) {
                        x = childSnapshot.val();
                        x.key = childSnapshot.key;
                        unseen_mentions = unseen_mentions + '|' + x.key
                    });
                });

                firebase_mentions_seen.once("value", function (snapshot) {
                    if (snapshot.val() == null) {
                        firebase_mentions_seen.set({'mentions_seen': unseen_mentions}).catch(function (error) {
                            send_error_to_sentry(JSON.stringify(error), "Something went wrong please try again later or contact support staff.");
                        });
                    } else {
                        var mentions_seen = snapshot.val().mentions_seen + "|" + unseen_mentions;
                        firebase_mentions_seen.update({'mentions_seen': mentions_seen}).catch(function (error) {
                            send_error_to_sentry(JSON.stringify(error), "Something went wrong please try again later or contact support staff.");
                        });

                    }
                    notifications['mentions'] = [];
                    update_badge(0);
                });

                return;

            } else {
                firebase_mentions_seen.once("value", function (snapshot) {
                    if (snapshot.val() == null) {
                        firebase_mentions_seen.set({'mentions_seen': mention_key}).catch(function (error) {
                            send_error_to_sentry(JSON.stringify(error), "Something went wrong please try again later or contact support staff.");
                        });
                    } else {
                        var mentions_seen = snapshot.val().mentions_seen + "|" + mention_key;
                        firebase_mentions_seen.update({'mentions_seen': mentions_seen}).catch(function (error) {
                            send_error_to_sentry(JSON.stringify(error), "Something went wrong please try again later or contact support staff.");
                        });

                    }
                    for (let x = 0; x < notifications['mentions'].length; x++) {
                        if (notifications['mentions'][x]) {
                            if (notifications['mentions'][x].unread_mentions.key == mention_key) {
                                notifications['mentions'].splice(x, 1);
                            }
                        }
                    }

                    update_general_notifications(true);

                });
            }
        },

        findAndRemove: function (data, seen_ids, callback) {
            let to_display_on_notifications = [];

            for (let x = 0; x < data.length; x++) {
                let key_founded = data[x].mentions_info.key;
                if (!seen_ids.includes(key_founded)) {
                    to_display_on_notifications.push(data[x].mentions_info);
                }
            }
            callback(to_display_on_notifications);
        }
    };
}();

function if_in_task_page() {
    return window.location.href.indexOf("tasks") > -1;
}