package models

import (
	"github.com/astaxie/beego/orm"
)

//统计表模型
type Setting struct {
	Id       int64  //编号
	Weight   int64  //权重
	Web      string //网站
	Url      string //网址
	Redirect string //跳转地址
	Count    int64  //跳转次数
	State    int64  //状态
	Begin    int64  //开始时间
	End      int64  //结束时间
	Time     int64  //操作时间

}

func init() {
	orm.RegisterModel(new(Setting))
}

func (this *Setting) TableName() string {
	return "data_setting"
}
