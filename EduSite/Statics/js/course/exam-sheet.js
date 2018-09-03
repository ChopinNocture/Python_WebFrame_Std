$(document).ready(onInit);


var qType_list = [];
var result_list = [];   // complete, result, answer
var qList_obj = null;
var cur_type = "FillInBlank";
var cur_idx = 0;
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
        $(elem).html(TYPE_TRANS_LIST[typestr]).click(onTypeChanged);        
    });

    if(examination) {
        question_sum = examination.total_num;
        for (var i in qType_list) {
            if(examination[qType_list[i]]) {
                examination[qType_list[i]]["index"] = 0;
            }
        }
    }
}

//---------------------------------------------------------------------------
// exam part
// { "total_num": 0, "total_score": 0, "choice" :{ 'per_score': 1, 'num': 0, 'sum_score': 0, index, qlist }    }
function onTypeChanged(event) {
    examination[cur_type]["index"] = cur_idx;
        
    $(".qtype").removeClass("actived");
    cur_type = $(event.target).addClass("actived").data("qtype");
    cur_idx = examination[cur_type]["index"];
    question_sum = examination[cur_type]["num"];

    if(examination[cur_type]["questions"] == null) {
        var jsonlist = JSON.stringify({'qlist':examination[cur_type]['qlist']});

        $.ajax({        
            url: $("#exam_form").data("typelisturl"),
            type: 'post',
            data: { "qtype": cur_type, "jsonlist":jsonlist },
            dataType: "json",
            success: onQuestionGet,
        });
    }
    else {
        update();
    }    
    //qtype
}

function onQuestionGet(jsonData) {
    var getType = jsonData['qtype'];
    examination[getType]["questions"] = jsonData['questions']

    update();
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
    updateQuestion();
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


function updateQuestion() {
    //alert(examination[cur_type].qlist[cur_idx]);
    eval('refresh' + cur_type + '(examination[cur_type]["questions"][cur_idx])');
}