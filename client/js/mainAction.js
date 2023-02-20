
modeSwap(0);

function modeSwap(mode) {
    let selected, unselected;
    if (!mode) {
        selected = $('button#friends');
        unselected = $('button#rooms');
    } else {
        selected = $('button#rooms');
        unselected = $('button#friends');
    }
    selected.css({
        'color': 'white',
        'font-weight': 'bold'
    });
    unselected.removeAttr('style');
    
    let left = 32.5 + (mode * 172.5);
    $('#underline').animate({
        left: left
    }, 200);
}