package admin

import (
	"Webgroup/controllers"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path"
	"regexp"
	"strings"
	"time"
	"tsEngine/tsCrypto"
	"tsEngine/tsFile"

	"github.com/astaxie/beego"
	"github.com/pborman/uuid"
)

type UeditorController struct {
	controllers.BaseController
}

type UploadimageUE struct {
	url      string
	title    string
	original string
	state    string
}

type List struct {
	Url string `json:"url"`
}

type Listimage struct {
	State string `json:"state"`
	List  []List `json:"list"`
	Start int    `json:"start"`
	Total int    `json:"total"`
}

type ListCatch struct {
	Url    string `json:"url"`
	Source string `json:"source"`
	State  string `json:"state"`
}

type Catchimage struct {
	State string      `json:"state"`
	List  []ListCatch `json:"list"`
}

func (this *UeditorController) Config() {

	src, err := tsFile.ReadFile("conf/config.json")
	if err != nil {
		beego.Error(err)
	}

	re, _ := regexp.Compile("\\/\\*[\\S\\s]+?\\*\\/")

	//参考php的$CONFIG = json_decode(preg_replace("/\/\*[\s\S]+?\*\//", "", file_get_contents("config.json")), true);
	//将php中的正则移植到go中，需要将/ \/\*[\s\S]+?\*\/  /去掉前后的/，然后将\改成2个\\
	//参考//去除所有尖括号内的HTML代码，并换成换行符
	// re, _ = regexp.Compile("\\<[\\S\\s]+?\\>")
	// src = re.ReplaceAllString(src, "\n")
	//当把<和>换成/*和*\时，斜杠/和*之间加双斜杠\\才行。
	src = re.ReplaceAllString(src, "")
	tt := []byte(src)

	var r interface{}
	json.Unmarshal(tt, &r) //这个byte要解码
	this.Data["json"] = r
	this.ServeJSON()
}

func (this *UeditorController) UploadFile() {
	var t int64 = time.Now().Unix()
	var s string = time.Unix(t, 0).Format("2006-01-02")

	dir := fmt.Sprintf("./static/upload/ueditor/files/%s", s)

	err := os.MkdirAll(dir, 0777) //..代表本当前exe文件目录的上级，.表示当前目录，没有.表示盘的根目录
	if err != nil {
		beego.Error(err)
	}
	//保存上传的图片
	//获取上传的文件，直接可以获取表单名称对应的文件名，不用另外提取
	_, h, err := this.GetFile("upfile")
	if err != nil {
		beego.Error(err)
	}

	beego.Trace(h)
	file := dir + "/" + h.Filename //tsCrypto.GetMd5([]byte(h.Filename))

	err = this.SaveToFile("upfile", file) //.Join("attachment", attachment)) //存文件    WaterMark(path)    //给文件加水印
	if err != nil {
		beego.Error(err)
	}

	file = strings.Replace(file, "./", "/", -1)
	this.Data["json"] = map[string]interface{}{"state": "SUCCESS", "url": file, "title": h.Filename, "original": h.Filename}
	this.ServeJSON()
}

func (this *UeditorController) UploadImage() {
	var t int64 = time.Now().Unix()
	var s string = time.Unix(t, 0).Format("2006-01-02")

	dir := fmt.Sprintf("./static/upload/ueditor/images/%s", s)

	err := os.MkdirAll(dir, 0777) //..代表本当前exe文件目录的上级，.表示当前目录，没有.表示盘的根目录
	if err != nil {
		beego.Error(err)
	}
	//保存上传的图片
	//获取上传的文件，直接可以获取表单名称对应的文件名，不用另外提取
	_, h, err := this.GetFile("upfile")
	if err != nil {
		beego.Error(err)
	}

	beego.Trace(h)
	file := dir + "/" + h.Filename //tsCrypto.GetMd5([]byte(h.Filename))

	err = this.SaveToFile("upfile", file) //.Join("attachment", attachment)) //存文件    WaterMark(path)    //给文件加水印
	if err != nil {
		beego.Error(err)
	}

	file = strings.Replace(file, "./", "/", -1)
	this.Data["json"] = map[string]interface{}{"state": "SUCCESS", "url": file, "title": h.Filename, "original": h.Filename}
	this.ServeJSON()
}

