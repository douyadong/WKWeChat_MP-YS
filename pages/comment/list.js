var request = require('../../utils/request.js');
var $ = require('../../utils/extend.js');
var houseComment = require('../components/house-comment.js');

var params = $.extend(true,{},{
    data: {
        comments: [],
        isLoading:false,
        isNoData:false
    },
    offset:1,
    isLoading:false,
    requestData:{},
    onLoad: function(option) {

        var mobile =  wx.getStorageSync('userInfo');
            mobile = mobile && mobile.mobile || '';
            
        this.requestData = $.extend(true,{},{
            offset:0,
            pageSize : 20 ,
            guestPhoneNum:mobile
        },option);

        request.fetch({
            data:this.requestData,
            module:'comment',
            action:'list',
            success:function(data){
                if(data.status === 1 && data.data){
                    this.setData({
                        "comments":data.data.commentList
                    })
                }
                if(!data.data){
                    this.setData({
                        "isNoData":true
                    })
                }
            }.bind(this)
        })
    },
    loadMore:function() {
        if(this.isLoading || this.data.isNoData)return;
        this.isLoading = true;
        this.offset++;
        this.requestData.offset = this.offset*10;
        
        request.fetch({
            data:this.requestData,
            module:'comment',
            action:'list',
            showLoading:true,
            //mock:true,
            success:function(data){
                if(data.status === 1 && data.data){
                    this.setData({
                        "comments":this.data.comments.concat(data.data.commentList)
                    })
                    setTimeout(function(){
                        this.isLoading= false;
                    }.bind(this),200)
                }
                if(!data.data){
                    this.setData({
                        "isNoData":true
                    })
                }
            }.bind(this),
            error:function(){
                this.offset--;
                this.setData({
                    "loadError":true
                })
            }.bind(this)
        })
    },
    bindErrorBtn:function(){
        this.isLoading=false;
        this.loadMore();
    },
    onShareAppMessage() {
        return {
            title : "买房卖房，找好经纪人就对了"
        }
    }
},houseComment);

Page(params);