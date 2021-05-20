var player = {};

$(() => {
    $('#newPlayerModal').modal('show');

   
    $("#player-icon").select2({
        templateResult: formatOption,
        templateSelection:formatOption
    });

    $("#player-icon").on('select2:select', function (e) {
        let option = e.params.data;
        
        $('#icon-preview-icon').removeClass();
        $('#icon-preview-icon').addClass(option.id);
        
    });

    $('#player-color').off("change").on("change", () => {
        let color = $('#player-color').val();

        $('#icon-preview-icon').css('color', color);
    });

    $('#btnStartGame').off('click').on('click', () =>{
        let frm = $("#player-form").get()[0];
        let valid = frm.checkValidity();
        if(!valid){
            frm.reportValidity();
            return;
        }
        
        player = {
            name:$('#player-name').val(),
            icon:$('#player-icon').val(),
            color:$('#player-color').val()
        }

        connectSocket(player);
        $('#display-name').text(player.name);

        $('#display-icon').addClass(player.icon);
        $('#display-icon').css('color', player.color);

        $('#newPlayerModal').modal('hide');
    });

    $('#btnClick').off('click').on('click', () =>{
        clickButton();
    })
})


function connectSocket(player) {
    window["socket"] = io.connect('', { query: `name=${player.name}&icon=${player.icon}&color=${player.color}` });

    window["socket"].on('set-player', (obj) => {
        console.dir(obj);
        window.player = obj.player;
    });

    
    window["socket"].on('connected', (obj) => {
        console.dir(obj);
    });

    window["socket"].on('disconnected', (obj) => {
        console.dir(obj);
    });

    window["socket"].on('button-click', (obj) => {
        console.dir(obj);
    });
}

function formatOption(option) {
    if (!option.id) {
        return option.text;
    }

    let optElement = $(`<span><i class="${option.id}"></i>${option.text}</span>`)

    return optElement;
};


function clickButton(){
    window["socket"].emit('button-click', player);
}