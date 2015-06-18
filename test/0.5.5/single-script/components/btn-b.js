Flipper.register('btn-b', ['./module/btn-helper'], function(btnHelper) {
    return {
        template: '<button>BUTTON B</button>',
        ready: function() {
            this.addEventListener('click', function() {
                btnHelper.click('B');
            }, false);
        }
    };
});
