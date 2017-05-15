import request from "../../utils/request" ;
import $ from "../../utils/extend" ;
import houseComment from "../components/house-comment" ;
import swiper from "../components/swiper" ;
import detailFoot from "../components/detailfoot" ;
var app = getApp();

let params =$.extend(true , {} , {
     data : {
           "qqMapKey":app.globalData.qqmapkey 
     } ,
     render : function(options) {
          let  _ = this ;
          let subEstateId = options.subEstateId ;
          request.fetch({
              "module": "xf" ,
              "action" : "detail" ,
              "data" : {
                  "subEstateId" : _.data.subEstateId ,
                  "agentId" : _.data.agentId
              } ,
              "showLoading" :  true ,            
              success : function (res) {
                  let result = res.data ;
                  //给二手房和新房两个组件赋值
                  result.xfSources = result.aroundNewHouseList ;                  
                  result.comments = result.comment && result.comment.commentList || [] ; 
                  //给经纪人信息赋值
                  result.agentDetail = result.agent ;
                  result.imgUrls = [] ;
                  //先将视频整合起来
                  if(result.newHouseDetail.estateVideoResponse) result.imgUrls.push({ "url" : result.newHouseDetail.estateVideoResponse.videoSmallImage , "videoUrl" : result.newHouseDetail.estateVideoResponse.videoUrl , "type" : "video" }) ; 
                  //再整合图片
                  if(result.newHouseDetail.cimageList) {
                      result.newHouseDetail.cimageList.forEach(function(element) {
                          result.imgUrls.push({ "url" : element.imageUrl }) ; 
                      }) ;
                  }
                //根据百度地图坐标获取腾讯地图坐标
                app.getQQMapLocation(result.newHouseDetail.latitude, result.newHouseDetail.longitude, function(res) {
                    _.setData({
                        'newHouseDetail.latitude': res.data.locations[0].lat,
                        'newHouseDetail.longitude': res.data.locations[0].lng
                    })
                });
                  _.setData(result) ;
              }
          }) ;
     } ,
     openLocation: function() {
        wx.openLocation({
            longitude : parseFloat(this.data.newHouseDetail.longitude) ,
            latitude : parseFloat(this.data.newHouseDetail.latitude) ,
            name : this.data.newHouseDetail.estateName ,
            address : this.data.newHouseDetail.initName
        }) ;
    } ,
    gotoComment:function(event){
      let url = event.currentTarget.dataset.url;
      let app = getApp();
      app.isLogin(true, url);
      wx.navigateTo({
        url: url
      })  
    },
    onLoad : function (options) {
         //将页面传递过来的经纪人ID和新房ID保存起来供其他地方使用       
        this.setData({
          agentId : options.agentId ,
          subEstateId : options.subEstateId
        }) ;
        this.render(options) ;    
    }
} , houseComment , swiper , detailFoot ) ;

Page(params);
