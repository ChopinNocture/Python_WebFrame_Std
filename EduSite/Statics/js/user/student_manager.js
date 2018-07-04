
function onClassSelect(event) {
    //alert(event.target.dataset.clsId);
    $('#class_selector').html(event.target.innerHTML);
    $.get(event.target.dataset.url + event.target.dataset.clsId, updateStudentList);
}


function onDeleteClick(event) {
    //alert("---------");
    ShowInfo("---------");
}


function updateStudentList(htmlData) {
    //alert(htmlData);
    $('#stu_li_con').html(
        $(htmlData).find('button[id^="stud_"]').click(onStudentSelected)
    );
}

function onStudentSelected(event) {
    $('button[id^="stud_"]').removeClass('active');
    $.get($(event.target).addClass('active').data('url'), updateStudenProf);
}

function updateStudenProf(htmlData) {
    $('#stud_prof').html(htmlData);
}