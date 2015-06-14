window.trace = function(obj) {
    console.log(JSON.stringify(obj, null, 4));
};

window.writeboard = function(msg) {
    var whiteBoard = $('.whiteboard')[0];
    whiteBoard.innerHTML += msg + '<br>' ;
};
