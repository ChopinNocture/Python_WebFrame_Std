//$("<p><button type='button' id='Btn_KeyAdd'>Add Option</button></p>")

$(document).ready(init);

function init() {
    csrf_Setup();
    $('a[id^=NavBtn_]').click(onNavTypeClk);
    $('a[id^=NavBtn_]').each(function (index, elem) {
        elem.innerHTML = TYPE_TRANS_LIST[elem.innerHTML];
    });

    $('#content_filer').on('hide.bs.collapse', function () {
        filterQList();
    })
    
    $('#content_filer').on('show.bs.collapse', function () {
        $('#filter_input').val("");
    })

    $('#NavBtn_' + question_type).click();
    $('button[id^=course_]:first').click();
}

//-------------------------------------------------------
var ParseFormFunc_Prefix = "parseForm2Json";
var RefreshFunc_Prefix = "refresh";
var CheckFunc_Prefix = "check";

var question_type = "FillInBlank";
var current_url = "";
var cur_list_url = "";
var curr_qid = "";

var section_id = null;

var with_value = false;

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
    refreshOthers();
    doRefreshQList();

    return false;
}

//=======================================================
// section Part
//=======================================================
function onSectionClick(event) {
    if (event.target.dataset.section != section_id) {
        $('button[id^=course_]').removeClass('active');
        $(event.target).addClass('active');
        section_id = event.target.dataset.section;
        doRefreshQList();
    }

    //    $(event.target).blur();
    return true;
}

//=======================================================
// Update question list
//=======================================================
var QLIST_ITEM_STR = '<button class="list-group-item list-group-item-action list-group-item-warning inline-block text-truncate" \
                    tabindex="-1" data-qid=-1 data-toggle="tooltip" data-placement="left" onfocus="this.blur()" id="" title=""></button>';

var QLIST_BTN_ID = "qlist_id";

function onAddModeClick(event) {
    $('button[id^=' + QLIST_BTN_ID + '].active').removeClass('active');
    curr_qid = "";
    with_value = false;
    refreshOthers();
}

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
    refreshOthers();

    return false;
}

function refreshOthers() {
    $('#btn_deleteQ').attr("disabled", curr_qid == "");
    $('#btn_addQ').attr("hidden", curr_qid == "");
    $.get(current_url + curr_qid, updateQForm);
}

function updateQList(jsonData) {
    var qListPanel = $("#Question_List");

    qListPanel.empty();

    var tempLine;
    var i = 0;
    jsonData.forEach(function (iter, index, array) {
        tempLine = $(QLIST_ITEM_STR)
            .clone()
            .attr({ "data-qid": iter.id, "id": QLIST_BTN_ID + i, "title": iter.desc })
            .html(iter.desc)
            .tooltip()
            .click(onQListBtnClick);

        if (curr_qid == iter.id) tempLine.addClass('active');
        qListPanel.append(tempLine);
        ++i;
    });
    $("#qlist_num").html(i.toString());
}

function doRefreshQList() {    
    if (section_id && cur_list_url) {
        $.get(cur_list_url + section_id.toString(), updateQList);
    }
    else {
        $("#Question_List").empty();
        $("#qlist_num").html('0');
    }
    $('#content_filer').collapse('hide');
}

function delSucFunc() {
    closeModal();
    doRefreshQList();
    curr_qid = "";
    refreshOthers();
}

//----------------
// filter
function onFilterInput(event) {
    filterQList(event.target.value);
}

function filterQList(words = null) {
    if (words) {
        var hidden_num = 0;
        $("#qlist_num").html(
            $('button[id^=' + QLIST_BTN_ID + ']').each(function (index, elem) {
                var missed = false;
                var word_list = words.split(" ");                
                word_list.forEach((item, idx, arr) => {
                    missed = missed || (elem.innerHTML.indexOf(item) == -1);
                    return missed;
                });

                if(missed) {
                    ++hidden_num;                    
                }
                $(elem).attr("hidden", missed);
            }).length - hidden_num);
    }
    else {
        $("#qlist_num").html($('button[id^=' + QLIST_BTN_ID + ']').attr("hidden", false).length);
    }
}

