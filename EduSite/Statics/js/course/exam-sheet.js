$(document).ready(onInit);


var qType_list = [];
var result_list = [];   // complete, result, answer
var qList_obj = null;
var cur_idx = -1;
var question_sum = 10;

function onInit(event) {  
    csrf_Setup();

    $('#btn_next').click(onNextClk);
    $('#btn_Prev').click(onPrevClk);
    $('#btn_back_main').click(onBackMain);
    ajaxSubmitJson(document.getElementById('qlist_form'), onQuestionListGet, failFunc);
}

var cur_idx = -1;

function onNextClk(event) {
    var lastnextidx = cur_idx;
    cur_idx = Math.min(cur_idx + 1, question_sum - 1);
    if (lastnextidx != cur_idx) {
        update();
    }
}

function onPrevClk(event) {
    var lastnextidx = cur_idx;
    cur_idx = Math.max(cur_idx - 1, 0);
    if (lastnextidx != cur_idx) {
        update();
    }
}

function update() {
    updateStat();
}

function updateStat() {
    if(cur_idx<=0) {
        $('#prev_panel').hide();
    }
    else {
        $('#prev_panel').show();
    }

    if (cur_idx<question_sum-1) {
        $('#next_panel').show();
        $('#next_index').html(cur_idx+2);
    }
    else {
        $('#next_panel').hide();
    }
}
