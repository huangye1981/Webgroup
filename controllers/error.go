package controllers

type ErrorController struct {
	BaseController
}

func (this *ErrorController) Error404() {
	this.Data["Content"] = "page not found"
	this.Display("error", false)
}

func (this *ErrorController) Error501() {
	this.Data["Content"] = "server error"
	this.Display("error", false)
}

func (this *ErrorController) ErrorDb() {
	this.Data["Content"] = "database is now down"
	this.Display("error", false)
}
