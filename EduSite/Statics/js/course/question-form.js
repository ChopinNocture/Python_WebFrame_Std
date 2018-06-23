//$("<p><button type='button' id='Btn_KeyAdd'>Add Option</button></p>")


$('a[id^=NavBtn_]').click(onNavTypeClk);
$('a[id^=NavBtn_]').each(function(index,elem) {
    elem.innerHTML = TYPE_TRANS_LIST[elem.innerHTML];
});



//-------------------------------------------------------
var ParseFormFunc_Prefix = "parseForm2Json";
var RefreshFunc_Prefix = "refresh";
var CheckFunc_Prefix = "check";
var question_type = "Choice";
var current_url = "";
var cur_list_url = "";
var curr_qid = "";

var lesson_id = -1;

var with_value = false;

//$(document).ready(updateQForm);

function onNavTypeClk(event) {

    //alert(event.target.dataset["url"]);
    // alert(event.target.dataset["typeName"]);
    question_type = event.target.dataset["typeName"];

    $('ul.nav-pills').find('a').each(function () {
        if (this.dataset["typeName"] == question_type) {
            $(this).addClass('active');
        }
        else {
            $(this).removeClass('active');
        }
    })

    curr_qid = "";
    with_value = false;
    current_url = event.target.dataset.url;
    cur_list_url = event.target.dataset.qlistUrl;
    $.get(current_url, updateQForm);
    $.get(cur_list_url, updateQList);

    return false;
}

//=======================================================
// Lesson Part
//=======================================================
function onLessonClick(event) {
    $('button[id^=course_]').removeClass('active');
    
    if(event.target.dataset.lesson==lesson_id) {
        $(event.target).removeClass('active');
        lesson_id = null;
    }
    else {
        $(event.target).addClass('active');
        lesson_id = event.target.dataset.lesson;
    }
    //alert(event.target.dataset.lesson + "  ---  " );
}

//=======================================================
// Update question list
//=======================================================
var QLIST_ITEM_STR = '<button class="list-group-item list-group-item-action inline-block text-truncate" data-qid=-1 id="">';
var QLIST_ITEM_SUFIX = '</button>';

var QLIST_BTN_ID = "qlist_id";

function onQListBtnClick(event) {
    $('button[id^=' + QLIST_BTN_ID + ']').removeClass('active');

    var tempQi = event.target.dataset["qid"];
    if (curr_qid == tempQi) {
        $(this).removeClass('active');
        curr_qid = "";
        with_value = false;
    }
    else {
        $(this).addClass('active');
        curr_qid = tempQi;
        with_value = true;
    }
    // each(function () {
    //     if (this.dataset["qid"] == curr_qid) {
    //         $(this).addClass('active');
    //     }
    //     else {
    //         $(this).removeClass('active');
    //     }
    // })

    $.get(current_url + curr_qid, updateQForm);

    return false;
}

function updateQList(jsonData) {
    //alert("update " + jsonData + " QList ");
    var qListPanel = $("#Question_List");

    qListPanel.empty();

    var tempLine;
    var i = 0;
    jsonData.forEach(function (iter, index, array) {
        tempLine = $(QLIST_ITEM_STR + iter.desc + QLIST_ITEM_SUFIX).clone().attr({ "data-qid": iter.id, "id": QLIST_BTN_ID + i }).click(onQListBtnClick);
        qListPanel.append(tempLine);
        //alert(value.id + "  " + value.desc);
        ++i;
    });
}


//=======================================================
// form framework
//=======================================================
function updateQForm(data) {
    //alert("Data Loaded: " + data);
    document.getElementById('QType_Panel').innerHTML = data;

    if (with_value) {
        document.getElementById('Form_QuestionEditor').action = question_type + "/" + curr_qid + "/";
        eval(ParseFormFunc_Prefix + question_type + "()");
        document.getElementById('btn_modify').innerHTML = "确认修改";
    }
    else {
        document.getElementById('Form_QuestionEditor').action = question_type + "/";
        document.getElementById('btn_modify').innerHTML = "加入题库";
    }
    document.getElementById('Form_QuestionEditor').submit = function () { ajaxSubmit(this, onSubmitSuccess, onSubmitFailed) };

    //alert("update " + question_type + " form");
    eval(RefreshFunc_Prefix + question_type + "()");
}

