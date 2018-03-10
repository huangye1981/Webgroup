package controllers

import (
	_ "Webgroup/models"
	_ "fmt"
	_ "strings"
	_ "time"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/httplib"
	_ "github.com/opesun/goquery"
)

type GrabController struct {
	BaseController
}

func (this *GrabController) Test() {
	url := "http://m.baidu.com/from=0/bd_page_type=1/ssid=0/uid=0/pu=usm%401%2Csz%40224_220%2Cta%40iphone___3_537/baiduid=024EF3C77B5EC1DC4720FAB8DA844FB9/w=0_10_/t=iphone/l=1/tc?ref=www_iphone&lid=3568767589894133259&order=11&fm=alop&tj=sigma_celebrity_rela_11_0_10_l1&w_qd=IlPT2AEptyoA_ykxxRIbuAWvBDu&tcplug=1&sec=28192&di=f83a632cad0b0cc3&bdenc=1&nsrc=IlPT2AEptyoA_yixCFOxCGZb8c3JV3T5ABfPNy6R2iv5nk_qva02ExEtRCT5QnvTUCGwdjObtQoDxULM3mQj9KFOrqcVt89h8kuMgPrx5KSLHxJOrhZnDsDHRyYovenggqoacNZ6GdUoB7sujvThwtg_vhKIugVv8cbXs8S5r4vPYomiZlLSmFe61YpVWSHdXurYcsn8gz6IS6zdAO4SKE8lhCYAUoIgsw0n7eAm1APO-S5u_PvOLB5oWWbDLphN2O7U04y69KS8_jAUuHlNNE5PhyiaraHIK6gyHAe3yPdGVu_JI2q0SV7KLKxYugCSGr9kHLb0seFzPWxkcEdcYikH_L_jQICGDpA9D4X-v_GhLU6pqWToM0TPoy2fD4e-Td9SBagOCHx8rnrvmeCpwZ7xNru"
	curl := httplib.Get(url)
	data, _ := curl.Bytes()
	beego.Trace(string(data))
	this.Ctx.WriteString(string(data))

}

