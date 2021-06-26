EWA_App.State = {
	stack : [], // 记录url的堆栈
	inc : 0,
	init : function(id) {
		this.state(document.title, window.location.href, true);
		this.stateListen();
		this.initUrl = window.location.href;
		this.initSection = $('section[id="' + id + '"]')[0];
		this.prevShow = this.initSection;
		$('a').each(
				function() {
					var href = this.href;
					if (!href || href.toLowerCase().indexOf("javascript") >= 0
							|| href.indexOf('#') < 0) {
						return;
					}
					EWA_App.Section.bindAEvent(this);
				});
	},
	/**
	 * 更换状态（跳转地址）
	 * 
	 * @param title
	 *            标题
	 * @param url
	 *            地址,例如 #aa?a=1&b=2
	 * @param isinit
	 *            是否初始化，无刷新改变URL
	 * @param isReplace
	 *            是否替换当前地址
	 */
	state : function(title, url, isinit, isReplace) {
		if (window.history.pushState) {
			this.inc++;
			var s = {
				title : title,
				url : url,
				inc : this.inc
			};
			var a = s.title + '/' + s.url;
			if (this.___last_ == a) { // 避免重复提交
				if (EWA_App.DEBUG) {
					console.log('none-push', this.___last_);
				}
				return;
			}
			this.___last_ = a;
			var c = this;
			setTimeout(function() {
				c.___last_ = null;
			}, 444);
			if (EWA_App.DEBUG) {
				console.log('push', s);
			}
			// EWA_App.State._is_replace 老方法调用
			if (EWA_App.State._is_replace || isReplace) {
				window.history.replaceState(s, title, url);
				EWA_App.State._is_replace = false;
				this.stack[this.stack.length - 1] = url;
			} else {
				window.history.pushState(s, title, url);
				this.stack.push(url);
			}
			if (!isinit) {
				EWA_App.Section.handleState(s);
			}
		} else {
			alert('brower not support history.pushState')
		}
		document.title = title;
	},
	stateListen : function() {// 监听地址
		var c = this;
		window.addEventListener('popstate', function(e) {
			if (EWA_App.DEBUG) {
				console.log('popstate', e);
			}
			var h = c.stack.pop();
			if (c.stack.length == 0) {
				if (EWA_App.DEBUG) {
					console.log('地址堆栈为空了，重新将第一页入栈');
				}
				c.state("", h, true);
				return;
			}
			if (e.state) {
				e.state._is_back = true;
				EWA_App.Section.handleState(e.state);
			} else {
			}
		}, false);
	}
};