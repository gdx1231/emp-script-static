var _EWA_EVENT_MSG = new Object();
_EWA_EVENT_MSG['ValidCodeError'] = "Error Valid Code";
_EWA_EVENT_MSG['EWA_DELETE'] = "Are you sure?";
_EWA_EVENT_MSG['OnTreeNodeNew'] = "New Node ";
_EWA_EVENT_MSG['OnTreeNodeDelete'] = "Are you sure?";
_EWA_EVENT_MSG['OnTreeNodeDeleteHaveChildren'] = "Don't delete!";
_EWA_EVENT_MSG['OnTreeNodeNameRepeat'] = "Name duplicated, pls change it!";
_EWA_EVENT_MSG['IdempotanceError'] = "Please do not resubmit";
var _EWA_INFO_MSG = {
	"EWA.SYS.CHOOSE_ITEM_TITLE": "Tips",
	"EWA.SYS.CHOOSE_ITEM": "Please select a record first",
	"EWA.SYS.DATASEARCH": "Search",
	"EWA.SYS.INVALID_NUMBER_FORMAT": "Invalid Format",
	"EWA.SYS.ERROR": "System runtime error",
	"EWA.F.VAILD": "Validation code error",
	"EWA.F.PASSWORD": "Passwords not match",
	"EWA.LF.SEARCH.BUT.TITLE": "Data Search",
	"EWA.LF.SEARCH.BUT.CLEAR": "Clear",
	"EWA.LF.SEARCH.BUT.SEARCH": "Search",
	"EWA.LF.SEARCH.BUT.CLOSE": "Close",
	"EWA.LF.DOWN_DATA.DENY": "Access right required",
	"BUT.OK": "OK",
	"BUT.CANCEL": "Cancel",
	"BUT.YES": "Yes",
	"BUT.NO": "No",
	"DeleteBefore": "Are you sure?",
	"DeleteAfter": "Record deleted!",
	"UpdateAfter": "Record updated ok!",
	"CommonTitle": "Record updated ok!",
	"EWA_MTYPE_N": "New",
	"EWA_MTYPE_M": "Modify",
	"EWA_MTYPE_C": "Copy to",
	"RECYCLE": "Recycle"
};
var _EWA_VALIDS = {
	EMAIL: { MSG: "Pls using name@gdxsoft.com style", REGEX: /^$|^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/ }
	, ALPHA: { MSG: "only numbers or letters", REGEX: /^[\w]*$/g }
	, DIGIT: { MSG: "only numbers", REGEX: /^$|^[-+]?\d+(\.\d*)?$/ }
	, DURATION: { MSG: "Format error", REGEX: /^$|^(\d{1,2}:)?[0-5][0-9]:[0-5][0-9]$/ }
	, MOBILE: { MSG: "Format error", REGEX: /^$|^(13|14|15|16|17|18|19)([0-9]{9})$/ }
	, PHONE: { MSG: "Format error", REGEX: /^$|^((\+?[0-9]{2,4}\-[0-9]{3,4}\-)|([0-9]{3,4}\-))?([0-9]{7,8})(\-[0-9]+)?$/ }
	, TELE: { MSG: "Format error", REGEX: /^$|^(13|14|15|16|17|18|19)([0-9]{9})$|^((\+?[0-9]{2,4}\-[0-9]{3,4}\-)|([0-9]{3,4}\-))?([0-9]{7,8})(\-[0-9]+)?$/ }
	, IDCARD: { MSG: "Format error", REGEX: /^$|^\d{14}(\d{1}|\d{4}|(\d{3}[xX]))$/ }
	, DATE: { MSG: "Format error", REGEX: /^$|^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-9]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-))$/ }
	, YYYY_YYYY: { MSG: "e.g.：2014-2018", REGEX: /^\d{4}\-\d{4}$/gi }
	, YYYYMMDD: { MSG: "e.g.：20140131", REGEX: /^([1-2]\d{3})(0?[1-9]|10|11|12)([1-2]?[0-9]|0[1-9]|30|31)$/gi }
	, YYYYMM: { MSG: "e.g.：201408", REGEX: /^([1-2]\d{3})(0?[1-9]|10|11|12)$/gi }
	, HH_MM: { MSG: "e.g.：09:18 or 9:18", REGEX: /^$|^(\d{1}|0\d{1}|1\d{1}|2[0-3]):[0-5]\d{1}$/ }
	, HH_MM_D4: { MSG: "e.g.：09:18 or 9:18 or 0918", REGEX: /^$|^(\d{1}|0\d{1}|1\d{1}|2[0-3]):[0-5]\d{1}$|^(0\d{1}|1\d{1}|2[0-3])[0-5]\d{1}$/ }
};
var _EWA_G_SETTINGS = {
	WEEKS: "Sun,Mon,Tue,Wed,Thu,Fri,Sat",
	MONTHS: "January,February,March,April,May,June,July,August,September,October,November,December",
	DATE: "MM/dd/yyyy",
	TIME: "hh:MM:ss",
	CURRENCY: "$",
	Today: "Today",
	Hour: "H",
	Minute: "M",
	Second: "S"
};
var _EWA_JS_ALERT = {
	"MaxMinLength": "length must in ({MinLength}-{MaxLength})"
	, "MaxMinValue": "Value must in {MinValue} - {MinValue} "
	, "IsMustInput": "*"
};