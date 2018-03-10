package models

import (
	"tsEngine/tsPagination"

	"github.com/astaxie/beego/orm"
)

//管理员表模型
type Admin struct {
	Id         int64  //编号
	Username   string //用户名
	Password   string //用户密码
	Role       string //角色
	Name       string //真实姓名
	Sex        int64  //性别 1：男 2：女
	Birthday   uint64 //出生日期
	Photo      string //照片
	Email      string //邮箱地址
	Address    string //员工地址
	IdentityId string //身份证号
	Mobile     string //手机号码
	LoginIp    string //登陆IP
	LoginTime  uint64 //登陆时间
	Status     int64  // 1:启用 2：停用
	Note       string //备注
	CreateTime uint64 //创建时间
	UpdateTime uint64 //更新时间
}

func init() {
	orm.RegisterModel(new(Admin))
}

func (this *Admin) TableName() string {
	return "sys_admin"
}

/************************************************************/

func (this *Admin) GetCount(field string, value ...interface{}) (count int64, err error) {

	op := orm.NewOrm().QueryTable(this)
	op = op.Filter(field, value)
	op = op.Exclude("Id", this.Id)
	count, err = op.Count()
	return count, err
}

func (this *Admin) GetFilterCount(field string, value interface{}) (count int64, err error) {

	op := orm.NewOrm().QueryTable(this)
	op = op.Filter(field, value)
	op = op.Exclude("Id", this.Id)
	count, err = op.Count()
	return count, err
}

func (this *Admin) List(page int64, page_size int64, keyword string) (data []orm.Params, pagination *tsPagination.Pagination, err error) {

	op := orm.NewOrm().QueryTable(this)

	if this.Status > 0 {
		op = op.Filter("Status", this.Status)
	}

	if this.Username != "" {
		op = op.Filter("Username__icontains", this.Username)
	}

	if this.Name != "" {
		op = op.Filter("Name__icontains", this.Name)
	}

	if this.Sex > 0 {
		op = op.Filter("Sex", this.Sex)
	}

	if this.IdentityId != "" {
		op = op.Filter("IdentityId", this.IdentityId)
	}

	if this.Mobile != "" {
		op = op.Filter("Mobile", this.Mobile)
	}

	if this.Status > 0 {
		op = op.Filter("Status", this.Status)
	}

	count, _ := op.Count()

	pagination = tsPagination.NewPagination(page, page_size, count)

	op = op.Limit(page_size, pagination.GetOffset())

	op = op.OrderBy("-Id")

	_, err = op.Values(&data)

	return data, pagination, err

}
