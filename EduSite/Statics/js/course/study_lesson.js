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
}