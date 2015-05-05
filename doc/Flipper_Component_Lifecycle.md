Flipper 生命週期事件說明
=====================

### initialize() 
第一個觸發的事件, 本身不會做什麼事, 幫助開發者在一開始建立模型

    Flipper.register({
        initialize: function() {
            this.key = 'abc';
        },
        ready: function() {
            console.log(this.key); //'abc'
        }
    });
    
### fetch() 

回傳的對象或是Promise會作為組件的model, 如下

直接回傳對象

    Flipper.register(
        fetch: function() {
            return {
                name: 'abcd'
            }; 
        },
        ready: function() {
            console.log(this.model); // { name: 'abcd' }
        }
    )  
        
使用AJAX取值, 回傳Promise   
            
    Flipper.register(
        fetch: function() {
            return $.get('http://path.to/data')
        },
        ready: function() {
            console.log(this.model);
        }
    )    
因此直接在fetch事件回傳對象就好, 可以不需要直接操作model屬性

### adapt()

如果model需要進行預處理才做渲染, 則可以在此事件中處理. 此處回傳回傳的結果只會影響模版渲染, 不會變更實際的model內容.
    
定義
    
    <web-component name="x-person">
        <template>
            <h1>{{full_name}}</h1>
        </template>
        <script>
            Flipper.register({
                fetch: function() {
                    return {
                        first_name: 'john',
                        last_name: 'lee'
                    };            
                },
                adapt: function(data) {
                    return {
                        full_name: data.first_name + data.last_name
                    };
                },
                ready: function() {
                    console.log(this.model); // { first_name: 'john', last_name: 'lee' }
                }
            })
        </script>
    </web-component>
    
使用

    <x-person>
    
    =>
    
    <x-person>
        <h1>johnlee</h1>
    </x-person>


### render()

將this.model跟模版組合進行渲染, 一般來說這個可以不用改

### ready()

在渲染完成後, 可以進行dom對象的操作. 
如果有異步的初始化, 可以回傳一個Promise標示什麼時候初始化完成, 如

定義

    <web-component name="x-datepicker">
        <script>
            Flipper.register({
                ready: function() {
                    var root = this;
                    var promise = new Promise(resolve, reject) {
                        setTimeout(function() {
                            $(root).datepicker();
                            resolve();
                        }, 3000);
                        
                        return promise;
                    };
                }
            })
        </script>
    </web-component>

使用

    <x-datepicker></x-datepicker>
    
    <script>
        //三秒後會執行此callback
        $('x-datepicker').on('ready', function() {
            console.log('this component is ready');
        }); 
    </script>
        
### fail() 

如果在以上任何一個階段發生錯誤, 即會觸發此事件

    Flipper.register({
        fail: function(err) {
            this.innerHTML = 'error: ' + err;
        }
    });
    
### destroy()

組件被銷燬的時候會觸發此回調函數，在這邊釋放掉記憶體
