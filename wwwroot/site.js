var player = {};

$(() => {
    
    //show player settings 
    $('#newPlayerModal').modal('show');

    //binding icon selector
    $("#player-icon").select2({
        templateResult: formatOption, //custom fomating
        templateSelection:formatOption
    });

    //when selecting so in preview
    $("#player-icon").on('select2:select', function (e) {
        let option = e.params.data;
        
        $('#icon-preview-icon').removeClass();
        $('#icon-preview-icon').addClass(option.id);
        
    });

    //when color change update the preivew
    $('#player-color').off("change").on("change", () => {
        let color = $('#player-color').val();

        $('#icon-preview-icon').css('color', color);
    });

    //connect the player to the game
    $('#btnStartGame').off('click').on('click', () =>{
        let frm = $("#player-form").get()[0];
        //check to make all needed setting are there
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

        //connet to game
        connectSocket(player);

        //update messages
        $('#display-name').text(player.name);

        $('#display-icon').addClass(player.icon);
        $('#display-icon').css('color', player.color);

        $('#newPlayerModal').modal('hide');
    });

    $('#btnClick').off('click').on('click', () =>{
        clickButton();
    });
})


function connectSocket(player) {
    //open conection and sending player sesttings
    window["socket"] = io.connect('', { query: `name=${player.name}&icon=${player.icon}&color=${player.color}` });

    //on connect server sends back player
    window["socket"].on('set-player', (obj) => {
        console.dir(obj);
        window.player = obj.player;
    });

    //sending leaderboard back so it can be displayed
    window["socket"].on('leadboard-update', (leadboard) => {
        updateLeadboard(leadboard);
    });
    
    window["socket"].on('connected', (message) => {
        console.log(message);
    });

    window["socket"].on('disconnected', (message) => {
        console.log(message);
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

function updateLeadboard(leadboard){
    //getting the ul
    let elememt = $('#leaderboard');

    //clearing it out for new items
    elememt.empty();

    //loop over the players
    leadboard
        .sort((a,b) => b.clickCount ?? 0 - a.clickCount ?? 0)
        .forEach(item => {
            let li = $(`<li><i class="${item.player.icon}"></i> ${item.player.name} ${item.clickCount ?? 0}</li>`);
            li.css('color', item.player.color);

            elememt.append(li);
        });
}