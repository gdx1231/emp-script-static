(function() {
	var __Ani = {
		DEF_CSS: {
			INIT: { //动画开始初始化位置
				'-webkit-transform': 'translate3d(90%,0,0)'
			},
			INIT_BACK: {
				'-webkit-transform': 'translate3d(-90%,0,0)'
			},

			HIDE: {
				'-webkit-transform': 'translate3d(-100%, 0, 0)',
				'-webkit-transition': '-webkit-transform 400ms cubic-bezier(0.42, 0, 0.58, 1.0) 0.1s'
			},
			SHOW: {
				'-webkit-transform': 'translate3d(0, 0, 0)',
				'-webkit-transition': '-webkit-transform 350ms cubic-bezier(0.42, 0, 0.58, 1.0)'
			},
			BACK_HIDE: {
				'-webkit-transform': 'translate3d(100%, 0px, 0px)',
				'-webkit-transition': '-webkit-transform 350ms cubic-bezier(0.42, 0, 0.58, 1.0) 0.1s'
			},
			BACK_SHOW: {
				'-webkit-transform': 'translate3d(0%, 0px, 0px)',
				'-webkit-transition': '-webkit-transform 400ms cubic-bezier(0.42, 0, 0.58, 1.0)'
			}
		},
		POP_CSS: {
			INIT: { //动画开始初始化位置
				'-webkit-transform': 'translate3d(0, 90%, 0)'
			},
			INIT_BACK: {
				'-webkit-transform': 'translate3d(0, 0, 0)'
			},
			HIDE: {
				'-webkit-transform': 'translate3d(0, 0%, 0)'
			},
			SHOW: {
				'-webkit-transform': 'translate3d(0, 0%, 0)',
				'-webkit-transition': '-webkit-transform 350ms cubic-bezier(0.42, 0, 0.58, 1.0)'
			},
			BACK_HIDE: {
				'-webkit-transform': 'translate3d(0, 100%, 0px)',
				'-webkit-transition': '-webkit-transform 350ms cubic-bezier(0.42, 0, 0.58, 1.0) 0.1s'
			},
			BACK_SHOW: {
				'-webkit-transform': 'translate3d(0%, 0px, 0px)'
			}
		},
		getCss: function(swapType) {
			if (EWA_App.DEBUG) console.log(swapType);
			if (swapType == 'pop') {
				return this.POP_CSS;
			}
			return this.DEF_CSS;
		}
	};
	EWA_App.Ani = __Ani;
})();