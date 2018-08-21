$(document).ready(onInit);

//================================================================
// 进度
var progress = 0;
function isLessonLock(idx) {    
    return (idx<<1 > progress);
}
function isPracLock(idx) {
    return (idx<<1 >= progress);
}

//================================================================
function onInit(event) {
    progress = $("#id_progress").data('progress');
    

    $.ajax({
        url: $('#notice_show').data('url'),
        type: "GET",       
        dataType: "json",
        success: onNoticesGet,
        error: failFunc
    });

    $('#l_m').css('background-size', '100% 100%');
    $('#move_prev').click(onNext);
    $('#move_next').click(onPrev);

    $('#class_list li').each(function (index, elem) {        
        listData.push({'desc': elem.dataset.desc,
                    'curl': elem.dataset.curl,
                    'purl': elem.dataset.purl });
    });
    refreshBookList();
}

function movingAnim() {
    $('#lesson_inner').addClass('anim-move');
    $('#lesson_ctrl li').addClass('anim-move');
    $('#lesson_ctrl span').addClass('anim-move');
    $('#l_u .lesson_label').addClass('anim-move');
    $('#l_b .lesson_label').addClass('anim-move');
    $('#l_m .lesson_label').addClass('anim-move');

    $('#l_m').css('background-size', '80% 70%');
    $('#l_m .lesson_label').css({'font-size': '60%', 
                                'top': '6em',
                                'left': '3.8em'});    
    setTimeout(refreshBookList, 400);     
}

function onPrev(event) {
    nextidx = Math.min(listData.length-1, middle_idx+1);
    if( nextidx == middle_idx ) return;    

    middle_idx = nextidx;
    
    movingAnim();
    $('#l_m .lesson-book-u').css({'background-size': '80% 70%','opacity':'1'});
    $('#l_b').css('background-size', '100% 100%');
    $('#l_b span').css({'background-size':'100% 0%', 'opacity':'0.01'});
    $('#l_b .lesson_label').css({'font-size': '80%',
                                'top': '4em',
                                'left': '2em'});
    $('#lesson_inner').css('top', '-20rem');    
}

function onNext(event) {
    nextidx = Math.max(0, middle_idx-1);
    if( nextidx == middle_idx ) return;    

    middle_idx = nextidx;

    movingAnim();
    $('#l_m .lesson-book-b').css({'background-size': '80% 70%','opacity':'1'});
    $('#l_u').css('background-size', '100% 100%');
    $('#l_u span').css({'background-size':'100% 0%', 'opacity':'0.01'});
    $('#l_u .lesson_label').css({'font-size': '80%',
                                'top': '4em',
                                'left': '2em'});
    $('#lesson_inner').css('top', '0rem');
}

var listData = [];
var middle_idx = 0;
function updateListView() {
    $('#l_m .lesson_label').html(listData[middle_idx].desc);
    $('#l_u .lesson_label').html( middle_idx-1<0 ? "":listData[middle_idx-1].desc);
    $('#l_u').css('visibility', middle_idx-1<0 ? 'hidden': 'visible');
    $('#l_uu .lesson_label').html(middle_idx-2<0 ? "":listData[middle_idx-2].desc);
    $('#l_uu').css('visibility', middle_idx-2<0 ? 'hidden': 'visible');
    $('#l_b .lesson_label').html(middle_idx+1<listData.length ? listData[middle_idx+1].desc:"");
    $('#l_b').css('visibility', middle_idx+1<listData.length ? 'visible':'hidden');
    $('#l_bb .lesson_label').html(middle_idx+2<listData.length ? listData[middle_idx+2].desc:"");
    $('#l_bb').css('visibility', middle_idx+2<listData.length ? 'visible':'hidden');
}

function refreshBookList() {
    $('#lesson_inner').removeClass('anim-move');
    $('#lesson_ctrl li').removeClass('anim-move').css('background-size', '80% 70%');
    $('#lesson_ctrl span').removeClass('anim-move');
    $('#l_u .lesson_label').removeClass('anim-move');
    $('#l_b .lesson_label').removeClass('anim-move');
    $('#l_m .lesson_label').removeClass('anim-move');

    $('#lesson_inner').css('top', '-10rem');

    $('#l_u span').css({'background-size':'80% 70%', 'opacity':'1'});
    $('#l_b span').css({'background-size':'80% 70%', 'opacity':'1'});
    $('#l_u .lesson_label').css({'font-size': '60%',
                                'top': '6em',
                                'left': '3.8em'});
    $('#l_b .lesson_label').css({'font-size': '60%',
                                'top': '6em',
                                'left': '3.8em'});
    $('#l_m .lesson_label').css({'font-size': '80%', 
                                'top': '4em',
                                'left': '2em'});

    $('#l_m').css('background-size', '100% 100%');
    $('#l_m span').css({'background-size': '100% 100%','opacity':'0.01'});
    updateListView();
    refreshCurrent();
}

//================================================================
// 当前
function refreshCurrent() {
    if (isLessonLock(middle_idx)) {        
        $('#btn_lesson').removeAttr('href');
        $('#btn_lesson .icon_locker').removeClass("fade-out");
    }
    else {
        $('#btn_lesson').prop('href', listData[middle_idx]['curl']);        
        $('#btn_lesson .icon_locker').addClass("fade-out");
    }
    
    if (isPracLock(middle_idx)) {
        $('#btn_practise').removeAttr('href');
        $('#btn_practise .icon_locker').removeClass("fade-out");
    }
    else {
        $('#btn_practise').prop('href', listData[middle_idx]['purl']);
        $('#btn_practise .icon_locker').addClass("fade-out");
    }    
}


//================================================================
// 公告部分
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