function checkForm() {
    var ret = true;

    ret = ret && ($('#id_description').val().length != 0);
    $('#id_sectionID').val(lesson_id);
    $('#id_flag').val(0x01);
    $('#id_star').val(3);

    //------------------check type
    ret = ret && eval(CheckFunc_Prefix + question_type + "()");
    ret = ret && document.getElementById('Form_QuestionEditor').checkValidity();
    return ret;
}

function onSubmitCheck() {
    if (checkForm()) {
        //alert("checkForm!");
        document.getElementById('Form_QuestionEditor').submit();
    } else {
        alert("提交失败，请检查题目填写是否正确。");
    }
}

function onSubmitFailed(result) {
    alert(result);
}

function onSubmitSuccess(result) {
    //alert(result);
    document.getElementById('Form_QuestionEditor').reset();
    if(!with_value) {
        eval(RefreshFunc_Prefix + question_type + "()");
        $.get(cur_list_url, updateQList);
    }    
}
//-------------------------------------------------------
// Question type: Choice & MultiChoice & Sort
//-------------------------------------------------------
var MAX_OPTION_NUMBER = 12;
var MIN_OP_N = 1;
var op_Label = $('<label id=""></label>');
var label_label = 65; // A:65  1:49
var ID_LABEL = 'lb_option';

var STYLE_CLASS = "form-control-inline";
var op_text = $('<input type="text" form="Form_OptionEditor" id=""/>');
var ID_TEXT = 'text_option';

var OPTION_KEY_HTML = '<input type="******" name="OptionKey" id="" value=""/>';
var op_keyButton = $();
var ID_KEYButton = 'key_option';

//var KEY_TYPE_HTML_DIC = { "Choice": "radio", "MultiChoice": "checkbox" };
var with_key = true;
var key_type = "";

var DEFAULT_OPTION_NUM = 4;
var iOptionNumber = DEFAULT_OPTION_NUM; // default

var Options_Json = [];

//--------------
// key function:
//-------------- refresh --------------
function refreshChoice() {
    key_type = "radio";
    with_key = true;
    label_label = 65; // A
    optionsUpdateFunc = updateOptions;
    refresh_option_part();
}

function refreshMultiChoice() {
    key_type = "checkbox";
    with_key = true;
    label_label = 65; // A
    optionsUpdateFunc = updateOptions;
    refresh_option_part();
}

function refreshSort() {
    key_type = "hidden";
    with_key = false;
    label_label = 49; // 1
    optionsUpdateFunc = updateOptions;
    refresh_option_part();
}

//-------------- check --------------
checkSort = checkMultiChoice = checkChoice = checkOptions;

function checkOptions() {
    var ret = true;

    //[id^=NavBtn_]
    var optionString = $('input:text[form="Form_OptionEditor"]').map(function () { return $(this).val(); }).get().join(OPTION_SPLITER_SYMBOL);
    ret = ret && (optionString.indexOf(OPTION_SPLITER_SYMBOL + OPTION_SPLITER_SYMBOL) == -1);
    if (optionString.indexOf(OPTION_SPLITER_SYMBOL + OPTION_SPLITER_SYMBOL) != -1) {
        alert("警告！选项内容不能为空！");
    }

    //alert(optionString);
    $('#id_options').val(optionString);


    if (with_key) {
        var keyValue = $('input:' + key_type + ':checked').map(function () { return $(this).val(); }).get().join(KEY_SPLITER_SYMBOL);
        //alert(keyValue);

        ret = ret && !(keyValue == '');
        if (keyValue == '') {
            alert("警告！答案未填写！");
        }
        $('#id_key').val(keyValue);
    }

    return ret;
}
// function checkSort() { return false; }
// function checkMultiChoice() { return checkChoice(); }
//-------------- parseForm2Json ---------------
parseForm2JsonSort = parseForm2JsonChoice = parseForm2JsonMultiChoice = parseOptionForm;
function parseOptionForm() {
    var optionString = $('#id_options').val();
    var optionList = optionString.split(OPTION_SPLITER_SYMBOL);

    var keyValue = "";
    var keyList = [];
    if (with_key && ($('#id_key') != null)) {
        keyValue = $('#id_key').val();
        keyList = keyValue.split(KEY_SPLITER_SYMBOL);
    }

    var value_List = [];
    iOptionNumber = optionList.length;

    for (var i = 0; i < iOptionNumber; i++) {
        value_List.push({ "option": optionList[i], "isKey": with_key ? ($.inArray("" + i, keyList) >= 0) : false });
    }

    Options_Json = value_List;
}

