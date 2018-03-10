package models

import (
	"github.com/astaxie/beego/orm"
	"tsEngine/tsPagination"
)

//统计表模型
type Statistics struct {
	Id       int64  //编号
	Url      string //网址
	Redirect string //跳转地址
	Time     int64  //时间

}

func init() {
	orm.RegisterModel(new(Statistics))
}

func (this *Statistics) TableName() string {
	return "data_statistics"
}

/************************************************************/

func (this *Statistics) List(page int64, page_size int64, keyword string) (data []orm.Params, pagination *tsPagination.Pagination, err error) {

	op := orm.NewOrm().QueryTable(this)

	count, _ := op.Count()

	pagination = tsPagination.NewPagination(page, page_size, count)

	op = op.Limit(page_size, pagination.GetOffset())

	op = op.OrderBy("-Id")

	_, err = op.Values(&data)

	return data, pagination, err

}
