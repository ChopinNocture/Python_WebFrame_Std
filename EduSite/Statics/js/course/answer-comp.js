
//=======================================================
// FillInBlank TrueOrFalse Choice MultiChoice Pair Sort
//=======================================================
//-------------------------------------------------------
// Question type: FillInBlank
//-------------------------------------------------------
//---- refresh ----
var BLANK_HTML = '<input type="text" class="blank-input" id="blank_**" placeholder=""></input>';

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

    result_json['answer'] = answer_str;
    result_json['result'] = (answer_str == key_str);

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
    if(result_json.complete) {
        result_json['answer'] = $('#TF_Right').prop('checked');
        result_json['result'] = (key_bool == result_json['answer']);
    }   

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
    result_json['answer'] = answer_str;
    result_json['result'] = (answer_str == key_str);

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
                            <label class="option-item pair-left" id="pair_l_cc">##</label>\
                            <label class="option-item pair-right" ondragenter="dragenter(event)" ondragleave="dragleave(event)" dropzone="move" ondrop="drop(event)" ondragover="allowDrop(event)" draggable="true" ondragstart="drag(event)" id="sort_item_cc" data-sortid="cc" data-opidx="~~">$$</label>\
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
                                <label class="option-item full-line" draggable="true" ondragstart="drag(event)" ondragenter="dragenter(event)" ondragleave="dragleave(event)" id="sort_item_cc" data-sortid="cc" data-opidx="~~"> \
                                        ##\
                                </label>\
                            </div>';

function dragenter(event) {
    $(event.target).addClass('dropable');
}

function dragleave(event) {
    $(event.target).removeClass('dropable');
}

function drag(event) {
    if(event.target.dataset['sortid']==null) return false;
    event.dataTransfer.setData('sortid', event.target.dataset['sortid']);// parentNode.id);
    event.dataTransfer.effectAllowed = 'copy'; 
}

function drop(event) {    
    event.preventDefault();
    $(event.target).removeClass('dropable');
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
    question['key'] = question.options;

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

