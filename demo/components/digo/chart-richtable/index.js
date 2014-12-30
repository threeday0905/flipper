Flipper.register({
    initialize: function() {
        var self = this;

        angular.module(this.name, [], angular.noop);
        return $.get(this.getAttribute('data-uri')).then(function(config) {
                self.config = config;
            });
    },
    render: function() {
        /* jshint camelcase: false */
        var node = this,
            config = this.config,
            template = this.getView(),
            injector = angular.bootstrap(node, [this.name]);

        injector.invoke(function($rootScope, $compile) {
            var link = $compile(template);
            var scope = angular.extend($rootScope.$new(true), config);
            var n = link(scope);
            $(node).append(n);

            //指标
            scope.target_list = [];

            //维度
            scope.dim_list = [];

            $.each(scope.column_list, function(i, e) {
                e.is_show = true;
                e.type === 'target' ? scope.target_list.push(e) : scope.dim_list.push(e);
            });

            //请求参数
            scope.params = {};

            scope.$watch('params', function() {
                scope.fetch(1);
            }, true);

            //合并单元格
            scope.merge = false;

            //显示维度选择
            (function() {
                $(document).on('click', function() {
                    scope.show_target_dim = false;
                    scope.$digest();
                });
            })();

            //排序
            scope.order_by_column = function(o) {
                if (scope.params.order === o.id) {
                    scope.params.order_desc = (!scope.params.order_desc + 0);
                } else {
                    scope.params.order = o.id;
                    scope.params.order_desc = 0;
                }
            };

            scope.fetch = function(page) {
                alert('获取数据了');

                scope.obj = [{
                    lv1_dept: '一级部门',
                    s20: '20秒接起',
                    spcr: '单通道PCR'
                }, {
                    lv1_dept: '一级部门',
                    s20: '20秒接起',
                    spcr: '单通道PCR2'
                }, {
                    lv1_dept: '部门',
                    s20: '20秒接起',
                    spcr: '单通道PCR'
                }, {
                    lv1_dept: '部门',
                    s20: '20秒接起2',
                    spcr: '单通道PCR'
                }];
                scope.sum_page = 4;
                scope.page = page;
                scope.range = new Array(scope.sum_page);

                //纵向合并
                for (var i = 0, l = scope.column_list.length; i < l; i++) {
                    var c = scope.column_list[i].id;
                    for (var j = 0, ll = scope.obj.length; j < ll; j++) {
                        if (scope.obj[j][c + '_rowspan'] == 0) {
                            continue
                        }
                        if (i > 0 && scope.obj[j][scope.column_list[i - 1].id + '_rowspan'] == 0) {
                            scope.obj[j][c + '_rowspan'] = 1;
                            continue;
                        }
                        scope.obj[j][c + '_rowspan'] = 1;

                        for (var k = j + 1, lll = scope.obj.length; k < lll; k++) {
                            if (scope.obj[k][c] == scope.obj[j][c]) {

                                if (i == 0 || (i > 0 && scope.obj[k][scope.column_list[i - 1].id + '_rowspan'] == 0)) {
                                    scope.obj[j][c + '_rowspan'] += 1;
                                    scope.obj[k][c + '_rowspan'] = 0;
                                    continue;
                                }

                            }
                            break;
                        }

                    }
                }
            }

            scope.$digest();
        });
    }
});
