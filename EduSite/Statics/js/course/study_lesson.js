var type_HTML = {
    'image': '<img src="***" alt="图片文件，需要支持HTML5 的浏览器" id="prev_control"/>',
    'video': '<video controls="controls" id="prev_control"> <source src="***" type="video/mp4">需要支持HTML5 的浏览器" </video>',
    'audio': '<img src="***" alt="图片文件，需要支持HTML5 的浏览器" id="prev_control"/>'
}

$(document).ready(init);

function init() {
    csrf_Setup();
    refreshUI();
}

function onBackClick(event) {
    alert("------------" + event.target.dataset['progress']);
    $.ajax({
        url: event.target.dataset['progurl'],
        type: 'post',
        data: { "progress": event.target.dataset['progress'] },
        dataType: 'json',
        success: SucFunc
    });
    $(location).attr('href', event.target.dataset['url'] );    
}

function refreshUI() {    
    var fileType = $('#file_panel').data('fileType');
    var fileUrl = $('#file_panel').data('fileUrl');

    if( fileType=="" ) {
        $('#file_panel').html('');
    }
    else {
        var temp_html = type_HTML[fileType].replace('***', '/uploaded/'+fileUrl);
        $('#file_panel').html(temp_html);
    }
}

function SucFunc() {

}