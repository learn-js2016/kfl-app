angular.module("myApp",["ng","ngRoute"])
    .controller("startCtrl", function($timeout,$location) {
        $timeout( () => {
            $location.path("/main")
        },2000)
    })
    .controller("mainCtrl", function($scope,$http) {
        var num = 4
        var index = 0
        function getDishes () {
            // 加载中
            $scope.loadStatus = 2
            $http({
                url: "/getDishes",
                method: "get",
                params: {
                    num: num,  // params用于后端分页查询条件
                    index: index,
                    searchText: $scope.searchText
                },
            }).success( (data) => {
                // console.log ( data )
                //数组拼接
                $scope.dishes = $scope.dishes.concat(data)
                index++ 
                //全部查询出时  => 没有更多了
                if( data.length == 0 ){
                     $scope.loadStatus = 3
                }else{
                    // => 加载更多
                    $scope.loadStatus = 1
                }
            })
        }
        $scope.dishes = []
        $scope.searchText = ''
        $scope.loadStatus = 1 //1  未加载   2 加载中  3 没有更多
        $scope.getMoreDishes = () => {
            getDishes()
        }
        getDishes()
        $scope.searchDishes = (e) => {
            // console.log(e)
            if ( e.keyCode == 13 ) {
                //关键字搜索
                if( $scope.searchText ) {
                    $http({
                        url: "/getDishes",
                        method: "get",
                        params: {
                            num: num,
                            index: index,
                            searchText: $scope.searchText
                        },
                    }).success( (data) => {
                        $scope.dishes = data
                        index = 0
                        $scope.loadStatus = 3
                    })
                }else {
                    //搜索关键字为空时
                    $scope.dishes = []   //清空页面
                    index = 0   // 重置下标 防止连续触发 index自增
                    getDishes() 
                }
            }
        }
        
    })
    .controller("detialCtrl", function($scope,$routeParams,$http) {
        $scope.dish = {}
        var did = $routeParams.did
        // 根据菜id向后端发送请求
        $http({
            url: '/getDish',
            method: 'get',
            params: {
                did: did
            }
        }).success( (data) => {
            // console.log (data)
            $scope.dish = data[0]
        })
    })
    .controller("orderCtrl", function($scope,$routeParams,$http,$timeout,$location) {
        function SetLocalStorage(key,value) {
            localStorage.setItem("kfl_" + key,value)
        }
        function GetLocalStorage(key) {
            return localStorage.getItem("kfl_" + key)
        }
        $scope.msg = ""
        $scope.username = GetLocalStorage("userName")
        $scope.sex = GetLocalStorage("sex")
        $scope.phone = GetLocalStorage("phone")
        $scope.addr = GetLocalStorage("addr")
        $scope.orderDish = () => {
            var username = $scope.username
            var sex = $scope.sex
            var phone = $scope.phone
            var addr = $scope.addr
            if (username == '') {
                showMsg ("联系人")
                return
            } 
            if(sex == ''){
                showMsg('性别')
                return
            } 
            if(phone == '') {
                showMsg("电话号码")
                return
            } 
            if(addr == '') {
                showMsg("联系地址")
                return
            }

            $http({
                url: "orderDish",
                method: "get",
                params: {
                    "userName": username,
                    "sex": sex,
                    "phone": phone,
                    "addr": addr,
                    "did": did
                }
            }).success( (data) => {
                // 如果插入成功
                // 保存用户输入信息到localStorage
                if (data.result > 0) {
                    SetLocalStorage("userName",username)
                    SetLocalStorage("sex",sex)
                    SetLocalStorage("phone",phone)
                    SetLocalStorage("addr",addr)

                    $location.path("/myOrder")
                }
                // 1.给出成功提示，并且跳转页面到订购清单
            })

            function showMsg(msg) {
                $scope.msg = msg
                $timeout( () => {
                    $scope.msg = ""
                },3000)
            }
        }
        var did = $routeParams.did
    })
    .controller("myOrderCtrl", function($scope,$routeParams,$http) {
        $scope.hasOrder = false
        function GetLocalStorage(key) {
            return localStorage.getItem("kfl_" + key)
        }
        var phone = GetLocalStorage("phone")
        console.log (phone)
        if(phone != null) {
            $http({
                url: 'getMyOrder',
                method: "get",
                params: {
                    phone: phone
                }
            }).success( (data) => {
                //console.log (data)
                $scope.hasOrder = true 
                $scope.orders = data
            })
        }else {
           $scope.hasOrder = false 
        }

    })
    .config(function ($routeProvider) {
        $routeProvider
        	.when("/start",  {
        		templateUrl: "template/start.html",
        		controller: "startCtrl"
        	})
        	.when("/main",{
        		templateUrl: "template/main.html",
        		controller: "mainCtrl"
        	})
        	.when("/detial/:did", {
        		templateUrl: "template/detial.html",
        		controller: "detialCtrl"
        	})
        	.when("/order/:did", {
        		templateUrl: "template/order.html",
        		controller: "orderCtrl"
        	})
			.when("/myOrder", {
                templateUrl: "template/myOrder.html",
                controller: "myOrderCtrl"
			})
			.when("/",{
				redirectTo: "/start"
			})
    })