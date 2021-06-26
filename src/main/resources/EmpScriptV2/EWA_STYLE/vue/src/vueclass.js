function EWA_VueClass(cfg, target) {
	var app = null;
	var vueCfg = null;
	if (cfg == null) {
		console.log('cfg(frame)的参数为空');
		return;
	}
	if (cfg.FRAME_TYPE == 'FrameList') {
		vueCfg = getListFrameVueCfg(target, cfg);
	} else if (cfg.FRAME_TYPE == 'FrameFrame') {
		vueCfg = getFrameFrameVueCfg(target, cfg);
	} else {
		console.log('未知的类型：' + cfg.FRAME_TYPE);
	}

	if (vueCfg) {
		app = new Vue(vueCfg);
		return app;
	}
}