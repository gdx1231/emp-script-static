var _EWA_EVENT_MSG = new Object();
_EWA_EVENT_MSG['ValidCodeError'] = "验证码错误";
_EWA_EVENT_MSG['EWA_DELETE'] = "您确认要删除么？ ";
_EWA_EVENT_MSG['OnTreeNodeNew'] = "新节点";
_EWA_EVENT_MSG['OnTreeNodeDelete'] = "您确认要删除么？ ";
_EWA_EVENT_MSG['OnTreeNodeDeleteHaveChildren'] = "还有子目录，不能删除。 ";
_EWA_EVENT_MSG['OnTreeNodeNameRepeat'] = "名称重复，请修改";
_EWA_EVENT_MSG['IdempotanceError'] = "请勿重复提交";
var _EWA_INFO_MSG = {
	"EWA.SYS.CHOOSE_ITEM_TITLE": "操作提示",
	"EWA.SYS.CHOOSE_ITEM": "请选择您要操作的内容",
	"EWA.SYS.DATASEARCH": "检索",
	"EWA.SYS.INVALID_NUMBER_FORMAT": "数字格式错误！",
	"EWA.SYS.ERROR": "系统执行错误！",
	"EWA.F.VAILD": "验证码输入错误",
	"EWA.F.PASSWORD": "密码不一致",
	"EWA.LF.SEARCH.BUT.TITLE": "数据查询",
	"EWA.LF.SEARCH.BUT.CLEAR": "清空",
	"EWA.LF.SEARCH.BUT.SEARCH": "查询",
	"EWA.LF.SEARCH.BUT.CLOSE": "关闭",
	"EWA.LF.DOWN_DATA.DENY": "没有下载数据权限",
	"BUT.OK": "确定",
	"BUT.CANCEL": "取消",
	"BUT.YES": "是",
	"BUT.NO": "否",
	"DeleteBefore": "您确认要删除么？",
	"DeleteAfter": "删除成功!",
	"UpdateAfter": "更新成功!",
	"CommonTitle": "您确认么!",
	"EWA_MTYPE_N": "新建",
	"EWA_MTYPE_M": "修改",
	"EWA_MTYPE_C": "复制到",
	"RECYCLE": "回收站"
};
var _EWA_VALIDS = {
	EMAIL: { MSG: "请用aa@bb.cn格式", REGEX: /^$|^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/ }
	, ALPHA: { MSG: "只能由数字和字母组成", REGEX: /^[\w]*$/g }
	, DIGIT: { MSG: "只能由数字组成", REGEX: /^$|^[-+]?\d+(\.\d*)?$/ }
	, DURATION: { MSG: "格式错误", REGEX: /^$|^(\d{1,2}:)?[0-5][0-9]:[0-5][0-9]$/ }
	, MOBILE: { MSG: "手机格式错误", REGEX: /^$|^(13|14|15|16|17|18|19)([0-9]{9})$/ }
	, PHONE: { MSG: "座机格式错误，区号或分机用-分隔", REGEX: /^$|^((\+?[0-9]{2,4}\-[0-9]{3,4}\-)|([0-9]{3,4}\-))?([0-9]{7,8})(\-[0-9]+)?$/ }
	, TELE: { MSG: "电话格式错误,请填写手机或座机（区号或分机用-分隔）", REGEX: /^$|^(13|14|15|16|17|18|19)([0-9]{9})$|^((\+?[0-9]{2,4}\-[0-9]{3,4}\-)|([0-9]{3,4}\-))?([0-9]{7,8})(\-[0-9]+)?$/ }
	, IDCARD: { MSG: "身份证错误", REGEX: /^$|^\d{14}(\d{1}|\d{4}|(\d{3}[xX]))$/ }
	, DATE: { MSG: "日期格式错误", REGEX: /^$|^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-9]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-))$/ }
	, YYYY_YYYY: { MSG: "格式：2014-2018", REGEX: /^\d{4}\-\d{4}$/gi }
	, YYYYMMDD: { MSG: "格式：20140131", REGEX: /^([1-2]\d{3})(0?[1-9]|10|11|12)([1-2]?[0-9]|0[1-9]|30|31)$/gi }
	, YYYYMM: { MSG: "格式：201408", REGEX: /^([1-2]\d{3})(0?[1-9]|10|11|12)$/gi }
	, HH_MM: { MSG: "格式：09:18 或 9:18", REGEX: /^$|^(\d{1}|0\d{1}|1\d{1}|2[0-3]):[0-5]\d{1}$/ }
	, HH_MM_D4: { MSG: "格式：09:18 或 9:18 或 0918", REGEX: /^$|^(\d{1}|0\d{1}|1\d{1}|2[0-3]):[0-5]\d{1}$|^(0\d{1}|1\d{1}|2[0-3])[0-5]\d{1}$/ }
};
var _EWA_G_SETTINGS = {
	WEEKS: "日,一,二,三,四,五,六",
	MONTHS: "一月,二月,三月,四月,五月,六月,七月,八月,九月,十月,十一月,十二月",
	DATE: "yyyy-MM-dd",
	TIME: "hh:MM:ss",
	CURRENCY: "￥",
	Today: "今天",
	Hour: "小时",
	Minute: "分钟",
	Second: "秒"
};
var _EWA_JS_ALERT = {
	"MaxMinLength": "长度应在{MinLength}-{MaxLength}之间 "
	, "MaxMinValue": "值应在({MinValue} - {MaxValue})之间"
	, "IsMustInput": "*"
};