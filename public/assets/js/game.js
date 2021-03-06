//Set username in background for testing purposes
var playername = location.pathname.substr(1);

console.log(playername);

// Empty global variable to hold player data
var player;

//  Empty global variables to hold clock interval and timecount 
var clockid;

//Do not confuse timecounter with player.timecount. Timecounter is measured in deciseconds (10 for each second)
//player.timecount is measured in seconds and is how time will be reflected in and passed to the database
//with each second in player.timecount = one week of in-game time.
var timecounter = 0;


// Get's most recent player data from db
function updatePlayer() {

    $.ajax('/player/' + playername, {
        type: 'GET'
    }).then((data) => {

            player = data;
            displayPlayer(player);

            //Prevent sutomatic carriage placement if animation is moving
            var carriage = $('#carriage').attr('src');

            if(carriage.indexOf('still') > 0) {
                placeplayer(player);
            }
    });



};

function findtotal(playerdata) {
    return playerdata.grain + playerdata.fish + playerdata.cloth + playerdata.metal + playerdata.silk + playerdata.wood +
        playerdata.weapons + playerdata.gems + playerdata.medicine + playerdata.poison + playerdata.dragon_glass + playerdata.wine;
}

// Updates player display
function displayPlayer(playerdata) {

    // Calculate total inventory
    var totalinventory = findtotal(playerdata);
    $('#playerdata').text(playerdata.username);
    $('#golddata').text(playerdata.gold);
    $('#citydata').text(playerdata.cityid);
    $('#timedata').text(calendar(playerdata.timecount));
    $('#currentdata').text(totalinventory);
    $('#maxdata').text(playerdata.max_space);
    $('#graindata').text(playerdata.grain);
    $('#fishdata').text(playerdata.fish);
    $('#clothdata').text(playerdata.cloth);
    $('#metaldata').text(playerdata.metal);
    $('#winedata').text(playerdata.wine);
    $('#silkdata').text(playerdata.silk);
    $('#wooddata').text(playerdata.wood);
    $('#weaponsdata').text(playerdata.weapons);
    $('#gemsdata').text(playerdata.gems);
    $('#medicinedata').text(playerdata.medicine);
    $('#poisondata').text(playerdata.poison);
    $('#dragonglassdata').text(playerdata.dragon_glass);


}

// Builds HTML form for buy and sell transactions
function buildtransaction(type, host) {



    //Assign parent modal to a variable to allow for usage in ajax call
    var currentelement = $(host).parents('.modal');

    //Build HTML form for buy transaction
    var transactionform = $('<div/>', {
        'class': 'transaction'
    });
    var $goodsmenu = $('<select>', {
        id: type + 'select'
    });

    //Create list of goods dropdown from array of keys in player object
    var playerkeys = Object.keys(player);
    var optionsstring = '';

    for (i = 7; i < playerkeys.length; i++) {
        optionsstring += '<option value=\'' + playerkeys[i] + '\'>' + playerkeys[i] + '</option>';

    }

    $goodsmenu.html(optionsstring);

    // Build transaction form
    transactionform.html('<p>What would you like to ' + type + '?</p>');
    transactionform.children().append($goodsmenu);
    transactionform.append('<p> How much would you like to ' + type + '? <input type="text" name="quantity" id="quantity"></p>');
    transactionform.append('<button type=\'submit\' class=\'' + type + 'submit\'> Complete Transaction </button>');
    currentelement.find('.modal-footer').append(transactionform);


};

function buylogic(host) {

    //Assign transaction form and form values to variables
    var currentelement = $(host).parents('.transaction');
    var currentgood = currentelement.find('#buyselect').val();
    var currentquantity = currentelement.find('#quantity').val();

    // Validate transaction
    //Confirm quantity is a positive number
    var numberregex = /^\d*$/;

    if (numberregex.test(currentquantity) && parseInt(currentquantity) >= 0) {

        currentquantity = parseInt(currentquantity);

        //Get price of good in current market
        var currentprice = parseInt(currentelement.parents('.modal').find('.' + currentgood + 'price').text());

        //Check player has enough gold to complete transaction
        if ((currentprice * currentquantity) < player.gold) {

            //Check player has enough space to complete transaction
            if (player.max_space >= findtotal(player) + currentquantity) {

                player.gold -= (currentprice * currentquantity);
                player[currentgood] += currentquantity;

                currentelement.remove();
                sendPlayerUpdate(player);

            } else {
                alert('Not a valid transaction, player doesn\'t have enough space');
            }

        } else {
            alert('Not a valid transaction, player doesn\'t have enough money to complete');
        }
    } else { //Result of number checking logic
        alert('Not a valid transaction, quantity must be a number above 0');
    }

};

