function EWA_WebSocketClass(wsUrl) {
	this.inited = false; // 曾经初始化过
	this.connected = false;
	this.socket = null;
	this.cbs = {};
	this.cbs_length = 0;
	this.handleBroadMsgs = {}; // 处理广播消息方法的容器
	this.handleOnReconnected = {}; // 断线后重新上线调用方法的容器
	this.handleOnOffline = {}; // 断线后处理的方法
	this.url = wsUrl;
	this.init = function(cb, debug) {
		this.inited = true;
		this.open(cb);
		this.debug = debug;

	};
	/**
	 * 注册处理广播消息的方法
	 * 
	 * @param handleId
	 *            方法ID
	 * @param func
	 *            处理方法
	 */
	this.registerHandleBroadMsg = function(handleId, func) {
		this.handleBroadMsgs[handleId] = func;
	};
	/**
	 * 取消注册 广播消息的方法
	 * 
	 * @param handleId
	 *            方法ID
	 */
	this.unRegisterHandleBroadMsg = function(handleId) {
		this.handleBroadMsgs[handleId] = null;
	};
	/**
	 * 注册当断线后重新上线调用的方法
	 * 
	 * @param handleId
	 *            方法ID
	 * @param func
	 *            处理方法
	 */
	this.registerOnReconnected = function(handleId, func) {
		this.handleOnReconnected[handleId] = func;
	};
	/**
	 * 取消 注册当断线后重新上线调用的方法
	 * 
	 * @param handleId
	 *            方法ID
	 */
	this.unRegisterOnReconnected = function(handleId) {
		this.handleOnReconnected[handleId] = null;
	};
	/**
	 * 注册当断线后调用的方法
	 * 
	 * @param handleId
	 *            方法ID
	 * @param func
	 *            处理方法
	 */
	this.registerOnOffline = function(handleId, func) {
		this.handleOnOffline[handleId] = func;
	};
	/**
	 * 取消 注册当断线后调用的方法
	 * 
	 * @param handleId
	 *            方法ID
	 */
	this.unRegisterOnOffline = function(handleId) {
		this.handleOnOffline[handleId] = null;
	};

	/**
	 * 发送消息
	 * 
	 * @param command
	 *            执行的命令
	 * @param cb
	 *            回调函数
	 */
	this.send = function(command, cb) {
		if (!this.connected) { // 为连接
			console.log('未连接');
			return false;
		}
		if (this.debug) {
			console.debug(command, cb);
		}
		this.socket.send(JSON.stringify(command));
		if (cb) {
			// 消息返回时，通过返回的ID找到回调函数并执行
			this.cbs[command.ID] = cb;
			this.cbs_length++;
		}

		return true;
	};
	// 关闭连接
	this.closeWebSocket = function() {
		this.socket.close();
	};
	/**
	 * 试图清除回调，避免长期执行对内存的占用
	 */
	this.tryClearCbs = function() {
		if (this.cbs_length > 200) {
			// 超过200，强制清空
			this.cbs = {};
			this.cbs_length = 0;

			if (this.debug) {
				console.debug("tryClearCbs：超过200，强制清空");
			}
			return;
		}
		for ( var n in this.cbs) {
			if (this.cbs[n] != null) {
				// 回调还在执行
				return;
			}
		}
		if (this.debug) {
			console.debug("tryClearCbs：清空" + this.cbs_length);
		}
		this.cbs = {};
		this.cbs_length = 0;
	};
	// 当收到消息时处理
	// 根据返回的JSON.ID获取 cbs 的对应的回调方法，回调用完就抛弃
	// 如果 返回JSON.BROADCAST_ID 的对应的回调方法，方法不会抛弃
	this.onMessage = function(event) {
		// console.log(event);
		var c = this;
		try {
			var json = JSON.parse(event.data);
			if (json.ID && c.cbs[json.ID]) {
				var func = c.cbs[json.ID];
				if (!func) {
					return;
				}

				if (c.debug) {
					console.debug("执行回调方法");
					console.debug(json.ID, func);
				}
				try {
					func(json, event);
				} catch (err) {
					console.log(event);
					console.log(func);
					console.log(err);
				}
				c.cbs[json.ID] = null;

				if (c.cbs_length > 10) {
					c.tryClearCbs();
				}
			} else if (json.BROADCAST_ID && c.handleBroadMsgs[json.BROADCAST_ID]) {
				var func = c.handleBroadMsgs[json.BROADCAST_ID];
				if (!func) {
					return;
				}
				if (c.debug) {
					console.debug("执行广播消息回调的方法");
					console.debug(func);
				}
				// 对应广播消息回调的方法
				try {
					func(json, event);
				} catch (err) {
					console.log(event);
					console.log(func);
					console.log(err);
				}
			}
		} catch (e) {
			console.log(event);
			console.log(e);
		}
		// c.setMessageInnerHTML(event.data);
	};

	this.onOpen = function(e, cb) {
		var c = this;
		c.connected = true;

		if (cb) {
			cb();
		} else {
			// 当断线后重新上线调用的方法
			for ( var n in c.handleOnReconnected) {
				var func = c.handleOnReconnected[n];
				if (c.debug) {
					console.debug(n, func);
				}
				try {
					if (func) {
						func(this, event);
					}
				} catch (err) {
					console.error(n);
					console.error(func);
					console.error(err);
				}
			}
		}

		// 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，
		// 防止连接还没断开就关闭窗口，server端会抛异常。
		window.onbeforeunload = function() {
			c.CLOSED_ON_QUIT = true;
			c.socket.close();
		};

		c._Attempts = 0;
		c._maxTimeout = 0;
	};
	this.onError = function(e) {
		var c = this;
	};
	this.onClose = function(e) {
		var c = this;
		// 从连接到非连接只调用一次
		if (c.connected) {
			for ( var n in c.handleOnOffline) {
				// 当断线后重新上线调用的方法
				var func = c.handleOnOffline[n];
				try {
					if (func) {
						func(this, e);
					}
				} catch (err) {
					console.error(n);
					console.error(func);
					console.error(err);
				}
			}
		}
		c.connected = false;
		if (c.CLOSED_ON_QUIT) {
			console.log("closed");
			return;
		}
		// 重试次数
		c._Attempts ? c._Attempts++ : c._Attempts = 0;
		if (c._maxTimeout == 0) {
			// 按照重试次数，增加重试时间间隔
			var timeout = 555 * Math.pow(1.1, c._Attempts);
			if (timeout > 3000) {
				timeout = 3210; // 最大时间间隔
				c._maxTimeout = timeout;
			}
		} else {
			timeout = c._maxTimeout;
		}
		// 重试连接
		setTimeout(function() {
			c.open();
		}, timeout);
	};
	/**
	 * 初始化
	 */
	this.open = function(cb) {
		var websocket = new WebSocket(this.url);
		var c = this;
		// 连接发生错误的回调方法
		websocket.onerror = function(event) {
			if (c.debug) {
				console.debug(event);
			}
			c.onError(event);
		};

		// 连接成功建立的回调方法
		websocket.onopen = function(event) {
			if (c.debug) {
				console.debug(event);
			}
			c.onOpen(event, cb);
		};
		// 接收到消息的回调方法
		websocket.onmessage = function(event) {
			if (c.debug) {
				console.debug(event);
			}
			c.onMessage(event);
		};

		// 连接关闭的回调方法
		websocket.onclose = function(event) {
			if (c.debug) {
				console.debug(event);
			}
			c.onClose(event);
		};

		this.socket = websocket;
	};
};