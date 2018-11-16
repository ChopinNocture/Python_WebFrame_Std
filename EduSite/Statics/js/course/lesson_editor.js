$(document).ready(init);

var cont_id = -1;

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
    $('#btn_new').hide();
    $('#btn_delete').hide();
    reBindEvent();
    refreshUI();
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

function refreshUI() {
    if ($('#id_file_name').val() == "") {
        $('#btn_preview').prop('disabled', true);
        $('#prev_part').html('');
        $('#btn_clsConfirm').hide();
    } else {
        $('#btn_preview').prop('disabled', false);
        var temp_html = type_HTML[$('#id_file_type').val()].replace('***', '/uploaded/' + $('#id_file_name').val());
        $('#prev_part').html(temp_html);
        $('#btn_clsConfirm').show();
    }

    if ($('#id_file')[0].files.length > 0 &&
        file_type_dict[$('#id_file_type').val()][1].test($('#id_file')[0].files[0].type)) {
        $('#fsel-label').html($('#id_file')[0].files[0].name);
    } else {
        $('#fsel-label').html('');
    }

    var cls_str = $('#id_class_id_list').val();
    if (cls_str != "") {
        $('input[id^=class_]').each(function () {
            $(this).prop("checked", -1 != cls_str.indexOf($(this).data("clsId")));
        });
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

    //$('#lesson_con_form')[0].reset();
    $('#id_lesson').val(event.target.dataset.section);
    $.get('.', {
        'lesson': $('#id_lesson').val()
    }, onLessContListGet);
    //    section_id = cur_section;
    //    doRefreshQList();
    return true;
}

function onContentClick(event) {
    if ($(event.target).hasClass('active')) return;
    $('button[id^=cont_]').removeClass('active');
    $(event.target).addClass('active');
    
    cont_id = event.target.dataset.contid;

    $.get('.', {
        'lesson': $('#id_lesson').val(),
        'content_id': cont_id
    }, onFormGet);
}

function onFormGet(response, status, xhr) {
    // alert(" -- -" + $('#id_file')[0].files.length + "-");
    $('#form_part').html(response);
    reBindEvent();
    refreshUI();
    $('#id_file_type').attr("disabled", true);
    $('#id_file').attr("disabled", true);
    $('#btn_new').show();
    $('#btn_delete').show();
}

function onLessContListGet(response, status, xhr) {
    $('#less_cont_part').html(response);
    onNewClick();
}

function onNewFormGet(response, status, xhr) {
    // alert(" -- -" + $('#id_file')[0].files.length + "-");
    $('#form_part').html(response);
    reBindEvent();
    refreshUI();
    $('#btn_new').hide();
    $('#btn_delete').hide();
}

function onNewClick(event) {
    $('button[id^=cont_]').removeClass('active');
    cont_id = -1;
    $.get('.', {
        'lesson': $('#id_lesson').val(),
        'content_id': cont_id
    }, onNewFormGet);
}

function onDeleteClick(event) {
    if (cont_id != -1) {
        var targetURL = event.target.dataset.url.replace("9999", cont_id);
        $.ajax({
            url: targetURL,
            type: 'post',
            success: delSucFunc,
        });
    }
}

function delSucFunc(){
    alert("资料删除成功");
    $.get('.', {
        'lesson': $('#id_lesson').val()
    }, onLessContListGet);;
}
//-----------------------------------------
function onAllClassClick(event) {
    $("input[id^=class_]").prop("checked", true);
}

function checkSubmit() {
    if (!$('#id_lesson').val()) {
        alert("请先在左边的列表中，选择要加入资料的章节");
        return false;
    }

    var cls_str = $('input[id^=class_]:checkbox:checked').map(function () {
        return $(this).data("clsId");
    }).get().join(",");
    $('#id_class_id_list').val(cls_str);
    if ("" == cls_str) {
        alert("必须至少选择一个班级!! ");
        $('#cls_setting_checker').prop("hidden", false);
        return false;
    } 
    else {
        $('#cls_setting_checker').prop("hidden", true);
    }

    return $('#lesson_con_form')[0].reportValidity();
}

function onConfirmClassSetting(event) {
    if (cont_id != -1) {
        var targetURL = event.target.dataset.url.replace("9999", cont_id);

        var cls_str = $('input[id^=class_]:checkbox:checked').map(function () {
            return $(this).data("clsId");
        }).get().join(",");
        $('#id_class_id_list').val(cls_str);
        if ("" == cls_str) {
            alert("必须至少选择一个班级!! ");
            return false;
        } 

        $.ajax({
            url: targetURL,
            type: 'post',
            data: { "class_list": cls_str },
            dataType: 'json',
            success: classSettingChangeFunc,
        });
    }    
}

function classSettingChangeFunc() {
    alert("班级设置修改成功！");
}