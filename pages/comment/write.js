var util = require('../../utils/util.js')
var $ = require('../../utils/extend.js')
var request = require('../../utils/request.js')
var apiUrl = require('../../utils/apiUrl.js')


var params = $.extend(true,{},{
    data: {
        "uploadImages":[],
        "uploadTextarea":""
    },
    total : [],
    textareaValue : "",
    userInfo:'',
    initData :{},
    isSending :false,
    onLoad: function(option) {
        this.initData = $.extend(true,{},option);
        this.userInfo = wx.getStorageSync('userInfo');
    },
    bindblur: function(e){
        this.textareaValue = e.detail.value;
        this.setData({
            "uploadTextarea":this.textareaValue
        })
    },
    chooseImg: function(e) {
        var _this = this;
        wx.chooseImage({
            count: 3, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function(res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                var tempFilePaths = res.tempFilePaths,
                    currentFilePaths = _this.data.uploadImages;
                if(tempFilePaths.length+currentFilePaths.length > 3){
                    wx.showToast({
                        title: '只能上传3张图片'
                    })
                }else{
                    currentFilePaths=currentFilePaths.concat(tempFilePaths);
                    _this.setData({
                        "uploadImages":currentFilePaths
                    })
                }
            }
        })
    },
    deletImageItem:function(e){
        var currentFilePaths = this.data.uploadImages,
            index = e.currentTarget.dataset && e.currentTarget.dataset.id;
        currentFilePaths.splice(index,1);
        this.setData({
            "uploadImages":currentFilePaths
        })
    },
    uploadFile:function(file,i){
        var _this = this;
        wx.uploadFile({
            url:apiUrl.get('comment','uploadImg'),
            filePath: file[i],//这里是多个不行tempFilePaths[0]这样可以
            name: 'file',
            success: function(res){
                var data = res.data;
                data = JSON.parse(data);
                data = data.data[0];

                if((i+1)!=file.length){
                    _this.total.push(data);
                    _this.uploadFile(file,i+1);
                }else{
                    _this.total.push(data);
                    wx.hideToast();  //隐藏Toast
                    _this.uploadFormSubmit();
                }
            },
            fail: function (e) {
                var n = i+1;
                /*if (wx.canIUse('showLoading')) {
                    wx.hideLoading()
                }else{
                    wx.hideToast()
                }*/
                wx.hideToast()
                wx.showModal({
                    title: '提示',
                    content: '第'+n+'张图片上传失败,ERROR:'+JSON.stringify(e),
                    showCancel: true
                })
            }
        })
    },
    uploadFormSubmit:function(){
        var requestData = {
            guestPhoneNum:this.userInfo.mobile,
            subEstateId:parseFloat(this.initData.subEstateId),
            comment:this.textareaValue,
            commentLocation:this.initData.commentLocation,
            imageKeys:this.total.join(',')
        }
        /*if (wx.canIUse('showLoading')) {
            wx.hideLoading()
        }else{
            wx.hideToast()
        }*/
        wx.hideToast()
        request.fetch({
            data:requestData,
            module:'comment',
            action:'write',
            method:'POST',
            showTitle:'提交中',
            success:function(data){
                if(data.status === 1){
                    this.isSending = false;
                    wx.showModal({
                        title: '成功',
                        content: '评价成功',
                        showCancel:false,
                        success: function(res) {
                            if (res.confirm) {
                                wx.navigateBack()
                            } else if (res.cancel) {
                                console.log('用户点击取消')
                            }
                        }
                    })
                }
            }.bind(this),
            fail:function(data){
                this.isSending = false;
                wx.showModal({
                    title: '提示',
                    content: data.message || '评价失败，稍后重试',
                    showCancel: false
                })
            }.bind(this)
        })
    },
    bindFormSubmit: function(e) {
        var reg = /(\d{11,15})|((\d{7,8})|(\d{3,4}-?\d{7,8}))|([-——#\/]?\d{7-12}[-——#\/]?)/,
            value = this.data.uploadTextarea;
        if(value===""){
            wx.showModal({
                title: '提示',
                content: '请填写评论',
                showCancel: false
            })
            return;
        }
        if(reg.test(value)){
            wx.showModal({
                title: '提示',
                content: '您所发布的评论不能包含联系方式哦，请修改。',
                showCancel: false
            })
            return;
        }
        if(this.isSending){
            console.log('退出提交')
            return;
        }
        this.isSending = true;

        if(this.data.uploadImages.length>0){
            /*if (wx.canIUse('showLoading')) {
                wx.showLoading({
                    title: '图片上传中'
                })
            }else{
                wx.showToast({
                    icon:'loading',
                    title: '图片上传中'
                })
            }*/
            wx.showToast({
                icon:'loading',
                title: '图片上传中'
            })
            
            this.uploadFile(this.data.uploadImages,0)
        }else{
            this.uploadFormSubmit()
        }
    }
})

Page(params)