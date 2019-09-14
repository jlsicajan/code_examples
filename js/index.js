const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();
var crypto = require('crypto');

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest((req, res) => {
    // Grab the text parameter.
    if (req.method == 'POST') {
        var error = []
        var data = req.body;

        key = '';
        timestamp = data.timestamp;
        token = data.token;
        signature = data.signature;

        hmac = crypto.createHmac('sha256', key);
        hmac.update(timestamp + token);
        hash = hmac.digest('hex');

        if (signature.toString('hex') == hash.toString('hex')) {
            var patientId = data.patient_id;
            var customerId = data.customer_id;
            var phoneNumber = data.number;
            var date = new Date();
            var messageTime = date.toISOString();
            if (!patientId && patientId != 0) {
                error.push('Patient Id missing');
            }
            if (!customerId && customerId != 0) {
                error.push('Customer Id missing');
            }
            if (!phoneNumber && phoneNumber != 0) {
                error.push('Phone Number missing');
            }
            if (error.length > 0) {
                return res.send(400, error);
            } else {
                var messageBody = {
                    'patientId': patientId,
                    'customerId': customerId,
                    'messageTime': messageTime.replace('Z', ''),
                    'phoneNumber': phoneNumber
                }
                return admin.database().ref('/messages').push(messageBody).then((snapshot) => {
                    return res.send(200, 'data uploaded successfuly');
                });
            }
        } else {
            return res.send(403, "Signatue not Valid");
        }
    } else {
        return res.send(405, "Post Request required");
    }

});


exports.getMessages = functions.https.onRequest((req, res) => {
    // Grab the text parameter.
    if (req.method == 'POST') {
        var error = []
        var data = req.body;
        var result = '';

        key = '';
        timestamp = data.timestamp;
        token = data.token;
        signature = data.signature;

        hmac = crypto.createHmac('sha256', key);
        hmac.update('' + timestamp + token);
        hash = hmac.digest('hex');

        if (signature.toString('hex') == hash.toString('hex')) {
            var patientId = data.patient_id;
            var customerId = data.customer_id;
            var phoneNumber = data.number;
            var date = new Date();
            var messageTime = date.toISOString();
            if (!patientId && patientId != 0) {
                error.push('Patient Id missing');
            }
            if (!customerId && customerId != 0) {
                error.push('Customer Id missing');
            }
            if (!phoneNumber && phoneNumber != 0) {
                error.push('Phone Number missing');
            }
            if (error.length > 0) {
                return res.send(400, error);
            } else {
                console.log(customerId);
                console.log(patientId);
                console.log(phoneNumber);

                return admin.database().ref('/messages').orderByChild("customerId").equalTo('' + customerId)
                    .once("value", function (snapshot) {
                        console.log(snapshot);
                        console.log(snapshot.val());
                        var result = '';
                        snapshot.forEach(function (childSnapshot) {
                            console.log(childSnapshot);
                            x = childSnapshot.val();
                            x.key = childSnapshot.key;
                            console.log(x.patientId);
                            console.log(x.phoneNumber);
                            if ((x.patientId == patientId && x.phoneNumber == phoneNumber) && (x.read == false || x.read == undefined)) {
                                console.log("condition true");
                                if (result.length == 0) {
                                    result = x.key
                                } else {
                                    result = result + '|' + x.key;
                                }
                                console.log(result);
                            }
                        });
                        return res.send(200, result);
                    });
            }
        } else {
            return res.send(403, "Signatue not Valid");
        }
    } else {
        return res.send(405, "POST Request required");
    }

});


exports.markMessagesFromTimeAsUnread = functions.https.onRequest((req, res) => {
    // Grab the text parameter.
    if (req.method == 'POST') {
        var error = []
        var data = req.body;
        var result = '';
        var d = {}
        key = '';
        timestamp = data.timestamp;
        token = data.token;
        signature = data.signature;
        userMessageTime = data.message_time

        hmac = crypto.createHmac('sha256', key);
        hmac.update('' + timestamp + token);
        hash = hmac.digest('hex');

        if (signature.toString('hex') == hash.toString('hex')) {
            var patientId = data.patient_id;
            var customerId = data.customer_id;
            var phoneNumber = data.number;
            var userId = data.user_id
            var date = new Date();
            var messageTime = date.toISOString();
            if (!patientId && patientId != 0) {
                error.push('Patient Id missing');
            }
            if (!customerId && customerId != 0) {
                error.push('Customer Id missing');
            }
            if (!phoneNumber && phoneNumber != 0) {
                error.push('Phone Number missing');
            }
            if (error.length > 0) {
                return res.send(400, error);
            } else {
                return admin.database().ref('/messages').orderByChild("customerId").equalTo('' + customerId)
                    .once("value", function (snapshot) {
                        var result = '';

                        snapshot.forEach(function (childSnapshot) {
                            x = childSnapshot.val();
                            x.key = childSnapshot.key;
                            fireBaseMessageTime = new Date(x.messageTime)
                            userMessageTime = new Date(userMessageTime)
                            if (x.patientId == patientId && x.phoneNumber == phoneNumber && fireBaseMessageTime >= userMessageTime) {
                                k = '/messages/' + x.key;
                                x.read = false;
                                x.updated_by_user = userId;
                                x.updated_time = new Date();
                                d[k] = x

                            }
                        });
                        admin.database().ref().update(d, function (error) {
                            if (error) {
                                console.log("Error updating data:", error);
                                return res.send(500, error);
                            }
                        });
                        return res.send(200, true);
                    });
            }
        } else {
            return res.send(403, "Signatue not Valid");
        }
    } else {
        return res.send(405, "POST Request required");
    }

});


