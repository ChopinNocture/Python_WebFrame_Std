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
    if( result_json.complete ) {
        showEffect(result_json.result); 
        updateStat();
        showKeyFunc(result_json, qList_obj.qList[cur_idx].key);
    }
}

const LI_HTML = '<li><span class="gold-icon **"/></li>';

const LI_HTML_SUC = '<li><span class="gold-icon"/></li>';
const LI_HTML_UNFIN = '<li><span class="unfinished"/></li>';
const LI_HTML_FAIL = '<li><span class="gold-icon-failed"/></li>';
const LI_HTML_CURRENT = '<li><span class="current"/></li>';

function updateStat() {
    var right_sum=0, wrong_sum = 0;
    var list_html = "";
    result_list.forEach(function(value,index,array) {
        var state_string = "";

        if (value['complete']) {
            if (value['result']) {
                ++right_sum;
                state_string = "succeed";
            } else {
                ++wrong_sum;
                state_string = "failed";
            }
        }
        else {
            state_string = "unfinished";
        }

        if (index == cur_idx) {
            state_string += " current";
        }

        list_html += LI_HTML.replace("**", state_string);
    });

    $('#progress_list').html(list_html);

    $('#stat_right').html(right_sum);
    $('#stat_wrong').html(wrong_sum);
}

function showEffect(isCorrect) {
    $('#show_panel').show();
    var effectTime = 3;
    var finisheFunc = null;

    if(isCorrect) {
        $('#effect_right').show();
        effectTime = 3;
        finisheFunc = ()=> {
            onNextClk();
        };
        $('#q_type_tips').html(QTYPE_TIPS_MAP["SUCCEED"]);
    }
    else {
        effectTime = 1.2;
        $('#btn_submit').hide();
        $('#btn_next').show();
        $('#effect_wrong').show();
        $('#sheet_bg_in').addClass('effect-wrong');

        $('#q_type_tips').html(QTYPE_TIPS_MAP["ERROR"]);        
    }
    
    setTimeout(() => {
        $('#effect_right').hide();
        $('#effect_wrong').hide();
        $('#show_panel').hide();
        $('#sheet_bg_in').removeClass('effect-wrong');

        if(finisheFunc!=null) {
            finisheFunc();
        }
        //$('#sheet_bg_out').removeClass('effect-wrong');
    }, effectTime * 1000);    
}

function onQuestionListGet(jsonData) {
    //alert('' + jsonData.qType_list.length + ' ' + jsonData.qList.length);
    qType_list = jsonData.qType_list;
    qList_obj = jsonData;
    
    question_sum = qList_obj.qList.length;    
    result_list = Array.apply(null, Array(question_sum)).map(() => {return {'complete':false};});
    
    cur_idx = 0;
    //updateStat();
    update();
}

function update() {    
    if (qList_obj != null && qList_obj.qList != null) {
        $('#question_index').html(cur_idx + 1);

        if (cur_idx >= 0 && cur_idx < qList_obj.qList.length) {
            $('#btn_submit').show();
            $('#btn_next').hide();

            var qtype = qList_obj.qList[cur_idx].qType;
            $('#question_count').html('/' + qList_obj.qList.length);
            $('#question_type').html(TYPE_TRANS_LIST[qtype]);
            $('#q_type_tips').html(QTYPE_TIPS_MAP[qtype]);

            $('#q_type_sheet').empty();
            if (qType_list.indexOf(qtype) != -1) {
                // framework [set:check answer] and [refresh page]                
                eval('refresh' + qtype + '(qList_obj.qList[cur_idx])');
                // 设置check函数
                eval('checkAnswerFunc = check' + qtype);
                eval('showKeyFunc = showKey' + qtype);                
            }
            //
        }
    }
    updateStat();
}

//=======================================================
// FillInBlank TrueOrFalse Choice MultiChoice Pair Sort
//=======================================================
//-------------------------------------------------------
// Question type: FillInBlank
//-------------------------------------------------------
//---- refresh ----
var BLANK_HTML = '<input type="text" class="blank-input" id="blank_**" placeholder=""></input>';

var FillInBlank_Key_Reg = /{@([\w\u4e00-\u9fa5]+)@}/g;
var fill_desc = "";

var blank_key_list = [];

function refreshFillInBlank(question) {
    blank_key_list = [];
    var i=0;

    fill_desc = question.description.replace(FillInBlank_Key_Reg, function ($0, $1) {
        blank_key_list.push($1);
        //blank_key_list
        var htmltext = BLANK_HTML.replace("**", i.toString());
        ++i;
        return htmltext;
    });

    $('#q_description').html(fill_desc);

    html_str = '<div id="FIB-key-panel"></div>';
    $('#q_type_sheet').html(html_str);
}

