//$("<p><button type='button' id='Btn_KeyAdd'>Add Option</button></p>")


$('a[id^=NavBtn_]').click(onNavTypeClk);

//-------------------------------------------------------
var ParseForm_Prefix = "parseForm2Json";
var RefreshFunc_Prefix = "refresh";
var CheckFunc_Prefix = "check";
var question_type = "Choice";
var current_url = "";
var curr_qid = "";

var with_value = false;
var value_Json = { "desc": "" };

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

    with_value = true;
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
        eval(ParseForm_Prefix + question_type + "()");
    }
    else {
        document.getElementById('Form_QuestionEditor').action = question_type + "/";
    }
    document.getElementById('Form_QuestionEditor').submit = function () { alert("QE func" + this); ajaxSubmit(this, onSubmitSuccess, onSubmitFailed) };

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
var op_Label = $('<label id=""></label>');
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

var iOptionNumber = 4; // default

//--------------
// key function:
function refresh_option_part() {
    $('#Btn_OptionAdd').click(onAddOptionClick);
    $('#Btn_OptionDelete').click(onDeleteOptionClick);
    var tempHTML = OPTION_KEY_HTML.replace("******", key_type)
    op_keyButton = $(tempHTML);
    updateOptions();
}

//-------------- refresh --------------
function refreshChoice() {
    key_type = "radio";
    with_key = true;
    refresh_option_part();
}

function refreshMultiChoice() {
    key_type = "checkbox";
    with_key = true;
    refresh_option_part();
}
//-------------- check --------------
function checkOptions() {
    var ret = true;
    
    //[id^=NavBtn_]
    var optionString = $('input:text[form="Form_OptionEditor"]').map(function () { return $(this).val(); }).get().join("|-|");
    ret = ret && (optionString.indexOf("|-||-|") == -1);
    if (optionString.indexOf("|-||-|") != -1) {
        alert("option can not be empty");
    }

    //alert(optionString);
    $('#id_options').val(optionString);


    if(with_key) {
        var keyValue = $('input:' + key_type + ':checked').map(function () { return $(this).val(); }).get().join(",");
        //alert(keyValue);
    
        ret = ret && !(keyValue == '');
        if (keyValue == '') {
            alert("No Key!!!!!");
        }
        $('#id_key').val(keyValue);
    }

    return ret;
}

checkMultiChoice = checkChoice = checkOptions;
// function checkMultiChoice() {
//     return checkChoice();
// }
//-------------- parse ---------------
parseForm2JsonChoice = parseForm2JsonMultiChoice = parseForm;
function parseForm() {
    var keyValue = $('#id_key') == null ? "" : $('#id_key').val();
    var optionString = $('#id_options').val();
    var optionList = optionString.split("|-|");
    var keyList = keyValue.split(",");

    var value_List = [];
    iOptionNumber = optionList.length;

    for (var i = 0; i < iOptionNumber; i++) {
        value_List.push({ "option": optionList[i], "isKey": ($.inArray("" + i, keyList) >= 0) });
    }

    value_Json = { "options": value_List };
}

//--------------
function updateOptions() {
    var opPanel = $("#OptionPanel");
    var btn_Panel = $('#BtnLine');

    var i=0;

    var tempContent = "";
    var tempCheck = false;

    opPanel.children("p[id^=elem]").each(function() {
        if(i<iOptionNumber) {
            tempContent = "";
            tempCheck = false;

            if (with_value) {
                if (i < value_Json["options"].length) {
                    tempContent = value_Json["options"][i]["option"];
                    tempCheck = value_Json["options"][i]["isKey"];
                }
            }
        
            $(this).children(ID_TEXT + i).val(tempContent);
            if (with_key) {
                $(this).children(ID_KEYButton + i).attr("checked", tempCheck);
            }
        }
        else{
            this.remove();
        }
        ++i;
    })

    while (i<iOptionNumber) {
        var optionLine = $("<p id=''></p>");
        optionLine.attr("id", "elem" + i);
        optionLine.append(op_Label.clone().attr({ "id": ID_LABEL + i, "class": STYLE_CLASS }).html(String.fromCharCode(65 + i)));

        tempContent = "";
        tempCheck = false;
        if (with_value) {
            if (i < value_Json["options"].length) {
                tempContent = value_Json["options"][i]["option"];
                tempCheck = value_Json["options"][i]["isKey"];
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
        updateOptions();
    }
    else {
        alert("Already Max Number!");
    }

}

function onDeleteOptionClick(event) {
    if (iOptionNumber > MIN_OP_N) {
        --iOptionNumber;
        updateOptions();
    }
    else {
        alert("Already Min Number!");
    }
}

//-------------------------------------------------------
// Question type: FillInBlank
//-------------------------------------------------------
//-------------- refresh --------------
function refreshFillInBlank() {
}

//-------------- check --------------
function checkFillInBlank() {
    return false;
}

//-------------------------------------------------------
// Question type: TrueOrFalse
//-------------------------------------------------------
//-------------- refresh --------------
function refreshTrueOrFalse() {
}

//-------------- check --------------
function checkTrueOrFalse() {
    return false;
}

//-------------------------------------------------------
// Question type: Pair
//-------------------------------------------------------
//-------------- refresh --------------
function refreshPair() {
}

//-------------- check --------------
function checkPair() {
    return false;
}

//-------------------------------------------------------
// Question type: Sort
//-------------------------------------------------------
//-------------- refresh --------------
function refreshSort() {
    key_type = "hidden";
    with_key = false;
    refresh_option_part();
}

//-------------- check --------------
checkSort = checkOptions;
// function checkSort() {
//     return false;
// }

//-------------------------------------------------------