func (this *UeditorController) UploadVideo() {
	var t int64 = time.Now().Unix()
	var s string = time.Unix(t, 0).Format("2006-01-02")

	dir := fmt.Sprintf("./static/upload/ueditor/videos/%s", s)

	err := os.MkdirAll(dir, 0777) //..代表本当前exe文件目录的上级，.表示当前目录，没有.表示盘的根目录
	if err != nil {
		beego.Error(err)
	}
	//保存上传的图片
	//获取上传的文件，直接可以获取表单名称对应的文件名，不用另外提取
	_, h, err := this.GetFile("upfile")
	if err != nil {
		beego.Error(err)
	}

	beego.Trace(h)
	file := dir + "/" + h.Filename //tsCrypto.GetMd5([]byte(h.Filename))

	err = this.SaveToFile("upfile", file) //.Join("attachment", attachment)) //存文件    WaterMark(path)    //给文件加水印
	if err != nil {
		beego.Error(err)
	}

	file = strings.Replace(file, "./", "/", -1)
	this.Data["json"] = map[string]interface{}{"state": "SUCCESS", "url": file, "title": h.Filename, "original": h.Filename}
	this.ServeJSON()
}

func (this *UeditorController) UploadScrawl() {

	photo := this.Input().Get("upfile")
	beego.Trace(photo)
	var t int64 = time.Now().Unix()
	var s string = time.Unix(t, 0).Format("2006-01-02")

	dir := fmt.Sprintf("./static/upload/ueditor/images/%s", s)

	filename := tsCrypto.GetMd5([]byte(fmt.Sprintf("%d", time.Now().Unix())))

	path, err := tsFile.WriteImgFile(dir, filename, photo)

	if err != nil {
		beego.Error(err)
	}
	this.Data["json"] = map[string]interface{}{
		"state":    "SUCCESS",
		"url":      path,
		"title":    filename + ".jpg",
		"original": filename + ".jpg",
	}
	this.ServeJSON()
}

func (this *UeditorController) ListImage() {

	/* 获取参数 */
	start, _ := this.GetInt("start")
	size, _ := this.GetInt("size")

	/* 获取图片列表 */
	file_list, _ := tsFile.Filelist("./static/upload/ueditor/images")

	var listimage Listimage

	if len(file_list) == 0 {
		listimage.State = "no match file"
		listimage.Start = start
		listimage.Total = 0
		this.Data["json"] = listimage
		this.ServeJSON()
		return
	}

	listimage.State = "SUCCESS"
	listimage.Start = start
	listimage.Total = len(file_list)

	if start > 0 {
		start = start - 1
	}
	end := start + size
	if end > listimage.Total {
		end = listimage.Total
	}

	var temp List
	for i := start; i < end; i++ {
		temp.Url = "/" + file_list[i]
		temp.Url = strings.Replace(temp.Url, "\\", "/", -1)
		listimage.List = append(listimage.List, temp)
	}

	this.Data["json"] = listimage
	this.ServeJSON()
}

func (this *UeditorController) CatchImage() {
	list := []ListCatch{
		{"/static/upload/1.jpg", "https://pic2.zhimg.com/7c4a389acaa008a6d1fe5a0083c86975_b.png", "SUCCESS"},
		{"/static/upload/2.jpg", "https://pic2.zhimg.com/7c4a389acaa008a6d1fe5a0083c86975_b.png", "SUCCESS"},
	}
	catchimage := Catchimage{"SUCCESS", list}
	this.Data["json"] = catchimage
	this.ServeJSON()

	file, header, err := this.GetFile("source") // r.FormFile("upfile")
	beego.Info(header.Filename)
	if err != nil {
		panic(err)
	}
	defer file.Close()
	filename := strings.Replace(uuid.NewUUID().String(), "-", "", -1) + path.Ext(header.Filename)
	err = os.MkdirAll(path.Join("static", "upload"), 0775)
	if err != nil {
		panic(err)
	}
	outFile, err := os.Create(path.Join("static", "upload", filename))
	if err != nil {
		panic(err)
	}
	defer outFile.Close()
	io.Copy(outFile, file)
}
