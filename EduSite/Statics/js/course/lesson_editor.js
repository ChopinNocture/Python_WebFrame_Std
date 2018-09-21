$(document).ready(init);

var file_type_dict = {
    'none': ['none', /n/],
    'image': ['image/*', /image\/\w/],
    'video': ['video/*', /video\/\w/],
    'audio': ['audio/*', /audio\/\w/],
    'ppt': ['application/vnd.ms-powerpoint', /application\/vnd.ms-powerpoint/],
    'excel': ['application/vnd.ms-excel', /application\/vnd.ms-excel/],
    'word': ['application/msword', /application\/msword/]
}

function init() {
    csrf_Setup();
    reBindEvent();
}

function reBindEvent() {
    $('#id_file_type').on('change', onFileTypeChanged);
    $('#id_file').on('change', onFileSelect);
}

function onFileTypeChanged(event) {
    //alert($(event.target).val());
    $('#id_file').attr('accept', file_type_dict[$('#id_file_type').val()][0]);
}

function onFileSelect(event) {
    //alert(event.target.files[0].name + ' ---- ' + event.target.files[0].type + ' - ');
    refreshUI();
}

var type_HTML = {
    'image': '<img src="***" alt="图片文件，需要支持HTML5 的浏览器" id="prev_control"/>',
    'video': '<video controls="controls" id="prev_control"> <source src="***" type="video/mp4">需要支持HTML5 的浏览器" </video>',
    'audio': '<img src="***" alt="图片文件，需要支持HTML5 的浏览器" id="prev_control"/>'
}


function refreshUI() {    
    if( $('#id_file_name').val()=="" ) {
        $('#btn_preview').prop('disabled', true);
        $('#prev_part').html('');
    }
    else {
        $('#btn_preview').prop('disabled', false);
        var temp_html = type_HTML[$('#id_file_type').val()].replace('***', '/uploaded/'+$('#id_file_name').val());
        $('#prev_part').html(temp_html);
    }

    if ($('#id_file')[0].files.length > 0
        && file_type_dict[$('#id_file_type').val()][1].test($('#id_file')[0].files[0].type)) {            
        $('#fsel-label').html($('#id_file')[0].files[0].name);
    }
    else {
        $('#fsel-label').html('');
        event.target.value = "";
    }
}

function onPreview(event) {
    $('#lesson_con_form')[0].reportValidity();
}

//=======================================================
// section Part
//=======================================================
function onSectionClick(event) {
    if ($(event.target).hasClass('active')) return;

    $('button[id^=course_]').removeClass('active');
    $(event.target).addClass('active');

    $('#lesson_con_form')[0].reset();
    $('#id_lesson').val(event.target.dataset.section);
    $.get('.', { 'lesson': event.target.dataset.section }, onFormGet);
    //    section_id = event.target.dataset.section;
    //    doRefreshQList();

    return true;
}

function onFormGet(response, status, xhr) {
    // alert(" -- -" + $('#id_file')[0].files.length + "-");
    $('#form_part').html('');
    $('#form_part').html(response);
    reBindEvent();
    refreshUI();
}