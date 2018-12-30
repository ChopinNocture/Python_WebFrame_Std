$(document).ready(init);

var lesson_list = [];
var cur_index = 0;
function init() {
    csrf_Setup();
    initClassList();
    refreshUI();
}

function initClassList(){
    lesson_list = [];
    var class_id = $("#id_info").data("clsid");
    $("li").each(function (idx, elem) {
        if (String($(elem).data("classList")).indexOf(class_id) != -1) {
            lesson_list.push({
                'content': $(elem).html(),
                'fileType': $(elem).data('fileType'),
                'fileUrl': $(elem).data('fileUrl')
            });
        }
    });
}

function onBackClick(event) {
    // alert("------------" + event.target.dataset['progress']);
    $.ajax({
        url: event.target.dataset['progurl'],
        type: 'post',
        data: { "progress": event.target.dataset['progress'] },
        dataType: 'json',
        success: SucFunc
    });
}

function onNextClk(event) {
    cur_index = Math.min(lesson_list.length-1, cur_index+1);
    refreshUI();
}

function refreshUI() {
    if(lesson_list.length>0) {    
        if(cur_index < (lesson_list.length-1)) {
            $('#btn_next').show();
            $('#btn_back').hide();
        }
        else {
            $('#btn_next').hide();
            $('#btn_back').show();
        }

        var cur_lesson = lesson_list[cur_index];
        $('#q_description').html(cur_lesson['content']);
        if( cur_lesson['fileType']=="none" ) {
            $('#file_panel').html('').hide();
        }
        else {
            var temp_html = type_HTML[cur_lesson['fileType']].replace('***', '/uploaded/'+cur_lesson['fileUrl']);
            $('#file_panel').html(temp_html).show();
        }
    }
    else {
        $('#btn_next').hide();
        $('#btn_back').show();
        $('#file_panel').html('').hide();
        $('#q_description').html("这一章没有秘籍噢！");
        alert("本章节没有秘籍！");
    }
}

function SucFunc() {
    $(location).attr('href', $('#btn_back').data('url') );
}