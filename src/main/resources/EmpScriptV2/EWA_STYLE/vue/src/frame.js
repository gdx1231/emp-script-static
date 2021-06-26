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