function selllogic(host) {

    //Assign transaction form and form values to variables
    var currentelement = $(host).parents('.transaction');
    var currentgood = currentelement.find('#sellselect').val();
    var currentquantity = currentelement.find('#quantity').val();


    // Validate transaction
    //Confirm quantity is a positive number
    var numberregex = /^\d*$/;

    if (numberregex.test(currentquantity) && parseInt(currentquantity) >= 0) {

        currentquantity = parseInt(currentquantity);
        var currentprice = parseInt(currentelement.parents('.modal').find('.' + currentgood + 'price').text());

        //Confirm player has enough good to sell
        if (player[currentgood] >= currentquantity) {

            player.gold += (currentprice * currentquantity);
            player[currentgood] -= currentquantity;

            currentelement.remove();
            sendPlayerUpdate(player);

        } else {
            alert('Not a valid transaction, you don\'t have enough ' + currentgood + ' to sell.');
        }



    } else { //Result of number checking logic
        alert('Not a valid transaction, quantity must be a number above 0');
    }



}

function startClock() {

    clockid = setInterval(timer, 100);

}

function timer() {
    timecounter++;
    if (timecounter === 10) {
        //Update calendar every 10 cycles (1 second)
        player.timecount++;
        sendPlayerUpdate(player);
        timecounter = 0;
    }
}

function calendar(counter) {
    // Add 298 to years count because game starts in 298 AC


    var years = Math.floor((counter - 1) / 48) + 298;
    counter -= ((years - 298) * 48);


    var months = Math.floor((counter - 1) / 4) + 1;
    counter -= ((months - 1) * 4);

    var datestring = '';
    switch (counter) {
        case 1:
            datestring += 'First';
            break;

        case 2:
            datestring += 'Second';
            break;

        case 3:
            datestring += 'Third';
            break;

        default:
            datestring += 'Fourth';

    }

    datestring += ' Week of the ' + months;

    switch (months) {
        case 1:
            datestring += 'st';
            break;

        case 2:
            datestring += 'nd';
            break;

        case 3:
            datestring += 'rd';
            break;

        default:
            datestring += 'th';
    }

    datestring += ' Moon, ' + years + ' AC';

    return datestring;
}

function stopClock() {
    clearInterval(clockid);
}

function sendPlayerUpdate(player) {



    $.ajax('/player/update', {
        method: 'PUT',
        data: player
    }).then((data) => {
        updatePlayer();
    });

}

function upgradetransaction(host) {
    var currentelement = $(host).parents('.modal-footer');

    //Build new form to upgrade
    var $transactionform = $('<div/>', {
        'class': 'upgrade'
    });






}

function route(destination,player) {

    var start = $('area[data-cityid=\'' + player.cityid + '\']').attr('data-carriage').split(',');
    
    var end = destination.attr('data-carriage').split(',');

    //Calculate distance between two points using Pythagorean theorum
    var distance = Math.sqrt(Math.pow(parseInt(start[0]) - parseInt(end[0]),2) + Math.pow(parseInt(start[1]) - parseInt(end[1]),2));

    return distance;
}


// Run once to bring player data into page 
$(document).one('ready', function () {
    updatePlayer();
    
})



//Begin live code and listeners
$(document).ready(function () {




    // When user clicks on a map location
    $('.clickable').click(function () {

        //Set element to be updated = to target of clickable map
        var currentelement = $(this);
        var targetmodal = '#'+ $(this).context.id + 'Modal';

        console.log(targetmodal);
        var distance = route($(this), player);

        startClock();
        movecarriage(currentelement, distance,1);

        $('#carriage').promise().done(function () {

            stopClock();
            // Set player cityid to new location and update player in db
            player.cityid = parseInt(currentelement.attr('data-cityid'));


            sendPlayerUpdate(player);

            //Get prices for goods
            index = player.cityid - 1;
            $.get('/game/priceupdate').then((data) => {

                var priceobject = data[index].prices;
                console.log(priceobject);

                for (var key in priceobject) {

                    $(targetmodal).find('.' + key + 'price').text(priceobject[key]);

                }

                $(targetmodal).modal({
                    show: true});
            });
        });
    });

    // Listeners for buy and sell requests
    $(document).on('click', '.buy', function () {
        buildtransaction('buy', this);
    });


    $(document).on('click', '.sell', function () {
        buildtransaction('sell', this);
    });

    $(document).on('click', '.buysubmit', function () {
        buylogic(this);
    });

    $(document).on('click', '.sellsubmit', function () {
        selllogic(this);
    });

    $(document).on('click', '.upgrade', function () {
        upgradetransaction(this);
    })

});