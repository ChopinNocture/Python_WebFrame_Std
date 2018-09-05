$(document).ready(onInit);

//================================================================
function onInit(event) {
    csrf_Setup();
}

function onCourseClick(event) {
    $('#param').val(event.target.dataset['id']);
    $('#Form_Login').submit();
    // $.post('.', {'course_id':event.target.dataset['id']}, function(data) {
    //     process(data);
    // });    
}