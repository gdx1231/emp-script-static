(function(call){
	// call 可能
Vue.component('ewa-item-span', {
	props: ['cfg'],
	template: '<span :id="cfg.NAME" :name="cfg.NAME" class="IX_SPAN">{{cfg.VAL}}</span>'
});
Vue.component('ewa-item-button', {
	props: ['cfg'],
	template: '<input type="button" :id="cfg.NAME" :name="cfg.NAME" class="IX_BUTTON" :value="cfg.DES" :onclick="cfg._ONCLICK">'
});
Vue.component('ewa-item-submit', {
	props: ['cfg'],
	template: '<input type="submit" :id="cfg.NAME" :name="cfg.NAME" class="IX_BUTTON" :value="cfg.DES" :onclick="cfg._ONCLICK">'
});
Vue.component('ewa-item-text', {
	props: ['cfg'],
	template: '<input type="text" :placeholder="cfg.MEMO" :id="cfg.NAME" :name="cfg.NAME" class="EWA_INPUT" :value="cfg.VAL">'
});
Vue.component('ewa-item-select', {
	props: ['cfg'],
	template: `<select :id="cfg.NAME" :name="cfg.NAME" class="EWA_SELECT">
	<template v-for="item in cfg.LST">
		<option :value="item.V" selected v-if="item.V === cfg.VAL">{{item.T}}</option>
		<option :value="item.V" v-else>{{item.T}}</option>
	</template>
</select>`
});
Vue.component('ewa-item-textarea', {
	props: ['cfg'],
	template: '<textarea :placeholder="cfg.MEMO" :id="cfg.NAME" :name="cfg.NAME" class="EWA_TEXTAREA">{{cfg.VAL}}</textarea>'
});
Vue.component('ewa-f-item', {
	props: ['cfg'],
	template: `
	<ewa-item-span v-if="cfg.TAG === 'span'" :cfg="cfg" />
	<ewa-item-text v-else-if="cfg.TAG === 'text'" :cfg="cfg" />
	<ewa-item-select v-else-if="cfg.TAG === 'select'" :cfg="cfg" />
	<ewa-item-textarea v-else-if="cfg.TAG === 'textarea'" :cfg="cfg" />
`
});
Vue.component('ewa-f-button', {
	props: ['cfg'],
	template: `
	<ewa-item-button v-show="cfg.TAG === 'button'" :cfg="cfg" />
	<ewa-item-submit v-show="cfg.TAG === 'submit'" :cfg="cfg" />
`
});

Vue.component('ewa-lf-th', {
	props: ['cfg', 'fnOrder'],
	template: `<td :class="cfg._className" v-show="cfg.TAG !== 'button'">
	<nobr :id="cfg.NAME" v-show="cfg.IS_ORDER">
		<a class="EWA_TD_HA" v-on:click="fnOrder" :field="cfg.NAME" >{{cfg.DES}}</a>
	</nobr>
	<nobr :id="cfg.NAME" v-show="!cfg.IS_ORDER">{{cfg.DES}}</nobr>
</td>`
});
Vue.component('ewa-lf-td', {
	props: ['cfg'],
	template: `
<td :class="cfg._className" v-show="cfg.TAG !== 'button'" :tt="cfg.TAG">
	<ewa-item-span v-if="cfg.TAG === 'span'" :cfg="cfg" />
	<ewa-item-button v-else-if="cfg.TAG === 'button'" :cfg="cfg" />
	<div v-else>{{cfg.VAL}}</div>
</td>`
});
 var getFrameFrameVueCfg = (targetId, lfData) => {
	var cfg = {
		el: targetId,
		data: {
			rst: lfData
		},
		methods: {
			getMainId: function() {
				return "EWA_FRAME_" + this.rst.FRAME_UNID;
			},
			getFormId: function() {
				return "f_" + this.rst.FRAME_UNID;
			},
			thclass: function(cfg) {
				return 'EWA_TD_H ewa-col-' + cfg.NAME;
			},
			tdclass: function(cfg) {
				return 'EWA_TD_M ewa-row-' + cfg.NAME;
			},
		}, mounted: function() {
			EWA_Utils.JsRegister(this.rst.JSFRAME);
			EWA_Utils.JsRegister(this.rst.JS);
		},
		template: `<div>
<table id="Test1" style='width:700px' border='0' cellspacing='0' cellpadding='0' align='center'>
<tbody><tr><td vAlign='top'>

	<form autocomplete="off" :id="getFormId()" method="post" :name="getFormId()" onsubmit="EWA.F.FOS[this.id.replace(&quot;f_&quot;,&quot;&quot;)].DoPost(this);return false;">
		<table :id="getMainId()" class="ewa-frame EWA_TABLE" border="0" cellpadding="1" cellspacing="1">
			<tbody>
				<tr show_msg="1" 
					v-if="cfg.TAG != 'button' && cfg.TAG != 'submit'" 
					v-for="cfg in rst.CFG" 
					:key="cfg.$index"
				>
					<td class='EWA_TD_L'>{{cfg.DES}}</td>
					<td :class='tdclass(cfg)'><ewa-f-item :cfg="cfg" /></td>
				</tr>
				<tr>
					<td class="EWA_TD_B" colspan="2" align="right">
						<template v-for="cfg in rst.CFG">
							<ewa-item-button v-if="cfg.TAG == 'button'" :cfg="cfg"></ewa-item-button>
							<ewa-item-submit v-else-if="cfg.TAG == 'submit'" :cfg="cfg"></ewa-item-submit>
						</template>
					</td>
				</tr>
			</tbody>
		</table>
 	</form>

</td></tr></tbody></table>
</div>`
	};
	return cfg;
};
var getListFrameVueCfg = (targetId, lfData) => {
	var cfg = {
		el: targetId,
		template: `<div>
<table id="Test1" style='width:100%' border='0' cellspacing='0' cellpadding='0' align='center'>
<tbody>
<tr>
<td  vAlign='top'>
<div>
	<table class="ewa-lf-frame EWA_TABLE" :id="getMainId()"><tbody>
		<tr class='ewa-lf-header' ewa_tag="HEADER">
			<ewa-lf-th 
				v-for="cfg in rst.CFG" 
				:cfg="getCfgData(cfg)"
				:key="cfg.$index"
				:fnOrder="order"
			></ewa-lf-th>
		</tr>
		<tr :ewa_key="rowData.EWA_KEY" 
			v-on:mouseover="mover"
			v-on:mousedown="mdown"
			class='ewa-lf-data-row' v-for="rowData in rst.DATA">
			<ewa-lf-td 
				v-for="cfg in rst.CFG" 
				:key=" cfg.$index"
				:cfg="getRowData(cfg, rowData)"
				/>
		</tr>
	</tbody></table>

	<table border="0" class="ewa-lf-frame-split" id="__ewa_listframe_spit">
	<tbody><tr>
		<td>
			页次：<b class="ewa-page-current">{{rst.PAGEINFO.PAGE_CURRENT}}</b>/<b class="ewa-page-count">{{rst.PAGEINFO.PAGE_COUNT}}</b>页
			每页 <input class="EWA_INPUT ewa-page-size" style="width:30px;text-align:right" type="text" :value="rst.PAGEINFO.PAGE_SIZE" size="3" maxlength="3" v-on:blur="pageNewSize">
			/<b class="ewa-total-records">{{rst.PAGEINFO.RECORD_COUNT}}</b>记录
		</td>
		<td nowrap="">
			<table border="0" align="right"><tbody><tr>
				<td class="ewa-page-first" nowrap="">
					<a v-show="rst.PAGEINFO.PAGE_CURRENT > 1" v-on:click="pageTop">首页</a>
					<span v-show="rst.PAGEINFO.PAGE_CURRENT == 1">首页</span>
				</td>
				<td class="ewa-page-prev" nowrap="">
					<a v-show="rst.PAGEINFO.PAGE_CURRENT > 1" v-on:click="pagePrev">上一页</a>
					<span v-show="rst.PAGEINFO.PAGE_CURRENT == 1">上一页</span>
				</td>
				<td class="ewa-page-next" nowrap="">
					<a v-show="rst.PAGEINFO.PAGE_CURRENT < rst.PAGEINFO.PAGE_COUNT" v-on:click="pageNext">下一页</a>
					<span v-show="rst.PAGEINFO.PAGE_CURRENT >= rst.PAGEINFO.PAGE_COUNT">上一页</span>
				</td>
				<td class="ewa-page-last" nowrap="">
					<a v-show="rst.PAGEINFO.PAGE_CURRENT < rst.PAGEINFO.PAGE_COUNT" v-on:click="pageEnd">末页</a>
					<span v-show="rst.PAGEINFO.PAGE_CURRENT >= rst.PAGEINFO.PAGE_COUNT">末页</span>
				</td>
				<td class="ewa-page-go">到</td>
				<td class="ewa-page-go"><input type="text" v-on:blur="pageGo" size="4" maxlength="6" class="EWA_INPUT ewa-page-goto" style="width:30px"></td>
				<td class="ewa-page-go">页</td>
			</tr></tbody></table>
		</td>
	</tr></tbody></table>
</div>
</td></tr></tbody></table>
</div>`,
		data: {
			rst: lfData
		},
		methods: {
			getMainId: function() {
				return "EWA_LF_" + this.rst.FRAME_UNID;
			},
			pageNewSize: function(event) {
				var newPageSize = event.target.value;
				EWA.F.FOS[this.rst.FRAME_UNID].NewPageSize(newPageSize);
			},
			pageGo: function(event) {
				if (event.target.value != '') {
					var page = event.target.value;
					EWA.F.FOS[this.rst.FRAME_UNID].Goto(page);
				}
			},
			pageTop: function() {
				var page = 1;
				EWA.F.FOS[this.rst.FRAME_UNID].Goto(page);
			},
			pageNext: function() {
				var page = this.rst.PAGEINFO.PAGE_CURRENT + 1;
				EWA.F.FOS[this.rst.FRAME_UNID].Goto(page);
			},
			pagePrev: function() {
				var page = this.rst.PAGEINFO.PAGE_CURRENT - 1;
				EWA.F.FOS[this.rst.FRAME_UNID].Goto(page);
			},
			pageEnd: function() {
				var page = this.rst.PAGEINFO.PAGE_COUNT;
				EWA.F.FOS[this.rst.FRAME_UNID].Goto(page);
			},
			order: function(event) {
				var obj = event.target;
				var field = $(obj).attr('field');
				EWA.F.FOS[this.rst.FRAME_UNID].Sort(field);
				var tag;
				if (field.endsWith('DESC')) {
					field = field.replace('DESC', '').trim();
					tag = 'v';
				} else {
					field = field + " DESC";
					tag = '^';
				}
				$(obj).attr('field', field);
				var text = $(obj).text().split(' ')[0] + ' ' + tag;
				$(obj).text(text);
			},
			mover: function(event) {
				var obj = event.target;
				if (obj.tagName != 'TR') {
					obj = $(obj).parentsUntil('tbody').last()[0];
				}
				EWA.F.FOS[this.rst.FRAME_UNID].MOver(obj, event);
			},
			mdown: function(event) {
				var obj = event.target;
				if (obj.tagName != 'TR') {
					obj = $(obj).parentsUntil('tbody').last()[0];
				}
				EWA.F.FOS[this.rst.FRAME_UNID].MDown(obj, event);
			},
			getCfgData: function(cfg) {
				var o = {};
				for (var n in cfg) {
					o[n] = cfg[n];
				}
				o._className = this.thclass(cfg);
				return o;
			},
			getRowData: function(cfg, rowData) {
				var o = {};
				for (var n in cfg) {
					o[n] = cfg[n];
				}
				o.VAL = rowData[cfg.DF + "_HTML"] ? rowData[cfg.DF + "_HTML"] : rowData[cfg.DF];
				o._className = this.tdclass(cfg);
				if (o._ONCLICK) {
					var r1 = /\@[a-zA-Z0-9\-\._:]*\b/ig;
					var m1 = o._ONCLICK.match(r1);
					if (m1 != null) {
						var tmp_html = o._ONCLICK;
						for (var i = 0; i < m1.length; i++) {
							var key = m1[i];
							var id = key.replace('@', '').toUpperCase();
							var val = rowData[id];
							tmp_html = tmp_html.replace(key, val);
						}
						o._ONCLICK = tmp_html;
					}
				}
				return o;
			},
			thclass: function(cfg) {
				return 'EWA_TD_H ewa-col-' + cfg.NAME;
			},
			tdclass: function(cfg) {
				return 'EWA_TD_M ewa-col-' + cfg.NAME;
			},

		}, mounted: function() {
			EWA_Utils.JsRegister(this.rst.JSFRAME);
			EWA_Utils.JsRegister(this.rst.JS);
			var s1 = "(function(){var o = EWA.F.FOS['" + this.rst.FRAME_UNID + "'];";
			var s2 = `
	o.ReShow();
	o.ShowSearch();
	o.SelectSingle();
	o.DblClick(0);
})();`;
			EWA_Utils.JsRegister(s1 + s2);
			var c = this;
			EWA.F.FOS[this.rst.FRAME_UNID].Goto = function(gotoPage, httpReferer) {
				EWA.F.CID = this._Id;

				this._PageCurrent = gotoPage;
				this._Ajax = this.CreateAjax();

				var url = new EWA_UrlClass();
				url.SetUrl(this.Url == null ? document.location.href : this.Url);

				url.AddParameter(this._PageCurrentName, this._PageCurrent);
				if (this._PageSize) {
					url.AddParameter(this._PageSizeName, this._PageSize);
				}
				if (this._Sort != null) {
					url.AddParameter(this._SortName, this._Sort);
				}
				if (this._SearchExp != null && this._SearchExp != "") {
					url.AddParameter("EWA_LF_SEARCH", this._SearchExp);
				}
				if (this.GotoParas != null && this.GotoParas.length > 0) {
					for (var i = 0; i < this.GotoParas.length; i += 1) {
						url.AddParameter(this.GotoParas[i].Name, this.GotoParas[i].Value);
					}
				}
				url.AddParameter("EWA_AJAX", "JSON_EXT1");

				$J(url.GetUrl(), function(rst) {
					c.rst = rst;
				});
			};
		}
	};
	return cfg;
}
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
}  if (typeof define === 'function' && define.amd) {
    define(function () {
      return EWA_VueClass;
    })
  } else if (typeof module === 'object' && module.exports) {
    module.exports = EWA_VueClass
  } else {
    call.EWA_VueClass = EWA_VueClass;
  }
})(this);