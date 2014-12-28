<div class="row digo-widget rich-table">

  <div class="col-sm-12">

    <div class="row header">

      <div class="col-sm-6">
        <div class="filter">{{ title }}</div>
        <div class="filter" ng-repeat="o in filter_list">
          <span>{{ o.name }}</span>
          <select id="{{ o.id }}">
            <option ng-repeat="oo in o.option_list" value="{{ oo.id }}" ng-click="params[o.id]=oo.id">{{ oo.text }}</option>
          </select>
        </div>
      </div>

      <div class="col-sm-6">
        <div class="tool">
          <button type="button" class="btn btn-default btn-xs" ng-show="is_export">
            <span class="glyphicon glyphicon-circle-arrow-down"></span>
            导出数据
          </button>
        </div>
        <div class="tool">
          <button type="button" class="btn btn-default btn-xs" ng-click="show_target_dim=!show_target_dim;$event.stopPropagation()">
            <span class="glyphicon glyphicon-cog"></span>
            设置指标与维度
          </button>
          <div class="target_dim" ng-show="show_target_dim" ng-click="$event.stopPropagation()">
            <p>维度</p>
            <ul>
              <li ng-repeat="o in dim_list"><input type="checkbox" ng-model="o.is_show" /> {{ o.name }}</li>
            </ul>
            <p>指标</p>
            <ul>
              <li ng-repeat="o in target_list"><input type="checkbox" ng-model="o.is_show" /> {{ o.name }}</li>
            </ul>
          </div>
        </div>
        <div class="tool">
          <span>显示</span>
          <span class="glyphicon glyphicon-th merge" ng-click="merge=false"></span>
          <span class="glyphicon glyphicon-th-list merge" ng-click="merge=true"></span>
        </div>
      </div>
    </div><!-- row header -->

    <div class="row body">
      <div class="col-sm-12">
        <table class="table table-bordered">
          <tr>
            <th ng-repeat="o in column_list" ng-if="o.is_show" ng-click="order_by_column(o)">
              {{ o.name }}
              <span class="glyphicon glyphicon-sort-by-attributes" ng-show="params.order == o.id && !params.order_desc"></span>
              <span class="glyphicon glyphicon-sort-by-attributes-alt" ng-show="params.order == o.id && params.order_desc"></span>
            </th>
          </tr>

          <tr ng-repeat="o in obj" ng-if="merge">
            <td ng-repeat="c in column_list" ng-if="o[c.id + '_rowspan'] > 0 && c.is_show" rowspan="{{ o[c.id + '_rowspan'] }}">{{ o[c.id] }}</td>
          </tr>

          <tr ng-repeat="o in obj" ng-if="!merge">
            <td ng-repeat="c in column_list" ng-if="c.is_show">{{ o[c.id] }}</td>
          </tr>

        </table>
      </div><!-- col 12 -->
    </div><!-- row -->

    <div class="row footer">
      <div class="col-sm-12 paginator-block">
        <div class="paginator">
          <div class="previous" ng-click="fetch(page-1)" ng-show="page > 1 && sum_page > 1">◀</div>

            <div class="page" ng-repeat="p in range track by $index">
              <div class="current" ng-show="$index + 1 == page" ng-click="fetch($index + 1)">{{ $index + 1 }}</div>
              <div ng-hide="$index + 1 == page" ng-click="fetch($index + 1)">{{ $index + 1 }}</div>
            </div>

          <div class="next" ng-click="fetch(page+1)" ng-show="page < sum_page && sum_page > 1">▶</div>
          <div class="sum">共 {{ sum_page }} 页</div>
        </div>
      </div>
    </div><!-- row footer -->

  </div><!-- col 12 -->
</div><!-- row rich table -->
