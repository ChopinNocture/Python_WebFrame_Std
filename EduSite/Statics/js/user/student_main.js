$(document).ready(onInit);

//================================================================
// 进度
var progress = 0;
var lock_mode = true;

function isLessonLock(idx) {    
    return lock_mode && (idx<<1 > progress);
}
function isPracLock(idx) {
    return lock_mode && (idx<<1 >= progress);
}

//================================================================
function onInit(event) {
    onExamReadyGet(null);

    var gold = $("#id_gold").html();
    gold = Math.floor(gold / 20);
    //$("#icon_gold").addClass("num-"+gold.toString());
    
    lock_mode = $("#id_cls_lock_mode").val()=="True";

    progress = $("#id_progress").data('progress');

    middle_idx = (progress>>1);

    $.ajax({
        url: $('#notice_show').data('url'),
        type: "GET",       
        dataType: "json",
        success: onNoticesGet,
        error: failFunc
    });

    $.ajax({
        url: $('#exam_entrance').data('url'),
        type: "GET",       
        dataType: "json",
        success: onExamReadyGet,
    });
    

    $('#l_m').css('background-size', '100% 100%');
    $('#l_uu').click(onNext);
    $('#l_u').click(onNext);
    $('#l_b').click(onPrev);
    $('#l_bb').click(onPrev);
    $('#move_prev').click(onNext);
    $('#move_next').click(onPrev);
    $('#lesson_list_panel').on('mousewheel', onWheeling).on('DOMMouseScroll', onWheeling);
    

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

    $('#l_m').css('background-size', '70% 70%');
    $('#l_m .lesson_label').removeClass("lesson_label-scaled");
    setTimeout(refreshBookList, 400);     
}

function onWheeling(event) {
    event.preventDefault();
    var value = event.originalEvent.wheelDelta || -event.originalEvent.detail;
    if(value>0) {
        onNext();        
    }
    else if(value<0) {
        onPrev();
    }
}

function onPrev(event) {
    nextidx = Math.min(listData.length-1, middle_idx+1);
    if( nextidx == middle_idx ) return;    

    middle_idx = nextidx;
    
    movingAnim();
    $('#l_b').css('background-size', '100% 100%');
    $('#l_b span').css({'background-size':'100% 100%', 'opacity':'1'});
    $('#l_b .lesson_label').addClass("lesson_label-scaled");
    $('#lesson_inner').css('left', '-14.6784rem');    
}

function onNext(event) {
    nextidx = Math.max(0, middle_idx-1);
    if( nextidx == middle_idx ) return;    

    middle_idx = nextidx;

    movingAnim();
    $('#l_u').css('background-size', '100% 100%');
    $('#l_u span').css({'background-size': '100% 100%', 'opacity': '1'});
    $('#l_u .lesson_label').addClass("lesson_label-scaled");
    $('#lesson_inner').css('left', '0rem');
}

var listData = [];
var middle_idx = 0;
function updateListView() {
    $('#l_m .lesson_label').html(middle_idx+1); //    $('#l_m .lesson_label').html(listData[middle_idx].desc);
    $('#l_u .lesson_label').html( middle_idx-1<0 ? "":middle_idx); // $('#l_u .lesson_label').html( middle_idx-1<0 ? "":listData[middle_idx-1].desc);
    $('#l_u').css('visibility', middle_idx-1<0 ? 'hidden': 'visible');
    $('#l_uu .lesson_label').html(middle_idx-2<0 ? "":middle_idx-1); // $('#l_uu .lesson_label').html(middle_idx-2<0 ? "":listData[middle_idx-2].desc);
    $('#l_uu').css('visibility', middle_idx-2<0 ? 'hidden': 'visible');
    $('#l_b .lesson_label').html(middle_idx+1<listData.length ? middle_idx+2:""); // $('#l_b .lesson_label').html(middle_idx+1<listData.length ? listData[middle_idx+1].desc:"");
    $('#l_b').css('visibility', middle_idx+1<listData.length ? 'visible':'hidden');
    $('#l_bb .lesson_label').html(middle_idx+2<listData.length ? middle_idx+3:""); // $('#l_bb .lesson_label').html(middle_idx+2<listData.length ? listData[middle_idx+2].desc:"");
    $('#l_bb').css('visibility', middle_idx+2<listData.length ? 'visible':'hidden');
}

