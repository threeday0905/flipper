(function(Flipper) {
    'use strict';
    var utils = Flipper.utils,
        XTemplate = window.XTemplate;

    var render = {
        xtpl: function(facotry) {
            var tplText = facotry.getTplHTML(),
                module = new XTemplate(tplText);

            return function(data, commands) {
                commands = utils.mix(commands || {}, {
                    $scope: function(scope) {
                        return JSON.stringify(scope.getData());
                    }
                });

                return module.render(data, {
                    commands: commands
                });
            };
        }
    };

    Flipper.render = render;
} (Flipper));
