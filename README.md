Flipper使用說明
==============

Flipper提供一個客製化機制，可以簡單的將組件封裝成為web component組件。

---

### 使用方法

定義一個html，並具備以下內容：

    <web-component name="test-tag" template-engine="xtpl" injection-mode="light-dom">
        <!-- 組件使用的樣式，也可以用link定義 -->
        <style>
            test-tag {
                display: block;
            }
            
            test-tag h1 {
                font-size: 14px;
            }
        </style>
        
        <!--組件使用的模版-->
        <template>
            <h1>{{title}}</h1>
        </template>
        
        <script>
            Flipper.register({
                // 取得組件的model
                fetch: function() {
                    // 使用者定義的attribute可作為組件的入參
                    var title = this.getAttribute('title');
                    
                    // 回傳的對象為組件的model，也可回傳一個ajax的promise對象，Flipper會將接口返回的對象作為model
                    return {
                        title: title
                    };
                },

                // 組件會自動將fetch所回傳的model進行渲染，渲染完成後觸發ready事件
                ready: function() {
                    // this為實際的element物件，可以進行操作並加上事件
                    $(this).find('h1').on('click', function() {
                    });
                },
                
                // 當element被移除時會觸發此事件
                destroy: function() {
                },
                
                // 除了Flipper定義的生命週期事件外，可以加入任意的事件
                getMyName: function() {
                    return $(this).find('h1').html();
                },
                alertMyName: function() {
                    alert(this.getMyName());
                }
            });
        </script>
    </web-component>

如此定義完成後，Flipper即會將他註冊為一個web component，並可以直接使用。

渲染 （僅需寫標籤，不用做其他的事情）：

    <test-tag id="test" title="xxx"></test-tag>
    
使用事件：

    document.getElementById('test').alertMyName();
    
    
---
### 渲染方法

Flipper內置xtemplate，透過指定template-engine做切換。

如不指定template-engine，會不做渲染，直接將模版內的syntax注入於element中。

如果想要自己操作渲染，如angular。可以在ready事件中自行加上渲染處理。


---
### this

Flipper的方法所操作的this，都為element本身。

可直接使用dom element原生事件，如 `this.getAttribute()`

也可直接丟入jQuery後使用，如 `$(this).attr()`


---
### 事件

Flipper的方法所操作的this，都為element本身。

可在ready中監聽事件，或著綁定事件。

---
### 依賴

如果組件本身依賴於其他的js module (必須符合KMD規範)，可以透過如下代碼定義

    // 第一個參數可傳入依賴的js位置
    Flipper.register( ['./interface.js', './otherModule.js'], function(a, b) {
    
        // 回傳的對象會作為Flipper定義的組件prototype
        return {
            fetch: function() {},
            ready: function() {},
            otherEvent: function()
        };
    });

