var dataCenter = {};

var uniqueId = 0;
function getUnqiueId() {
    uniqueId += 1;
    return uniqueId;
}

function requestModelSpace(model) {
    var spaceId = getUnqiueId();
    dataCenter[spaceId] = model || {};
    return spaceId;
}

function getModelSpace(spaceId) {
    return dataCenter[spaceId];
}

function removeModelSpace(spaceId) {
    delete dataCenter[spaceId];
}

Flipper.requestModelSpace = requestModelSpace;
Flipper.getModelSpace = getModelSpace;
Flipper.removeModelSpace = removeModelSpace;

window._dataCenter = dataCenter;
