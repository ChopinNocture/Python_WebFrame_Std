$(document).ready(init);

var type_list = [];
var cur_type = "FillInBlank";
var examination = { "total_num": 0, "total_score": 0 };
var question_list_all = {} // "id"  "desc" "secID" "flag"

var section_id = null;
var cur_index = -1;

function init() {
    csrf_Setup();
    // Filter
    $('#content_filer').on('hide.bs.collapse', resetWordFilter).on('show.bs.collapse', resetWordFilter);

    // 给input  date设置默认值
    var now = new Date();
    //格式化日，如果小于9，前面补0
    var day = ("0" + now.getDate()).slice(-2);
    //格式化月，如果小于9，前面补0
    var month = ("0" + (now.getMonth() + 1)).slice(-2);
    //拼装完整日期格式
    var today = now.getFullYear() + "-" + (month) + "-" + (day);
    $('#exam-date').val(today);
    $('#exam-date').attr({ min: today });

    $('button[id^=NavBtn_]').click(onNavTypeClk).each(function (index, elem) {
        var typeName = elem.dataset.typeName;
        type_list.push(typeName);
        examination[typeName] = { 'per_score': 1, 'num': 0, 'sum_score': 0 };    // 数据结构
        question_list_all[typeName] = [];
        elem.innerHTML = elem.innerHTML.replace(typeName, TYPE_TRANS_LIST[typeName]);
    });

    $('span[id^=per-sco-lb-]').each(function (index, elem) {
        elem.innerHTML = elem.innerHTML.replace(elem.innerHTML, TYPE_TRANS_LIST[elem.innerHTML]);
    });

    $('#btn_random').on("click", onRandomBegin);
    //$('button[id^=QSelected_]').click(onSelectClk); 

    document.getElementById('exam_editor').submit = onSubmitExam;

    updateChapterFilter();
    preSetValidation();

    getAllQuestion();
    // $('button[id^=course_]:first').click();
}


function multiSelect(event) {
    $('button[id^=' + QLIST_ID + ']').removeClass('active');
}

//-----------------------------------------
// 类型选择
function onNavTypeClk(event) {
    $('button[id^=NavBtn_]').removeClass('active');
    $(event.target).addClass('active');
    $('span[id^=per-sco-lb-]').removeClass('bg-info');
    $('span[id^=total-sco-lb-]').removeClass('bg-info');

    cur_type = event.target.dataset["typeName"];
    cur_index = -1;

    $('span[id^=per-sco-lb-' + cur_type + ']').addClass('bg-info');
    $('span[id^=total-sco-lb-' + cur_type + ']').addClass('bg-info');

    doRefreshQList();

    return false;
}

function getAllQuestion() {
    var jsonObj = JSON.stringify({ "typelist": type_list });

    $.ajax({
        url: $('#exam_editor').data("url"),
        type: "POST",
        data: { "jsonObj": jsonObj },
        dataType: "json",
        success: onGetQList,
    });
}

function doRefreshQList() {
    updateQList();
    updateExamination();
    updateBtn();
}

function onGetQList(jsonData) {
    for (var typeName in jsonData) {
        jsonData[typeName].forEach(function (iter, index, array) {
            if (iter.flag & 0x2) {
                //iter.selected = false;
                question_list_all[typeName].push(iter).selected = false;
            }
        });
    }
    updateExamination();
    updateQList();
    //    alert(question_list_all[cur_type].length);
}

function updateExamInfo() {
    for (var iter in type_list) {
        typeIter = type_list[iter];
        if (examination[typeIter]) {
            $('#per-score-' + typeIter).val(examination[typeIter].per_score);
            $('#total-score-' + typeIter).val(examination[typeIter].sum_score);
            $('#qType_num_' + typeIter).html(examination[typeIter].num);
        }
    }
    $('#qlist_num').html(examination.total_num);
    $('#exam-total-score').val(examination.total_score);
}

