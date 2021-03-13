/**
 * 显示隐藏列
 * 
 * @param instanceName
 */
function EWA_ListFrame_ShowHideColumns(instanceName){
	this._name=instanceName;
	this.frameUnid="";
	this.storageId="";
	this.inited=false;//已初始化
	this.notHideColsArr=[];//禁止隐藏的列
    this.defHideCols="";//默认隐藏的列
	this.readme="合并列和设置完初始查询条件后，再执行init。"
		+" 参数说明：SYS_FRAME_UNID;不隐藏的列（逗号分隔），复选列不隐藏"
		+" defHideCols 默认隐藏的列",
    this.wrap="",//容器ID，默认："#"+fraUnid+"_RESHOW"
    this.setWrap=function(wrapId){
		this.wrap="#"+wrapId;
	},
	this.initPart=function(fraUnid,notHideCols,defHideCols){
		var wrapId;
	    if($(".grp-part").length>0){
	        wrapId=$("#EWA_LF_"+fraUnid).parentsUntil(".grp-part").parent().attr("id");
	        this.setWrap(wrapId);
	    }
	    this.init(fraUnid,notHideCols,defHideCols);
	    if(wrapId){
	        $("#"+wrapId+" .but-shc-gear b.fa-gear").css({"line-height":"100%","font-size":"14px"});
	    }
	},
    this.init=function(fraUnid,notHideCols,defHideCols){
        if(!this.inited){
            var _self=this;
            this.frameUnid=fraUnid;
            if(!this.wrap){
            	this.wrap="#"+fraUnid+"_RESHOW";
            }
            this.defHideCols=defHideCols;
            this.storageId="LF_HIDE_COLS_"+this.frameUnid;
            if(notHideCols){
                this.notHideColsArr=notHideCols.split(",");
            }
            if(defHideCols && !window.localStorage.hasOwnProperty(this.storageId)){
                window.localStorage[this.storageId]=defHideCols;
            }
            var caption=$(this.wrap+" .ewa_lf_func_caption").parent();     
            
            var firstInit=false;
            if(caption.find(".but-shc-gear").length===0){
                firstInit=true;
                var but="<div class=\"ewa_lf_func_dact ewa-lf-func-recycle but-shc-gear\">"
                    +"<b class=\"fa fa-gear\" "
                    +" style=\"font-size: 16px;line-height: 30px;\"></b></div>";
                caption.append(but);
            
                caption.find(".but-shc-gear").on("click",function(){
                	_self.togglePanel();
                });
            }
            
            var hideIds=window.localStorage[this.storageId];
            var arrHideIds;
            if(hideIds){
                arrHideIds=hideIds.split(",");
                if(!firstInit){
                    for(var i=0;i<arrHideIds.length;i++){
                        $("#EWA_LF_"+fraUnid+" .ewa-col-"+arrHideIds[i]+".EWA_TD_H:hidden").show();
                    }
                }
            }else{
                arrHideIds=[];
            }
            
            var header=$("#EWA_LF_"+fraUnid+" .EWA_TD_H:not(:hidden)");
            var fields=[];
            header.each(function(){
                if($(this).find("a[href*='CheckedAll']").length===0){
                    var tdId=$(this).find("nobr").attr("id");
                    var tdName=$(this).text();
                    fields.push({"id":tdId,"name":tdName});
                }
            });
            
            if(fields.length===0){
                this.hideCols();
                return;
            }
            
            var ht=[];
            ht.push("<div class='custom-cols-panel-box' data-fid=\""+this.frameUnid+"\">");
            var headerContent="";
            if(EWA.LANG.toLowerCase()=="enus"){
                headerContent="Show/Hide";
                headerContent+="&nbsp;&nbsp;<a href='javascript:void(0)' class='but-default'>Default</a>"; 
            }else{
                headerContent="显示/隐藏列";  
                headerContent+="&nbsp;&nbsp;<a href='javascript:void(0)' class='but-default'>默认</a>";
            }
            
            headerContent+="<b class='fa fa-close but-close'></b>";
            ht.push("<div class='custom-cols-header'>"+headerContent+"</div>");
            
            ht.push("<div class='custom-cols-contain'>");
            
            
            ht.push("<ul>");
            for(var i=0;i<fields.length;i++){
                ht.push("<li><input type='checkbox' checked "
                    +" value='"+fields[i].id+"' id='custom_cols_id_"+fields[i].id+"'>"
                    +"<label for='custom_cols_id_"+fields[i].id+"'>"+fields[i].name.replace(/>/ig,'&gt')+"</label></li>");
            }
            ht.push("</ul>");
            ht.push("</div>");
            ht.push("</div>");
            caption.append(ht.join(""));
            
            caption.find(".but-default").on("click",function(){
            	_self.setDefault();
            });
            
            caption.find(".but-close").on("click",function(){
            	_self.togglePanel();
            });
            
            caption.find("li input[type=checkbox]").on("click",function(){
            	_self.setCol(this.value);
            });
            
            if(arrHideIds.length>0){
                for(var i=0;i<arrHideIds.length;i++){
                    if($(this.wrap+" .custom-cols-panel-box input[value='"+arrHideIds[i]+"']").length>0){
                        $(this.wrap+" .custom-cols-panel-box input[value='"+arrHideIds[i]+"']")[0].checked=false;
                    }else{
                        this.setCol(arrHideIds[i]);
                    }
                }
            }
            if(this.notHideColsArr.length>0){
                for(var i=0;i<this.notHideColsArr.length;i++){
                    var id2=this.notHideColsArr[i];
                    var obj=$(this.wrap+" .custom-cols-panel-box input[value='"+id2+"']");
                    if(obj.length>0){
                        obj.parent().addClass("not-hide-col");
                        if(!obj[0].checked){
                            this.setCol(id2);
                            obj[0].checked=true;
                        }
                        obj[0].disabled=true;
                    }
                }
            }
            
            this.inited=true;
        }
        this.hideCols();
    };
    this.adjustPanel=function(){    	
        var maxHeight=window.innerHeight-80;
        var containHeight=$(this.wrap+" .custom-cols-contain").height();
        var gearLeft=$(this.wrap+" .but-shc-gear").offset().left;
        var w=window.innerWidth;
        var panelWidth=$(this.wrap+" .custom-cols-panel-box").width();
        var right=(w-panelWidth)/2
        $(this.wrap+" .custom-cols-contain").css({"max-height":maxHeight});
        $(this.wrap+" .custom-cols-panel-box").css({"right":right,"top":"0"});
        
    };
    this.togglePanel=function(){
    	if(!this.inited){
    		this.init(this.frameUnid);
    	}
    	$(".custom-cols-panel-box[data-fid!=\""+this.frameUnid+"\"]").hide();
        $(this.wrap+" .custom-cols-panel-box").toggle();
        if(!$(this.wrap+" .custom-cols-panel-box").is("hide")){
            this.adjustPanel();
        }
    };
    this.hideCols=function(){
        var ids=window.localStorage[this.storageId];
        if(!ids){
            return;
        }
        var arrIds=ids.split(",");
        for(var i=0;i<arrIds.length;i++){
            this.hide(arrIds[i]);
        }
    };
    this.show=function(id){
        $("#EWA_LF_"+this.frameUnid+" .ewa-col-"+id).show();
        $("#EWA_SEARCH_ITEM_"+this.frameUnid+" .ewa-lf-search-item [name='"+id+"']")
            .parentsUntil(".ewa-lf-search-item").last().parent().show();
        $("#EWA_LF_"+this.frameUnid+" #ADD_ROW_"+id).show();
        $("#EWA_LF_"+this.frameUnid+" #INS_ROW_"+id).show();
    };
    this.hide=function(id){
        var pp=$("#EWA_SEARCH_ITEM_"+this.frameUnid+" .ewa-lf-search-item [name='"+id+"']")
            .parentsUntil(".ewa-lf-search-item").last().parent();
        pp.find("select").val("");
        pp.find("input[type=text]").val("");
        pp.find("input:checked").each(function(){this.checked=false});
        $("#EWA_LF_"+this.frameUnid+" .ewa-col-"+id).hide();
        pp.hide();
        $("#EWA_LF_"+this.frameUnid+" #ADD_ROW_"+id).hide();
        $("#EWA_LF_"+this.frameUnid+" #INS_ROW_"+id).hide();
    };
    this.setCol=function(id){
        if(!this.frameUnid){
            $Tip("not init");
        }
        if($("#EWA_LF_"+this.frameUnid+" .ewa-col-"+id+" a[href*='CheckedAll']").length>0){
            return;
        }
        var ids=window.localStorage[this.storageId];
        if(!ids){
            window.localStorage[this.storageId]=id;
            this.hide(id);
            return;
        }
        var arrIds=ids.split(",");
        var newArrIds=[];
        for(var i=0;i<arrIds.length;i++){
            if(id==arrIds[i]){
                this.show(id);
            }else{
                newArrIds.push(arrIds[i]);
            }
        }
        if(arrIds.length==newArrIds.length){
            newArrIds.push(id);
            this.hide(id);
        }
        window.localStorage[this.storageId]=newArrIds.join(",");
    };
    this.setDefault=function(){
       this.togglePanel();
       window.localStorage[this.storageId]=this.defHideCols;
       var ipts=$(this.wrap+" .custom-cols-panel-box input");
       for(var i=0;i<ipts.length;i++){
           ipts[i].checked=true;
       }
       if(this.defHideCols){
            var arrIds=this.defHideCols.split(",");
            for(var i=0;i<arrIds.length;i++){
                if($(this.wrap+" .custom-cols-panel-box input[value='"+arrIds[i]+"']").length>0){
                    $(this.wrap+" .custom-cols-panel-box input[value='"+arrIds[i]+"']")[0].checked=false;
                }else{
                    this.setCol(arrIds[i]);
                }
            }
        }
       EWA.F.FOS[this.frameUnid].Reload();
    }
}