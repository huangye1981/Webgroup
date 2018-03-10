package models

import (
	"tsEngine/tsPagination"

	"github.com/astaxie/beego/orm"
)

//用户表模型
type Files struct {
	Id          int64
	Title       string
	Keywords    string
	Description string
	Href        string
	Content     string
	Note        string
	Time        uint64
	Sort        int64
}

func init() {
	orm.RegisterModel(new(Files))
}

func (this *Files) TableName() string {
	return "data_files"
}

/************************************************************/

func (this *Files) List(page int64, page_size int64, keyword string) (data []orm.Params, pagination *tsPagination.Pagination, err error) {

	op := orm.NewOrm().QueryTable(this)

	if keyword != "" {
		cond := orm.NewCondition().And("Title__icontains", keyword).Or("Keywords__icontains", keyword).Or("Description__icontains", keyword)
		op = op.SetCond(cond)
	}

	count, _ := op.Count()

	pagination = tsPagination.NewPagination(page, page_size, count)

	op = op.Limit(page_size, pagination.GetOffset())

	op = op.OrderBy("Sort", "-Id")

	_, err = op.Values(&data)

	return data, pagination, err

}
