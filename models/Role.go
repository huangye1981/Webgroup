package models

import (
	"github.com/astaxie/beego/orm"
	"tsEngine/tsPagination"
)

//用户表模型
type Role struct {
	Id          int64
	Name        string
	Permission  string
	Node        string
	System      string
	Description string
}

func init() {
	orm.RegisterModel(new(Role))
}

func (this *Role) TableName() string {
	return "sys_role"
}

func (this *Role) List(page int64, page_size int64, keyword string) (data []orm.Params, pagination *tsPagination.Pagination, err error) {

	op := orm.NewOrm().QueryTable(this)

	if keyword != "" {
		cond := orm.NewCondition().And("Name__icontains", keyword).Or("Description__icontains", keyword)
		op = op.SetCond(cond)
	}

	count, _ := op.Count()

	pagination = tsPagination.NewPagination(page, page_size, count)

	op = op.Limit(page_size, pagination.GetOffset())

	op = op.OrderBy("-Id")

	_, err = op.Values(&data)

	return data, pagination, err

}
