/*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
1. 项目名称：悟空找房+微信小程序
2. 文件名：pages -> agent -> detail.js
3. 作者：zhaohuagang@lifang.com
4. 备注：经纪人详情页面脚本逻辑
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
import request from "../../utils/request" ;
import $ from "../../utils/extend" ;
import detailFoot from "../components/detailfoot" ;
var app = getApp() ;
/*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
用来标识页面当前是否正在下拉加载数据
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
let esfIsLoading = false ; 
let xfIsLoading = false ; 
/*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
定义上拉加载新房请求数据对象格式，并赋予初始值
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
let pullLoadXfRequestData =  { "agentId" : null , "pageIndex" : 0 , "pageSize" : 10 } ; 
let pullLoadEsfRequestData =  { "agentId" : null , "pageIndex" : 0 , "pageSize" : 10 } ; 
/*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
定义页面初始化参数
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
let params = $.extend(true , {} , detailFoot , {
    data : {
        "pageParams" : {} ,  //页面参数对象
        "esfIsNoData" : false ,  //用来标识页面二手房数据是否加载完毕
        "esfLoadError" : false ,  //是否存在二手房数据加载错误
        "xfIsNoData" : false ,  //用来标识页面新房数据是否加载完毕
        "xfLoadError" : false ,  //是否存在新房数据加载错误
        "currentSourcesTab" : "esf"  //默认设置推荐房源停留在新房这个tab，等待切换
    } ,
    /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    渲染页面方法
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
    render : function() {
        let _ = this ;       
        request.fetch({
            "module": "agent",
            "action": "detail",            
            "data": { "agentId" :  _.data.pageParams.agentId } ,
            "showLoading": true ,
            "mock" : false ,
            success: function(res) {
                let result = res.data ;
                //经纪人公司名称取得规则：有简称显示简称，无简称显示全称，全称也没有就不显示
                let abbreviation = result.simpleAgentDetail.abbreviation ;
                let companyName = result.simpleAgentDetail.companyName ;
                let finalCompanyName = abbreviation ? abbreviation : ( companyName ? companyName : "") ;
                result.simpleAgentDetail.finalCompanyName = finalCompanyName ;
                result.shareTitle = finalCompanyName + "经纪人" + result.simpleAgentDetail.agentName ;
                //给二手房和新房两个组件赋值，并将agentId带进去
                result.xfSources = _.mapSource(result.recommendNewHouseList) ;                 
                result.esfSources = _.mapSource(result.recommendOldHouseList) ; 
                //判断熟悉商圈后面是否需要出...更多
                let agentBizTownList = result.simpleAgentDetail.agentBizTownList || [] ;
                agentBizTownList = agentBizTownList.join(",") ;
                result.agentBizTownListExtendable = agentBizTownList && agentBizTownList.length > 16 ? true : false ;
                result.simpleAgentDetail.shortAgentBizTownList = agentBizTownList.substr(0, 16) + "..." ;  
                //判断自我介绍后面是否需要出...更多
                let agentIntroduction = result.simpleAgentDetail.agentIntroduction || "" ;
                result.agentIntroductionExtendable = agentIntroduction && agentIntroduction.length > 32 ? true : false ;
                result.simpleAgentDetail.shortAgentIntroduction = agentIntroduction.substr(0, 32) + "..." ; 
                //判断成交故事后面是否需要出...更多
                let agentStory = result.simpleAgentDetail.agentStory || "" ;
                result.agentStoryExtendable = agentStory && agentStory.length > 32 ? true : false ;
                result.simpleAgentDetail.shortAgentStory = agentStory.substr(0, 32) + "..." ; 
                /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                 设置导航栏标题，格式为："公司名称 经纪人名称"
                 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
                 wx.setNavigationBarTitle({
                     title : result.simpleAgentDetail.agentName
                 }) ;              
                //最后赋予模板变量
                result.agentInfo = result.simpleAgentDetail ;
                _.setData(result) ;
                
            }
        }) ;
    } ,
    /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    切换二手房新房tab的方法
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
    swapToTab : function(event) {
        this.setData({ "currentSourcesTab": event.currentTarget.dataset.tab }) ;
    } ,
    gotoRate:function(event){
        let url = event.currentTarget.dataset.url;
      app.isLogin(true, url);
      wx.navigateTo({
        url: url
      })  
    } ,
    /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    展开熟悉商圈的方法
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
    extendAgentBizTownList : function() {
        this.setData({ "agentBizTownListExtendable": false }) ;
    } ,
    /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    展开自我介绍的方法
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
    extendAgentIntroduction : function() {
        this.setData({ "agentIntroductionExtendable": false }) ;
    } ,
    /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    展开成交故事的方法
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
    extendAgentStory : function() {
        this.setData({ "agentStoryExtendable": false }) ;
    } ,
    /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    二手房源下拉加载方法
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
    loadMoreEsf : function() {
        let _ = this ;
        if(esfIsLoading || this.data.esfIsNoData) return ;  //如果正在加载数据或者已经没有了数据就直接返回
        if(this.data.esfSources.length < 10) {
            _.setData({ "esfIsNoData" : true }) ;
            return ;
        }
        esfIsLoading = true ;  //开始加载
        pullLoadEsfRequestData.agentId = this.data.pageParams.agentId ;
        pullLoadEsfRequestData.pageIndex += 10 ;
        request.fetch({
            "module" : "agent",
            "action" : "getMoreEsf",            
            "data" : pullLoadEsfRequestData ,            
            "mock" : false ,
            success : function(res) {
                _.setData({ "esfLoadError" : false }) ;
                let result = _.data.esfSources ;
                if(res.data && res.data.length) {
                    result = result.concat(_.mapSource(res.data)) ; 
                     _.setData({ "esfSources" : result }) ;     
                }
                else _.setData({ "esfIsNoData" : true }) ; 
                console.log(_.data.esfSources.length) ;            
            } ,
            fail : function(res) {
                _.setData({ "esfLoadError" : true }) ;    
            } ,
            complete : function() {
                esfIsLoading = false ;
            }
        }) ;
    } ,
    /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    新房房源下拉加载方法
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
    loadMoreXf : function() {
        let _ = this ;
        if(xfIsLoading || this.data.xfIsNoData) return ;  //如果正在加载数据或者已经没有了数据就直接返回
        if(this.data.xfSources.length < 10) {
            _.setData({ "xfIsNoData" : true }) ;
            return ;
        }
        xfIsLoading = true ;  //开始加载
        pullLoadXfRequestData.agentId = this.data.pageParams.agentId ;
        pullLoadXfRequestData.pageIndex += 10 ;
        request.fetch({
            "module" : "agent",
            "action" : "getMoreXf",            
            "data" : pullLoadXfRequestData ,            
            "mock" : false ,
            success : function(res) {
                _.setData({ "xfLoadError" : false }) ;
                let result = _.data.xfSources ;
                if(res.data && res.data.length) {
                    result = result.concat(_.mapSource(res.data)) ;  
                     _.setData({ "xfSources" : result }) ;     
                }
                else _.setData({ "xfIsNoData" : true }) ;
                console.log(_.data.xfSources.length) ;               
            } ,
            fail : function(res) {
                _.setData({ "xfLoadError" : true }) ;    
            } ,
            complete : function() {
                xfIsLoading = false ;
            }
        }) ;
    } ,
    /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    对于房源数据的处理：
    1. 把agentId加到房源数据中去的方法
    2. 新房价格为0时显示为待定
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
    mapSource : function(sources) {
        if(!sources) return sources ;
        let _ = this ;        
        sources.forEach(function(element){
            element.agentId = _.data.pageParams.agentId ;
            if ( element.avgPriceWou !== undefined ) {
                let originalPrice = element.avgPriceWou ;
                element.avgPriceWou = ( ! originalPrice || parseInt( originalPrice , 10 ) === 0 ) ? "价格待定" : originalPrice + "元/㎡" ;
            }            
        }) ;
        return sources ;
    } ,
    /*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    页面加载完触发
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
    onLoad : function(options) {        
        //把页面参数保存到页面数据中
        this.setData({ "pageParams" : options }) ;        
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
            "title" : this.data.shareTitle
        }
    }
}) ;
/*++----------------------------------------------------------------------------------------------------------------------------------------------------------------------
实例化页面
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------++*/
Page(params) ;
