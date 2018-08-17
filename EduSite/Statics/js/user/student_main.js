$(document).ready(onInit);

function onInit(event) {
    $.ajax({
        url: $('#notice_show').data('url'),
        type: "GET",       
        dataType: "json",
        success: onNoticesGet,
        error: failFunc
    });

    $('#l_m').css('background-size', '100% 100%');
    $('#move_prev').click(onPrev);
    $('#move_next').click(onNext);
}

function movingAnim() {
    $('#lesson_inner').addClass('anim-move');
    $('#lesson_ctrl li').addClass('anim-move');
    $('#lesson_ctrl span').addClass('anim-move');

    $('#l_m').css('background-size', '80% 70%');

    setTimeout(() => {
        $('#lesson_inner').removeClass('anim-move');
        $('#lesson_ctrl li').removeClass('anim-move').css('background-size', '80% 70%');
        $('#lesson_ctrl span').removeClass('anim-move');

        $('#lesson_inner').css('top', '-10rem');

        $('#l_u span').css({'background-size':'80% 70%', 'opacity':'1'});
        $('#l_b span').css({'background-size':'80% 70%', 'opacity':'1'});
        $('#l_m').css('background-size', '100% 100%');
        $('#l_m span').css({'background-size': '100% 100%','opacity':'0'});
    }, 400);     
}

function onPrev(event) {      
    movingAnim();
    $('#l_m .lesson-book-u').css({'background-size': '80% 70%','opacity':'1'});
    $('#l_b').css('background-size', '100% 100%');
    $('#l_b span').css({'background-size':'100% 0%', 'opacity':'0'});
    $('#lesson_inner').css('top', '-20rem');    
}

function onNext(event) {
    movingAnim();
    $('#l_m .lesson-book-b').css({'background-size': '80% 70%','opacity':'1'});
    $('#l_u').css('background-size', '100% 100%');
    $('#l_u span').css({'background-size':'100% 0%', 'opacity':'0'});
    $('#lesson_inner').css('top', '0rem');
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
