function getDataMention(mode, query, callback) {
    let path = 'user/mention/list/';
    $.ajax({
        url: path,
        method: 'post',
        data: {'term': query},
        dataType: 'json',
        success: function (result) {
            let data = result.users;
            data = _.filter(data, function (item) {
                return item.name.toLowerCase().indexOf(query.toLowerCase()) > -1
            });
            callback.call(this, data);
        },
    });
}

$(function () {
    $('textarea.comment_mention').mentionsInput({
        onDataRequest: getDataMention,
        minChars: 1,
    });
});