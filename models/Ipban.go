package models

import (
	"github.com/astaxie/beego/orm"
	"tsEngine/tsPagination"
)

//用户表模型
type Ipban struct {
	Id          int64
	Ip          string
	Start       uint64
	End         uint64
	Description string
	AdminId     int64
	CreateTime  uint64
	UpdateTime  uint64
}

func init() {
	orm.RegisterModel(new(Ipban))
}

func (this *Ipban) TableName() string {
	return "sys_ipban"
}

/************************************************************/

func (this *Ipban) List(page int64, page_size int64, keyword string) (data []orm.Params, pagination *tsPagination.Pagination, err error) {

	op := orm.NewOrm().QueryTable(this)

	if keyword != "" {
		cond := orm.NewCondition().And("Ip__icontains", keyword).Or("Description__icontains", keyword)
		op = op.SetCond(cond)
	}

	count, _ := op.Count()

	pagination = tsPagination.NewPagination(page, page_size, count)

	op = op.Limit(page_size, pagination.GetOffset())

	op = op.OrderBy("-Id")

	_, err = op.Values(&data)

	return data, pagination, err

}
