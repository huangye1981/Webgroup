package models

import (
	"tsEngine/tsPagination"

	"github.com/astaxie/beego/orm"
)

//用户表模型
type Domain struct {
	Id     int64
	Domain string
	Time   uint64
	Sort   int64
	Note   string
	State  int64
}

func init() {
	orm.RegisterModel(new(Domain))
}

func (this *Domain) TableName() string {
	return "data_domain"
}

/************************************************************/

func (this *Domain) List(page int64, page_size int64, keyword string) (data []orm.Params, pagination *tsPagination.Pagination, err error) {

	op := orm.NewOrm().QueryTable(this)

	if keyword != "" {
		cond := orm.NewCondition().And("Domain__icontains", keyword).Or("Note__icontains", keyword)
		op = op.SetCond(cond)
	}

	count, _ := op.Count()

	pagination = tsPagination.NewPagination(page, page_size, count)

	op = op.Limit(page_size, pagination.GetOffset())

	op = op.OrderBy("Sort", "-Id")

	_, err = op.Values(&data)

	return data, pagination, err

}
