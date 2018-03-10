package models

import (
	"github.com/astaxie/beego/orm"
	"tsEngine/tsPagination"
)

//用户表模型
type Logs struct {
	Id         int64
	AdminId    int64
	Mode       int64
	Action     int64
	Pass       int
	Ip         string
	Content    string
	CreateTime uint64
}

func init() {
	orm.RegisterModel(new(Logs))
}

func (this *Logs) TableName() string {
	return "sys_logs"
}

/************************************************************/

func (this *Logs) List(page int64, page_size int64, keyword string) (data []orm.Params, pagination *tsPagination.Pagination, err error) {

	op := orm.NewOrm().QueryTable(this)

	if keyword != "" {
		op = op.Filter("Content__icontains", keyword)
	}

	count, _ := op.Count()

	pagination = tsPagination.NewPagination(page, page_size, count)

	op = op.Limit(page_size, pagination.GetOffset())

	op = op.OrderBy("-Id")

	_, err = op.Values(&data)

	return data, pagination, err
}
