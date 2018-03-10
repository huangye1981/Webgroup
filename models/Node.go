package models

import (
	"fmt"
	"github.com/astaxie/beego/orm"
)

//用户表模型
type Node struct {
	Id          int64
	ParentId    int64
	ParentTree  string
	Icon        string
	Sort        int64
	Name        string
	Url         string
	Description string
}

func init() {
	orm.RegisterModel(new(Node))
}

func (this *Node) TableName() string {
	return "sys_node"
}

/************************************************************/

func (this *Node) Del() (err error) {

	op := orm.NewOrm()
	res, err := op.Raw("DELETE FROM `sys_node` WHERE `parent_tree` Like ?", "%"+fmt.Sprintf(",%d,", this.Id)+"%").Exec()
	//res, err := op.Raw("DELETE FROM `sys_node` WHERE `parent_tree` Like '%," + fmt.Sprintf("%d", this.Id) + "%'").Exec()

	if err != nil {
		fmt.Println("错误:", err)
		return
	}
	_, err = res.RowsAffected()
	return

}