exports.markExistingMessageRead = functions.https.onRequest((req, res) => {
    // Grab the text parameter.
    var d = {}
    var result = []
    var date = new Date();
    var messageTime = date.toISOString();
    admin.database().ref('/messages_seen').once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            x = childSnapshot.val();
            x.key = childSnapshot.key;
            var mId = x.messages_seen.split('|');
            var mIds = removeDups(mId);
            result = result.concat(mIds);
            result = removeDups(result);
        });

        console.log("--------");
        console.log(result.length);
        console.log("--------");
        var index = result.indexOf("");
        if (index > -1) {
            result.splice(index, 1);
        }
        console.log(JSON.stringify(result));
        console.log(result.length);


    }).then(function () {
        console.log("here");
        admin.database().ref('/messages').once("value", function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                x = childSnapshot.val();
                x.key = childSnapshot.key;
                if (result.indexOf(x.key) != -1) {
                    k = '/messages/' + x.key;
                    x.read = true;
                    x.updated_by_user = '';
                    x.updated_time = new Date();
                    d[k] = x

                }
                console.log(d);
            });
            console.log(d);
            admin.database().ref().update(d, function (error) {
                if (error) {
                    console.log("Error updating data:", error);
                    return res.send(500, error);
                }
            });
            return res.send(200, d);
        });

    });
});

exports.assignTask = functions.https.onRequest((req, res) => {
    if (req.method == 'POST') {
        var error = [];
        var data = req.body;
        key = '';
        timestamp = data.timestamp;
        token = data.token;
        signature = data.signature;
        userMessageTime = data.message_time;

        hmac = crypto.createHmac('sha256', key);
        hmac.update('' + timestamp + token);
        hash = hmac.digest('hex');

        if (signature.toString('hex') == hash.toString('hex')) {
            var users_assigned = data.users_assigned;
            var task_id = data.task_id;
            var customer_id = data.customer_id;

            if (!task_id && task_id != 0) {
                error.push('Task id missing');
            }
            if (!users_assigned && users_assigned != 0) {
                error.push('Users assigned missing');
            }
            if (!customer_id && customer_id != 0) {
                error.push('Customer id missing');
            }

            if (error.length > 0) {
                return res.send(400, error);
            } else {

                for (let x = 0; x < users_assigned.length; x++) {
                    let assign_to_this_user = users_assigned[x];
                    let fb_specific_user = admin.database().ref('tasks_assigned/' + assign_to_this_user + '/' + customer_id);

                    fb_specific_user.once('value', function (snapshot) {
                        if (snapshot.val() === null) {
                            fb_specific_user.set({'assigned': task_id}).then(function () {
                                return res.send(200, true);
                            }).catch(function (error) {
                                if (error) {
                                    console.log("Error updating data:", error);
                                    return res.send(500, error);
                                }
                            });

                        } else {
                            var task_assigned = snapshot.val().assigned + "|" + task_id;

                            fb_specific_user.update({"assigned": task_assigned}).then(function () {
                            }).catch(function (error) {
                                if (error) {
                                    console.log("Error updating data:", error);
                                    return res.send(500, error);
                                }
                            });
                        }
                    });
                }

                return res.send(200, true);
            }
        } else {
            return res.send(403, "Signatue not Valid");
        }
    } else {
        return res.send(405, "POST Request required");
    }

});


exports.deleteTaskAssignation = functions.https.onRequest((req, res) => {
    if (req.method == 'POST') {
        var error = [];
        var data = req.body;
        key = '';
        timestamp = data.timestamp;
        token = data.token;
        signature = data.signature;
        userMessageTime = data.message_time;

        hmac = crypto.createHmac('sha256', key);
        hmac.update('' + timestamp + token);
        hash = hmac.digest('hex');

        if (signature.toString('hex') == hash.toString('hex')) {
            var user_id = data.user_id;
            var customer_id = data.customer_id

            if (!user_id && user_id != 0) {
                error.push('User id missing');
            }

            if (!customer_id && customer_id != 0) {
                error.push('Customer id missing');
            }

            if (error.length > 0) {
                return res.send(400, error);
            } else {
                let fb_specific_user = admin.database().ref('tasks_assigned/' + user_id + '/' + customer_id);
                fb_specific_user.remove();

                return res.send(200, true);
            }
        } else {
            return res.send(403, "Signatue not Valid");
        }
    } else {
        return res.send(405, "POST Request required");
    }
});

function removeDups(names) {
    let unique = {};
    names.forEach(function (i) {
        if (!unique[i]) {
            unique[i] = true;
        }
    });
    return Object.keys(unique);
}
