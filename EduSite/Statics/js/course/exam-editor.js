$(document).ready(init);

function init() {
    csrf_Setup();

    // Filter
    $('#content_filer').on('hide.bs.collapse', function () {
        filterQList();
    }).on('show.bs.collapse', function () {
        $('#filter_input').val("");
    })
    
    // 给input  date设置默认值
    var now = new Date();
    //格式化日，如果小于9，前面补0
    var day = ("0" + now.getDate()).slice(-2);
    //格式化月，如果小于9，前面补0
    var month = ("0" + (now.getMonth() + 1)).slice(-2);
    //拼装完整日期格式
    var today = now.getFullYear() + "-" + (month) + "-" + (day);
    $('#exam-date').val(today);
    $('#exam-date').attr({min:today});
    
    $('button[id^=NavBtn_]').click(onNavTypeClk);
    $('button[id^=NavBtn_]').each(function (index, elem) {
        elem.innerHTML = elem.innerHTML.replace(elem.dataset.typeName,TYPE_TRANS_LIST[elem.dataset.typeName]);
    });

    $('span[id^=per-sco-lb-]').each(function (index, elem) {
        elem.innerHTML = elem.innerHTML.replace(elem.innerHTML, TYPE_TRANS_LIST[elem.innerHTML]);
    });
 
    $('#btn_random').on("click", onRandomBegin);
    $('button[id^=QSelected_]').click(onSelectClk); 

    $('#NavBtn_' + cur_type).click();

    document.getElementById('exam_editor').submit = onSubmitExam;

    preSetValidation();    
   // $('button[id^=course_]:first').click();
}

function onSelectClk(event) {
    $('button[id^=QSelected_]').removeClass('active');
    $(this).addClass('active');
}


var cur_type = "FillInBlank";
var examination = { "total_num": 0, "total_score": 0 };
var question_list_all = {} // "id"  "desc" "secID" "flag"


var current_url = "";
var cur_list_url = "";
var section_id = null;
var cur_index = -1;

//-----------------------------------------
// 类型选择
function onNavTypeClk(event) {    
    $('button[id^=NavBtn_]').removeClass('active');
    $(event.target).addClass('active');
    $('span[id^=per-sco-lb-]').removeClass('bg-info');
    $('span[id^=total-sco-lb-]').removeClass('bg-info');
    
    cur_type = event.target.dataset["typeName"];
    current_url = event.target.dataset.url;
    cur_list_url = event.target.dataset.qlistUrl;
    cur_index = -1;

    $('span[id^=per-sco-lb-' + cur_type + ']').addClass('bg-info');
    $('span[id^=total-sco-lb-' + cur_type + ']').addClass('bg-info');

    doRefreshQList();

    return false;
}

function doRefreshQList() {
    if (null == question_list_all[cur_type]) {
        if (cur_list_url) {
            $.get(cur_list_url, onGetQList);
        }
    }
    else {
        updateExamInfo();
        updateQList();
    }
    updateBtn();
}

function onGetQList(jsonData) {
    examination[cur_type] = { 'per_score': 1, 'num': 0, 'sum_score': 0 };    // 数据结构
    question_list_all[cur_type] = [];

    var temp;
    jsonData.forEach(function (iter, index, array) {
        if (iter.flag & 0x2) {
            //iter.selected = false;
            temp = question_list_all[cur_type].push(iter);
            temp.selected = false;
        }
    }); 
    updateExamInfo();
    updateQList();
//    alert(question_list_all[cur_type].length);
}

function updateExamination(){
    examination[cur_type].sum_score = examination[cur_type].per_score * examination[cur_type].num;

    var t_num = 0, t_score = 0;
    $('button[id^=NavBtn_]').each(function (index, elem) {
        if( examination[elem.dataset.typeName]) {
            t_num += examination[elem.dataset.typeName].num;
            t_score += examination[elem.dataset.typeName].sum_score;
        }
    });

    $('span[id^=qType_num_]').each(function (index, elem) {
        if( examination[elem.dataset.typeName]) {
            elem.innerHTML = examination[elem.dataset.typeName].num;
        }
    });
    
    examination.total_num = t_num;
    examination.total_score = t_score;

    $('#qlist_num').html(examination.total_num);
    $('#exam-total-score').val(examination.total_score);
    $('#total-score-' + cur_type).val(examination[cur_type].sum_score);
}

//----------------
// filter
function onFilterInput(event) {
    filterQList(event.target.value);
}

function filterQList(words = null) {
    if (words) {
        var hidden_num = 0;
        $('button[id^=' + QLIST_ID + ']').each(function (index, elem) {
            if(elem.innerHTML.indexOf(words) == -1) {
                ++hidden_num;
                $(elem).attr("hidden", true);
            }
        });
    }
    else {
        $('button[id^=' + QLIST_ID + ']').attr("hidden", false);
    }
}

const QLIST_ITEM_STR = '<button class="list-group-item list-group-item-action inline-block text-truncate" \
                    tabindex="-1" data-qindex=-1 data-toggle="tooltip" data-placement="left" onfocus="this.blur()" id="" title=""></button>';

