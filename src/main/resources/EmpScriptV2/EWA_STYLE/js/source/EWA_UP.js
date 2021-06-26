
if (typeof EWA == "undefined") {
	EWA = {};
	EWA.F = {};
}
//
function EWA_UploadClass() {
	this.Ajax;
	this.Guid;
	this.Exts;
	this.IsGetting = false;
	this.Timer;
	this.UploadFile = function () {
		if (!this.CheckExt(document.forms[0].f2)) {
			alert("\u6587\u4ef6\u7c7b\u578b\u9519\u8bef\u6216\u672a\u9009\u62e9\u6587\u4ef6");
			return false;
		}
		url = document.location.href + "?a=1&EWA_UP_GUID=" + this.Guid + "&EWA_UP_STATUS=UPLOAD";
		document.forms[0].action = url;
		document.forms[0].submit();
		this.StartMoniter();
	};
	this.StartMoniter = function () {
		this.Timer = window.setInterval(_UP.GetStatus, 501);
	};
	this.GetStatus = function () {
		window.clearInterval(_UP.Timer);
		_UP.Ajax = new EWA.C.Ajax();
		_UP.Ajax.AddParameter("a", "1");
		_UP.Ajax.AddParameter("EWA_UP_STATUS", "STATUS");
		_UP.Ajax.AddParameter("EWA_UP_GUID", _UP.Guid);
		_UP.IsGetting = true;
		_UP.Ajax.PostNew(document.location.href, _UP.GetStatusCallBack);
	};
	this.GetStatusCallBack = function () {
		var ajax = _UP.Ajax;
		if (ajax._Http.readyState != 4) {
			return;
		}
		var s1 = "";
		if (ajax._Http.status == 200) {
			s1 = ajax._Http.responseText;
			_UP.ShowStatus(s1);
		} else {
			alert("err:" + ajax._Http.status);
		}
		this.IsGetting = false;
	};
	this.ShowStatus = function (s1) {
		var xml = new EWA.C.Xml();
		xml.LoadXml(s1);
		var node = xml.GetElement("UploadStatus");
		if (node == null) {
			this.StartMoniter();
			return;
		}
		var obj = {UploadTotalSize:node.getAttribute("UploadTotalSize"), ReadTotalSize:node.getAttribute("ReadTotalSize"), Status:node.getAttribute("Status"), CurrentUploadFileNum:node.getAttribute("CurrentUploadFileNum")};
		var o1 = document.getElementById("_EMP_UPLOADER_BACKGROUND");
		var o2 = document.getElementById("_EMP_UPLOADER_FORGROUND");
		var o3 = document.getElementById("_EMP_UPLOADER_BYTES");
		var w = o1.clientWidth;
		var w1 = obj.ReadTotalSize * 1 / obj.UploadTotalSize * 1 * w;
		o2.style.posWidth = w1;
		o3.innerHTML = obj.Status;
		if (obj.ReadTotalSize * 1 == obj.UploadTotalSize * 1) {
			//监控名称是否返回
			this.Timer = window.setInterval(_UP._MoninterName, 101);
		} else {
			this.StartMoniter();
		}
	};
	this._MoninterName = function () {
		if (document.forms[0].__EMP_UPLOAD_SERVER_NAME.value == "") {
			return;
		}
		window.clearInterval(_UP.Timer);
		_UP.UploadComplete();
	};
	this.UploadComplete = function () {
		var name = document.forms[0].__EMP_UPLOAD_SERVER_NAME.value;
		var retCmd = _EWA_DialogWnd.GetReturnBack();
		if (retCmd == null) {
			alert("not define retCmd");
			_EWA_DialogWnd.CloseWindow();
			return;
		}
		if (retCmd.CmdArgus[1] == "UPFILE") { //上传文件
			var obj = retCmd.CmdArgus[0];
			var ss=CONTEXT_PATH;
			_EWA_DialogWnd.CloseWindow();
			if (obj.type == 'hidden') {
				obj.value = name;
				obj.parentNode.focus();
				var imgs = obj.parentNode.getElementsByTagName('img');
				if (imgs.length > 0) {
					imgs[0].setAttribute('src',ss+"/"+name);
				}
				imgs=null;
			}
			else {
				obj.value = name;
				obj.focus();
			}
			obj = null;
			return;
		}
		if (retCmd.CmdArgus[1] == "DHTML") {
			var doc = retCmd.CmdArgus[0].frames[0].document;
			var src = retCmd.CmdArgus[2] + "/" + name;
			var sel = retCmd.CmdArgus[3];
			_EWA_DialogWnd.CloseWindow();
			doc.body.focus();
			if (sel) {
				try{
					sel.pasteHTML("<img src=" + src + ">");
				}catch(e){
					doc.execCommand("InsertImage", false, src);
				}
			} else {
				doc.execCommand("InsertImage", false, src);
			}
			doc = null;
		}
	};
	this.CheckExt = function () {
		var obj = document.forms[0].f2;
		u1 = obj.value;
		m = u1.lastIndexOf(".");
		ext = "";
		if (m < 0) {
			ext = "-----------------------gdx------------------------";
		} else {
			ext = u1.substring(m + 1);
		}
		exts = this.Exts.split(",");
		isok = false;
		for (i = 0; i < exts.length; i++) {
			if (ext.toUpperCase() == exts[i].toUpperCase().trim()) {
				isok = true;
			}
		}
		if (!isok) {
			obj.value = "";
			alert("\u6587\u4ef6\u7c7b\u578b\u9519\u8bef\uff0c\u5141\u8bb8\u6587\u4ef6\u4e3a" + this.Exts);
		}
		return isok;
	};
	this.LoadImg = function (v1) {
		o1 = document.getElementById("__EMP_UPLOADER_IMG");
		if (window.navigator.userAgent.indexOf("IE 7") > 0) {
			o1.innerHTML = "<br><br>IE7\u4e0d\u652f\u6301\u9884\u89c8,\u60a8\u53ef\u4ee5\u70b9\u51fb\"\u786e\u5b9a\"\u4e0a\u4f20\u6587\u4ef6.";
			return;
		}
		if (!this.CheckExt()) {
			o1.innerHTML = "";
			objs=document.getElementsByTagName('input');
			for(var i=0;i<objs.length;i++){
				if(objs[i].type=='file'){
					objs[i].value='';
				}
			}
			return;
		}
		this.UserImg = new Image;
		this.UserImg.src = v1;
		this.ImgTimer = window.setInterval(_UP.DispImg, 100);
	};
	this.DispImg = function () {
		if (_UP.UserImg.readyState != "complete") {
			return;
		}
		window.clearInterval(_UP.ImgTimer);
		var w = _UP.UserImg.width;
		var h = _UP.UserImg.height;
		var o1 = document.getElementById("__EMP_UPLOADER_IMG");
		var w1 = o1.clientWidth;
		var h1 = o1.clientHeight;
		var s1 = "<img src='" + _UP.UserImg.src + "'";
		if (w / h < w1 / h1) {
			s1 += " height='" + h1 + "'>";
		} else {
			s1 += " width='" + w1 + "'>";
		}
		o1.innerHTML = s1;
	};
}



























