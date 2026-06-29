/**
 * 导航按钮
 * 
 */
class EWA_UI_NavBarClass {
	constructor() {
		this.id = null;
		this.parent = null;
		/**
		 * {text: '测试1', url: 'htts://gdx/1/a', cb: ()=>{console.log(1)}}
		 * {text: '测试2', content: '<h1>abc</h1>', cb: ()=>{console.log(2), show: true}}
		 * cb(target, index, content/url, ...)
		 */
		this.tabsCfg = null;
		this.lastIdx = 0;
	};

	show(idx) {
		let idx1 = idx * 1;
		if (idx1 === this.lastIdx) {
			return;
		}
		this.lastIdx = idx1;
		let boxes = $(this.parent).find('.ewa-tab-box');
		$(this.parent).find('.ewa-tab-tab').each(function() {
			if ($(this).attr('idx') * 1 === idx1) {
				$(this).removeClass('EWA_GROUP_CNT_TOP').addClass('EWA_GROUP_CNT_TOP1');
			} else {
				$(this).removeClass('EWA_GROUP_CNT_TOP1').addClass('EWA_GROUP_CNT_TOP');
			}
		});
		boxes.hide();
		$(boxes[idx1]).show();
	};
	getBox(idx) {
		let t = $(this.parent).find('.ewa-tab-box:eq(' + idx + ')');
		return t.length == 0 ? null : t[0];
	};
	setContent(idx, content, cb) {
		let t = this.getBox(idx);
		t.html(content);
		if (cb) {
			cb(t, idx, content);
		}
	};
	install(idx, url, cb) {
		let t = this.getBox(idx);
		$Install(url, t, function(a, b, c) {
			if (cb) {
				cb(t, idx, url, a, b, c);
			}
		});
	};
	createInstallCfg(text, url, cb, show) {
		return { text: text, url: url, cb: cb, show: show };
	};
	createContentCfg(text, content, cb, show) {
		return { text: text, content: content, cb: cb, show: show };
	}
	demo() {
		let cfgs = [{
			text: "标签一"
		}, {
			text: "标签二"
		}, {
			text: "<b>标签三</b>",
			show: true
		}];
		document.body.innerHTML = "";
		this.init('demo', document.body, cfgs);
	};
	init(id, parent, tabsCfg) {
		this.id = id;
		this.parent = parent;
		this.tabsCfg = tabsCfg;

		let headers = [];
		let boxes = [];
		for (let i in tabsCfg) {
			let cfg = tabsCfg[i];
			let hclass = i > 0 ? "EWA_GROUP_CNT_TOP" : "EWA_GROUP_CNT_TOP1";
			let header = `<div idx="${i}" class="ewa-tab-tab ${hclass}" id="tab_${id}_${i}">
<a style='display:block'>${cfg.text}</a></div>`;
			let dsp = i > 0 ? "none" : "block";
			let box = `<div idx="${i}" class='ewa-tab-box' id="box_${id}_${i}" style="display: ${dsp}"></div>`;
			boxes.push(box);
			headers.push(header);
		}
		let h = headers.join('');
		let b = boxes.join('');
		let html = `<div class="ewa-tab" id="${id}">
	<div class="ewa-tab-headers" id="headers_${id}">${h}<div style='clear:both'></div></div>
	<div class="ewa-tab-boxes" id="boxes_${id}">${b}</div>
</div>`;
		let tab = $(html);
		let that = this;
		tab.find('a').on('click', function() {
			let idx = $(this).parent().attr('idx') * 1;
			that.show(idx);
		});
		$(parent).append(tab);

		for (let i in tabsCfg) {
			let cfg = tabsCfg[i];
			if (cfg.url) {
				//let cmd = 'that.install(' + i + ',"' + cfg.url + '")';
				//conole.log(cmd);
				//eval(cmd);
				that.install(i, cfg.url, cfg.cb)
			} else if (cfg.content) {
				that.setContent(i, cfg.content, cfg.cb);
			}

			if (cfg.show) {
				console.log(cfg)

				this.show(i);
			}
		}
	};
}