//--------------
var optionsUpdateFunc = updateOptions;
function refresh_option_part() {
    $('#Btn_OptionAdd').click(onAddOptionClick);
    $('#Btn_OptionDelete').click(onDeleteOptionClick);
    var tempHTML = OPTION_KEY_HTML.replace("******", key_type)
    op_keyButton = $(tempHTML);
    if (!with_value) iOptionNumber = DEFAULT_OPTION_NUM;
    optionsUpdateFunc();
}

function updateOptions() {
    var opPanel = $("#OptionPanel");
    var btn_Panel = $('#BtnLine');

    var i = 0;

    var tempContent = "";
    var tempCheck = false;

    opPanel.children("p[id^=elem]").each(function () {
        if (i < iOptionNumber) {
            tempContent = "";
            tempCheck = false;

            if (with_value) {
                if (i < Options_Json.length) {
                    tempContent = Options_Json[i]["option"];
                    tempCheck = Options_Json[i]["isKey"];
                }
            }

            $(this).children(ID_TEXT + i).val(tempContent);
            if (with_key) {
                $(this).children(ID_KEYButton + i).attr("checked", tempCheck);
            }
        }
        else {
            this.remove();
        }
        ++i;
    })

    while (i < iOptionNumber) {
        var optionLine = $("<p id=''></p>");
        optionLine.attr("id", "elem" + i);
        optionLine.append(op_Label.clone().attr({ "id": ID_LABEL + i, "class": STYLE_CLASS }).html(String.fromCharCode(label_label + i)));

        tempContent = "";
        tempCheck = false;
        if (with_value) {
            if (i < Options_Json.length) {
                tempContent = Options_Json[i]["option"];
                tempCheck = Options_Json[i]["isKey"];
            }
        }
        optionLine.append(op_text.clone()
            .attr({ "id": ID_TEXT + i, "data-index": i, "class": STYLE_CLASS })
            .val(tempContent));

        if (with_key) {
            optionLine.append(op_keyButton.clone()
                .attr({
                    "id": ID_KEYButton + i,
                    "value": i, "class": STYLE_CLASS,
                    "checked": tempCheck
                }));
        }

        btn_Panel.before(optionLine);
        //.remove();
        ++i;
    }
}

function onAddOptionClick(event) {
    if (iOptionNumber < MAX_OPTION_NUMBER) {
        ++iOptionNumber;
        optionsUpdateFunc();
    }
    else {
        alert("警告！选项已经达到最大数量!");
    }

}

function onDeleteOptionClick(event) {
    if (iOptionNumber > MIN_OP_N) {
        --iOptionNumber;
        optionsUpdateFunc();
    }
    else {
        alert("警告！不能再少了!");
    }
}

//-------------------------------------------------------
// Question type: FillInBlank
//-------------------------------------------------------
var FillInBlank_Key_Reg = /{@([\w\u4e00-\u9fa5]+)@}/g;
var fill_key_list = [];
//-------------- refresh --------------
function refreshFillInBlank() {
    $('#id_description').change(refreshKeys);
    if(with_value) {
        refreshKeys();
    }
}

function refreshKeys() {
    var ques_str = $('#id_description').val();    
    $('#KeysPanel').empty();
    var htmltext = "";
    var key;
    var i=1;
    fill_key_list = [];

    FillInBlank_Key_Reg.lastIndex = 0;

    while(key=FillInBlank_Key_Reg.exec(ques_str)) {
        fill_key_list.push(key[1]);
        htmltext += "填空答案"+ i.toString() + ":  " + key[1] + "<br>";
        ++i;
    }
    $('#KeysPanel').html(htmltext);
}

//-------------- check --------------
function checkFillInBlank() {
    if(fill_key_list.length<=0) {
        alert("警告！答案未填写！");        
        return false;
    }

    var keyValue = fill_key_list.map(function (elem, index) { return elem; }).join(KEY_SPLITER_SYMBOL);
    alert(keyValue);
    $('#id_key').val(keyValue);

    return true;
}

//-------------- parseForm2Json ---------------
function parseForm2JsonFillInBlank() {
}

//-------------------------------------------------------
// Question type: TrueOrFalse
//-------------------------------------------------------
//-------------- refresh --------------
function refreshTrueOrFalse() { }

//-------------- check --------------
function checkTrueOrFalse() { return true; }

//-------------- parseForm2Json ---------------
function parseForm2JsonTrueOrFalse() { }

//-------------------------------------------------------
// Question type: Pair
//-------------------------------------------------------
var pairs_Json = []

