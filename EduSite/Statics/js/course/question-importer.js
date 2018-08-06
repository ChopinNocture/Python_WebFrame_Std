$(document).ready(init);

function init() {
    csrf_Setup();
    $('#excel_file').on('change', onFileSelect);
}

function onFileSelect(event) {
    //alert(event.target.files[0].name + ' ---- ' + event.target.files[0].type + ' - ');
    if($('#excel_file')[0].files[0].type.indexOf('application/vnd.ms-excel')!=-1) {
        $('#fsel_label').html($('#excel_file')[0].files[0].name);
        $('#import_btn').prop('disabled', false);
    }
    else {
        $('#fsel_label').html("请选择Excel文件......");
        $('#import_btn').prop('disabled', true);
    }
}