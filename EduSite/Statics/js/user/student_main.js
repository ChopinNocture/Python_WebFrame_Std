$(document).ready(onInit);

//================================================================
// 进度
var progress = 0;
var lock_mode = true;
var gold = 0;

function isLessonLock(idx) {
    return lock_mode && (idx << 1 > progress);
}
function isPracLock(idx) {
    return lock_mode && (idx << 1 >= progress);
}
function isUsing(idx) {
    return lessonListData[idx].use;
}
//================================================================
function onInit(event) {
    onExamReadyGet(null);

    exam_ticket = $("#id_exam_ticket").val();

    gold = Number($("#id_gold").html());
    //$("#icon_gold").addClass("num-"+gold.toString());

    var addgold = $("#id_add_gold").data('gold');
    if (addgold > 0) {
        $("#id_add_gold").show();
    }
    else {
        $("#id_add_gold").hide();
    }

    lock_mode = $("#id_cls_lock_mode").val() == "True";

    progress = $("#id_progress").data('progress');

    middle_idx = (progress >> 1);

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

    let order_list = [];
    if ($('#id_cls_order').val() != 'None') { order_list = JSON.parse($('#id_cls_order').val()); }
    let temp_list = [];

    $('#class_list li').each(function (index, elem) {
        temp_list.push({
            'id': elem.dataset.id,
            'desc': elem.dataset.desc,
            'curl': elem.dataset.curl,
            'purl': elem.dataset.purl
        });
    });
    let t_lesson;
    for (let iter of order_list) {
        t_lesson = temp_list.find((elem) => { return (elem.id == iter.id); });
        lessonListData.push({
            'id': t_lesson.id,
            'desc': t_lesson.desc,
            'curl': t_lesson.curl,
            'purl': t_lesson.purl,
            'use': iter.c,
        });
    }
    if (progress == 0) {
        let next_pro_idx = -1;
        while (++next_pro_idx < lessonListData.length && !lessonListData[next_pro_idx].use) { }
        progress = next_pro_idx << 1;
    }

    $('#exam_his_list li').each(function (index, elem) {
        exam_his_list.push({
            'title': elem.dataset.title,
            'url': elem.dataset.url
        });
    });
    refreshExamHistory();
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
    if (value > 0) {
        onNext();
    }
    else if (value < 0) {
        onPrev();
    }
}

function onPrev(event) {
    nextidx = Math.min(lessonListData.length - 1, middle_idx + 1);
    if (nextidx == middle_idx) return;

    middle_idx = nextidx;

    movingAnim();
    $('#l_b').css('background-size', '100% 100%');
    $('#l_b span').css({ 'background-size': '100% 100%', 'opacity': '1' });
    $('#l_b .lesson_label').addClass("lesson_label-scaled");
    $('#lesson_inner').css('left', '-14.6784rem');
}

function onNext(event) {
    nextidx = Math.max(0, middle_idx - 1);
    if (nextidx == middle_idx) return;

    middle_idx = nextidx;

    movingAnim();
    $('#l_u').css('background-size', '100% 100%');
    $('#l_u span').css({ 'background-size': '100% 100%', 'opacity': '1' });
    $('#l_u .lesson_label').addClass("lesson_label-scaled");
    $('#lesson_inner').css('left', '0rem');
}

var lessonListData = [];
var middle_idx = 0;
function updateListView() {
    $('#l_m .lesson_label').html(middle_idx + 1); //    $('#l_m .lesson_label').html(lessonListData[middle_idx].desc);
    $('#l_u .lesson_label').html(middle_idx - 1 < 0 ? "" : middle_idx); // $('#l_u .lesson_label').html( middle_idx-1<0 ? "":lessonListData[middle_idx-1].desc);
    $('#l_u').css('visibility', middle_idx - 1 < 0 ? 'hidden' : 'visible');
    $('#l_uu .lesson_label').html(middle_idx - 2 < 0 ? "" : middle_idx - 1); // $('#l_uu .lesson_label').html(middle_idx-2<0 ? "":lessonListData[middle_idx-2].desc);
    $('#l_uu').css('visibility', middle_idx - 2 < 0 ? 'hidden' : 'visible');
    $('#l_b .lesson_label').html(middle_idx + 1 < lessonListData.length ? middle_idx + 2 : ""); // $('#l_b .lesson_label').html(middle_idx+1<lessonListData.length ? lessonListData[middle_idx+1].desc:"");
    $('#l_b').css('visibility', middle_idx + 1 < lessonListData.length ? 'visible' : 'hidden');
    $('#l_bb .lesson_label').html(middle_idx + 2 < lessonListData.length ? middle_idx + 3 : ""); // $('#l_bb .lesson_label').html(middle_idx+2<lessonListData.length ? lessonListData[middle_idx+2].desc:"");
    $('#l_bb').css('visibility', middle_idx + 2 < lessonListData.length ? 'visible' : 'hidden');
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

    $('#l_m').css({ 'background-size': '100% 100%' });
    $('#l_m span').css({ 'background-size': '100% 100%', 'opacity': '0.01' });
    updateListView();
    refreshCurrent();
}