//-------------- refresh --------------
function refreshPair() {
    $('#Btn_OptionAdd').click(onAddOptionClick);
    $('#Btn_OptionDelete').click(onDeleteOptionClick);
    optionsUpdateFunc = updatePairOptions;

    if (!with_value) iOptionNumber = DEFAULT_OPTION_NUM;

    optionsUpdateFunc();
}

function updatePairOptions() {
    var opPanel = $("#OptionPanel");
    var btn_Panel = $('#BtnLine');

    var i = 0;
    var leftContent, rightContent = "";

    opPanel.children("p[id^=elem]").each(function () {
        if (i < iOptionNumber) {
            leftContent = rightContent = "";

            if (with_value && (i < pairs_Json.length)) {
                leftContent = pairs_Json[i]["left"];
                rightContent = pairs_Json[i]["right"];
            }

            $(this).children("left_" + ID_TEXT + i).val(leftContent);
            $(this).children("right_" + ID_TEXT + i).val(rightContent);
        }
        else {
            this.remove();
        }
        ++i;
    })

    while (i < iOptionNumber) {
        var optionLine = $("<p id=''></p>");
        optionLine.attr("id", "elem" + i);
        optionLine.append(op_Label.clone().attr({ "id": ID_LABEL + i, "class": STYLE_CLASS }).html("Pair " + (i + 1)));

        leftContent = rightContent = "";
        if (with_value && (i < pairs_Json.length)) {
            leftContent = pairs_Json[i]["left"];
            rightContent = pairs_Json[i]["right"];
        }

        optionLine.append(op_text.clone()
            .attr({ "id": "left_" + ID_TEXT + i, "data-index": i, "class": STYLE_CLASS })
            .val(leftContent));
        optionLine.append(op_text.clone()
            .attr({ "id": "right_" + ID_TEXT + i, "data-index": i, "class": STYLE_CLASS })
            .val(rightContent));

        btn_Panel.before(optionLine);
        ++i;
    }
}

//-------------- check --------------
function checkPair() {
    var ret = true;
    //[id^=NavBtn_]
    var optionString = $('input[id^="left_"]:text[form="Form_OptionEditor"]').map(function () { return $(this).val(); }).get().join(OPTION_SPLITER_SYMBOL);

    ret = ret && (optionString.indexOf(OPTION_SPLITER_SYMBOL + OPTION_SPLITER_SYMBOL) == -1 && optionString.slice(-OPTION_SPLITER_SYMBOL.length) != OPTION_SPLITER_SYMBOL);
    if (optionString.indexOf(OPTION_SPLITER_SYMBOL + OPTION_SPLITER_SYMBOL) != -1 || optionString.slice(-OPTION_SPLITER_SYMBOL.length) == OPTION_SPLITER_SYMBOL) {
        alert("警告！左边选项不能为空！");
    }
    $('#id_leftOptions').val(optionString);

    optionString = $('input[id^="right_"]:text[form="Form_OptionEditor"]').map(function () { return $(this).val(); }).get().join(OPTION_SPLITER_SYMBOL);
    ret = ret && (optionString.indexOf(OPTION_SPLITER_SYMBOL + OPTION_SPLITER_SYMBOL) == -1 && optionString.slice(-OPTION_SPLITER_SYMBOL.length) != OPTION_SPLITER_SYMBOL);
    if (optionString.indexOf(OPTION_SPLITER_SYMBOL + OPTION_SPLITER_SYMBOL) != -1 || optionString.slice(-OPTION_SPLITER_SYMBOL.length) == OPTION_SPLITER_SYMBOL) {
        alert("警告！右边选项不能为空！");
    }
    $('#id_rightOptions').val(optionString);

    return ret;
}

//-------------- parseForm2Json ---------------
function parseForm2JsonPair() {
    var leftOpList = $('#id_leftOptions').val().split(OPTION_SPLITER_SYMBOL);
    var rightOpList = $('#id_rightOptions').val().split(OPTION_SPLITER_SYMBOL);

    if (leftOpList.length != rightOpList.length) {
        alert("警告！左边选项数: " + leftOpList.length + " ;右边选项数: " + rightOpList.length + " ！不相等！");
    }
    else {
        pairs_Json = [];
        iOptionNumber = leftOpList.length;

        for (var i = 0; i < iOptionNumber; i++) {
            pairs_Json.push({ "left": leftOpList[i], "right": rightOpList[i] });
        }
    }
}

//-------------------------------------------------------