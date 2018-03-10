//项目方法
package models

import (
	"time"
	"tsEngine/tsDb"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/httplib"
	"github.com/astaxie/beego/orm"
	"github.com/tidwall/gjson"
)

var (
	Depth = true
	list  []orm.Params
)

func WebCheck() {

	beego.Trace("====", Depth)
	db := tsDb.NewDbBase()
	o := Domain{}

	api := "http://vip.weixin139.com/weixin/qq1782882732.php?domain="

	for {

		if Depth == true {
			list, _ = db.DbList(&o, "State__lt", 2)
			Depth = false
			beego.Trace("执行了一次")
		}

		for _, v := range list {

			//创建链接
			curl := httplib.Get(api + v["Domain"].(string))

			//设置超时时间 2秒链接，3秒读数据
			curl.SetTimeout(5*time.Second, 5*time.Second)

			//获取请求的内容
			temp, err := curl.Bytes()
			if err != nil {
				beego.Error(err)
			}

			content := string(temp)
			beego.Trace(content)
			status := gjson.Get(content, "status").String()
			if status == "2" {
				o.Id = v["Id"].(int64)
				o.State = 2
				db.DbUpdate(&o, "State")
				err_msg := gjson.Get(content, "errmsg").String()
				beego.Error(err_msg)
			}
			time.Sleep(time.Second * 2)
		}
		time.Sleep(time.Second * 1)

	}
}
