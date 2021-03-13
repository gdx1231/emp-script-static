function EWA_Html5TakePhotoClass() {
	this._wait_end = true;
	this.UPLOAD_STATUS = 'NO';
	this.H5_UPLOAD = new EWA_Html5UploadClass(); // h5上传对象
	this.res = {
		zhcn : {
			TAKE_PHOTO : "点击获取照片",
			RE_TAKE : "重新获取"

		},
		enus : {
			TAKE_PHOTO : "Take photo",
			RE_TAKE : "Re take"
		}
	}
	this.getRes = function() {
		return EWA.LANG == 'enus' ? this.res.enus : this.res.zhcn;
	};
	// 获取值
	this.getValue = function() {
		if (!this.responseText) {
			return "";
		}
		return this.responseText;
	}
	this.init = function(objName) {
		this.objName = objName;
		var main_id = "#h5TakePhoto_" + objName;
		var canvas_id = "h5TakePhotoCan_" + objName;
		var video_id = "h5TakePhotoVod_" + objName;

		var canvas = $X(canvas_id);
		canvas.height = $(main_id).height();
		canvas.width = $(main_id).width();

		this.context = canvas.getContext("2d");
		// video 元素，将用于接收并播放摄像头 的数据流
		this.video = $X(video_id);
		$(this.video).show();

		var videoObj = {
			"video" : true
		};

		// Put video listeners into place
		// 针对标准的浏览器
		var c = this;
		if (navigator.getUserMedia) { // Standard
			navigator.getUserMedia(videoObj, function(stream) {
				c.video.src = stream;
				c.video.play();
			}, c.errBack);
		} else if (navigator.webkitGetUserMedia) { // WebKit-prefixed
			navigator.webkitGetUserMedia(videoObj, function(stream) {
				c.video.src = (window.URL || window.webkitURL).createObjectURL(stream);
				c.video.play();
			}, c.errBack);
		}   else if (navigator.mozGetUserMedia) {
			navigator.mozGetUserMedia(videoObj, function(stream) {
				c.video.src = window.URL.createObjectURL(stream);
				c.video.play();
			}, c.errBack);
		}

		$(main_id).find('button').html(this.getRes().TAKE_PHOTO);
	};
	// 一个出错的回调函数，在控制台打印出错信息
	this.errBack = function(error) {
		EWA.UI.Msg.ShowError('浏览器不支持在线拍摄<br>' + error.message, '浏览器不支持在线拍摄');
		console.log(error);
	};

	// 对拍照按钮的事件监听
	this.takePhoto = function(fromButton) {
		// 画到画布上
		if (!this._wait_end) {
			$Tip("运行中...");
			return;
		}
		var video_id = "#h5TakePhotoVod_" + this.objName;

		var pWidth = $(video_id).width();
		var pHeight = $(video_id).height();
		this.context.drawImage(this.video, 0, 0, pWidth, pHeight);
		this.createPic();
		this.setPhotoStatus("img");

		if (fromButton) {
			var c = this;

			fromButton.innerHTML = this.getRes().RE_TAKE;
			fromButton.onclick = function() {
				c.showVideo(this);
			};
			$(fromButton).show();
			$(fromButton).parent().show();
		}
	};
	this.showVideo = function(fromButton) {
		if (!this._wait_end) {
			$Tip("运行中...");
			return;
		}
		this.setPhotoStatus("video");
		if (fromButton) {
			var c = this;

			fromButton.innerHTML = this.getRes().TAKE_PHOTO;
			fromButton.onclick = function() {
				c.takePhoto(this);
			}
			$(fromButton).show();
			$(fromButton).parent().show();
		}
	};
	this.setPhotoStatus = function(sta) {
		var main_id = "#h5TakePhoto_" + this.objName;
		var canvas_id = "#h5TakePhotoCan_" + this.objName;
		var video_id = "#h5TakePhotoVod_" + this.objName;
		var img_id = "#h5TakePhotoImg_" + this.objName;
		$(main_id).find("*").hide();
		if (sta == "img") {
			this._photo_status = "img";
			$(main_id).css({
				"border" : "1px solid green"
			});
			$(img_id).show();
		} else if (sta == "video") {
			this._photo_status = "video";
			$(main_id).css({
				"border" : "1px solid red"
			});
			$(video_id).show();
		} else if (sta == "canvas") {
			this._photo_status = "canvas";
			$(main_id).css({
				"border" : "1px solid blue"
			});
			$(canvas_id).show();

		}
	};
	this.createPic = function() {
		var canvas_id = "h5TakePhotoCan_" + this.objName;
		var img_id = "#h5TakePhotoImg_" + this.objName;

		var imgData = $X(canvas_id).toDataURL('image/jpeg', 0.7);
		$(img_id).attr('src', imgData);
		this.setPhotoStatus('img');
		return $(img_id)[0];
	};

	/**
	 * 每个 input 执行一次上传
	 */
	this.submitUpload = function() {
		var img_id = "#h5TakePhotoImg_" + this.objName;
		var fd = this.H5_UPLOAD.createFormData();
		var fromImg = $(img_id)[0];

		var blob = EWA_ImageCalss.resizeAsBlob(fromImg, fromImg.width, fromImg.height);
		fd.append(this.objName, blob, this.objName + ".jpg");

		var main_id = "#h5TakePhoto_" + this.objName;

		var c = this;
		var img_target = $(main_id).find('.ewa-h5-take-photo-process');
		img_target.show();
		img_target.find('span').show().html("0%");
		var img_target1 = $(main_id).find('.ewa-h5-take-photo-process1');
		img_target1.css('width', 0).show();

		var xhr = new XMLHttpRequest();
		var c = this;
		xhr.upload.addEventListener("progress", function(evt) {
			if (evt.lengthComputable) {
				var percentComplete = Math.round(evt.loaded * 100 / evt.total - 10);
				if (percentComplete < 0) {
					percentComplete = 0;
				}
				img_target.find('span').html(percentComplete.toString() + '%');
				img_target1.css('width', percentComplete.toString() + '%');
			} else {
				img_target.html('unable to compute');
			}
		}, false);
		xhr.addEventListener("load", function(evt) {
			img_target.find('span').html('100%');
			img_target1.css('width', '100%');

			/* 服务器端返回响应时候触发event事件 */
			$('#EWA_FRAME_' + c.H5_UPLOAD.SYS_FRAME_UNID + ' #' + c.objName).val(evt.target.responseText);
			c.responseText = evt.target.responseText;
			c.UPLOAD_STATUS = 'ok';

		}, false);
		xhr.addEventListener("error", function(evt) {
			console.log(evt);
			img_target.html(evt);
			c.UPLOAD_STATUS = "error";
		}, false);
		xhr.addEventListener("abort", function(evt) {
			img_target.html("The upload has been canceled by the user or the browser dropped the connection.");
			console.log(evt);
			c.UPLOAD_STATUS = "abort";
		}, false);

		var action = EWA.CP + "/EWA_STYLE/cgi-bin/_up_/?xmlname=" + this.H5_UPLOAD.POST_XMLNAME + "&ITEMNAME="
			+ this.H5_UPLOAD.POST_ITEMNAME + "&NAME=" + this.H5_UPLOAD.POST_NAME + "&EWA_UP_TYPE=SWFUPLOAD&EWA_UP_REF="
			+ this.H5_UPLOAD.POST_REF;

		$(main_id).find('button').hide();

		xhr.open('POST', action, true);
		xhr.send(fd);
		this.xhr = xhr;
	};

}