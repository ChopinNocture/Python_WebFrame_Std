$(document).ready(onInit);

var qType_list = [];
var cur_type = "FillInBlank";
var cur_idx = 0;
var question_sum = 0;
var examination = null;
var answer_info = null;


function onInit(event) {
    csrf_Setup();
    var title = "";
    title = title + $('#id_title').val() + " 卷面查看";
    $('#section_title').html(title);

    $('#btn_next').click(onNextClk);
    $('#btn_Prev').click(onPrevClk);

    initQuestion();

    $("#nav_" + cur_type).click();
}

function update() {
    updatePageView();
    updateQuestion();
}

function onBackClick(event) {
    console.log("2323131");

    history.back();
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
        cur_idx = n;
        update();
    }
}

function updatePageView() {
    if (cur_idx <= 0) {
        $('#prev_panel').hide();
    }
    else {
        $('#prev_panel').show();
    }

    if (cur_idx < question_sum - 1) {
        $('#last_panel').hide();
        $('#next_panel').show();
        $('#next_index').html(cur_idx + 2);
    }
    else {
        $('#last_panel').show();
        $('#next_panel').hide();
    }
    $('#current_index').html(cur_idx + 1);
    $('#sum_label').html(question_sum);
}

//---------------------------------------------------------------------------
// exam part
var refreshQuestionFunc;
var refreshAnswerFunc;

// { "total_num": 0, "total_score": 0, "choice" :{ 'per_score': 1, 'num': 0, 'sum_score': 0, index, qlist:[ids], questions:[]}}
// { ts, choice{sc re[{c r a}]} }
function initQuestion() {
    $(".qtype").each(function (index, elem) {
        var typestr = $(elem).data("qtype");
        qType_list.push(typestr);
        $(elem).html(TYPE_TRANS_LIST[typestr]).click(onTypeChanged);
    });

    examination = $.parseJSON($('#id_question_list').val());
    if (examination) {
        for (var i in qType_list) {
            if (examination[qType_list[i]]) {
                examination[qType_list[i]]["index"] = 0;
            }
        }
    }

    answer_info = $.parseJSON($('#id_answer_json').val());
    var sc, adsc;
    sc = Number($("#id_score").val());
    adsc = Number($("#id_addition_score").val());
    $("#total_sum").html(examination.total_score);
    $("#finanl_score").html(sc + adsc);
    $("#answer_score").html(sc);
    $("#addition_score").html(adsc);
}

function onTypeChanged(event) {
    $(".qtype").removeClass("actived");
    updateTypeChanged($(event.target).addClass("actived").data("qtype"));
}

function updateTypeChanged(newType) {
    examination[cur_type]["index"] = cur_idx;
    //alert(newType+"--" + examination[cur_type]["questions"]);
    cur_type = newType;
    cur_idx = examination[cur_type]["index"];
    question_sum = examination[cur_type]["num"];

    var cur_al = answer_info[cur_type]["re"];
    var right_num = 0;
    for (var iter in cur_al) {
        if (cur_al[iter]['r']) {
            ++right_num;
        }
    }
    $("#cur_score").html(answer_info[cur_type]["sc"]);
    $("#cur_sum_sc").html(examination[cur_type]["sum_score"]);
    $("#cur_num").html(right_num);
    $("#cur_sum_nm").html(question_sum);

    eval('refreshQuestionFunc = refresh' + cur_type);
    eval('refreshAnswerFunc = refreshAnswer' + cur_type);
    eval('showKeyFunc = showKey' + cur_type);

    if (examination[cur_type]["questions"] == undefined) {
        if (examination[cur_type]['qlist'].length > 0) {
            var jsonlist = JSON.stringify({ 'qlist': examination[cur_type]['qlist'] });

            $.ajax({
                url: $("#exam_form").data("typelisturl"),
                type: 'post',
                data: { "qtype": cur_type, "jsonlist": jsonlist },
                dataType: "json",
                success: onQuestionGet,
            });
        }
        else {
            examination[cur_type]["questions"] = [];
        }
    }
    else {
        update();
    }
}

function onQuestionGet(jsonData) {
    var getType = jsonData['qtype'];
    //alert(getType+ " ** " +  JSON.stringify(jsonData));
    examination[getType]["questions"] = jsonData['questions'];
    update();
}

