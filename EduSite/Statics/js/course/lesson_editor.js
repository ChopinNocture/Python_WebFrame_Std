$(document).ready(init);

 var file_type_dict = { 'image':['image/*', /image\/\w/],
                        'video':['video/*', /video\/\w/],
                        'audio':['audio/*', /audio\/\w/],
                        'ppt':['application/vnd.ms-powerpoint', /application\/vnd.ms-powerpoint/]}

function init() {
    csrf_Setup();

    //$('#id_file').click();

    $('#id_file_type').on('change', onFileTypeChanged);
    $('#id_file').on('change', onFileSelect);
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

function onFileTypeChanged(event) {
    alert($(event.target).val());
    $('#id_file').attr('accept', file_type_dict[$(event.target).val()][0]);
}

function onFileSelect(event) {
    alert(event.target.files[0].name + ' ---- ' +
        event.target.files[0].type + ' - '        
    );

    if( file_type_dict[$('#id_file_type').val()][1].test(event.target.files[0].type) ) {
        $('#fsel-label').html(event.target.files[0].name);
    }
    else {
        $('#fsel-label').reset();
    }
}

//=======================================================
// section Part
//=======================================================
function onSectionClick(event) {
    $('button[id^=course_]').removeClass('active');
    $(event.target).addClass('active');
    if (event.target.dataset.section != section_id) {

    //    section_id = event.target.dataset.section;
    //    doRefreshQList();
    }
    return true;
}