//================================================================
// 当前
function refreshCurrent() {
    $('#chapter_title').html(lessonListData[middle_idx].desc);

    if (isUsing(middle_idx)) {
        $('#lesson_pass').hide();
        $('#practice_pass').hide();

        if (isLessonLock(middle_idx)) {
            $('#btn_lesson').removeAttr('href');
            $('#lesson_info').hide();
            $('#lesson_locked').show();
            $('#lesson_locked .icon_locker').removeClass("fade-out");
        }
        else {
            $('#btn_lesson').prop('href', lessonListData[middle_idx]['curl'] + "?progress=" + Math.max(progress, ((middle_idx << 1) + 1)).toString());
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
            let next_pro_idx = middle_idx;
            while (++next_pro_idx < lessonListData.length && !lessonListData[next_pro_idx].use) { }
            console.log("next_pro_idx", next_pro_idx);

            $('#btn_practice').prop('href', lessonListData[middle_idx]['purl'] + "?progress=" + Math.max(progress, (next_pro_idx << 1)).toString());
            $('#practice_info').show();
            $('#practice_locked').hide();
            $('#practice_locked .icon_locker').addClass("fade-out");
        }
    }
    else {
        $('#lesson_info').hide();
        $('#lesson_locked').hide();
        $('#practice_info').hide();
        $('#practice_locked').hide();
        $('#lesson_pass').show();
        $('#practice_pass').show();
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
    if (cur_idx >= notices_list.length) { cur_idx = 0; }

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
var exam_ticket = 0;

function testfunc() {
    alert("本次考试需要 " + exam_ticket + "枚金币，你的金币数不够！");
}
function onExamReadyGet(jsonData) {
    examination = jsonData;

    if (examination) {
        if (gold >= exam_ticket) {
            $('#btn_enter_exam').prop('href', $('#exam_entrance').data('examurl').replace('0', examination.id)).click(null);
        }
        else {
            $('#btn_enter_exam').prop('href', "#").click(testfunc);
        }

        var time_str = examination.start_time;
        time_str = time_str.replace('-', '年').replace('-', '月').replace('T', '日 ');
        $('#exam_starttime').html(time_str);
        time_str = examination.end_time;
        time_str = time_str.replace('-', '年').replace('-', '月').replace('T', '日 ');
        $('#exam_endtime').html(time_str);

        $("#exam_open").show();
        $("#exam_end").show();
        $("#btn_enter_exam").show();
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
        $("#exam_end").hide();
        $("#btn_enter_exam").hide();
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

// 考试历史
var exam_his_list = [];
var his_index = 0;
function refreshExamHistory() {
    $("#his_prev").attr('disabled', (his_index == 0));
    $("#his_next").attr('disabled', (his_index >= exam_his_list.length - 1));
    if (exam_his_list[his_index]) {
        $("#exam_check_title").html(exam_his_list[his_index].title);
        $("#btn_exam_check").prop('href', exam_his_list[his_index].url);
        $("#exam_check").show();
        $("#exam_check_none").hide();
    }
    else {
        $("#exam_check").hide();
        $("#exam_check_none").show();
    }
}
function onHisPrev(event) {
    nextidx = Math.min(exam_his_list.length - 1, his_index + 1);
    if (nextidx == his_index) return;
    his_index = nextidx;
    refreshExamHistory();
}

function onHisNext(event) {
    nextidx = Math.max(0, his_index - 1);
    if (nextidx == his_index) return;
    his_index = nextidx;
    refreshExamHistory();
}