function updateExamination() {
    var t_num = 0, t_score = 0;
    for (var iter in type_list) {
        typeIter = type_list[iter];
        var sel_list = question_list_all[typeIter].filter(function (item, index, array) {
            return item.selected;
        });
        if (examination[typeIter]) {
            examination[typeIter].num = sel_list.length;
            examination[typeIter].sum_score = examination[typeIter].per_score * examination[typeIter].num;
            t_num += examination[typeIter].num;
            t_score += examination[typeIter].sum_score;
        }
    }

    examination.total_num = t_num;
    examination.total_score = t_score;
    updateExamInfo();
}

//----------------
// filter
function onFilterInput(event) {
    filterQList();
}

function filterQList() {
    filteQuestions($('#filter_input').val(), section_id);
}

function filteQuestions(words = null, section = null) {
    if (words || section) {
        $('button[id^=' + QLIST_ID + ']').each(function (index, elem) {
            var hidden = false;
            if (words) {
                var missed = false;
                var word_list = words.split(" ");
                word_list.forEach((item, idx, arr) => {
                    missed = missed || (elem.innerHTML.indexOf(item) == -1);
                    return missed;
                });

                hidden = hidden || missed;
            }

            if (section) {
                hidden = hidden || (elem.dataset.secid != section);
            }

            $(elem).attr("hidden", hidden);
        });
    }
    else {
        $('button[id^=' + QLIST_ID + ']').attr("hidden", false);
    }
}

const QLIST_ITEM_STR = '<button class="list-group-item list-group-item-action inline-block text-truncate" \
                    tabindex="-1" data-qindex=-1 data-toggle="tooltip" data-placement="left" data-secid="" onfocus="this.blur()" id="" title=""></button>';

const QLIST_ID = "qList_";
const CSS_SEL_CLASS = "list-group-item-danger";
const CSS_UNSEL_CLASS = "list-group-item-warning";


function updateQList() {
    var curTypeList = question_list_all[cur_type];

    var SL_Elem = $("#selected_qlist");
    var uSL_Elem = $("#unSelected_qlist");

    SL_Elem.empty();
    uSL_Elem.empty();

    var qListPanel;
    var tempLine;
    var css_cls = "";
    var sel_sum = 0, unsel_sum = 0;
    let desc = "";

    curTypeList.forEach(function (iter, index, array) {
        desc = iter.desc;
        if (desc.length > 50) { 
            desc = desc.replace(/<\/?[\S]*>/g, "");            
            desc = desc.trim().substr(0, 20); 
        }
        if (iter['selected']) {
            qListPanel = SL_Elem;
            css_cls = CSS_SEL_CLASS;
            ++sel_sum;
        }
        else {
            qListPanel = uSL_Elem;
            css_cls = CSS_UNSEL_CLASS;
            ++unsel_sum;
        }

        tempLine = $(QLIST_ITEM_STR)
            .clone()
            .attr({ "data-qindex": index, "id": QLIST_ID + index, "title": desc, "data-secID": iter.secID })
            .html(desc)
            .addClass(css_cls)
            .tooltip()
            .click(onQListBtnClick).dblclick(onQListBtnDoubleClick);

        qListPanel.append(tempLine);
    });

    $("#" + QLIST_ID + cur_index).click();
    $("#sel_sum").html(sel_sum.toString());
    $("#unsel_sum").html(unsel_sum.toString());
    $('#content_filer').collapse('hide');

    updateExamination();
}

function onQListBtnClick(event) {
    if ($("#mul_sel").prop("checked")) {
        if (cur_index != -1 && question_list_all[cur_type][cur_index].selected !=
            question_list_all[cur_type][event.target.dataset.qindex].selected) {
            $('button[id^=' + QLIST_ID + ']').removeClass('active');
        }
        if ($(event.target).hasClass('active')) {
            $(event.target).removeClass('active');
        }
        else {
            $(event.target).addClass('active');
        }
    }
    else {
        $('button[id^=' + QLIST_ID + ']').removeClass('active');
        $(event.target).addClass('active');
    }
    cur_index = event.target.dataset.qindex;

    updateBtn();
}

