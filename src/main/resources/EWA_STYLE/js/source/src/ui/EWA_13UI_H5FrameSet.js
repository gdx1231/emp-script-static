function EWA_UI_H5FrameSet() {
    this.Create = function (frameId, frameType) {
        this.Id = frameId;
        this.FrameType = frameType;

        this.LOC_ID = "EWA_UI_H5FrameSet_" + this.Id;

        this.ParentDiv = $('#F0_' + this.Id).parent();
        this.objOne = this.ParentDiv.find('.ewa-frameset-one');
        this.objTwo = this.ParentDiv.find('.ewa-frameset-two');
        this.objSplit = this.ParentDiv.find('.ewa-frameset-split');
        this.objCover = this.ParentDiv.find('.ewa-frameset-cover');

		// 当 h5 页面，需要指定高度		
		//$('#EWA_FRAME_MAIN').css('height', '100vh');
		$('body').css('height', '100vh');

        if (frameType == 'H5') {
            this.CreateMoveH5(); // 水平移动
        } else {
            this.CreateMoveV5(); // 上下移动
        }
        if (window.localStorage[this.LOC_ID]) {
            var left = window.localStorage[this.LOC_ID] * 1;
            this.ChangeLocation(left);
        }

		
    };

    /**
     * 获取已经存在的移动实例
     */
    this._GetMoveInstance = function () {
        var name = "__EWA_MOVE_EWA_UI_H5FrameSetInstance";
        if (window[name]) {
            return window[name];
        }

        window[name] = new EWA.UI.Move();
        window[name].NAME = "__EWA_MOVE_EWA_UI_H5FrameSetInstance";
        window[name].Init(window[name]);
        
        return window[name];
    };

    /**
     * 上下移动
     */
    this.CreateMoveV5 = function () {
        this.mv1 = this._GetMoveInstance();
        var obj = this.objSplit[0];

        var c = this;
        this.mv1.AddMoveObjectY(obj, obj, function (a) { // 鼠标抬起
            c.objCover.hide();
            c.objSplit.css('z-index', 1);
        }, document.body, function (a, b) {// 鼠标移动
            var top = $(a).css('top').replace('px', '') * 1;
            c.ChangeLocation(top);
            window.localStorage[c.LOC_ID] = top;
            // console.log(c)
        }, function () {// 鼠标按下
            c.objCover.show();
        });
    };
    /**
     * 水平移动
     */
    this.CreateMoveH5 = function () {
        this.mv1 = this._GetMoveInstance();
        var obj = this.objSplit[0];
        var c = this;
        this.mv1.AddMoveObjectX(obj, obj, function (a) { // 鼠标抬起
            c.objCover.hide();
            c.objSplit.css('z-index', 1);
        }, document.body, function (a, b) {// 鼠标移动
            var left = $(a).css('left').replace('px', '') * 1;
            c.ChangeLocation(left);
            window.localStorage[c.LOC_ID] = left;
            // console.log(c)
        }, function () {// 鼠标按下
            c.objCover.show();
        });
    };

    this.ChangeLocation = function (left) {
        if (this.FrameType == 'H5') {
            this.objOne.css('width', left);
            this.objTwo.css('left', left + 1);
            this.objSplit.css('left', left);
        } else {
            this.objOne.css('height', left);
            this.objTwo.css('top', left + 1);
            this.objSplit.css('top', left);
        }
    };
}