function refreshBookList() {
    $('#lesson_inner').removeClass('anim-move');
    $('#lesson_ctrl li').removeClass('anim-move').css('background-size', '70% 70%');
    $('#lesson_ctrl span').removeClass('anim-move');
    $('#l_u .lesson_label').removeClass('anim-move');
    $('#l_b .lesson_label').removeClass('anim-move');
    $('#l_m .lesson_label').removeClass('anim-move');

    $('#lesson_inner').css('left', '-7.3392rem');

    $('#l_u span').css({ 'background-size': '70% 70%', 'opacity': '0.01' });
    $('#l_b span').css({ 'background-size': '70% 70%', 'opacity': '0.01' });
    $('#l_u .lesson_label').removeClass("lesson_label-scaled");
    $('#l_b .lesson_label').removeClass("lesson_label-scaled");
    $('#l_m .lesson_label').addClass("lesson_label-scaled");

    $('#l_m').css({'background-size': '100% 100%'});
    $('#l_m span').css({ 'background-size': '100% 100%', 'opacity': '0.01' });
    updateListView();
    refreshCurrent();
}

//================================================================
// 当前
function refreshCurrent() {
    $('#chapter_title').html(listData[middle_idx].desc);

    if (isLessonLock(middle_idx)) {        
        $('#btn_lesson').removeAttr('href');
        $('#lesson_info').hide();
        $('#lesson_locked').show();
        $('#lesson_locked .icon_locker').removeClass("fade-out");        
    }
    else {
        $('#btn_lesson').prop('href', listData[middle_idx]['curl'] + "?progress=" + Math.max(progress, ((middle_idx<<1)+1)).toString());
        $('#lesson_info').show();
        $('#lesson_locked').hide();
        $('#lesson_locked .icon_locker').addClass("fade-out");        
    }
    
    if (isPracLock(middle_idx)) {
        $('#btn_practice').removeAttr('href');
        $('#practice_info').hide();
        $('#practice_locked').show();
        $('#practice_locked .icon_locker').removeClass("fade-out");        
    }
    else {
        $('#btn_practice').prop('href', listData[middle_idx]['purl'] + "?progress=" + Math.max(progress, ((middle_idx<<1)+2)).toString() );
        $('#practice_info').show();
        $('#practice_locked').hide();
        $('#practice_locked .icon_locker').addClass("fade-out");        
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


//================================================================
// 考试部分 ('id', 'title', 'duration', 'start_time')
var examination = null;

function onExamReadyGet(jsonData) {
    examination = jsonData;

    if (examination) {    
        $('#btn_enter_exam').prop('href', $('#exam_entrance').data('examurl').replace('0', examination.id));
        var time_str = examination.start_time;
        time_str = time_str.replace('-', '年').replace('-', '月').replace('T', '日 ');
        $('#exam_starttime').html(time_str);
        $("#exam_open").show();
        $("#exam_closed").hide();
        $("#exam_inner").removeClass("shirked").removeClass("extended").addClass('hasExam');
        $("#exam_icon_Sword").removeClass("sword_shirk").removeClass("sword_extend").addClass('sword_hasExam');
        $('#exam_entrance').off('mouseenter').off('mouseleave');
    }
    else {
        $("#exam_inner").removeClass('hasExam');
        $("#exam_icon_Sword").removeClass('sword_hasExam');
        examShirk();
        $('#exam_entrance').mouseenter(examExtend).mouseleave(examShirk);
        $("#exam_open").hide();
        $("#exam_closed").show();
    }
}

function examExtend() {
    $("#exam_inner").removeClass("shirked").addClass("extended");
    $("#exam_icon_Sword").removeClass("sword_shirk").addClass("sword_extend");
}
function examShirk() {
    $("#exam_inner").addClass("shirked").removeClass("extended");
    $("#exam_icon_Sword").addClass("sword_shirk").removeClass("sword_extend");
}