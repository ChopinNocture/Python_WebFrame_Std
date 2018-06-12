// section_title question_index question_count question_type

$(document).ready(onInit);

$('#btn_submit').click(onSubmitClk);
$('#btn_next').click(onNextClk);
$('#btn_Prev').click(onPrevClk);

var qType_list = []
var answer_list = []
var qList_obj = null;
var cur_idx = -1;
var question_sum = 0;

function onInit(event) {
    //alert('henen');    
    ajaxSubmitJson( document.getElementById('qlist_form'), onQuestionListGet, failFunc)
}

function checkAnswer() {}
function onSubmitClk(event){
    checkAnswer();
}

function onNextClk(event){
    cur_idx = Math.min(cur_idx + 1, question_sum);
    update();
}

function onPrevClk(event){
    cur_idx = Math.max(cur_idx - 1, 0);
    update();
}

function failFunc() {
    alert('boibo');
}

function onQuestionListGet(jsonData) {
    //alert(typeof(jsonData));
    alert('' + jsonData.qType_list.length + ' ' + jsonData.qList.length);
    qType_list = jsonData.qType_list;
    question_sum = qType_list.length;
    answer_list = new Array(question_sum);
    qList_obj = jsonData;
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
                eval('checkAnswer = check' + qList_obj.qList[cur_idx].qType);
                eval('refresh' + qList_obj.qList[cur_idx].qType + '(qList_obj.qList[cur_idx])');
            }
            //
        }
    }
}

//=======================================================
// FillInBlank TrueOrFalse Choice MultiChoice Pair Sort
//=======================================================
function refreshFillInBlank(question) {
    alert(question);
    $('#q_description').html(question.description);
}

function checkFillInBlank() {    
}

function checkTrueOrFalse() {}

function chk_Opt(key_type) {
    return $('input:' + key_type + ':checked').map(function () { return $(this).val(); }).get().join(",");
}

function checkChoice() {
    alert(chk_Opt('radio'));
}
function checkMultiChoice() {
    alert(chk_Opt('checkbox'));
}

function checkPair() {}
function checkSort() {}

function refreshTrueOrFalse(question) {
    alert(question);
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

var OPTION_HTML = '<div class="form-check">\
                        <input class="form-check-input" type="$$" name="QuestionOptions" id="@@" value="^^">\
                        <label class="form-check-label" for="@@">\
                            ##\
                        </label>\
                    </div>';
var OPTION_ID = 'ID_Option';

function generateOptions(question, CheckOrRadio='radio') {
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

function refreshPair(question) {
    $('#q_description').html(question.description);
}

function refreshSort(question) {
    $('#q_description').html(question.description);
}
