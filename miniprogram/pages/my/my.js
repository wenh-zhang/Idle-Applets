// miniprogram/pages/my/my.js
const db = wx.cloud.database()
const admin = db.collection('admin')
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    hasUserInfo:false,
    canIUseGetUserProfile: false,
  },

  toRaise: function () {
    var user=this.data.userInfo
    if(user&&user.nickName)
    {
      wx.navigateTo({
      url: '../raisedetail/raisedetail'
      })
    }
    else{
      wx.showToast({
        title: '请先登录',
        icon:'none',
        duration:1500
      })
      this.getUserProfile()
    }
  },

  toCollect: function () {
    var user=this.data.userInfo
    if(user&&user.nickName)
    {
      wx.navigateTo({
      url: '../collectdetail/collectdetail'
      })
    }
    else{
      wx.showToast({
        title: '请先登录',
        icon:'none',
        duration:1500
      })
      this.getUserProfile()
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  var user=wx.getStorageSync('user');
  console.log(user)
  if(user&&user.nickName)
  {
    this.setData({
      hasUserInfo:true,
      userInfo:user,
      canIUseGetUserProfile: true
    })
    console.log(this.data.hasUserInfo)
  }  
  wx.setStorageSync('hasUserInfo', this.data.hasUserInfo)
  if(!this.data.hasUserInfo)
  {
    this.getUserProfile()
  }

    // var that = this;
    // // 查看是否授权
    // if (wx.getUserProfile) {
    //   this.setData({
    //     canIUseGetUserProfile: true
    //   })
    // }
},
getUserProfile(e) {
  // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
  wx.getUserProfile({
    desc: '用于展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
    success: (res) => {
      console.log("获取用户信息成功")
      let user=res.userInfo
      wx.setStorageSync('user', user)//保存用户信息到本地缓存
      wx.login({
        success: function() {
          //后端请求操作
          
        }
      })
      this.setData({
        userInfo: user,
        hasUserInfo: true,
      })
      wx.setStorageSync('hasUserInfo', this.data.hasUserInfo)
    },
    fail:(res)=>{
      console.log("获取用户信息失败")
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入',
        showCancel: false,
        confirmText: '返回授权',
        success: (res)=> {
            if (res.confirm) {
                console.log('用户点击了“返回授权”');
            }
        }
    });
    }
  })
},

logOut:function(){
  wx.showModal({
    title: '确定要退出账号吗？',
    content: '点击确定退出',
    showCancel: false,
    confirmText:"确定",
    showCancel:true,
    success: (res)=> {
        if (res.confirm) {
            console.log('用户退出账号”');
            this.setlogOut()
        }
        
    }
});
}
,
setlogOut:function(){
  this.setData({
    userInfo:{},
    hasUserInfo:false,
    canIUseGetUserProfile: false,
  })
  wx.setStorageSync('user', null)
},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // var user=wx.getStorageSync('user');
    // if(user&&user.nickname)
    // {
    //   this.setData({
    //     hasUserInfo:true,
    //     userInfo:user
    //   })
    // }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // const userInfo = app.globalData.userInfo
    // if (userInfo) {
    //   admin.where({
    //     openid: userInfo.openid
    //   }).count().then(res => {
    //     userInfo.isadmin = res.total
    //     this.setData({
    //       userInfo: userInfo
    //     })

    //   })
    //     .catch(err => {
    //       console.error(err)
    //     })
    // }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onGotUserInfo: function (result) {
    // wx.cloud.callFunction({
    //   name: 'login',
    //   success: res => {
    //     console.log(res.result.dbResult.total)
    //     result.detail.userInfo.openid = res.result.OPENID
    //     result.detail.userInfo.isadmin = res.result.dbResult.total
    //     app.globalData.userInfo = result.detail.userInfo
    //     this.setData({
    //       userInfo: result.detail.userInfo
    //     })
    //     wx.setStorageSync("userInfo", result.detail.userInfo)
    //   }
    // })
  }
})