//
function __EMP_UPLOADER_SUBMIT() {
	if (!__EMP_UPLOADER_ISOK) {
		alert("\u6587\u4ef6\u7c7b\u578b\u9519\u8bef\u6216\u672a\u9009\u62e9\u6587\u4ef6");
		return false;
	}
	url = document.location.href + "?a=1&guid=" + __EMP_UPLOADER_GUID + "&__EMP_UPLOAD_POST=1";
	//alert(url);
	document.forms(0).action = document.location.href + "?a=1&guid=" + __EMP_UPLOADER_GUID;
	_EMP_AJAX_TIMER0 = window.setInterval(__EMP_AJAX_RUN_RESULT1, 1001);
}
var __EMP_UPLOAD_TIMER_FCKEDITOR;
function __EMP_UPLOAD_SET_FCKEDITOR() {
	var f1 = document.forms[0].__EMP_UPLOAD_SERVER_NAME.value;
	if (f1.length == 0) {
		return;
	}
	window.clearInterval(__EMP_UPLOAD_TIMER_FCKEDITOR);
	f1 = __EMP_CONTEXT_PATH + "/" + f1;
	var oedit = window.parent.external.dialogArguments.Editor;
	oedit.frames[0].document.body.innerHTML = oedit.frames[0].document.body.innerHTML + "<img src='" + f1 + "'>";
}
var __EMP_UPLOADER_ISOK = false;

