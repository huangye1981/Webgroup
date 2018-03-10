package main

import (
	"Webgroup/controllers"
	"Webgroup/models"
	_ "Webgroup/routers"
	"tsEngine/tsDb"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	"github.com/astaxie/beego/plugins/cors"
)

func Indexaddone(index int) (index1 int) {
	index1 = index + 1
	return
}

//默认启动
func main() {

	beego.AddFuncMap("indexaddone", Indexaddone) //模板中使用{{indexaddone $index}}或{{$index|indexaddone}}

	beego.InsertFilter("*", beego.BeforeRouter, cors.Allow(&cors.Options{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"*"},
		AllowHeaders:     []string{"Origin", "Authorization", "Access-Control-Allow-Origin"},
		ExposeHeaders:    []string{"Content-Length", "Access-Control-Allow-Origin"},
		AllowCredentials: true,
	}))

	//log记录设置
	beego.SetLogger("file", `{"filename":"./logs/logs.log"}`)
	//beego.SetLevel(beego.LevelInformational)
	beego.SetLogFuncCall(true)

	//404 等错误处理
	beego.ErrorController(&controllers.ErrorController{})

	if beego.AppConfig.String("runmode") == "dev" {
		orm.Debug = true
	}

	//数据库连接
	tsDb.ConnectDb()
	models.Depth = false
	go models.WebCheck()

	beego.Run()
}
