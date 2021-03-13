2015-02-03
增加
EWA_UI_FlowChartClass   画横向流程
/**
 * 调用FlowChart
 * @param pid
 * @param json_url
 */
function init_flow_chart(pid, json_url) {
	//var u = EWA.CP + '/agent/r_status_chk.jsp?chk_method=EDU-AGT-COS&' + $U();

	var id1 = pid + '_______sub';
	$X(pid).innerHTML = '<div id="' + id1 + '" style="padding: 20px 0;background:#fff"></div>';

	
	$J(json_url, function(datas) {
		var aa = new EWA_UI_FlowChart();
		aa.Create(id1, datas, 'id', draw_chart_text, 222, 80);
	});
}
/**
 * 写FlowChart
 * @param d
 * @returns
 */
function draw_chart_text(d) {
	if (d.st == 'yes') {
		var m1 = d.memo || '';
		m1 = m1.replace(/,/ig, '<br>');

		return "<div style='line-height:30px;font-size:16px;'><b class='fa fa-check'></b>" + d.id
			+ "</div><div style='line-height:14px;font-size:12px'>" + m1 + "</div>";
	} else if (d.st == 'wait') {
		var m1 = d.memo || '';
		m1 = m1.replace(/,/ig, '<br>');
		return "<div style='line-height:30px;font-size:16px;'><b class='fa fa-star-half-o'></b>" + d.id
			+ "</div><div style='line-height:14px;font-size:12px'>" + m1 + "</div>";
	} else if (d.st == 'no') {
		var m1 = d.memo || '';
		m1 = m1.replace(/,/ig, '<br>');

		return "<div style='line-height:30px;font-size:16px;'><b class='fa fa-star-o'></b>" + d.id
			+ "</div><div style='line-height:14px;font-size:12px'>" + m1 + "</div>";
	} else {
		return d.id;
	}
}



2015-01-15
修改
EWA_FrameClass _DoValidExAction 改为匿名函数执行
obj.setAttribute('show_alert',0); 表示无论如何都显示提示信息

2015-01-12
修改
EWA_WF loadWfShow, 将数据库中指定的用户改写到当前节点上 
if (i == sts.length - 1) {
	var next1 = st.SYS_STA_VAL;
	var unitNext = _tmp_units[next1];
	// 设置当前可操作用户为状态表的ID列表,原则上一致,但是当手动调整流程时进行转换
	unitNext.WF_UNIT_ADM_LST = st.ROLE_IDS;
	// 审批类型为用户定义的审批类型,原则上一致,但是当手动调整流程时进行转换
	unitNext.WF_UNIT_ADM = st.ROLE_TYPE;
	EWAC_WfUtil["WF"].CurUnit = unitNext; // 当前节点
}

修改 
EWA_FrameCommonItems CheckValid,添加了在每一个校验无误的情况下,去除提醒, 避免逻辑错误,当是必输项目和邮件格式时提示必须输入的内容
if (errorInfo)
			errorInfos.push(errorInfo);
else
			EWA_FrameRemoveAlert(obj);
增加
EWA.UI.Ext.Mobile(辅助手机输入)和EWA.UI.Ext.IdCard(辅助身份证输入)



2015-01-09
增加
EWA_Tanslator类,用于自动翻译, 调用方式
function translate_all() {
  var trans = new EWA_TanslatorCalss();
  var froms = $('span[id=VIS_REQ_NAME]');
  var tos = $('span[id=VIS_REQ_NAME_EN]');
  trans.transAll(froms, tos, translate_call_back, function(){
  	console.log('完成全部翻译');
  });
}
function translate_call_back(f, rst) {
  var tr = f.parentNode.parentNode;
  var id = tr.getAttribute('EWA_KEY');
  var p = 'VIS_REQ_NAME_EN=' + rst.toURL() + '&VIS_REQ_id=' + id + '&EWA_AJAX=json&EWA_ACTION=ExtendAction0';
  var u = $U2('@xmlname', '@itemname', p);
  $J(u, function() {});
}