const QLIST_ID = "qList_";
const CSS_SEL_CLASS = "list-group-item-danger";
const CSS_UNSEL_CLASS = "list-group-item-warning";

function updateExamInfo() {
    $('#per-score-'+cur_type).val(examination[cur_type].per_score);
}

function updateQList() {
    //alert("update " + jsonData + " QList ");
    var jsonData = question_list_all[cur_type];

    var SL_Elem = $("#selected_qlist");
    var uSL_Elem = $("#unSelected_qlist");
    
    SL_Elem.empty();
    uSL_Elem.empty();

    var qListPanel;
    var tempLine;
    var css_cls = "";
    var sel_sum = 0, unsel_sum = 0;

    jsonData.forEach(function (iter, index, array) {
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
            .attr({ "data-qindex": index, "id": QLIST_ID + index, "title": iter.desc })
            .html(iter.desc)
            .addClass(css_cls)
            .tooltip()
            .click(onQListBtnClick).dblclick(onQListBtnDoubleClick);
        
        qListPanel.append(tempLine);
        if (cur_index == index) { tempLine.click(); }
        //alert(value.id + "  " + value.desc);
    });

    examination[cur_type].num = sel_sum;
    updateExamination();
    $("#sel_sum").html(sel_sum.toString());
    $("#unsel_sum").html(unsel_sum.toString());

    $('#content_filer').collapse('hide');
}

function onQListBtnClick(event) {
    $('button[id^=' + QLIST_ID + ']').removeClass('active');
    $(event.target).addClass('active');
    cur_index = event.target.dataset.qindex;
    updateBtn();
}

function onQListBtnDoubleClick(event) {
    $(event.target).tooltip('dispose');
    onToggleAdd();
}

function updateBtn() {
    if(cur_index<0) {
        $('#btn_toggle').css('visibility','hidden');
    }
    else {
        $('#btn_toggle').css('visibility','visible');

        if(question_list_all[cur_type][cur_index].selected) {
            //$('#magic_panel').removeClass("text-right").addClass("text-left");
            $('#btn_toggle').css({'left': '0px'}).removeClass('btn_to_right').removeClass("btn-warning").addClass("btn-danger").html('移出试卷 <span class="font-weight-bold text-warning oi oi-arrow-thick-right"></span>');
        }
        else {
            //$('#magic_panel').removeClass("text-left").addClass("text-right");
            $('#btn_toggle').css({'left': 'calc( 100% - ' + $('#btn_toggle').width().toString() + 'px - 28px )' }).addClass('btn_to_right').removeClass("btn-danger").addClass("btn-warning").html('<span class="text-danger font-weight-bold oi oi-arrow-thick-left"></span> 加入试卷');
        }  
    }
}

function onPerScoreChange(event, qtype) {
    examination[qtype].per_score = event.target.value;
    updateExamination();
}

function onToggleAdd(event) {
    var curQuestion = question_list_all[cur_type][cur_index];
    curQuestion.selected = !curQuestion.selected;
    updateQList();
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

function preSetValidation() {
    $('#exam-duration').attr({'min': '10', 'max': '1440'});    
}

function formCheckAndSet() {
    var dateTime = $('#exam-date').val() + ' ' + $('#exam-time').val();
    $('#id_start_time').val(dateTime);

    var result = true;
    var checkingElem = null;

    checkingElem = $('#exam_editor');    
    if(checkingElem[0].checkValidity()) {
        checkingElem.removeClass('was-validated');        
    }
    else{
        checkingElem.addClass('was-validated');
        result = false;
    }

    checkingElem = $('#exam-total-score');
    if( checkingElem.val()<=0 ) {
        //alert("试卷总分必须大于0，请检查试卷！");
        document.getElementById('exam-total-score').checkValidity();
        result = false;
        //checkingElem[0].setCustomValidity("试卷总分必须大于0，请检查试卷！");
        //checkingElem[0].checkValidity();
    }

    for (var key in question_list_all) {
        examination[key]['qlist'] = [];

        question_list_all[key].forEach(function (iter, index, array) {
            if (iter.selected) {
                //iter.selected = false;
                temp = examination[key].qlist.push(iter.id);
            }
        }); 
    }
    
    alert("---- " + JSON.stringify(examination));
    $('#id_question_list').val(JSON.stringify(examination));

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
    if(formCheckAndSet()) {
        document.getElementById('exam_editor').submit();  
    }
    //
     //document.getElementById('exam_editor').checkValidity();
    //document.getElementById('exam_editor').verify();
    //document.getElementById('exam_editor').submit();

    
    //alert(valCheck);

    //$('#exam_editor').verify();
}

function onSubmitExam() {
    ajaxSubmit(this, onSubmitSuccess, onSubmitFailed);   
}

function onSubmitFailed(result) {
    alert("???" + result);
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
    $('input[id^=per-num-]').css({"width":"0px"}).attr({'disabled':true});
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
    random_num_list[qtype] = Math.max(0, Math.min(event.target.value, question_list_all[cur_type].length));
    event.target.value = random_num_list[qtype];
}