function onQListBtnDoubleClick(event) {
    if (!$("#mul_sel").prop("checked")) {
        $(event.target).tooltip('dispose');
        onToggleAdd();
    }
}

function updateBtn() {
    if (cur_index < 0) {
        $('#btn_toggle').css('visibility', 'hidden');
    }
    else {
        $('#btn_toggle').css('visibility', 'visible');

        if (question_list_all[cur_type] && question_list_all[cur_type][cur_index].selected) {
            //$('#magic_panel').removeClass("text-right").addClass("text-left");
            $('#btn_toggle').css({ 'left': '0px' }).removeClass('btn_to_right').removeClass("btn-warning").addClass("btn-danger").html('移出试卷 <span class="font-weight-bold text-warning oi oi-arrow-thick-right"></span>');
        }
        else {
            //$('#magic_panel').removeClass("text-left").addClass("text-right");
            $('#btn_toggle').css({ 'left': 'calc( 100% - ' + $('#btn_toggle').width().toString() + 'px - 28px )' }).addClass('btn_to_right').removeClass("btn-danger").addClass("btn-warning").html('<span class="text-danger font-weight-bold oi oi-arrow-thick-left"></span> 加入试卷');
        }
    }
}

function onPerScoreChange(event, qtype) {
    examination[qtype].per_score = event.target.value;
    updateExamination();
}

function onToggleAdd(event) {
    var curQuestion = question_list_all[cur_type][cur_index];
    var targetSelect = !curQuestion.selected;
    if ($("#mul_sel").prop("checked")) {
        $('button[id^=' + QLIST_ID + ']').each(function (i, elem) {
            if ($(elem).hasClass('active')) {
                question_list_all[cur_type][elem.dataset.qindex].selected = targetSelect;
            }
        });
    }
    else {
        curQuestion.selected = targetSelect;
    }
    updateQList();
}

//=======================================================
// section Part
//=======================================================
function onSectionClick(event) {
    if ($('#chapter_filter').prop('checked')) {
        if (event.target.dataset.section != section_id) {
            $('button[id^=course_]').removeClass('active');
            $(event.target).addClass('active');
            section_id = event.target.dataset.section;
            filterQList();
        }
        return true;
    }

    return false;
}

function preSetValidation() {
    $('#exam-duration').attr({ 'min': '10', 'max': '1440' });
}

function formCheckAndSet() {
    var startTime = $('#exam-date').val() + ' ' + $('#exam-time').val();
    $('#id_start_time').val(startTime);

    var endTime = $('#exam-date').val() + ' ' + $('#exam-end-time').val();
    $('#id_end_time').val(endTime);

    var result = true;
    var checkingElem = null;

    checkingElem = $('#exam-end-time');
    if (startTime > endTime) {
        checkingElem.addClass('was-validated');
        checkingElem[0].reportValidity();
        result = false;
    }

    checkingElem = $('#exam_editor');
    if (checkingElem[0].reportValidity()) {
        checkingElem.removeClass('was-validated');
    }
    else {
        checkingElem.addClass('was-validated');
        result = false;
    }

    checkingElem = $('#exam-total-score');
    if (checkingElem.val() <= 0) {
        //alert("试卷总分必须大于0，请检查试卷！");
        checkingElem.addClass('was-validated');
        checkingElem[0].reportValidity();
        result = false;
        //checkingElem[0].setCustomValidity("试卷总分必须大于0，请检查试卷！");
        //checkingElem[0].checkValidity();
    }

    for (var key in question_list_all) {
        if (examination[key]) {
            examination[key]['qlist'] = [];
        } else {
            examination[key] = { 'per_score': 1, 'num': 0, 'sum_score': 0, 'qlist': [] };
        }
        question_list_all[key].forEach(function (iter, index, array) {
            if (iter.selected) {
                //iter.selected = false;
                temp = examination[key].qlist.push(iter.id);
            }
        });
    }

    //alert("---- " + JSON.stringify(examination));
    $('#id_question_list').val(JSON.stringify(examination));

    var cls_str = $('input[id^=class_]:checkbox:checked').map(function () { return $(this).data("clsId"); }).get().join(",");
    if (cls_str == "") {
        result = false;
        $('#btn_cls_se').addClass('btn-danger text-dark');
        $('#cls_setting_checker').prop("hidden", false);
    }
    else {
        $('#btn_cls_se').removeClass('btn-danger text-dark');
        $('#cls_setting_checker').prop("hidden", true);
    }
    $('#id_class_id_list').val(cls_str);
    // checkingElem = $('#id_duration');
    // if( checkingElem.val()<=0 ) {
    //     //alert("试卷总分必须大于0，请检查试卷！");
    //     //document.getElementById('exam-duration').checkValidity();
    //     checkingElem[0].validity.rangeOverflow = false;
    //     checkingElem[0].setCustomValidity("试卷总分必须大于0，请检查试卷！");
    //     checkingElem[0].checkValidity();
    //     result = false;        
    // }

    // 
    // $('#exam-date')
    // $('#exam-time')
    // $('#id_title')

    return result;
}

