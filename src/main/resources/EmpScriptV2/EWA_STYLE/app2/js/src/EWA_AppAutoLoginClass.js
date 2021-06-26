/**
 * 自动登录， 本地localStorage保存的凭证发送到服务器进行登录，同时获取新的凭证保存下来
 * 
 * @param locaStoreName
 *            本地保存名称
 * @param loginUrl
 *            登录的url
 * @param loginSucessCb
 *            登录成功的回调 (rst.RST=true)
 * @param loginFailCb
 *            登录失败的回调 (rst.RST!=true)
 */
var EWA_AppAutoLoginClass = function(locaStoreName, loginUrl, loginSucessCb,
		loginFailCb) {
	this.name = locaStoreName;
	this.loginUrl = loginUrl;
	this.loginSucess = loginSucessCb;
	this.loginFail = loginFailCb;
	
	
	this.lastLoginTime = 0; // 最后一次登录时间
	/**
	 * 自动登录
	 * 
	 * @param callBack
	 *            传递进来的回调
	 * @returns 是否执行
	 */
	this.autoLogin = function(callBack) {
		var code = this.getCode();
		if (!code) {
			return false;
		}
		var data = {
			code : code,
			method : "auto_login"
		};
		var u = this.loginUrl;

		if (!u) {
			console.log('没有定义自动登录的url');
			return false;
		}
		var c = this;
		$JP1(u, data, function(rst) {
			
			c.lastLoginTime = new Date().getTime();
			
			console.log(rst);
			if (!rst.RST) {
				c.removeCode(); // 删除凭证
				if (c.loginFail) {
					c.loginFail(rst);
				}
				
				if(callBack){ // 传递进来的回调
					callBack(rst);
				}
				return;
			}

			g_is_user_logined = true;
			if (rst.CODE) {
				// 保存凭证
				c.saveCode(rst.CODE);
			}
			if (c.loginSucess) {
				c.loginSucess(rst);
			}
			if(callBack){ // 传递进来的回调
				callBack(rst);
			}
		});
		
		return true;
	};
	/**
	 * 距离上一次执行的分钟
	 */
	this.getPastMinutes = function(){
		var diff = new Date().getTime() - this.lastLoginTime;
		return diff / 1000 /60; // 换算成分钟
	};
	/**
	 * 获取凭证
	 */
	this.getCode = function() {
		try {
			var code = window.localStorage[this.name];
			return code;
		} catch (e) {
			console.log(e);
		}
	};
	/**
	 * 保存凭证
	 */
	this.saveCode = function(code) {
		window.localStorage[this.name] = code;
	};
	/**
	 * 删除凭证
	 */
	this.removeCode = function() {
		window.localStorage.removeItem(this.name);
	};
}
