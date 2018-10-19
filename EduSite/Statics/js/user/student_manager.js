$(document).ready(init);

function init() {
    csrf_Setup();
}

function onClassSelect(event) {
    if ($(event.target).hasClass('active')) return;

    $('button[id^=class_]').removeClass('active');
    $(event.target).addClass('active');

    $('#class_selector').html(event.target.innerHTML);
    $('#stu_li_con').html("");
    $('#stud_prof').html("");
    $.get(event.target.dataset.url + event.target.dataset.clsId, updateStudentList);
}

function onDeleteClick(event) {
    ShowInfo("---------");
}

function updateStudentList(htmlData) {
    $('#stu_li_con').html(htmlData);
    $('button[id^="stud_"]').click(onStudentSelected);
}

function onStudentSelected(event) {
    if ($(event.target).hasClass('active')) return;

    $('button[id^="stud_"]').removeClass('active');
    $.get($(event.target).addClass('active').data('url'), updateStudenProf);
}

function updateStudenProf(htmlData) {
    $('#stud_prof').html(htmlData);
    refreshTable();
}

function refreshTable() {
    $("td[id^=fin_]").each(function (index, elem) {
        refreshFinalScore(elem.dataset['index']);        
    });
}

function refreshFinalScore(idx) {
    $("#fin_" + idx).html( Number($("#score_"+idx).html()) + Number($("#add_"+idx).val()) );
}

function onAddChanged(event) {
    refreshFinalScore(event.target.dataset["index"]);
}

function onConfirm(event) {
    $.ajax({
        url: event.target.dataset['url'],
        type: 'post',
        data: {'addition_score': $("#add_"+event.target.dataset["index"]).val()},
        dataType: "json"        
    });
}

function onCoinGiven(event) {
    var gold_add = $("#gold_given").val();
    if(gold_add) {    
        $.ajax({
            url: event.target.dataset['url'],
            type: 'post',
            data: { 'user_id': event.target.dataset['userid'], 'gold': gold_add},
            dataType: "json",
            success: onCoinSuc
        });
    }
}

function onCoinSuc() {
    $.get($("#id_confirm").data('profurl'), updateStudenProf);    
}