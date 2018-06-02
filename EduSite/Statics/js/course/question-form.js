//$("<p><button type='button' id='Btn_KeyAdd'>Add Option</button></p>")




$('a[id^=NavBtn_]').click(onNavTypeClk);

//-------------------------------------------------------
var RefreshFunc_Prefix = "refresh";
var CheckFunc_Prefix = "check";
var question_type = "Choice";
var current_url = "";
var curr_qid = "";

//$(document).ready(updateQForm);
function ajaxSubmit(aform, sucFunc, failFunc) {
    alert($(aform).serialize());

    $.ajax({
        url: aform.action,
        type: aform.method,
        data: $(aform).serialize(),
        dataType: "html",
        success: sucFunc,
        error: failFunc
    });
}

function onNavTypeClk(event) {
    curr_qid = "";
    alert(event.target.dataset["url"]);
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

    current_url = event.target.dataset.url;
    $.get(current_url, updateQForm);
    $.get(event.target.dataset.qlistUrl, updateQList);

    return false;
}

//=======================================================
// Update question list
//=======================================================
var QLIST_ITEM_STR = '<button class="list-group-item list-group-item-action" data-qid=-1 id="">';
var QLIST_ITEM_SUFIX = '</button>';

var QLIST_BTN_ID = "qlist_id";

function onQListBtnClick(event) {
    curr_qid = event.target.dataset["qid"];

    $('button[id^=' + QLIST_BTN_ID + ']').each(function () {
        if (this.dataset["qid"] == curr_qid) {
            $(this).addClass('active');
        }
        else {
            $(this).removeClass('active');
        }
    })

    $.get(current_url + curr_qid, updateQForm);

    return false;
}

function updateQList(jsonData) {
    alert("update " + jsonData + " QList ");

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
    if(curr_qid!="") {
        document.getElementById('Form_QuestionEditor').action = question_type + "/" + curr_qid + "/";
    }
    else {
        document.getElementById('Form_QuestionEditor').action = question_type + "/";
    }
    document.getElementById('Form_QuestionEditor').submit = function () { alert("QE func" + this); ajaxSubmit(this, onSubmitSuccess, onSubmitFailed) };
    alert(document.getElementById('Form_QuestionEditor').action);

    document.getElementById('QType_Panel').innerHTML = data;

    //alert("update " + question_type + " form");
    eval(RefreshFunc_Prefix + question_type + "()");
}

function checkForm() {
    var ret = true;

    ret = ret && ($('#id_description').val().length != 0);
    $('#id_sectionID').val("A");
    $('#id_flag').val(0x01);
    $('#id_star').val(3);

    //------------------check type
    ret = ret && eval(CheckFunc_Prefix + question_type + "()");
    ret = ret && document.getElementById('Form_QuestionEditor').checkValidity();
    return ret;
}

function onSubmitCheck() {
    if (checkForm()) {
        alert("checkForm!");
        document.getElementById('Form_QuestionEditor').submit();
    } else {
        alert("!!!");
    }
}

function onSubmitFailed(result) {
    alert(result);
}

function onSubmitSuccess(result) {
    alert(result);
    document.getElementById('Form_QuestionEditor').reset();
}
//-------------------------------------------------------
// Question type: Choice & MultiChoice
//-------------------------------------------------------
var MAX_OPTION_NUMBER = 12;
var MIN_OP_N = 1;
var op_Label = $('<label id="">A:</label>');
var ID_LABEL = 'lb_option';

var STYLE_CLASS = "form-control-inline";
var op_text = $('<input type="text" form="Form_OptionEditor" id=""/>');
var ID_TEXT = 'text_option';

var OPTION_KEY_HTML = '<input type="******" name="OptionKey" id="" value=""/>';
var op_keyButton = $();
var ID_KEYButton = 'key_option';

var KEY_TYPE_HTML_DIC = { "Choice": "radio", "MultiChoice": "checkbox" };

var iOptionNumber = 4; // default

//--------------
// key function:
//-------------- refresh --------------
function refreshChoice() {
    $('#Btn_OptionAdd').click(onAddOptionClick);
    $('#Btn_OptionDelete').click(onDeleteOptionClick);
    var tempHTML = OPTION_KEY_HTML.replace("******", KEY_TYPE_HTML_DIC[question_type])
    op_keyButton = $(tempHTML);
    updateOptions();
}

function refreshMultiChoice() {
    refreshChoice();
}
//-------------- check --------------
function checkChoice() {
    var ret = true;

    var keyValue = $('input:' + KEY_TYPE_HTML_DIC[question_type] + ':checked').map(function () { return $(this).val(); }).get().join(",");
    alert(keyValue);

    ret = ret && !(keyValue == '');
    if (keyValue == '') {
        alert("No Key!!!!!");
    }

    //[id^=NavBtn_]
    var optionString = $('input:text[form="Form_OptionEditor"]').map(function () { return $(this).val(); }).get().join("|-|");
    ret = ret && (optionString.indexOf("|-||-|") == -1);
    if (optionString.indexOf("|-||-|") != -1) {
        alert("option can not be empty");
    }

    alert(optionString);
    $('#id_options').val(optionString);
    $('#id_key').val(keyValue);

    return ret;
}

function checkMultiChoice() {
    return checkChoice();
}
//--------------
function parseForm(aform) {
    var keyValue = $('#id_key').val();
    var optionString = $('#id_options').val();
    var optionList = optionString.split("|-|");
    var keyList = keyValue.split(",");
        
    var retList = new Array();

    iOptionNumber = optionList.length;

    for (var i = 0; i < iOptionNumber; i++) {
        retList.push({ "option": optionList[i], "isKey": ($.inArray(""+i, keyList)>=0) });        
    }

    return retList;
}

//--------------
function updateOptions() {
    var opPanel = $("#OptionPanel");
    var opList = opPanel.find("p[id^=elem]");
    var btn_Panel = $('#BtnLine');
    //alert(opList.length);
    var needNumber = Math.max(iOptionNumber, opList.length)

    var hasValue = (curr_qid != "");

    if (hasValue) {
        var formList = parseForm();
    }

    for (var i = 0; i < needNumber; ++i) {
        if (i >= opList.length) {
            var optionLine = $("<p id=''></p>");
            optionLine.attr("id", "elem" + i);
            optionLine.append(op_Label.clone().attr({ "id": ID_LABEL + i, "class": STYLE_CLASS }));
            optionLine.append(op_text.clone().attr({ "id": ID_TEXT + i, "data-index": i, "class": STYLE_CLASS }).val(hasValue ? formList[i]["option"] : ""));
            optionLine.append(op_keyButton.clone().attr({ "id": ID_KEYButton + i, "value": i, "class": STYLE_CLASS, "checked": hasValue ? formList[i]["isKey"] : false }));

            btn_Panel.before(optionLine);
        }
        if (i >= iOptionNumber) {
            opList[i].remove();
        }
    }
}

function onAddOptionClick(event) {
    //alert(event.target.enable);
    ++iOptionNumber;
    iOptionNumber = Math.min(MAX_OPTION_NUMBER, iOptionNumber);
    updateOptions();
}

function onDeleteOptionClick(event) {
    --iOptionNumber;
    iOptionNumber = Math.max(MIN_OP_N, iOptionNumber);
    updateOptions();
}
//-------------------------------------------------------