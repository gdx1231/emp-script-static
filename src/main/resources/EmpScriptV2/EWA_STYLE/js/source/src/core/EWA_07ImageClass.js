/**
 * 图片操作类 toDataURL
 */
EWA_ImageCalss = {
	defaultRatio : 0.7,

	resize : function(img, width, height, format, ratio) {
		var scale1 = img.naturalWidth / width;
		var scale2 = img.naturalHeight / height;

		var scale = scale1 > scale2 ? scale1 : scale2;

		var width = img.naturalWidth / scale;
		var height = img.naturalHeight / scale;

		var format1 = format ? format : 'image/jpeg';
		var ratio1 = ratio || this.defaultRatio;
		if (isNaN(ratio1) || ratio1 > 1) {
			ratio1 = this.defaultRatio;
		}
		var c1 = document.createElement('canvas');
		c1.width = width;
		c1.height = height;
		ctx1 = c1.getContext("2d");

		// context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
		// 参数值
		// 参数 描述
		// img 规定要使用的图像、画布或视频。
		// sx 可选。开始剪切的 x 坐标位置。
		// sy 可选。开始剪切的 y 坐标位置。
		// swidth 可选。被剪切图像的宽度。
		// sheight 可选。被剪切图像的高度。
		// x 在画布上放置图像的 x 坐标位置。
		// y 在画布上放置图像的 y 坐标位置。
		// width 可选。要使用的图像的宽度。（伸展或缩小图像）
		// height 可选。要使用的图像的高度。（伸展或缩小图像）
		ctx1.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, c1.width, c1.height);
		var src = c1.toDataURL(format1, ratio1);
		// delete c1;
		return src;
	},
	dataURItoBlob : function(dataURI) {
		var arr = dataURI.split(',');
		var mime = arr[0].match(/:(.*?);/)[1];
		// arr1 = arr;
		var data = window.atob(arr[1]);
		var ia = new Uint8Array(data.length);
		for (var i = 0; i < data.length; i++) {
			ia[i] = data.charCodeAt(i);
		}
		;
		return new Blob([ ia ], {
			type : mime
		});
	},
	resizeAsBlob : function(img, width, height, format, ratio) {
		var src = this.resize(img, width, height, format, ratio);
		var blob = this.dataURItoBlob(src);
		// console.log(src);
		// aaaa = src;
		// bbbb = blob;

		// var a = document.createElement('a');
		// a.href = window.URL.createObjectURL(blob);
		// a.donwload = 'hello-world.jpg';
		// a.textContent = 'Download Hello World';
		// a.target = '_blank';
		// a.style.display = 'block';
		// document.body.appendChild(a);

		return blob;
	}
};
