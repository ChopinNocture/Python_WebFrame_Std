$(document).ready(onInit);


var qType_list = [];
var result_list = [];   // complete, result, answer
var qList_obj = null;
var cur_idx = -1;
var question_sum = 0;
var examination = null;

function onInit(event) {  
    csrf_Setup();

    $('#section_title').html($('#id_title').val());

    $('#btn_next').click(onNextClk);
    $('#btn_Prev').click(onPrevClk);
    
    initQuestion();
    //examination.
    // ajaxSubmitJson(document.getElementById('qlist_form'), onQuestionListGet, failFunc);
}

function initQuestion() {
    examination = $.parseJSON( $('#id_question_list').val() );
    $(".qtype").each(function (index, elem) { 
        var typestr = $(elem).data("qtype");
        qType_list.push(typestr); 
        $(elem).html(TYPE_TRANS_LIST[typestr]);
        $(elem).click(onTypeChanged);
    });

    if(examination) {
        question_sum = examination.total_num;
        for (var iter in qType_list) {

        }
    }
}

//---------------------------------------------------------------------------
// exam part
// { "total_num": 0, "total_score": 0, "choice" :{ 'per_score': 1, 'num': 0, 'sum_score': 0, qlist }    }
function onTypeChanged(event) {
    $(event.target).prop("checked", true);
    //qtype
}


//---------------------------------------------------------------------------
// page
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
