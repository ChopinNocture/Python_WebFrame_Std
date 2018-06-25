
$(document).ready(onInit);

function onInit(event) {
    $.ajax({
        url: $('#notice_show').data('url'),
        type: "GET",       
        dataType: "json",
        success: onNoticesGet,
        error: failFunc
    });
}

var notices_list = [];
var cur_idx = 0;
function onNoticesGet(jsonData) {
    notices_list = jsonData;
    cur_idx = 0;

    if (notices_list.length > 0) {
        setInterval('refresh_notice()', 5000); 
        refresh_notice();
    }
}

function refresh_notice() {
    if (notices_list.length <= 0) return;
    if (cur_idx >= notices_list.length) {cur_idx = 0;}

//    alert("---" + cur_idx + " - " + notices_list.length +  notices_list[cur_idx].content );
    $('#notice_show').html(notices_list[cur_idx].content);
    ++cur_idx;
    return;
}

function failFunc() {
    alert('失败');
}
