package models

const (

	//****************返回值****************************
	SuccessProto int = 1 // 成功
	ErrorProto   int = 2 // 错误
	ParamError   int = 3 // http请求参数错误
	DbError      int = 4 // 数据库错误
	Loading      int = 5 // 加载中

	ConnectServerError  int = 6  // 链接服务器错误
	UserNameNoOnly      int = 7  // 用户名称必须唯一
	AccountAndPwdError  int = 8  // 帐号或密码错误
	PwdNoSame           int = 9  // 两次密码不同
	UserNameFormatError int = 10 // 用户名称格式错误
	UserPWDFormatError  int = 11 // 用户密码错误
	NoLogin             int = 12 // 没有登录
	NoPermission        int = 13 // 权限不足，请联系管理员
	OrderStatusError    int = 14 // 不可以删除该状态下的订单
	UsernameRootError   int = 15 // root 为系统保留账号不可以注册
	IpBanError          int = 16 // 管理员已经屏蔽此ip访问
	OldPasswordError    int = 17 // 原始密码错误，修改失败
	PhotoUploadError    int = 18 // 照片上传失败

)
