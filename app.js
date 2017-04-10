var express = require("express")
var mysql = require("mysql")

//连接 kfl 数据库 
var connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "tangshi20054",
	database: "kfl",
	port:"3305"  //端口默认3306 
})

// 启动数据库
connection.connect()

var app = express()

//设置静态资源路径
app.use(express.static("kfl"))

app.get("/getDishes", (req, res) => {
	var req = req.query
	var num = req.num
	var index = req.index 
	var searchText = req.searchText
	var sqlstr 
	if( searchText ){
		//where name like '%..%' 模糊查询
		sqlstr = "select * from kf_dish where name like '%"+ searchText +"%' or material like '%"+ searchText +"%'"
	}else{
		// 分页查询 mysql 语句
		sqlstr = "select * from kf_dish limit " + index*num + "," + num
	}
	connection.query(sqlstr, (err,result) => {
		// select * from table_name limit 0,4  分页查询数据库中表的数据
		if ( err ) throw err
		// console.log ( result )
		res.send( result )
	})
	// console.log ( num, index )
})

app.get("/getDish", (req, res) => {
	//取得前端传过来的菜的id
	var req = req.query
	var did = req.did
	// sql语句
	var sqlStr = "select * from kf_dish where did = "  + did	
	// connection.query() 根据sql查询语句 查询相关
	connection.query(sqlStr, (err, result) => {
		if ( err ) throw err
		console.log ( result )
		// 向前端发送数据
		res.send( result )
	})
})

app.get("/orderDish", (req, res) => {
	//接收订单信息
	// 拼接sql 插入语句  insert into 表名 values（值，值）
	//执行语句，并放回信息
	var req = req.query
	var dish = {
	 	user_name: req.userName,
	 	sex:  req.sex,
	 	phone: req.phone,
	 	addr:  req.addr,
	 	did: req.did
	}
	connection.query("insert into kf_order set ?", dish ,(err, result) => {
		if(err) throw err
		console.log (result.insertId)
		res.send({"result":result.insertId})
	})
	
})

app.get("/getMyOrder", (req, res) => {
	var phone = req.query.phone
	console.log (phone)
	var sqlStr = "select * from kf_order inner join kf_dish on kf_order.did = kf_dish.did where phone = '" + phone +"'"
	connection.query(sqlStr, (err, result) => {
		if (err) throw err
		console.log (result)
		res.json (result)
	})
})
app.listen(3030)
