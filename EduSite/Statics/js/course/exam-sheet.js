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

function update() {
    updatePageView();
    updateQuestion();
}
//---------------------------------------------------------------------------
// page
function onNextClk(event) {
    nextQuestion(cur_idx + 1);
}

function onPrevClk(event) {
    nextQuestion(cur_idx - 1);
}

function nextQuestion(nextIdx) {
    var n = Math.max(Math.min(nextIdx, question_sum - 1), 0)
    
    if (n != cur_idx) {
        checkCurrentAnswer();
        cur_idx = n;
        update();
    }
}

function updatePageView() {
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
    $('#current_index').html(cur_idx+1);    
}

//---------------------------------------------------------------------------
// exam part
var checkAnswerFunc;// = function(){ return {complete, result, answer}; };
var refreshQuestionFunc;
var refreshAnswerFunc;

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

// { "total_num": 0, "total_score": 0, "choice" :{ 'per_score': 1, 'num': 0, 'sum_score': 0, index, qlist }    }
function onTypeChanged(event) {
    $(".qtype").removeClass("actived");

    updateTypeChanged($(event.target).addClass("actived").data("qtype"));
}

function updateTypeChanged(newType) {
    examination[cur_type]["index"] = cur_idx;
    checkCurrentAnswer();

    cur_type = newType;
    cur_idx = examination[cur_type]["index"];
    question_sum = examination[cur_type]["num"];        

    eval('checkAnswerFunc = check' + cur_type);
    eval('refreshQuestionFunc = refresh' + cur_type);
    eval('refreshAnswerFunc = refreshAnswer' + cur_type);
    

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
}

function onQuestionGet(jsonData) {
    var getType = jsonData['qtype'];
    examination[getType]["questions"] = jsonData['questions'];
    examination[getType]["answers"] = new Array(jsonData['questions'].length);

    update();
}

function updateQuestion() {
    //alert(examination[cur_type].qlist[cur_idx]);
    refreshQuestionFunc(examination[cur_type]["questions"][cur_idx]);
    if(examination[cur_type]["answers"] && examination[cur_type]["answers"][cur_idx]) {
        refreshAnswer(examination[cur_type]["answers"][cur_idx].answer);    
    }         
}

function checkCurrentAnswer() {
    if(examination[cur_type]["answers"]) {
        examination[cur_type]["answers"][cur_idx] = checkAnswerFunc(examination[cur_type]["questions"][cur_idx].key);
    }    
}

function refreshAnswer(answerString) {
    refreshAnswerFunc(answerString);
}


//----------------------------------------------------------------------------
function refreshAnswerFillInBlank(answerString) {
    var keyArray = answerString.split(KEY_SPLITER_SYMBOL)
    $('input[id^=blank_]').each(function (idx, elem) {
        $(elem).val(keyArray[idx]);
    });
}

function refreshAnswerTrueOrFalse(answerString) {
    if(answerString!=undefined) {
        $('#TF_Right').prop('checked', answerString ? "checked" : "no");
        $('#TF_Wrong').prop('checked', !answerString ? "checked" : "no");
    }    
}

function refreshAnswerChoice(answerString) {
    $('input[id^=id_option_]').each(function(idx, elem){
        if(answerString == elem.value) {
            $(elem).prop('checked', 'checked');
            return false;
        }
    });
}

function refreshAnswerMultiChoice(answerString) {
    $('input[id^=id_option_]').each(function (idx, elem) {
        if (answerString.indexOf(elem.value) != -1) {
            $(elem).prop('checked', 'checked');
        }
    });
}

function refreshAnswerKeyPair(answerString) {
    refreshAnswerKeySort(answerString);
}

function refreshAnswerKeySort(answerString) {
    var answer_list = answerString.split(OPTION_SPLITER_SYMBOL);

    $('label[id^=' + SORT_OP_ID + ']').each(function (index, elem) {
        //alert('  0  ' + index + '  ' + this.dataset['opidx']);
        $(elem).html(answer_list[index]);
    });
}
