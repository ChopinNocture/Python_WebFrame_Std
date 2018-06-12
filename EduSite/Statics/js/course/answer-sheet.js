// section_title question_index question_count question_type

$(document).ready(onInit);

var qType_list = []
var qList_obj = null;
var cur_idx = -1;

function onInit(event) {
    //alert('henen');    
    ajaxSubmitJson( document.getElementById('qlist_form'), onQuestionListGet, failFunc)
}

function failFunc() {
    alert('boibo');
}

function onQuestionListGet(jsonData) {
    //alert(typeof(jsonData));
    alert('' + jsonData.qType_list.length + ' ' + jsonData.qList.length);
    qType_list = jsonData.qType_list;
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
                eval('refresh' + qList_obj.qList[cur_idx].qType + '(qList_obj.qList[cur_idx])');
            }
            //
        }
    }
}

// FillInBlank TrueOrFalse Choice MultiChoice Pair Sort
function refreshFillInBlank(question) {
    alert(question);
    $('#q_description').html(question.description);
}
function refreshTrueOrFalse(question) {
    alert(question);
    $('#q_description').html(question.description);
    var html_str = '';
    html_str += '<input type="radio" name="TF_Answer" id="TF_Right" value="Right"/><label>Right</label>';
    html_str += '<input type="radio" name="TF_Answer" id="TF_Wrong" value="Wrong"/><label>Wrong</label>';
    $('#q_type_sheet').html(html_str);
}
function refreshChoice(question) {
    alert(question);
    $('#q_description').html(question.description);
}
function refreshMultiChoice(question) {
    alert(question);
    $('#q_description').html(question.description);
}
function refreshPair(question) {
    alert(question);
    $('#q_description').html(question.description);
}
function refreshSort(question) {
    alert(question);
    $('#q_description').html(question.description);
}