Flipper.register('ie8-sample', {
    templateEngine: 'xtpl',
    template: '<h1>{{title}}</h1><h2>{{subTitle}}</h2><h3>{{attr("sub")}}</h3>',
    initialize: function() {
        this.title = 'IE8';
    },
    fetch: function() {
        return {
            title: this.title,
            subTitle: this.getAttribute('sub') || 'N/A'
        };
    },
    adpat: function(model) {
        model.adpat = 'adpat';
    },
    ready: function() {
        $(this).find('h1').on('click', function() {
            window.alert('click header');
        });
    }
});
