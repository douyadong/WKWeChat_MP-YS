/*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
1. 项目名称：悟空找房+微信小程序
2. 文件名：pages -> agent -> qrcode.js
3. 作者：zhaohuagang@lifang.com
4. 备注：添加经纪人微信页面脚本逻辑
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
              "module": "agent" ,
              "action" : "getAgentInfo" ,              
              "mock" : false ,
              "data": {
                "agentId" :  _.data.pageParams.agentId
              } ,       
              success : function (res) {
                  let result = res.data ;
                  //经纪人公司名称取得规则：有简称显示简称，无简称显示全称，全称也没有就不显示
                 let abbreviation = result.abbreviation ;
                 let companyName = result.companyName ;
                 let finalCompanyName = abbreviation ? abbreviation : ( companyName ? companyName : "") ;
                 result.cardName = finalCompanyName + "经纪人" + result.agentName ;                
                  _.setData(res.data) ;
                  /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                 设置导航栏标题，格式为："公司名称 经纪人名称"
                 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
                 wx.setNavigationBarTitle({
                     title : result.cardName
                 }) ;
                  /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                  将微信号赋值到剪贴板
                  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
                  wx.setClipboardData({  data : res.data.agentWChatId }) ;
              } ,
              fail : function() {
                  wx.showModal({ "title" : "错误提示" , "content" : res.message , "showCancel" : false , "confirmText" : "我知道了" }) ;
              }
          }) ;
     } ,
    /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    页面加载完触发
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
     onLoad : function (options) {          
          //把页面参数保存到页面数据中
         this.setData({ "pageParams" : options }) ;
         this.render() ;   
    } ,
    onShareAppMessage : function() {
        return {
            "title" : "买房卖房，找好经纪人就对了！"            
        }
    }
} ;
/*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
实例化页面
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
Page(params) ;