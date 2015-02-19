'use strict';

var SPECIAL_CHAR_RE  = /\\([dDwWsStrnvfb0])/g,
    UNSPECIAL_CHAR_RE = /%([dDwWsStrnvfb0])/g,
    OPERATOR_RE = /[|\\\/{}()[\]^$+*?.]/g;

function escape(str) {
    var hasBeginBoundary, hasEndBoundary;

    if (str.charAt(0) === '^') {
        str = str.substr(1);
        hasBeginBoundary = true;
    }

    if (str.charAt(str.length - 1) === '$') {
        str = str.substr(0, str.length - 1);
        hasEndBoundary = true;
    }

    str = str.replace(SPECIAL_CHAR_RE, '%$1');
    str = str.replace(OPERATOR_RE, '\\$&');
    str = str.replace(UNSPECIAL_CHAR_RE, '\\$1');

    if (hasBeginBoundary) {
        str = '^' + str;
    }

    if (hasEndBoundary) {
        str = str + '$';
    }

    return str;
}

function create(str, flags) {
    return new RegExp( escape(str), flags );
}

module.exports = {
    escape: escape,
    create: create
};