function checkFillInBlank(key_str) {
    var result_json = { 'complete': false };
    var blank_num = -1;
    var answer_str = $('input[id^=blank_]').map(function () { ++blank_num; return $(this).val(); }).get().join(KEY_SPLITER_SYMBOL);

    result_json.complete = (answer_str.length>blank_num);

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

    html_str = '<div class="option-group">\
                    <span id="span_r"/><input type="radio" name="inlineRadioOptions" id="TF_Right" value="Right">\
                    <label for="TF_Right" class="full-line">正 确</label>\
                </div>\
                <div class="option-group">\
                    <span id="span_w"/><input type="radio" name="inlineRadioOptions" id="TF_Wrong" value="Wrong">\
                    <label for="TF_Wrong" class="full-line">错 误</label> </div>';

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
var OPTION_HTML = '<div class="option-group">\
                        <span id="id_span_cc"/>\
                        <input type="$$" name="QuestionOptions" id="id_option_cc" value="cc">\
                        <label class="full-line" for="id_option_cc">##</label>\
                    </div>';

function generateOptions(question, CheckOrRadio = 'radio') {
    var html_str = '';
    var option_list = question.options.split(OPTION_SPLITER_SYMBOL);

    for (var i = 0; i < option_list.length; ++i) {
        html_str += OPTION_HTML.replace('$$', CheckOrRadio)
            .replace('cc', i).replace('cc', i).replace('cc', i).replace('cc', i)
            .replace('##', getOptionLabelChar(i) + " " + option_list[i]);
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
var id_replace_reg = new RegExp( 'cc' , "g" );

var PAIR_OPTION_HTML = '<div class="pair-line option-group" id="id_option_cc">\
                            <span id="id_span_cc"></span>\
                            <label class="option-pair pair-left" id="pair_l_cc">##</label>\
                            <label class="option-pair pair-right" dropzone="move" ondrop="drop(event)" ondragover="allowDrop(event)" draggable="true" ondragstart="drag(event)" id="sort_item_cc" data-sortid="cc" data-opidx="~~">$$</label>\
                        </div>';

function swapData(curidx, taridx) {
    var curhtml = $('#sort_item_' + curidx).html();
    var curdata = $('#sort_item_' + curidx).get(0).dataset['opidx'];
    
    var tarhtml = $('#sort_item_' + taridx).html();
    var tardata = $('#sort_item_' + taridx).get(0).dataset['opidx'];   

    $('#sort_item_' + curidx).html(tarhtml);
    $('#sort_item_' + curidx).get(0).dataset['opidx'] = tardata;
    $('#sort_item_' + taridx).html(curhtml).get(0).dataset['opidx'] = curdata;
}

function onUpClick(event) {
    var curidx = parseInt(event.target.dataset['sortid']);
    swapData(curidx, curidx-1);
}
         
function onDownClick(event) {
    var curidx = parseInt(event.target.dataset['sortid']);    
    swapData(curidx, curidx+1);
}

function refreshPair(question) {
    $('#q_description').html(question.description);
    question['key'] = question.rightOptions;

    var option_list_l = question.leftOptions.split(OPTION_SPLITER_SYMBOL);
    var option_list_r = question.rightOptions.split(OPTION_SPLITER_SYMBOL);

    var shuffled_op = tool_shuffle_list(option_list_r.length);
    
    var html_str = '';
    for (var i = 0; i < shuffled_op.length; ++i) {
        html_str += PAIR_OPTION_HTML.replace(id_replace_reg, i)
                                    .replace('##', option_list_l[i])
                                    .replace('$$', option_list_r[shuffled_op[i]])
                                    .replace('~~', shuffled_op[i]);
    }
    $('#q_type_sheet').html(html_str);
    $('#up_0').css('visibility','hidden');
    $('#down_'+(option_list_r.length-1)).css('visibility','hidden');    
}

function checkPair(key_str) { 
    return checkSort(key_str);
}
//-------------------------------------------------------
// Question type: Sort
//-------------------------------------------------------

var SORTABLE_OPTION_HTML = '<div class="option-group" id="id_option_cc" dropzone="move" ondrop="drop(event)" ondragover="allowDrop(event)" data-sortid="cc">\
                                <span id="id_span_cc"></span>\
                                <label class="option-pair full-line" draggable="true" ondragstart="drag(event)" width="336" height="69" id="sort_item_cc" data-sortid="cc" data-opidx="~~"> \
                                        ##\
                                </label>\
                            </div>';

function drag(event) {
    if(event.target.dataset['sortid']==null) return false;
    event.dataTransfer.setData('sortid', event.target.dataset['sortid']);// parentNode.id);
    event.dataTransfer.effectAllowed = 'copy'; 
}

function drop(event) {    
    event.preventDefault();

    if(event.target.dataset['sortid']== null) return false;
    //alert(event.target);
    var id = event.dataTransfer.getData("sortid");

    if(id==''||id==null) return false;

    swapData(id, event.target.dataset['sortid']);
}

function allowDrop(event){
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    return false;
}

var SORT_OP_ID = 'sort_item';

function refreshSort(question) {
    $('#q_description').html(question.description);

    var option_list = question.options.split(OPTION_SPLITER_SYMBOL);    
    var shuffled_op = tool_shuffle_list(option_list.length);
    
    var html_str = '';
    for (var i = 0; i < shuffled_op.length; ++i) {
        html_str += SORTABLE_OPTION_HTML.replace(id_replace_reg, i)
                                        .replace('##', option_list[shuffled_op[i]])
                                        .replace('~~', shuffled_op[i]);
    }
    $('#q_type_sheet').html(html_str);
    //alert(shuffled_op);
}

function checkSort(key_str) { 
    //alert("hgaha");
    var suc = true;
    $('label[id^=' + SORT_OP_ID + ']').each(function (index) {
        //alert('  0  ' + index + '  ' + this.dataset['opidx']);
        suc = (index == this.dataset['opidx']);
        return suc;
    });

    var result_json = { 'complete': true };

    result_json['answer'] = $('label[id^=' + SORT_OP_ID + ']').map(function(){ return this.dataset['opidx'];}).get().join(KEY_SPLITER_SYMBOL);
    result_json['result'] = suc;

    return result_json;
}


//=======================================================
// tips part
//-----------
const QTYPE_TIPS_MAP = {
    "FillInBlank": "请把你的答案，输入在输入框中哦！回答完毕点“确定”",
    "TrueOrFalse": "上面的描述是“正确”还是“错误”呢，点相应按钮哦。回答完毕点“确定”",
    "Choice": "在上面的选项中选一个正确的，回答完毕点“确定”",
    "MultiChoice": "上面的选项会有至少一个正确，要全选出来哦。回答完毕点“确定”",
    "Pair": "点击最右边的上移、下移按钮，来让右边选项和左边的配对。",
    "Sort": "点击最右边的上移、下移来安排正确的顺序噢！",
    "CaseAnalyse": "案例与简答题",
    "Voice": "语音题",
    "ERROR": "回答错误, 正确的答案是这样噢！",
    "SUCCEED": "恭喜你回答正确！"
}


//=======================================================
// key display part
//-----------
var FIB_KEY_HTML = '<font class="correct-text">**</font>';
function showKeyFillInBlank(result, keyObject) {
    var keyArray = keyObject.split(KEY_SPLITER_SYMBOL)
    $('input[id^=blank_]').each(function (idx, elem) {
        $(elem).attr("disabled", true).addClass(($(elem).val() == keyArray[idx]) ? 'correct' : 'wrong');
    });

    key_desc = qList_obj.qList[cur_idx].description.replace(FillInBlank_Key_Reg, function ($0, $1) {
        return FIB_KEY_HTML.replace("**", $1);;
    });

    $('#FIB-key-panel').html(key_desc);   
    //alert("xxx");
}

function showKeyTrueOrFalse(result, keyObject) {
    //alert("???????????");
    refreshOptionByResult($('#TF_Right'), keyObject, $('#span_r'));
    refreshOptionByResult($('#TF_Wrong'), !keyObject, $('#span_w'));    
}

function showKeyChoice(result, keyObject) {
    $('input[id^=id_option_]').each(function(idx, elem){
        refreshOptionByResult($(elem), keyObject == elem.value, $('#id_span_'+idx));
    });
}

function showKeyMultiChoice(result, keyObject) {
    $('input[id^=id_option_]').each(function(idx, elem){
        refreshOptionByResult($(elem), keyObject.indexOf(elem.value)!=-1, $('#id_span_'+idx));
    });
}

function showKeyPair(result, keyObject) {
    alert("---");
}

function showKeySort(result, keyObject) {
    alert("---");
}

//-----------------------------------------------------
// 答案揭晓，更新选项框
function refreshOptionByResult(jq_elem, isKey, jq_icon) {
    jq_elem.attr("disabled", true);

    var cssName = jq_elem.prop('checked') ? 'checked' : 'no';
    cssName += '-';
    cssName += isKey ? 'key' : 'no';

    jq_elem.addClass(cssName);
    jq_icon.addClass('icon-' + cssName);
}