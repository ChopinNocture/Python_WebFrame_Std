//$("<p><button type='button' id='Btn_KeyAdd'>Add Option</button></p>")




$('button[id^=NavBtn_]').click(onNavTypeClk);

//-------------------------------------------------------
var RefreshFunc_Prefix = "refresh";
var CheckFunc_Prefix = "check";
var question_type = "Choice";

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
    // alert(event.target.dataset["url"]);
    // alert(event.target.dataset["typeName"]);

    question_type = event.target.dataset["typeName"];

    $.get(event.target.dataset.url, updateQForm);
}

function updateQForm(data) {
    //alert("Data Loaded: " + data);
    document.getElementById('Form_QuestionEditor').action = question_type + "/";
    document.getElementById('Form_QuestionEditor').submit = function() { alert("QE func" + this); ajaxSubmit(this, onSubmitSuccess, onSubmitFailed)};
    alert(document.getElementById('Form_QuestionEditor').action);

    document.getElementById('QType_Panel').innerHTML = data;

    alert("update " + question_type + " form");
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
var op_Label = $('<label id="">A: </label>');
var ID_LABEL = 'lb_option';

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
    if (optionString.indexOf("|-||-|")!=-1) {
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
function updateOptions() {
    var opPanel = $("#OptionPanel");
    var opList = opPanel.find("p[id^=elem]");
    var btn_Panel = $('#BtnLine');
    //alert(opList.length);
    var needNumber = Math.max(iOptionNumber, opList.length)

    for (var i = 0; i < needNumber; ++i) {
        if (i >= opList.length) {
            var optionLine = $("<p id=''></p>");
            optionLine.attr("id", "elem" + i);
            optionLine.append(op_Label.clone().attr("id", ID_LABEL + i));
            optionLine.append(op_text.clone().attr({ "id": ID_TEXT + i, "data-index": i }));
            optionLine.append(op_keyButton.clone().attr({ "id": ID_KEYButton + i, "value": i }));

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