//----------------
function onDeleteConfirm() {
    var urlStr = $("#btn_deleteQ").data('url');
    urlStr = urlStr.replace("qqqq", question_type);
    urlStr = urlStr.replace("999", curr_qid);

    $.ajax({
        url: urlStr,
        type: 'post',
        success: delSucFunc
    });
}

function onDeleteQuestionClick(event) {
    OpenModal("确认要删除选中的题目吗？删除后不可恢复！", onDeleteConfirm);
}

//=======================================================
// form framework
//=======================================================
function updateQForm(data) {
    //alert("Data Loaded: " + data);
    document.getElementById('QType_Panel').innerHTML = data;

    if (with_value) {
        var flag = $('#id_flag').val();
        $('#id_in_pra').get(0).checked = flag & 0x1;
        $('#id_in_exm').get(0).checked = flag & 0x2;

        ic_btn("difficult").val($('#id_star').val());
        document.getElementById('Form_QuestionEditor').action = question_type + "/" + curr_qid + "/";
        eval(ParseFormFunc_Prefix + question_type + "()");
        document.getElementById('btn_modify').innerHTML = "确认修改";
    }
    else {
        $('#id_in_pra').get(0).checked = true;
        $('#id_in_exm').get(0).checked = true;

        ic_btn("difficult").val(1);
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
    $('#id_sectionID').val(section_id);
    var flag = 0;
    
    if ($('#id_in_pra').get(0).checked) {
        flag = flag | 0x1;
    }
    if ($('#id_in_exm').get(0).checked) {
        flag = flag | 0x2;
    }

    $('#id_flag').val(flag);
    $('#id_star').val(ic_btn("difficult").val());

    //------------------check type
    ret = ret && eval(CheckFunc_Prefix + question_type + "()");
    ret = ret && document.getElementById('Form_QuestionEditor').reportValidity();
    return ret;
}

function onSubmitCheck() {
    if (checkForm()) {
        //alert("checkForm!");
        document.getElementById('Form_QuestionEditor').submit();
    } else {
        ShowInfo("提交失败，请检查题目填写是否正确。", 2, function(){document.getElementById('Form_QuestionEditor').reportValidity();}, 'danger');        
    }
}

function onSubmitFailed(result) {
    alert(result);
}

function onSubmitSuccess(result) {
    //alert(result);
    //document.getElementById('Form_QuestionEditor').clear();
    var infostr = '';
    if (with_value) {
        infostr = "题目修改成功！";
    }
    else {
        infostr = "题目成功添加入题库！";
    }

    ShowInfo(infostr);

    doRefreshQList();
    refreshOthers();

    // if(!with_value) {
    //     eval(RefreshFunc_Prefix + question_type + "()");        
    // }

}
//-------------------------------------------------------
// Question type: Choice & MultiChoice & Sort
//-------------------------------------------------------
var MAX_OPTION_NUMBER = 20;
var MIN_OP_N = 1;
var Label_Prepend = $('<div class="input-group-prepend"></div>')
var op_Label = $('<label id="" style="width:98px"></label>');
var IS_Char_Label = true;
var ID_LABEL = 'lb_option';

var LINE_HTML = '<div class="form-inline w-100" id=""></div>';

var H5_input_group = $('<div class="input-group mb-2 mr-sm-1" style="width:96%"></div>');

var STYLE_CLASS_LABEL = "input-group-text text-info";
var STYLE_CLASS_SEL = "form-check-input mb-2 mr-sm-2";
var STYLE_CLASS_INPUT = "form-control font-weight-bold";
var op_text = $('<input type="text" form="Form_OptionEditor" id=""/>');
var ID_TEXT = 'text_option';

var OPTION_KEY_HTML = '<input type="**" name="OptionKey" id="" value=""/>';
var op_keyButton = null;
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
    IS_Char_Label = true;
    optionsUpdateFunc = updateOptions;
    refresh_option_part();
}

function refreshMultiChoice() {
    key_type = "checkbox";
    with_key = true;
    IS_Char_Label = true;
    optionsUpdateFunc = updateOptions;
    refresh_option_part();
}

