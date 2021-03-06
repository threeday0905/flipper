/********************************************
 * External Scripts generated by Flipper
 ********************************************/

/********************************************
 * Component Register generated by Flipper
 ********************************************/

/* [btn-a] - components/btn-a.html */
Flipper.register('btn-a', ['test/components/module/btn-helper'], function (btnHelper) {
    return {
        template: { index: '<button>BUTTON A</button>' },
        ready: function () {
            this.addEventListener('click', function () {
                btnHelper.click('A');
            }, false);
        }
    };
});

/* [btn-b] - components/btn-b.js */
Flipper.register('btn-b', ['test/components/module/btn-helper'], function (btnHelper) {
    return {
        template: { index: '<button>BUTTON B</button>' },
        ready: function () {
            this.addEventListener('click', function () {
                btnHelper.click('B');
            }, false);
        }
    };
});