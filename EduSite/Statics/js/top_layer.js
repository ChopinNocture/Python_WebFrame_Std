function closeModal() {
    $('#btn_confirm').click(null);
    $('#btn_cancel').click(null);
    $('#modal_confirm').modal('hide');
}

function OpenModal(content, confirmFunc, cancelFunc=null) {
    $('#id_modal_content').html(content);
    $('#modal_confirm').modal('show');
    $('#btn_confirm').click(confirmFunc);
    $('#btn_cancel').click(cancelFunc);
}

function ShowInfo(info) {
    $('#info_window_content').html(info);
    $('#info_window').modal('show');
}
