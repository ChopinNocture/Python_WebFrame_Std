$(document).ready(init);

var PROGFRESS_STRING = "正在导入，请稍后";
var pro_str;
var progress = 0;

function init() {
    csrf_Setup();
    $('#progressing').hide();
    $('#excel_file').on('change', onFileSelect);
}

function onFileSelect(event) {
    //alert(event.target.files[0].name + ' ---- ' + event.target.files[0].type + ' - ');
    if($('#excel_file')[0].files[0].type.indexOf('application/vnd.ms-excel')!=-1) {
        $('#fsel_label').html($('#excel_file')[0].files[0].name);
        $('#check_btn').prop('disabled', false);
        $('#import_btn').prop('disabled', false);
        $('#import_list_btn').prop('disabled', false);
    }
    else {
        $('#fsel_label').html("请选择Excel文件......");
        $('#check_btn').prop('disabled', true);
        $('#import_btn').prop('disabled', true);
        $('#import_list_btn').prop('disabled', true);
    }
}

function onBtnClk(event) {
    $('#op_id').val('normal');
    $('#check_btn').prop('disabled', true);
    $('#import_btn').prop('disabled', true);
    $('#import_list_btn').prop('disabled', true);
    start_progress();
    $('#quest_importer_fm').submit();
}

function onListBtnClk(event) {
    $('#op_id').val('ListImport');
    $('#check_btn').prop('disabled', true);
    $('#import_btn').prop('disabled', true);
    $('#import_list_btn').prop('disabled', true);
    start_progress();
    $('#quest_importer_fm').submit();
}

function onCheckClk(event) {
    $('#op_id').val('check');
    $('#check_btn').prop('disabled', true);
    $('#import_btn').prop('disabled', true);
    $('#import_list_btn').prop('disabled', true);
    start_progress();
    $('#quest_importer_fm').submit();
}

function start_progress() {
    $('#progressing').show();
    pro_str = PROGFRESS_STRING;
    setInterval( progressing, 200);
}

function progressing() {
    progress = progress + 1;
    if (progress == 10) {
        progress = 0;
        pro_str = PROGFRESS_STRING;
    }
    else {
        pro_str = pro_str + "..";
    } 
    $('#progressing').html(pro_str);    
}