function refreshSort() {
    key_type = "hidden";
    with_key = false;
    IS_Char_Label = false;
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
        var keyValue = $('input[id^='+ ID_KEYButton + ']:' + key_type + ':checked').map(function () { return $(this).val(); }).get().join(KEY_SPLITER_SYMBOL);
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
    op_keyButton = $(OPTION_KEY_HTML.replace("**", key_type));
    if (!with_value) iOptionNumber = DEFAULT_OPTION_NUM;
    optionsUpdateFunc();
}

function updateOptions() {
    var opPanel = $("#OptionPanel");
    var btn_Panel = $('#BtnLine');

    var i = 0;

    var tempContent = "";
    var tempCheck = false;

    opPanel.children("div[id^=elem]").each(function () {
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
        var optionLine = $(LINE_HTML);
        optionLine.attr("id", "elem" + i);

        tempContent = "";
        tempCheck = false;
        if (with_value) {
            if (i < Options_Json.length) {
                tempContent = Options_Json[i]["option"];
                tempCheck = Options_Json[i]["isKey"];
            }
        }

        if (with_key) {
            optionLine.append(op_keyButton.clone()
                .attr({
                    "id": ID_KEYButton + i,
                    "value": i, "class": STYLE_CLASS_SEL,
                    "checked": tempCheck
                }));
        }

        optionLine.append(
            H5_input_group.clone().append(
                Label_Prepend.clone().append(
                    op_Label.clone()
                        .attr({ "id": ID_LABEL + i, "class": STYLE_CLASS_LABEL, "for": ID_KEYButton + i })
                        .html("正确选项 " + getOptionLabelChar(i, IS_Char_Label))
                )
            ).append(
                op_text.clone()
                    .attr({ "id": ID_TEXT + i, "data-index": i, "class": STYLE_CLASS_INPUT })
                    .val(tempContent)
            )
        );

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
var fill_key_list = [];
//-------------- refresh --------------
function refreshFillInBlank() {
    $('#id_description').change(refreshKeys);
    if (with_value) {
        refreshKeys();
    }
}

var FILL_BLANK_KEY_HTML = '<div class="input-group mb-1 mr-sm-1"> <div class="input-group-prepend"> \
                            <label style="width:98px" class="input-group-text text-info">填空答案 ** </label> \
                           </div> <input type="text" id="text_option0" data-index="0" class="font-weight-bold form-control" value="--" disabled> </div>';

function refreshKeys() {
    var ques_str = $('#id_description').val();
    $('#KeysPanel').empty();
    var htmltext = "";
    var key;
    var i = 1;
    fill_key_list = [];

    FillInBlank_Key_Reg.lastIndex = 0;

    while (key = FillInBlank_Key_Reg.exec(ques_str)) {
        fill_key_list.push(key[1]);
        htmltext += FILL_BLANK_KEY_HTML.replace("**", i.toString()).replace("--", key[1]);
        ++i;
    }
    $('#KeysPanel').html(htmltext);
}

//-------------- check --------------
function checkFillInBlank() {
    if (fill_key_list.length <= 0) {
        alert("警告！答案未填写！");
        return false;
    }

    var keyValue = fill_key_list.map(function (elem, index) { return elem; }).join(KEY_SPLITER_SYMBOL);
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
// Question type: CaseAnalyse
//-------------------------------------------------------
//-------------- refresh --------------
var subQuestions = [];

function refreshCaseAnalyse() {
    $('#sub_type_sel').change(onSubTypeChange);
    $('#sub_question_sel').change(onSubQuestionChange);
    $('button[id^=course_]').off('click', handleSubSectionChange).on('click', handleSubSectionChange);
    $('#btn_sub_add').click(onAddSubQuestion);
    refreshSubQList();
}

var SUB_QUEST = '<div class="input-group">**</div>';
var SUB_TYPE_HTML = '<span class="bg-info" style="width:10%">**</span>';

function onAddSubQuestion() {
    var newSubQ = {'qType':$('#sub_type_sel').val(), 'qid':$('#sub_question_sel').val()};
    subQuestions.push(newSubQ);
    $('#SubQ_Panel').append(SUB_QUEST.replace('**', SUB_TYPE_HTML.replace('**', TYPE_TRANS_LIST[newSubQ.qType] )+ $('#sub_question_sel').find("option:selected").text()));
    alert(JSON.stringify(subQuestions));
}

function handleSubSectionChange(event) {
    if(question_type != 'CaseAnalyse') {
        $('button[id^=course_]').off('click', handleSubSectionChange);
        return;
    }
    refreshSubQList();
}

function onSubTypeChange(event) {
    refreshSubQList();
}

function onSubQuestionChange(event) {

}

function refreshSubQList() {
    var sub_list_url = $('#NavBtn_' + $('#sub_type_sel').val()).data('qlistUrl');
    $.get(sub_list_url + section_id.toString(), updateSubQList);
}

function updateSubQList(jsonData) {
    var qListPanel = $("#sub_question_sel");

    qListPanel.empty();

    var tempLine;
    jsonData.forEach(function (iter, index, array) {
        tempLine = $('<option class="form-control text-truncate" value="" style="width:80%;"></option>')
            .clone()
            .val(iter.id)
            .html(iter.desc);

        qListPanel.append(tempLine);
    });
}    


//-------------- check --------------
function checkCaseAnalyse() { return false; }

//-------------- parseForm2Json ---------------
function parseForm2JsonCaseAnalyse() { }


//-------------------------------------------------------
// Question type: Voice
//-------------------------------------------------------
//-------------- refresh --------------
function refreshVoice() { }

//-------------- check --------------
function checkVoice() { return false; }

//-------------- parseForm2Json ---------------
function parseForm2JsonVoice() { }

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

    opPanel.children("div[id^=elem]").each(function () {
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
        var optionLine = $(LINE_HTML);
        optionLine.attr("id", "elem" + i);

        leftContent = rightContent = "";
        if (with_value && (i < pairs_Json.length)) {
            leftContent = pairs_Json[i]["left"];
            rightContent = pairs_Json[i]["right"];
        }

        optionLine.append(
            H5_input_group.clone().append(
                Label_Prepend.clone().append(
                    op_Label.clone().attr({ "id": ID_LABEL + i, "class": STYLE_CLASS_LABEL }).html("正确配对 " + (i + 1))
                )
            ).append(
                op_text.clone()
                    .attr({ "id": "left_" + ID_TEXT + i, "data-index": i, "class": STYLE_CLASS_INPUT })
                    .val(leftContent)
            ).append(op_text.clone()
                .attr({ "id": "right_" + ID_TEXT + i, "data-index": i, "class": STYLE_CLASS_INPUT })
                .val(rightContent)
            )
        );

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

//=======================================================
// other option
//=======================================================
var ic_btn = function (group = "") {
    if (group == "") return null;

    var self_obj = this;
    this.val = function (value=null) {
        if(value!=null) {
            icon_btn_list.each(function (idx, elem) {
                if(idx<value) {
                    $(elem).attr("ic_active", true);
                    $(elem).removeClass("text-dark").addClass("text-warning");
                }
                else {
                    $(elem).attr("ic_active", false);
                    $(elem).addClass("text-dark").removeClass("text-warning");
                }
                return true;
            })
            return self_obj;
        }
        else {
            var group_value = 0;
            icon_btn_list.each(function (idx, elem) {
                group_value = idx;
                return ($(this).attr("ic_active")=="true");
            })
            return group_value;
        }
    }

    this.elems_active = function (elem_btn) {
        var scan = true;
        icon_btn_list.each(function (idx, elem) {
            if (scan) {
                $(elem).removeClass("text-dark").addClass("text-warning");
            }
            else {
                $(elem).addClass("text-dark").removeClass("text-warning");
            }
            $(elem).attr("ic_active", scan);
            if (elem_btn == elem) {
                scan = false;
            }
            return true;
        });
    }

    if (!this.bind) {
        this.icon_group = $('[ic_group=' + group + ']');
        this.icon_btn_list = icon_group.find("[ic_name=" + group + "]");

        icon_btn_list.mouseenter(function (event) {
            var after = false;
            var mouse_elem = this;
            icon_btn_list.each(function (idx, elem) {
                if (after) {
                    $(elem).removeClass("font-weight-bold");
                }
                else {
                    $(elem).addClass("font-weight-bold");
                }

                if (elem == mouse_elem) { after = true; }
                return true;
            });
        }).mouseleave(function (event) {
            icon_btn_list.removeClass("font-weight-bold");
        }).click(function (event) {
            elems_active(this);
        });
        this.bind = true;
    }

    return this;
}


