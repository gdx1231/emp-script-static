(function(global, factory) {
	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = factory();
	} else {
		factory(global);
	}
})(typeof window !== "undefined" ? window : this, function(global) {
	let chnNumChar = {
		'零': 0, '0': 0, "０": 0, 'o': 0, 'O': 0,
		'一': 1, '壹': 1, '1': 1, "１": 1,
		'二': 2, '贰': 2, '2': 2, "２": 2,
		'三': 3, '叁': 3, '3': 3, "３": 3,
		'四': 4, '肆': 4, '4': 4, "４": 4,
		'五': 5, '伍': 5, '5': 5, "５": 5,
		'六': 6, '陆': 6, '6': 6, "６": 6,
		'七': 7, '柒': 7, '7': 7, "７": 7,
		'八': 8, '捌': 8, '8': 8, "８": 8,
		'九': 9, '玖': 9, '9': 9, "９": 9
	};
	let chnNameValue = {
		'十': { value: 10 },
		'拾': { value: 10 },
		'什': { value: 10 },
		'百': { value: 100 },
		'佰': { value: 100 },
		'陌': { value: 100 },
		'千': { value: 1000 },
		'阡': { value: 1000 },
		'仟': { value: 1000 },
		'万': { value: 10000 },
		'萬': { value: 10000 },
		'亿': { value: 100000000 }
	};
	let negative = {
		'-': true,
		'负': true,
		'－': true
	};
	function convertDot(strs) {
		let number = "0.";
		let scaleDot = 1;
		let prevName = null;
		for (let i = 0; i < strs.length; i++) {
			let alpha = strs[i];
			let num = chnNumChar[alpha];
			let name = chnNameValue[alpha];
			if (num != null) {
				number += num.toString();
				if (prevName) {
					throw '非连续小数点后单位：' + strs.join("");
				}
			} else if (name) {

				scaleDot = (prevName ? scaleDot : 1) * name.value;
				prevName = name;
			} else {
				throw '非数字或单位：' + alpha;
			}
		}
		// 0.3万
		let num1 = 1 * number;
		let num2 = number.startsWith("0") ? ("1" + number.substring(1)) * scaleDot : num1 * scaleDot;
		let fixed;
		if (scaleDot == 1) { // 没有计量单位
			fixed = number.toString().length - 2;
		} else if (num2 > scaleDot) {// 小数点后面位置
			fixed = number.length - scaleDot.toString().length + 1;
		} else {
			fixed = 0;
		}
		return [num1, scaleDot, fixed];

	}
	function convert(strs) {
		let number = 0;
		let scale = 1;
		let prevName = null;
		for (let i = strs.length - 1; i >= 0; i--) {
			let alpha = strs[i];
			if (i == 0) {
				if (negative[alpha]) {
					number = number * -1;
					continue;
				}
			}

			let num = chnNumChar[alpha];
			let name = chnNameValue[alpha];
			if (num != null) {
				number += num * scale;
				scale *= 10;
				prevName = null;
			} else if (name) {
				// 连续单位 1百万
				scale = (prevName ? scale : 1) * name.value;
				prevName = name;
			} else {
				throw '非数字或单位：' + alpha;
			}
		}
		return [number, 1, 0];
	}

	function chineseToNumber(chnStr) {
		if (!chnStr) {
			return 0;
		}
		let chnStrs = chnStr.replace(/，|,| /ig, '').replace(/点|。/ig, '.').split('.');
		if (chnStrs.length > 2) {
			throw '非数字表达式：' + chnStr;
		}
		let strs = chnStrs[0].split('');
		let dots = (chnStrs.length == 2 ? chnStrs[1] : "").split('');

		let number = convert(strs);
		let number1 = convertDot(dots);
		if (number1 == 0) {
			return number;
		} else {
			let fixed = number1[2] < 0 ? 0 : number1[2];
			let scale = number1[1];
			return ((number[0] + number1[0]) * scale).toFixed(fixed) * 1;
		}
	}
	if (window && window.EWA && window.EWA_Utils) {
		window.EWA_Utils.chineseToNumber = chineseToNumber;
	} else if (global) {
		global.chineseToNumber = chineseToNumber;
	} else {
		return chineseToNumber;
	}
});