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

function onSubmitClk(event) {
    checkAnswer();
}

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

function failFunc() {
    alert('失败');
}

var checkAnswerFunc;// = function(){ return {complete, result, answer}; };
function checkAnswer() {
    var result_json = checkAnswerFunc(qList_obj.qList[cur_idx].key);
    result_list[cur_idx] = result_json;    
    //alert(cur_idx + '   ' + JSON.stringify(qList_obj.qList[cur_idx]) + '\n' + JSON.stringify(result_json));

    updateStat();
    //showKey();
}

function updateStat() {
    var right_sum=0, wrong_sum = 0;
    result_list.forEach(function(value,index,array) {
        if (value['complete']) {
            if(value['result']) {
                ++right_sum;
            }
            else {
                ++wrong_sum;
            }
        }        
    });
    $('#stat_right').html(right_sum);
    $('#stat_wrong').html(wrong_sum);
}

function onQuestionListGet(jsonData) {
    //alert(typeof(jsonData));
    //alert('' + jsonData.qType_list.length + ' ' + jsonData.qList.length);
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
var BLANK_HTML = '<input type="text" class="" style="width:5px display:inline" id="***" placeholder=""></input>';
var blank_id_prefix = 'blank_';

var FillInBlank_Key_Reg = /{@([\w\u4e00-\u9fa5]+)@}/g;
var fill_desc = "";

var blank_key_list = [];

function refreshFillInBlank(question) {
    blank_key_list = [];
    var i=0;

    fill_desc = question.description.replace(FillInBlank_Key_Reg, function ($0, $1) {
        blank_key_list.push($1);
        //blank_key_list
        var htmltext = BLANK_HTML.replace("***", blank_id_prefix + i.toString());
        ++i;
        return htmltext;
    });

    $('#q_description').html(fill_desc);
}

function checkFillInBlank(key_str) {
    var result_json = { 'complete': false };
    
    var answer_str = $('input[id^=' + blank_id_prefix + ']').map(function () { return $(this).val(); }).get().join(KEY_SPLITER_SYMBOL);

    result_json.complete = (answer_str.length>0);
    if (result_json.complete) {
        result_json['answer'] = answer_str;
        result_json['result'] = (answer_str == key_str);
    }
    else {
        alert('提交之前请完成题目!');
    }
    return result_json;
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
        alert('提交之前请完成题目!');
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
            .replace('@@', OPTION_ID + (i))
            .replace('@@', OPTION_ID + (i))
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
        alert('提交之前请完成题目!');
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

var SORTABLE_OPTION_HTML = '<div class="" id="@@" dropzone="move" ondrop="drop(event)" ondragover="allowDrop(event)">\
                                <div class="form-check" draggable="true" ondragstart="drag(event)" width="336" height="69" id="^^" data-opidx="~~"> \
                                        ##\
                                </div>\
                            </div>';

function drag(event) {
    event.dataTransfer.setData('text', $(event.target).parent().attr('id'));// parentNode.id);
    event.dataTransfer.effectAllowed = 'copy'; 
}

function drop(event) {
    
    event.preventDefault();

    //alert(event.target);
    var id = event.dataTransfer.getData("text");

    var orin = $('#'+id);
    var orinNode = orin.children('div');
    var targetNode = $(event.target).children('div');

    orin.empty();
    $(event.target).empty();//target.innerHTML = '';//.removeChild(targetNode);

    $(event.target).append(orinNode);
    orin.append(targetNode);
}

function allowDrop(event){
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    return false;
}

var SORT_OP_ID = 'drag_item';

function refreshSort(question) {
    $('#q_description').html(question.description);

    var option_list = question.options.split(OPTION_SPLITER_SYMBOL);    
    var shuffled_op = tool_shuffle_list(option_list.length);
    
    var html_str = '';
    for (var i = 0; i < shuffled_op.length; ++i) {
        html_str += SORTABLE_OPTION_HTML.replace('@@', OPTION_ID + (i))
                                        .replace('##', option_list[shuffled_op[i]])
                                        .replace('~~', shuffled_op[i])
                                        .replace('^^', SORT_OP_ID + i);
    }
    $('#q_type_sheet').html(html_str);
    //alert(shuffled_op);
}

function checkSort(key_str) { 
    //alert("hgaha");
    var suc = true;
    $('div[id^=' + SORT_OP_ID + ']').each(function (index) {
        //alert('  0  ' + index + '  ' + this.dataset['opidx']);
        suc = (index == this.dataset['opidx']);
        return suc;
    });

    var result_json = { 'complete': true };

    result_json['answer'] = $('div[id^=' + SORT_OP_ID + ']').map(function(){return this.dataset['opidx'];}).get().join(KEY_SPLITER_SYMBOL);
    result_json['result'] = suc;

    return result_json;
}