/*
func (this *GrabController) GGmee() {
	var grab models.Grab
	var url = "http://www.ggmee.com/video/b/-1-/p1"
	p, err := goquery.ParseUrl(url)
	if err != nil {
		beego.Trace(err)
	} else {
		t := p.Find("ul.v_list li a")
		beego.Trace(t.Length())
		for i := 0; i < t.Length(); i++ {
			url := t.Eq(i).Attr("href")

			go grab.GgmeeInfo(url, i)
		}

		time.Sleep(10e9)

		//pTitle := p.Find("title").Text() //直接提取title的内容
		//fmt.Println(pTitle)

	}
	this.Ctx.WriteString("下载完毕")
}

func (this *GrabController) Haza() {
	//var grab models.Grab

	var url = this.GetString("url")

	beego.Trace(url)

	p, err := goquery.ParseUrl(url)

	if err != nil {
		beego.Trace(err)
	} else {

		img_url := "http://v.1haza.com" + p.Find("div.details-con1 img").Eq(0).Attr("data-url")

		name := p.Find("div.art-title h1").Eq(0).Text()
		beego.Trace(name)

		director := p.Find("div.synopsis p a").Eq(0).Text()
		beego.Trace(director)

		performer := p.Find("div.synopsis p").Eq(2).Text()
		performer = strings.Replace(performer, "주연：", "", -1)
		performer = strings.Replace(performer, " ", ",", -1)
		beego.Trace(performer)

		desc := p.Find("p.synopsis-article").Eq(0).Text()
		beego.Trace(desc)

		vod_url := "http://v.1haza.com" + p.Find("iframe").Eq(0).Attr("src")
		p, err = goquery.ParseUrl(vod_url)
		if err != nil {
			beego.Trace(err)
		} else {

			acfun := strings.Contains(p.Find("title").Text(), "acfun")
			vid := p.Find("source").Eq(0).Attr("src")

			if acfun {
				filename := models.Md5([]byte(fmt.Sprintf("%d", time.Now().Unix()))) + ".jpg"
				models.SaveImage(img_url, "./static/upload/movies/"+filename)

				oMovies := models.Movies{}
				oMovies.Name = name
				oMovies.Img = "/movies/" + filename
				oMovies.Type = 6
				oMovies.Category = "drama"
				oMovies.Director = director
				oMovies.Performer = performer
				oMovies.Releasetime = time.Now().Unix()
				oMovies.Updatetime = time.Now().Unix()
				oMovies.Score = 8.0
				oMovies.State = 100
				oMovies.Desc = desc
				oMovies.Md5 = models.Md5([]byte(fmt.Sprintf("%s", oMovies.Type) + oMovies.Name))
				mid, err := oMovies.Insert()
				if err != nil {
					beego.Warn("movies数据插入错误：", err)
					this.Ctx.WriteString("插入数据异常错误")
					return
				}

				oVideo := models.Video{}

				oVideo.Mid = mid
				oVideo.Title = "CD1"
				oVideo.Code = vid
				oVideo.State = 100
				oVideo.Platform = "acfun"
				oVideo.Episode = "1"

				err = oVideo.Insert()
				if err != nil {
					beego.Error("video数据插入错误：", err)
					this.Ctx.WriteString("插入数据异常错误")
					return
				}

				this.Ctx.WriteString("Video添加完毕")

			} else {
				this.Ctx.WriteString("不是acfun电影")
			}

		}

	}
	this.Ctx.WriteString("完毕")
}

func (this *GrabController) Mgtv() {

	var url = this.GetString("url")

	beego.Trace(url)

	p, err := goquery.ParseUrl(url)

	if err != nil {
		beego.Trace(err)
		this.Ctx.WriteString("地址解析失败")
	} else {

		img_url := p.Find("div.poster i img").Eq(0).Attr("src")
		beego.Trace(img_url)

		name := p.Find("div.content h1").Eq(0).Text()

		director := p.Find("p.item").Eq(1).Text()
		director = strings.Replace(director, "导演：", "", -1)
		director = strings.Replace(director, " ", "", -1)
		director = strings.Replace(director, "\n", "", -1)

		performer := p.Find("p.item").Eq(0).Text()
		performer = strings.Replace(performer, "主演：", "", -1)
		performer = strings.Replace(performer, " ", "", -1)
		performer = strings.Replace(performer, "\n", "", -1)

		desc := p.Find("p.item").Eq(4).Text()
		desc = strings.Replace(desc, "简介：", "", -1)
		desc = strings.Replace(desc, " ", "", -1)
		desc = strings.Replace(desc, "\n", "", -1)

		temp := strings.Split(p.Find("li.v-item").Eq(0).Attr("id"), "-")
		vid := temp[2]

		filename := models.Md5([]byte(fmt.Sprintf("%d", time.Now().Unix()))) + ".jpg"
		models.SaveImage(img_url, "./static/upload/movies/"+filename)

		oMovies := models.Movies{}
		oMovies.Name = name
		oMovies.Img = "/movies/" + filename
		oMovies.Type = 6
		oMovies.Category = "drama"
		oMovies.Director = director
		oMovies.Performer = performer
		oMovies.Releasetime = time.Now().Unix()
		oMovies.Updatetime = time.Now().Unix()
		oMovies.Score = 8.0
		oMovies.State = 100
		oMovies.Desc = desc
		oMovies.Md5 = models.Md5([]byte(fmt.Sprintf("%s", oMovies.Type) + oMovies.Name))
		mid, err := oMovies.Insert()
		if err != nil {
			beego.Warn("movies数据插入错误：", err)
			this.Ctx.WriteString("插入数据异常错误")
			return
		}

		oVideo := models.Video{}

		oVideo.Mid = mid
		oVideo.Title = "CD1"
		oVideo.Code = vid
		oVideo.State = 100
		oVideo.Platform = "mgtv"
		oVideo.Episode = "1"

		err = oVideo.Insert()
		if err != nil {
			beego.Error("video数据插入错误：", err)
			this.Ctx.WriteString("插入数据异常错误")
			return
		}

		this.Ctx.WriteString("Video添加完毕")

	}

}
*/
