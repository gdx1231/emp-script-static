var ccc = null;

function loadJson1(ewaId, url, ewaWfType, ewaWfName) {
	if (ewaWfType != 'control') {
		$('_ewa_tr$EWA_WF_UOK').style.display = 'none';
	}

	$J(url, drawWf, ewaId, ewaWfType, ewaWfName);
}
function drawWf(json, cmds) {
	var id = cmds[0];
	var ewaWfType = cmds[1];
	var ewaWfName = cmds[2];

	$('wf').innerHTML = '';

	EWA.OW.Load();
	var f;
	for (var n in EWA.OW.PWin.EWA.F.FOS) {
		f = EWA.OW.PWin.EWA.F.FOS[n];
		break;
	}

	var units = {};
	var objs = [];
	for (var i = 0; i < f.WorkflowCfg.length; i++) {
		var cfg = f.WorkflowCfg[i];
		cfg.SET = 0;
		var unitTb = createUnit(cfg, ewaWfName, json);
		unitTb.setAttribute("idx", i);
		objs.push(unitTb);
		// alert(unitTb.outerHTML);
		$('wf').appendChild(unitTb);
		units[cfg.NAME] = cfg;
	}

	var inc = 0;
	var tb = document.createElement('table');
	document.body.appendChild(tb);
	tb.align = 'center';
	var tr = tb.insertRow(-1);
	for (var i = 0; i < objs.length; i++) {
		var td = tr.insertCell(-1);
		td.style.paddingLeft = '20px';
		td.appendChild(objs[i]);
	}

	for (var i = 0; i < objs.length; i++) {
		var o = objs[i];
		var cfg = units[o.id];
		if (cfg.TYPE == 'control') {
			var td1 = o.parentNode.nextSibling;
			var oyes = $(cfg.NEXT_YES);
			var ono = $(cfg.NEXT_NO);
			if (oyes.getAttribute('idx') * 1 > o.getAttribute('idx') * 1) {
				td1.appendChild(oyes);
			}
			if (ono.getAttribute('idx') * 1 > o.getAttribute('idx') * 1) {
				td1.appendChild(ono);
			}
		}
	}
	var cfg = units[ewaWfName];
	if (cfg == null) { // view
		var buts = $F(document, 'input', 'type', 'button,submit');
		for (var i = 0; i < buts.length - 1; i++) {
			buts[i].style.display = 'none';
		}
	} else if ($(cfg.NEXT_YES)) {
		$(cfg.NEXT_YES).style.cursor = 'pointer';
		$(cfg.NEXT_YES).style.backgroundColor = 'yellow';
		$(cfg.NEXT_YES).rows[0].cells[0].innerHTML += '<br>YES';
		$(cfg.NEXT_YES).onclick = function() {
			$('EWA_WF_UOK').value = 'COM_YES';
			if (ccc != null) {
				ccc.style.backgroundColor = 'yellow';
			}
			ccc = this;
			this.style.backgroundColor = 'blue';

		}

		if (ewaWfType != 'control') {
			$(cfg.NEXT_YES).click();
		}
	} else if ($(cfg.NEXT_NO)) {
		$(cfg.NEXT_NO).style.cursor = 'pointer';
		$(cfg.NEXT_NO).style.backgroundColor = 'yellow';
		$(cfg.NEXT_NO).rows[0].cells[0].innerHTML += '<br>NO';

		$(cfg.NEXT_NO).onclick = function() {
			$('EWA_WF_UOK').value = 'COM_NO';
			if (ccc != null) {
				ccc.style.backgroundColor = 'yellow';
			}
			ccc = this;
			this.style.backgroundColor = 'blue';

		}
	}
	$('wf').appendChild(tb);

	if (json.length > 0) {
		var j = json[json.length - 1];
		var curId = j.SYS_STA_VAL;
		if ($(curId)) {
			$(curId).style.border = '1px solid blue';
			$('M_' + curId).innerHTML = $('M_' + curId).innerHTML
					+ '<br><nobr style="font-size:9px;color:brown">当前节点</nobr>';
		}
	}
}
function createUnit(cfg, ewaWfName, json) {
	var tb = document.createElement('table');

	tb.cellSpacing = 1;
	tb.cellPadding = 1;
	tb.id = cfg.NAME;
	tb.align = 'center';
	var tr = tb.insertRow(-1);
	var td = tr.insertCell(-1);
	td.style.padddingBottom = '7px';

	if (ewaWfName != cfg.NAME) {
		td.style.backgroundColor = '#fff';
	} else {
		td.style.backgroundColor = 'darkblue';
		td.style.border = '1px solid blue';
		td.style.color = '#fff';
		td.style.fontWeight = 'bold';
	}
	var s = [];
	s.push(cfg.DES);

	for (var i = 0; i < json.length; i++) {
		var j = json[i];
		if (j.SYS_STA_TAG == cfg.NAME) {
			s.push('<span style="font-size:9px">' + j.ADM_NAME + '</span>');
			s.push('<nobr><span style="font-size:9px">'
					+ j.SYS_STA_CDATE.split('.')[0] + '</span></nobr>');
			var memo = '';
			if (j.SYS_STA_MEMO) {
				memo = j.SYS_STA_MEMO;
			}
			s.push('<span style="font-size:9px" id="M_' + tb.id + '">' + memo
					+ '</span>');
			td.style.backgroundColor = '#ccc';
		}
	}
	if (s.length == 1) {

		s.push('<span style="font-size:9px" id="M_' + tb.id + '"></span>'); // 备注

	}
	td.innerHTML = s.join('<br>');
	td.style.fontSize = '12px';

	td.height = '60';
	td.width = '80';
	td.align = 'center';
	td.vAlign = 'middle';

	return tb;

}