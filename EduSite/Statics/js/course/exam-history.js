$(document).ready(init);

function init() {
    csrf_Setup();
}

var exam_id = -1, class_id = -1;
var class_students = {};
var exam_ans_list = {};
function onClassSelect(event) {
    if ($(event.target).hasClass('active')) return;

    $('button[id^=class_]').removeClass('active');
    $(event.target).addClass('active');

    let cid = event.target.dataset['clsId'];
    if (class_id != cid) {
        class_id = cid;
        get_student_list(event.target.dataset['url']);
    }
}

function onExamSelect(event) {
    if ($(event.target).hasClass('active')) return;

    $('button[id^=exam_]').removeClass('active');
    $(event.target).addClass('active');

    let eid = event.target.dataset['eid'];
    if (exam_id != eid) {
        exam_id = eid;
        get_exam_list();
    }
}

// uid st_num name eid score add_sc
function get_student_list(url) {
    if (class_id < 0) return;
    if (class_students[class_id]) {
        refresh();
        return;
    }

    $.post(url, { 'class_id': class_id }, function (data) {
        class_students[class_id] = data.std_list;
        refresh();
    });
}

function get_exam_list() {
    if (exam_id < 0) return;
    if (exam_ans_list[exam_id]) {
        refresh();
        return;
    }

    $.post('.', { 'exam_id': exam_id }, function (data) {
        let e_list = data.exam_list;
        e_list.sort((a, b)=>{ return b.score - a.score; });
        if (e_list.length > 0) {
            exam_ans_list[e_list[0].eid] = e_list;
        }
        refresh();
    });
}

const TR_HTML = "<tr><td width='25%'>111</td>\
                <td width='24%'>222</td>\
                <td width='17%'>333</td>\
                <td width='17%'>444</td>\
                <td width='17%'>555</td> </tr>"

function refresh() {
    if (class_students[class_id] && exam_ans_list[exam_id]) {
        var html_str = "";

        for (let iter of exam_ans_list[exam_id]) {
            let stu = class_students[class_id].find((elem)=>{ return elem.uid==iter.uid; });
            if (stu) {
                html_str += TR_HTML.replace('111', stu.name).replace('222', stu.st_num).replace('333', iter.score)
                .replace('444', iter.add_sc).replace('555', iter.score + iter.add_sc);
            }            
        }
        $("#list_panel").html(html_str);
    }
}