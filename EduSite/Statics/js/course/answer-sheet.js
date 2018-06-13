// section_title question_index question_count question_type

$(document).ready(onInit);

$('#btn_submit').click(onSubmitClk);
$('#btn_next').click(onNextClk);
$('#btn_Prev').click(onPrevClk);

var qType_list = [];
var result_list = [];   // complete, result, answer
var qList_obj = null;
var cur_idx = -1;
var question_sum = 0;

function onInit(event) {  
    ajaxSubmitJson(document.getElementById('qlist_form'), onQuestionListGet, failFunc)
}

var checkAnswerFunc;// = function(){ return {complete, result, answer}; };
function checkAnswer() {
    var result_json = checkAnswerFunc(qList_obj.qList[cur_idx].key);
    result_list[cur_idx] = result_json;    
    alert(cur_idx + '   ' + JSON.stringify(qList_obj.qList[cur_idx]) + '\n' + JSON.stringify(result_json));
}

function onSubmitClk(event) {
    checkAnswer();
}

function onNextClk(event) {
    cur_idx = Math.min(cur_idx + 1, question_sum - 1);
    update();
}

function onPrevClk(event) {
    //cur_idx = Math.max(cur_idx - 1, 0);
    //update();

    tool_shuffle_list(8);
}

function failFunc() {
    alert('boibo');
}

function onQuestionListGet(jsonData) {
    //alert(typeof(jsonData));
    alert('' + jsonData.qType_list.length + ' ' + jsonData.qList.length);
    qType_list = jsonData.qType_list;
    qList_obj = jsonData;
    
    question_sum = qList_obj.qList.length;
    answer_list = new Array(question_sum);
    
    cur_idx = 0;
    update();
}

function update() {
    if (qList_obj != null && qList_obj.qList != null) {
        $('#question_index').html(cur_idx + 1);

        if (cur_idx >= 0 && cur_idx < qList_obj.qList.length) {
            $('#question_count').html('/' + qList_obj.qList.length);
            $('#question_type').html(qList_obj.qList[cur_idx].qType);

            $('#q_type_sheet').empty();
            if (qType_list.indexOf(qList_obj.qList[cur_idx].qType) != -1) {
                // framework [set:check answer] and [refresh page]                
                eval('refresh' + qList_obj.qList[cur_idx].qType + '(qList_obj.qList[cur_idx])');
                // 设置check函数
                eval('checkAnswerFunc = check' + qList_obj.qList[cur_idx].qType);
            }
            //
        }
    }
}

//=======================================================
// FillInBlank TrueOrFalse Choice MultiChoice Pair Sort
//=======================================================
//-------------------------------------------------------
// Question type: FillInBlank
//-------------------------------------------------------
//---- refresh ----
function refreshFillInBlank(question) {
    $('#q_description').html(question.description);
}

function checkFillInBlank(key_str) {
    return '';
}

//-------------------------------------------------------
// Question type: TrueOrFalse
//-------------------------------------------------------
function refreshTrueOrFalse(question) {
    $('#q_description').html(question.description);
    var html_str = '';
    // html_str += '<input type="radio" name="TF_Answer" id="TF_Right" value="Right"/><label>Right</label>';
    // html_str += '<input type="radio" name="TF_Answer" id="TF_Wrong" value="Wrong"/><label>Wrong</label>';

    html_str = '<div class="form-check form-check-inline">\
                <input class="form-check-input" type="radio" name="inlineRadioOptions" id="TF_Right" value="Right">\
                <label class="form-check-label" for="TF_Right">Right</label>\
                </div>\
                <div class="form-check form-check-inline">\
                <input class="form-check-input" type="radio" name="inlineRadioOptions" id="TF_Wrong" value="Wrong">\
                <label class="form-check-label" for="TF_Wrong">Wrong</label>\
                </div>'

    $('#q_type_sheet').html(html_str);
}
function checkTrueOrFalse(key_bool) {
    var result_json = { 'complete': false }

    result_json.complete = $('#TF_Right').prop('checked') || $('#TF_Wrong').prop('checked');
    if (!result_json.complete) {
        alert('Unfinished! Must choose something!');
        return result_json;
    }

    result_json['answer'] = $('#TF_Right').prop('checked');

    result_json['result'] = (key_bool == result_json['answer']);

    return result_json;
}

//-------------------------------------------------------
// Question type: Choice MultiChoice
//-------------------------------------------------------
//---- refresh ----
var OPTION_HTML = '<div class="form-check">\
                        <input class="form-check-input" type="$$" name="QuestionOptions" id="@@" value="^^">\
                        <label class="form-check-label" for="@@">\
                            ##\
                        </label>\
                    </div>';
var OPTION_ID = 'ID_Option';
function generateOptions(question, CheckOrRadio = 'radio') {
    var html_str = '';
    var option_list = question.options.split(OPTION_SPLITER_SYMBOL);

    for (var i = 0; i < option_list.length; ++i) {
        html_str += OPTION_HTML.replace('$$', CheckOrRadio)
            .replace('@@', OPTION_ID + (i + 1))
            .replace('@@', OPTION_ID + (i + 1))
            .replace('##', option_list[i])
            .replace('^^', i)
    }
    return html_str;
}

function refreshChoice(question) {
    $('#q_description').html(question.description);
    $('#q_type_sheet').html(generateOptions(question));
}

function refreshMultiChoice(question) {
    $('#q_description').html(question.description);
    $('#q_type_sheet').html(generateOptions(question, 'checkbox'));
}

//---- check ----
function chk_Opt(key_str, key_type) {
    var result_json = { 'complete': false };
    var answer_str = $('input:' + key_type + ':checked').map(function () { return $(this).val(); }).get().join(KEY_SPLITER_SYMBOL);

    result_json.complete = (answer_str.length>0);
    if (result_json.complete) {
        result_json['answer'] = answer_str;
        result_json['result'] = (answer_str == key_str);
    }
    else {
        alert('Unfinished! Must choose something!');
    }
    return result_json;
}

function checkChoice(key_str) {
    return chk_Opt(key_str, 'radio');
}

function checkMultiChoice(key_str) {
    return chk_Opt(key_str, 'checkbox');
}

//-------------------------------------------------------
// Question type: Pair
//-------------------------------------------------------
function refreshPair(question) {
    $('#q_description').html(question.description);
}
function checkPair(key_str) { }
//-------------------------------------------------------
// Question type: Sort
//-------------------------------------------------------
function refreshSort(question) {
    var listtt = new Array(10);
    listtt.
    $('#q_description').html(question.description);
}
function checkSort(key_str) { }