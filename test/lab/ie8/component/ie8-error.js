Flipper.register('ie8-error', {
    templateEngine: 'xtpl',
    template: {
        index: '<h1>success</h1>',
        error: '<h1>error</h1>'
    },
    initialize: function() {
        throw new Error('error');
    },
    ready: function() {

    },
    fail: function() {
        this.innerHTML = this.renderView('error');
        console.log('ie8-error is failed');
    }
});
