/*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
1. 项目名称：悟空找房+微信小程序
2. 文件名：pages -> xf -> layouts.js
3. 作者：zhaohuagang@lifang.com
4. 备注：新房户型信息页面脚本逻辑
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
import request from "../../utils/request" ;
/*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
定义页面初始化参数
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
let params = {
     data : {
         "pageParams" : {} ,  //页面参数对象     
     } ,
    /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    渲染页面方法
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
     render : function() {
          let  _ = this ;          
          request.fetch({
              "module" : "xf" ,
              "action" : "layouts" ,              
              "mock" : false ,
              "data" : {
                "subEstateId" : _.data.pageParams.subEstateId
              } ,             
              success : function (res) {
                  let pageCurrentParam = parseInt(_.data.pageParams.current , 10 ) ;                    
                  //赋予模板变量
                  _.setData({ "layouts" : res.data ,"current" : pageCurrentParam }) ;
                  /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                  设置导航栏标题，格式为："户型名称 index / count"
                  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
                  wx.setNavigationBarTitle({
                      title : _.data.layouts[pageCurrentParam].name + " " + (pageCurrentParam + 1).toString() + " / " + _.data.layouts.length.toString()
                  }) ;
              } ,
              fail : function() {
                  wx.showModal({ "title" : "错误提示" , "content" : res.message , "showCancel" : false , "confirmText" : "我知道了" }) ;
              }
          }) ;
     } ,
     /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    设置导航栏标题，格式为："户型名称 index / count"
     -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
     setNavigatorTitle : function(event) {
        wx.setNavigationBarTitle({
            title : this.data.layouts[event.detail.current].name + " " + (event.detail.current + 1).toString() + " / " + this.data.layouts.length.toString()
        }) ;
     } ,
     /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    页面加载完触发
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
     onLoad : function (options) {
         //把页面参数保存到页面数据中
         this.setData({ "pageParams" : options }) ;         
        this.render() ;        
    }
} ;
/*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
实例化页面
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
Page(params) ;