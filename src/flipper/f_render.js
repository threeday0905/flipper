(function(Flipper) {
    'use strict';

    var render = {
        render: function(ele, definition) {
            var tplText = definition.getTplHTML(),
                xtpl = new XTemplate(tplText),
                root = ele.createShadowRoot(),
                html = xtpl.render();

            root.innerHTML = html;
        }
    };

    Flipper.render = render;
} (Flipper));
