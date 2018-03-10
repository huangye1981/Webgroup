//管理员管理
package admin

import (
	"Webgroup/controllers"
	"Webgroup/models"
	"fmt"
	"tsEngine/tsCrypto"
	"tsEngine/tsDb"
	"tsEngine/tsFile"
	"tsEngine/tsRand"
	"tsEngine/tsString"
	"tsEngine/tsTime"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/validation"
)

type AdminController struct {
	controllers.BaseController
}

//类似构造函数
func (this *AdminController) Prepare() {
	//权限判断
	this.CheckPermission()
}

//管理员列表
func (this *AdminController) List() {

	Keyword := this.GetString("Keyword")
	Page, _ := this.GetInt64("Page")
	PageSize, _ := this.GetInt64("PageSize")

	o := models.Admin{}

	o.Username = this.GetString("Username")
	o.Name = this.GetString("Name")
	o.Status, _ = this.GetInt64("Status")

	items, pagination, err := o.List(Page, PageSize, Keyword)

	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "数据库异常错误，请联系管理员"
		this.TraceJson()
	}

	this.Code = models.SuccessProto
	this.Result = map[string]interface{}{"Items": items, "Pagination": pagination}
	this.TraceJson()

}

//管理员信息
func (this *AdminController) View() {

	//初始化
	db := tsDb.NewDbBase()
	o := models.Admin{}

	//获取get数据
	o.Id = tsString.ToInt64(this.Ctx.Input.Param("0"))
	if o.Id <= 0 {

		this.Code = 0
		this.Msg = "参数错误"
		this.TraceJson()
	}

	err := db.DbGet(&o)
	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "参数错误"
		this.TraceJson()
	}
	this.Code = 1
	this.Result = o
	this.TraceJson()

}

//管理员编辑
func (this *AdminController) Add() {

	var err error
	o := models.Admin{}
	o.Username = this.GetString("Username")
	//过滤开发者账号
	if o.Username == beego.AppConfig.String("Username") {
		this.Code = 0
		this.Msg = "参数错误"
		this.TraceJson()
	}
	o.Password = this.GetString("Password")
	ConfirmPassword := this.GetString("ConfirmPassword")
	o.Status, _ = this.GetInt64("Status")

	o.Role = "," + this.GetString("Role") + ","

	o.Name = this.GetString("Name")
	o.Sex, _ = this.GetInt64("Sex")
	o.Birthday = tsTime.StringToSe(this.GetString("Birthday"), 4)

	o.Email = this.GetString("Email")
	o.IdentityId = this.GetString("IdentityId")
	o.Mobile = this.GetString("Mobile")
	o.Address = this.GetString("Address")
	o.Note = this.GetString("Note")

	//****************************************************
	//数据验证

	valid := validation.Validation{}

	//用户名验证
	valid.Required(o.Username, "Username").Message("登录账号不能为空")
	valid.MinSize(o.Username, 6, "UserNameMin").Message("登录账号不能小于6位")
	valid.MaxSize(o.Username, 20, "UserNameMax").Message("登录账号不能大于20位")
	valid.AlphaDash(o.Username, "UserNameAlphaDash").Message("登录账号不符合规定，只能使用字符或数字或横杠-_")
	//密码验证
	valid.Required(o.Password, "Password").Message("密码不能为空")
	valid.MinSize(o.Password, 6, "PasswordMin").Message("密码不能小于6位")
	valid.MaxSize(o.Password, 50, "PasswordMax").Message("密码不能大于50位")
	if o.Password != ConfirmPassword {
		this.Code = 0
		this.Msg = "两次密码不一致"
		this.TraceJson()
	}
	valid.Range(int(o.Status), 1, 2, "Status").Message("状态类型错误[1,2]")

	if o.Name != "" {
		valid.MaxSize(o.Name, 10, "Name").Message("真实姓名过长")
	}

	if o.Sex > 0 {
		valid.Range(int(o.Sex), 1, 2, "Sex").Message("性别选择错误[1,2]")
	}

	if o.Email != "" {
		valid.Email(o.Email, "Email").Message("邮箱地址不符合规则")
	}

	if o.Mobile != "" {
		valid.Mobile(o.Mobile, "Mobile").Message("手机号码不符合规则")
	}

	if valid.HasErrors() {
		// 如果有错误信息，证明验证没通过
		// 打印错误信息
		for _, err := range valid.Errors {
			this.Code = 0
			this.Msg = err.Message
			this.TraceJson()
		}

	}

	photo := this.GetString("Photo")

	if len(photo) > 255 {
		filename := tsCrypto.GetMd5([]byte(fmt.Sprintf("%d%d", tsTime.CurrMs(), tsRand.RandInt(0, 10000))))
		path, err := tsFile.WriteImgFile("./static/upload/", filename, photo)
		if err != nil {
			beego.Debug(err)
		}
		o.Photo = path
	}

	o.Password = tsCrypto.GetMd5([]byte(o.Password + beego.AppConfig.String("PasswordKey")))
	o.CreateTime = tsTime.CurrSe()
	o.UpdateTime = o.CreateTime

	db := tsDb.NewDbBase()

	admin := models.Admin{}

	if o.Username != "" {

		count, err := db.DbCount(&admin, "Username", o.Username)
		if err != nil {
			this.Code = 0
			this.Msg = "数据库错误"
			this.TraceJson()
		}
		if count > 0 {

			this.Code = 0
			this.Msg = "登录账号已经存在"
			this.TraceJson()
		}
	}

	if o.Mobile != "" {
		count, err := db.DbCount(&admin, "Mobile", o.Mobile)
		if err != nil {
			this.Code = 0
			this.Msg = "数据库错误"
			this.TraceJson()
		}
		if count > 0 {

			this.Code = 0
			this.Msg = "手机号已经存在"
			this.TraceJson()
		}
	}

	if o.IdentityId != "" {

		count, err := db.DbCount(&admin, "IdentityId", o.IdentityId)
		if err != nil {
			this.Code = 0
			this.Msg = "数据库错误"
			this.TraceJson()
		}
		if count > 0 {

			this.Code = 0
			this.Msg = "身份证号码已经存在"
			this.TraceJson()
		}
	}

	_, err = db.DbInsert(&o)
	if err != nil {
		this.Code = 0
		this.Msg = "数据库错误"
		this.TraceJson()
	}

	this.Code = models.SuccessProto
	this.TraceJson()

}

