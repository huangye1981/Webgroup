//不需要权限判断时候所使用的模块
package admin

import (
	"Webgroup/controllers"
	"Webgroup/models"
	_ "encoding/base64"
	"fmt"
	_ "strconv"
	"time"
	"tsEngine/tsCrypto"
	"tsEngine/tsDb"
	"tsEngine/tsFile"
	"tsEngine/tsRand"
	"tsEngine/tsTime"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/httplib"
	"github.com/astaxie/beego/validation"
)

type PublicController struct {
	controllers.BaseController
}

func (this *PublicController) Cross() {
	data := `<?xml version="1.0"?>   
<!DOCTYPE cross-domain-policy SYSTEM "http://www.adobe.com/xml/dtds/cross-domain-policy.dtd">   
<cross-domain-policy> <site-control permitted-cross-domain-policies="all" />    
    <allow-access-from domain="*" />    
    <allow-http-request-headers-from domain="*" headers="*"/>  
</cross-domain-policy> 
`
	this.Ctx.WriteString(data)

}

func (this *PublicController) GetImg() {
	src := this.GetString("Imgsrc")
	//创建链接
	curl := httplib.Get(src)

	//设置超时时间 2秒链接，3秒读数据
	curl.SetTimeout(5*time.Second, 5*time.Second)

	//获取请求的内容
	temp, err := curl.Bytes()
	if err != nil {
		beego.Error(err)
	}

	content := string(temp)
	this.Ctx.WriteString(content)

}

func (this *PublicController) Config() {
	//登录校验
	this.CheckLogin()
	db := tsDb.NewDbBase()
	//获取数据信息
	types := this.Ctx.Input.Param("0")

	switch types {

	case "Company":
		this.Result = map[string]interface{}{"Name": beego.AppConfig.String("CompanyName"), "Logo": beego.AppConfig.String("CompanyLogo"), "Tel": beego.AppConfig.String("CompanyTel"), "Web": beego.AppConfig.String("CompanyWeb")}

	case "Admin":
		o := models.Admin{}
		list, _ := db.DbList(&o)
		this.Result = list

	case "Role":
		o := models.Role{}
		list, _ := db.DbList(&o)
		this.Result = list

	case "Mode":
		o := models.Mode{}
		list, _ := db.DbList(&o)
		this.Result = list

	case "Node":
		o := models.Node{}
		list, _ := db.DbList(&o)
		this.Result = list

	default:

		company := map[string]interface{}{"Name": beego.AppConfig.String("CompanyName"), "Logo": beego.AppConfig.String("CompanyLogo"), "Tel": beego.AppConfig.String("CompanyTel"), "Web": beego.AppConfig.String("CompanyWeb")}

		oRole := models.Role{}
		role_list, _ := db.DbList(&oRole)

		oAdmin := models.Admin{}
		admin_list, _ := db.DbList(&oAdmin)

		oMode := models.Mode{}
		mode_list, _ := db.DbList(&oMode)

		oNode := models.Node{}
		node_list, _ := db.DbList(&oNode)

		this.Result = map[string]interface{}{"Company": company, "Role": role_list, "Admin": admin_list, "Mode": mode_list, "Node": node_list}

	}
	this.Code = 1
	this.TraceJson()
}

//管理员信息修改
func (this *PublicController) Info() {

	//登录校验
	this.CheckLogin()

	//过滤开发者账号
	uid, _ := beego.AppConfig.Int64("Uid")
	if this.AdminId == uid {
		this.Code = 0
		this.Msg = "参数错误"
		this.TraceJson()
	}

	//初始化
	db := tsDb.NewDbBase()
	o := models.Admin{}
	o.Id = this.AdminId

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

	if o.Mobile != "" {
		count, err := o.GetFilterCount("Mobile", o.Mobile)
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

		count, err := o.GetFilterCount("IdentityId", o.IdentityId)
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

	err = db.DbUpdate(&o, "Password", "Name", "Email", "Photo", "Sex", "Birthday", "Address", "IdentityId", "Mobile", "UpdateTime", "Note")

	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "数据库异常"
		this.Result = err
		this.TraceJson()
	}

	this.Code = 1
	this.Result = o
	this.TraceJson()

}

//获取管理员数据
func (this *PublicController) Admin() {
	//登录校验
	this.CheckLogin()

	o := models.Admin{}

	//需要获取的字段
	fileds := []string{"Id", "Name", "Role", "Sex", "Photo"}
	//排序方式
	order := []string{"Id"}

	db := tsDb.NewDbBase()

	items, err := db.DbListFields(&o, fileds, order)
	/*
		db := tsDb.NewDbBase()
		items, err := db.DbList(&o)
	*/
	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "数据库操作异常，请联系管理员"
		this.TraceJson()
	}

	this.Code = 1
	this.Result = items
	this.TraceJson()

}
