var PUBDATE_PREFIX = "发布日期：";
var pub_date_str = "";

const MAX_DELAY = 100;
var delay_day = 3;

$(document).ready(init);

function init() {
    $('#btn_public').click(onPublic);
    csrf_Setup();

    $('#id_last_day').attr({ "max": MAX_DELAY });
$('#id_last_day').change(onDelayChange);
}

function onDelayChange(event) {
    var delay = Number($('#id_last_day').val());
    if(delay && Number.isSafeInteger(delay)) {
        delay = Math.max(1, Math.min(MAX_DELAY, delay) );
        delay_day = delay;
    }
    Number($('#id_last_day').val(delay_day));
}

function refresh_date(y, m, d) {    
    pub_date_str = '' + y + '/' + m + '/' + d;
    $('#label_pubdate').html(PUBDATE_PREFIX + pub_date_str);
}

var mySchedule = new Schedule({
    el: '#schedule-box',
    //date: '2018-9-20',
    clickCb: refresh_date,
    nextMonthCb: refresh_date,
    nextYeayCb: refresh_date,
    prevMonthCb: refresh_date,
    prevYearCb: refresh_date
});


function onPublic(event) {  
    var content = $('#id_content').val();
    if (content.length <= 0) {
        alert("请填写要发布的文字内容！");
        return;
    }
    if (pub_date_str.length <= 0) {
        alert("请选择公告发布日期！");
        return;
    }
    var targetURL = event.target.dataset.url + pub_date_str + "/" + delay_day.toString() + "/";
    $.ajax({        
        url: targetURL,
        type: 'post',
        data: { "content": content },
        dataType: "json",
        success: sucFunc,
        error: failFunc
    });
}

function sucFunc(event) {
    alert("--------");
    location.reload();
}

function failFunc(event) {
    location.reload();
}


var cur_notice = -1;

function onNoticeClick(event) {
    $('button[id^=notice_]').removeClass('active');
    
    if(event.target.dataset.notice==cur_notice) {
        $(event.target).removeClass('active');
        cur_notice = null;
    }
    else {
        $(event.target).addClass('active');
        cur_notice = event.target.dataset.notice;
    }
}

function onDeleteNotice(event) {
    if (cur_notice) {
        var targetURL = event.target.dataset.url.replace("9999", cur_notice);
        $.ajax({        
            url: targetURL,
            type: 'get',
            success: delSucFunc,
            error: failFunc
        });    
    }
}

function delSucFunc(event) {
    location.reload();
    alert("--------");
}
