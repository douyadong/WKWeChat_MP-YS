/*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
1. 项目名称：悟空找房+微信小程序
2. 文件名：pages -> xf -> detail.js
3. 作者：zhaohuagang@lifang.com
4. 备注：新房详情页面脚本逻辑
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
import request from "../../utils/request" ;
import $ from "../../utils/extend" ;
import houseComment from "../components/house-comment" ;
import swiper from "../components/swiper" ;
import detailFoot from "../components/detailfoot" ;
let app = getApp() ;
/*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
定义页面初始化参数
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
let params = $.extend(true, {}, {
    data: {
        "qqMapKey": app.globalData.qqmapkey, //腾讯地图秘钥
        "pageParams": {} , //页面参数对象
        "openType" : "redirect"  //周边楼盘打开的姿势
    },
    /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    渲染页面方法
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
    render: function() {
        let _ = this;
        request.fetch({
            "module": "xf",
            "action": "detail",
            "data": {
                "subEstateId": _.data.pageParams.subEstateId,
                "agentId": _.data.pageParams.agentId,
                "guestPhoneNum": _.data.guestPhoneNum
            },
            success: function(res) {
                let result = res.data;
                /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                设置导航栏标题，格式为："区域 板块"
                -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
                wx.setNavigationBarTitle({
                    title: result.newHouseDetail.districtName + " " + result.newHouseDetail.townName
                });
                /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                给新房组件赋值
                -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
                result.xfSources = _.mapSource(result.aroundNewHouseList);
                /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                给评论组件赋值
                -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
                result.comments = result.comment && result.comment.commentList || [];
                /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                给相册和视频组件赋值
                -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
                result.imgUrls = [];
                //先将视频整合起来
                if (result.newHouseDetail.estateVideoResponse) result.imgUrls.push({ "url": result.newHouseDetail.estateVideoResponse.videoSmallImage, "videoUrl": result.newHouseDetail.estateVideoResponse.videoUrl, "type": "video" });
                //再整合图片
                if (result.newHouseDetail.cimageList) {
                    result.newHouseDetail.cimageList.forEach(function(element) {
                        result.imgUrls.push({ "url": element.imageUrl });
                    });
                }
                /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                根据百度地图坐标获取腾讯地图坐标
                -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
                app.getQQMapLocation(result.newHouseDetail.latitude, result.newHouseDetail.longitude, function(res) {
                    _.setData({
                        'newHouseDetail.latitude': res.data.locations[0].lat,
                        'newHouseDetail.longitude': res.data.locations[0].lng
                    })
                });
                /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                赋值页面数据
                -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
                _.setData({ "agentId" : _.data.pageParams.agentId }) ;  //swiper组件必须要传agentId
                //最后赋予模板变量
                result.agentInfo = result.agent ;
                _.setData(result) ;
            },
            fail: function() {
                wx.showModal({ "title": "错误提示", "content": res.message, "showCancel": false, "confirmText": "我知道了" });
            }
        });
    },
    /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    地图图片跳转
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
    openLocation: function() {
        wx.openLocation({
            longitude: parseFloat(this.data.newHouseDetail.longitude),
            latitude: parseFloat(this.data.newHouseDetail.latitude),
            name: this.data.newHouseDetail.estateName,
            address: this.data.newHouseDetail.initName
        });
    },
    /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    点击我要评论的时候检查是否登录
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
    gotoComment: function(event) {
        let url = event.currentTarget.dataset.url;
        let app = getApp();
        if(app.isLogin(true, url)){
            wx.navigateTo({
                url: url
            })
        }        
    } ,    
    /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    对于房源数据的处理：
    1. 把agentId加到房源数据中去的方法
    2. 新房价格为0时显示为待定
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
    mapSource: function(sources) {
        if (!sources) return sources;
        let _ = this;
        sources.forEach(function(element) {
            element.agentId = _.data.pageParams.agentId;
            if ( element.avgPriceWou !== undefined ) {
                let originalPrice = element.avgPriceWou ;
                element.avgPriceWou = ( ! originalPrice || parseInt( originalPrice , 10 ) === 0 ) ? "价格待定" : originalPrice + "元/㎡" ;
            }
        });
        return sources;
    },
    /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    页面加载完触发
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
    onLoad : function(options) {
        let userInfo = wx.getStorageSync('userInfo');
        let guestPhoneNum = userInfo && userInfo.mobile || '';
        //把页面参数保存到页面数据中
        this.setData({ "pageParams": options, "guestPhoneNum": guestPhoneNum });       
    } ,
    /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    页面显示完触发
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
    onShow : function() {
        //渲染页面
        this.render() ;
    } ,
    /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    转发标题设置
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
    onShareAppMessage : function() {
        return {
            title : "买房卖房，找好经纪人就对了！"
        }
    } 
}, houseComment, swiper, detailFoot) ;
/*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
实例化页面
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
Page(params) ;
