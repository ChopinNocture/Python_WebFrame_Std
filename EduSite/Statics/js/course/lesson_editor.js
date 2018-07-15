$(document).ready(init);

 var file_type_dict = { 'none':['none', , ''],
                        'image':['image/*', /image\/\w/],
                        'video':['video/*', /video\/\w/],
                        'audio':['audio/*', /audio\/\w/],
                        'ppt':['application/vnd.ms-powerpoint', /application\/vnd.ms-powerpoint/]}

function init() {
    csrf_Setup();

    //$('#id_file').click();

    reBindEvent();
    // $('a[id^=NavBtn_]').click(onNavTypeClk);
    // $('a[id^=NavBtn_]').each(function (index, elem) {
    //     elem.innerHTML = TYPE_TRANS_LIST[elem.innerHTML];
    // });

    // $('#content_filer').on('hide.bs.collapse', function () {
    //     filterQList();
    // })
    
    // $('#content_filer').on('show.bs.collapse', function () {
    //     $('#filter_input').val("");
    // })

    // $('#NavBtn_' + question_type).click();
    // $('button[id^=course_]:first').click();
}

function reBindEvent() {
    $('#id_file_type').on('change', onFileTypeChanged);
    $('#id_file').on('change', onFileSelect);    
}

function onFileTypeChanged(event) {
    alert($(event.target).val());
    $('#id_file').attr('accept', file_type_dict[$(event.target).val()][0]);
}

function onFileSelect(event) {
    alert(event.target.files[0].name + ' ---- ' +
        event.target.files[0].type + ' - '        
    );
    refreshUI();
}

function refreshUI() {
    if( file_type_dict[$('#id_file_type').val()][1].test($('#id_file')[0].files[0].type) ) {
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
    $('button[id^=course_]').removeClass('active');
    $(event.target).addClass('active');

    $('#lesson_con_form')[0].reset();
    $('#id_lesson').val(event.target.dataset.section);
    $.get('.', {'lesson' : event.target.dataset.section}, onFormGet );
    //    section_id = event.target.dataset.section;
    //    doRefreshQList();
    
    return true;
}

function onFormGet(response,status,xhr) {
     alert(" -- -" + $('#id_file')[0].files.length + "-");
    $('#form_part').html('');
    $('#form_part').html(response);
    reBindEvent();
    refreshUI();
}