//管理员编辑
func (this *AdminController) Edit() {

	//初始化
	db := tsDb.NewDbBase()
	o := models.Admin{}

	//获取get数据
	o.Id = tsString.ToInt64(this.Ctx.Input.Param("0"))
	if o.Id > 0 {
		err := db.DbGet(&o)
		if err != nil {
			beego.Error(err)
			this.Code = 0
			this.Msg = "参数错误"
			this.TraceJson()
		}

		o.Password = ""
		this.Code = 1
		this.Result = o
		this.TraceJson()
	}

	//获取post数据
	o.Id, _ = this.GetInt64("Id")
	err := db.DbRead(&o)
	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "无法找到该记录"
		this.TraceJson()
	}

	old_password := o.Password

	o.Username = this.GetString("Username")
	//过滤开发者账号
	if o.Username == beego.AppConfig.String("Username") {
		this.Code = 0
		this.Msg = "参数错误"
		this.TraceJson()
	}
	o.Password = this.GetString("Password")
	ConfirmPassword := this.GetString("ConfirmPassword")
	o.Status, _ = this.GetInt64("Status")
	o.Role = "," + this.GetString("Role") + ","

	o.Name = this.GetString("Name")
	o.Sex, _ = this.GetInt64("Sex")
	o.Birthday = tsTime.StringToSe(this.GetString("Birthday"), 4)

	o.Email = this.GetString("Email")
	o.IdentityId = this.GetString("IdentityId")
	o.Mobile = this.GetString("Mobile")
	o.Address = this.GetString("Address")
	o.Note = this.GetString("Note")

	//****************************************************
	//数据验证
	valid := validation.Validation{}
	//用户名验证
	valid.Required(o.Username, "Username").Message("登录账号不能为空")
	valid.MinSize(o.Username, 6, "UserNameMin").Message("登录账号不能小于6位")
	valid.MaxSize(o.Username, 20, "UserNameMax").Message("登录账号不能大于20位")
	valid.AlphaDash(o.Username, "UserNameAlphaDash").Message("登录账号不符合规定，只能使用字符或数字或横杠-_")
	//密码验证
	if o.Password != "" {
		valid.Required(o.Password, "Password").Message("密码不能为空")
		valid.MinSize(o.Password, 6, "PasswordMin").Message("密码不能小于6位")
		valid.MaxSize(o.Password, 50, "PasswordMax").Message("密码不能大于50位")
		if o.Password != ConfirmPassword {
			this.Code = 0
			this.Msg = "两次密码不一致"
			this.TraceJson()
		}

		o.Password = tsCrypto.GetMd5([]byte(o.Password + beego.AppConfig.String("PasswordKey")))

	} else {
		o.Password = old_password
	}
	valid.Range(int(o.Status), 1, 2, "Status").Message("状态类型错误[1,2]")

	if o.Name != "" {
		valid.MaxSize(o.Name, 10, "Name").Message("真实姓名过长")
	}

	if o.Sex > 0 {
		valid.Range(int(o.Sex), 1, 2, "Sex").Message("性别选择错误[1,2]")
	}

	if o.Email != "" {
		valid.Email(o.Email, "Email").Message("邮箱地址不符合规则")
	}

	if o.Mobile != "" {
		valid.Mobile(o.Mobile, "Mobile").Message("手机号码不符合规则")
	}

	if valid.HasErrors() {
		// 如果有错误信息，证明验证没通过
		// 打印错误信息
		for _, err := range valid.Errors {
			this.Code = 0
			this.Msg = err.Message
			this.TraceJson()
		}

	}

	photo := this.GetString("Photo")
	if len(photo) > 255 && photo != o.Photo {
		filename := tsCrypto.GetMd5([]byte(fmt.Sprintf("%d%d", tsTime.CurrMs(), tsRand.RandInt(0, 10000))))
		path, err := tsFile.WriteImgFile("./static/upload/", filename, photo)
		if err != nil {
			beego.Error(err)
			this.Code = 0
			this.Msg = "照片上传异常错误，请联系管理员"
			this.TraceJson()
		}

		//上传成功后删除原始图片
		if o.Photo != "" {
			tsFile.DelFile("." + o.Photo) //删除文件
		}

		o.Photo = path

	}

	admin := models.Admin{}
	admin.Id = o.Id

	if o.Username != "" {
		count, err := admin.GetFilterCount("Username", o.Username)
		if err != nil {
			this.Code = 0
			this.Msg = "数据库错误"
			this.TraceJson()
		}
		if count > 0 {
			this.Code = 0
			this.Msg = "登录账号已经存在不可以使用"
			this.TraceJson()
		}
	}

	if o.Mobile != "" {
		count, err := admin.GetFilterCount("Mobile", o.Mobile)
		if err != nil {
			this.Code = 0
			this.Msg = "数据库错误"
			this.TraceJson()
		}
		if count > 0 {

			this.Code = 0
			this.Msg = "手机号已经存在不可以使用"
			this.TraceJson()
		}
	}

	if o.IdentityId != "" {

		count, err := admin.GetFilterCount("IdentityId", o.IdentityId)
		if err != nil {
			this.Code = 0
			this.Msg = "数据库错误"
			this.TraceJson()
		}
		if count > 0 {

			this.Code = 0
			this.Msg = "身份证号码已经存在"
			this.TraceJson()
		}
	}

	o.UpdateTime = tsTime.CurrSe()
	err = db.DbUpdate(&o)
	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "数据更新错误，请联系管理员"
		this.TraceJson()
	}
	this.Code = 1
	this.Result = o
	this.TraceJson()

}

//管理员删除
func (this *AdminController) Del() {

	db := tsDb.NewDbBase()
	o := models.Admin{}
	o.Id, _ = this.GetInt64("Id")
	err := db.DbRead(&o)
	if err != nil {
		beego.Debug(err)
		this.Code = 0
		this.Msg = "无法找到该记录"
		this.TraceJson()
	}
	if o.Photo != "" {
		tsFile.DelFile("." + o.Photo) //删除文件
	}

	//**********************************************

	err = db.DbDel(&o)

	if err != nil {
		beego.Debug(err)
		this.Code = 0
		this.Msg = "数据库异常错误，请联系管理员"
		this.TraceJson()
	}

	this.Code = 1
	this.TraceJson()

}
