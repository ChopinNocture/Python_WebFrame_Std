$(document).ready(init);

function init() {
    csrf_Setup();

    $('button[id^=NavBtn_]').click(onNavTypeClk);
    $('button[id^=NavBtn_]').each(function (index, elem) {
        elem.innerHTML = elem.innerHTML.replace(elem.dataset.typeName,TYPE_TRANS_LIST[elem.dataset.typeName]);
    });

    $('button[id^=QSelected_]').click(onSelectClk); 

    $('#NavBtn_' + cur_type).click();
   // $('button[id^=course_]:first').click();
}

function onSelectClk(event) {
    $('button[id^=QSelected_]').removeClass('active');
    $(this).addClass('active');
}


var cur_type = "FillInBlank";
var examination = { "total_num": 0, "total_score": 0 };
var question_list_all = {}


var current_url = "";
var cur_list_url = "";
var section_id = null;
var cur_index = -1;

//-----------------------------------------
// 类型选择
function onNavTypeClk(event) {    
    $('button[id^=NavBtn_]').removeClass('active');
    $(event.target).addClass('active');
    
    cur_type = event.target.dataset["typeName"];
    current_url = event.target.dataset.url;
    cur_list_url = event.target.dataset.qlistUrl;
    cur_index = -1;
 
    // curr_qid = "";
    // with_value = false;
    // current_url = event.target.dataset.url;
    // cur_list_url = event.target.dataset.qlistUrl;
    // refreshOthers();
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
    $('#content_filer').collapse('hide');
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
    $('#total-score').val(examination[cur_type].sum_score);
}

const QLIST_ITEM_STR = '<button class="list-group-item list-group-item-action inline-block text-truncate" \
                    tabindex="-1" data-qid=-1 data-toggle="tooltip" data-placement="left" onfocus="this.blur()" id="" title=""></button>';

const QLIST_ID = "qList_";
const CSS_SEL_CLASS = "list-group-item-danger";
const CSS_UNSEL_CLASS = "list-group-item-warning";

function updateExamInfo() {
    $('#per-score').val(examination[cur_type].per_score);
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
            .click(onQListBtnClick);
        
        qListPanel.append(tempLine);
        if (cur_index == index) { tempLine.click(); }
        //alert(value.id + "  " + value.desc);
    });

    examination[cur_type].num = sel_sum;
    updateExamination();
    $("#sel_sum").html(sel_sum.toString());
    $("#unsel_sum").html(unsel_sum.toString());
}

function onQListBtnClick(event) {
    $('button[id^=' + QLIST_ID + ']').removeClass('active');
    $(event.target).addClass('active');
    cur_index = event.target.dataset.qindex;
    updateBtn();
}

function updateBtn() {
    if(cur_index<0) {
        $('#btn_toggle').css('visibility','hidden');
    }
    else {
        $('#btn_toggle').css('visibility','visible');
    }
    if(question_list_all[cur_type][cur_index].selected){
        $('#magic_panel').removeClass("text-right").addClass("text-left");
        $('#btn_toggle').removeClass("btn-warning").addClass("btn-danger").html('移出试卷 <span class="font-weight-bold text-warning oi oi-arrow-thick-right"></span>');
    }
    else {
        $('#magic_panel').removeClass("text-left").addClass("text-right");
        $('#btn_toggle').removeClass("btn-danger").addClass("btn-warning").html('<span class="text-danger font-weight-bold oi oi-arrow-thick-left"></span> 加入试卷');
    }  
}

function onPerScoreChange(event) {
    examination[cur_type].per_score = event.target.value;
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