//app.js
wx.showLLL = function(){
  console.log('wx.showLLLL')
}

App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo:null
  },
  isLogin:function(needRedirect=true){//判断是否登录了小程序
    var userInfo = wx.getStorageSync('userInfo');
    if(!userInfo){
      //当前页的地址
      //var returnUrl = this.getCurrentPage().__route__;
      if(!needRedirect){return false;}
      wx.navigateTo({
        url: '/pages/login/index'//'/pages/login/index?returnUrl='+returnUrl
      })
    }    

    return true;
  },
  showLoading:function(showTitle="加载中..."){
    this.getCurrentPage().setData({"loading":{"show":true,"text":showTitle}})
  },
  hideLoading:function(cb){
    this.getCurrentPage().setData({"loading":{"show":false}});
    typeof cb == "function" && cb()
  }
})