function onSubmitClick(event) {
    if (formCheckAndSet()) {
        document.getElementById('exam_editor').submit();
    }
}

function onSubmitExam() {
    ajaxSubmit(this, onSubmitSuccess, onSubmitFailed);
}

function onSubmitFailed(result) {
    alert("考试上传失败" + result);
}

function onSubmitSuccess(result) {
    ShowInfo("成功添加考试！", 3, () => { window.location.reload(); });
}

var random_num_list = {};

function onRandomBegin(event) {
    for (var key in random_num_list) {
        random_num_list[key] = 0;
    }

    $(event.target).removeClass('btn-dark').addClass('btn-success').off("click", onRandomBegin).on("click", onRandom);
    $('input[id^=per-num-]').css("width", "80px").attr('disabled', false).val(0);
    $('#per-num-lb').css("width", "98px").html('设定题目数量');
}

function onRandom(event) {
    $(event.target).addClass('btn-dark').removeClass('btn-success').off("click", onRandom).on("click", onRandomBegin);
    $('input[id^=per-num-]').css({ "width": "0px" }).attr({ 'disabled': true });
    $('#per-num-lb').css("width", "0px").html('');

    for (var key in question_list_all) {
        var rand_list = [];
        question_list_all[key].forEach(function (elem) {
            rand_list.push(elem);
            elem.selected = false;
        });

        if (random_num_list[key] != null) {
            rand_list = random_pick_list(rand_list, random_num_list[key]);
            rand_list.forEach(function (elem) {
                elem.selected = true;
            });
        }
    }
    doRefreshQList();
}

function onRandomNumberChange(event, qtype) {
    random_num_list[qtype] = Math.max(0, Math.min(event.target.value, question_list_all[qtype].length));
    event.target.value = random_num_list[qtype];
}

function resetWordFilter() {
    $('#filter_input').val("");
    filterQList();
}
//----------------------------------------------
function updateChapterFilter() {
    if ($('#chapter_filter').prop('checked')) {
        $('#chapter_list').show();
    }
    else {
        $('#chapter_list').hide();
        section_id = null;
    }
    $('button[id^=course_]').removeClass('active');
    filterQList();
}

function onAllClassClick(event) {
    $("input[id^=class_]").prop("checked", true);
}

//------------------------------------------------
function selHistoryExam(exam_id, qlist) {
    console.log("-----", exam_id, qlist);
    fillInQuestionList(qlist);
}

function fillInQuestionList(exam_info) {
    examination = exam_info;

    console.log("-----", examination);

    for (var iter of type_list) {
        var sel_list = question_list_all[iter].forEach((item, index, array) => {
            if (examination[iter]) {
                item.selected = examination[iter].qlist.indexOf(item.id) != -1;
            }
        });
    }
    //updateExamination();
    doRefreshQList();
    updateExamInfo();
}
