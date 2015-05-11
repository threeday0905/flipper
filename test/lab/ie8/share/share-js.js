window.trace = function(obj) {
    console.log(JSON.stringify(obj, null, 4));
};

window.write = function(msg) {
    var whiteBoard = $('.whiteboard')[0];
    whiteBoard.innerHTML += msg + '<br>' ;
};