function updateQuestion() {
    //alert(examination[cur_type].qlist[cur_idx]);
    if (examination[cur_type]["questions"][cur_idx] != undefined) {
        refreshQuestionFunc(examination[cur_type]["questions"][cur_idx]);
        let res = false;
        if (answer_info[cur_type]["re"] && answer_info[cur_type]["re"][cur_idx] && answer_info[cur_type]["re"][cur_idx]['a'] != undefined) {
            refreshAnswer(answer_info[cur_type]["re"][cur_idx]['a'], examination[cur_type]["questions"][cur_idx]);
            res = answer_info[cur_type]["re"][cur_idx]['r'];
        }
        var result = {
            "result": res,
            "qDesc": examination[cur_type]["questions"][cur_idx].description
        };
        showKeyFunc(result, examination[cur_type]["questions"][cur_idx].key);
        showResult(result.result, cur_type == "Voice");
    }
    else {
        $('#q_description').html("本该题型没有题目，请选择其它题型继续！");
        $('#q_type_sheet').html("");
    }
}

function refreshAnswer(answerString, question) {
    refreshAnswerFunc(answerString, question);
}

function refreshAnswerCaseAnalyse(result, keyObject) {}
function showKeyCaseAnalyse() {}
//=======================================================
// tips part
//-----------
const QTYPE_TIPS_MAP = {
    "ERROR": "答案错误，正确答案如上所示！",
    "SUCCEED": "答案正确！",
    "VoiceRef": "点击按钮听参考答案！"
}

function showResult(isCorrect, isVoice) {
    $('#sheet_bg_in').removeClass('effect-right').removeClass('effect-wrong');
    if (isVoice) {
        $('#q_type_tips').html(QTYPE_TIPS_MAP["VoiceRef"]);
    }
    else {
        if (isCorrect) {
            $('#q_type_tips').html(QTYPE_TIPS_MAP["SUCCEED"]);
            $('#sheet_bg_in').addClass('effect-right');
        }
        else {
            $('#sheet_bg_in').addClass('effect-wrong');
            $('#q_type_tips').html(QTYPE_TIPS_MAP["ERROR"]);
        }
    }
}

//----------------------------------------------------------------------------
function refreshAnswerFillInBlank(answerString) {
    var keyArray = answerString.split(KEY_SPLITER_SYMBOL)
    $('input[id^=blank_]').each(function (idx, elem) {
        $(elem).val(keyArray[idx]);
    });
}

function refreshAnswerTrueOrFalse(answerString) {
    if (answerString != undefined) {
        if (answerString) {
            $('#TF_Right').prop('checked', "checked");
        }
        else {
            $('#TF_Wrong').prop('checked', "checked");
        }
    }
}

function refreshAnswerChoice(answerString) {
    $('input[id^=id_option_]').each(function (idx, elem) {
        if (answerString == elem.value) {
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

function refreshAnswerPair(answerString, question) {
    refreshAnswerSort(answerString, question);
}

function refreshAnswerSort(answerString, question) {
    var answer_list = answerString.split(KEY_SPLITER_SYMBOL);
    var option_list = question.options.split(OPTION_SPLITER_SYMBOL);

    $('label[id^=' + SORT_OP_ID + ']').each(function (index, elem) {
        $(elem).html(option_list[answer_list[index]]).data('opidx', answer_list[index]);
    });
}

function refreshAnswerVoice(answerString) {
    if (answerString.length > 0) {
        $("#voice_recorder").hide();
        var au = document.createElement('audio');

        au.controls = true;
        //alert(answerString);    
        au.src = answerString;
        $('#voice_reviewer')[0].appendChild(au);
    }
}

function checkVoice(keyString, result_obj) {
    var result_json = { 'complete': !is_recording };

    if (result_obj != undefined && result_obj['answer'] != '') {
        result_json['answer'] = result_obj['answer'];
    }
    else {
        result_json['answer'] = "";
        if (cur_voice_blob != null) {
            var formData = new FormData();
            formData.append("type", cur_type);
            formData.append("index", cur_idx);
            formData.append("voice", cur_voice_blob);

            $.ajax({
                url: $("#exam_form").data("voiceAnswerUrl"),
                type: 'post',
                data: formData,
                processData: false,
                contentType: false,
                success: onVoiceFileSubmitted,
            });
        }
    }
    result_json['result'] = true;
    return result_json;
}

var VOICE_SUBMIT_HTML = '<button id="btn_voice_submit" onclick="voiceSubmit(event)" class="btn-round-sky" onfocus="this.blur()" tabindex="-1" >上传语音答案</button>';
var VOICE_ANSWER_HTML = '<div id="frame_recorder"> <div id="voice_reviewer"></div> </div>';