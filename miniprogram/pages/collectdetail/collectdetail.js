
const DB = wx.cloud.database().collection("infolist")
const db=wx.cloud.database()
const DBp=wx.cloud.database().collection("person")
const _=db.command
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    navTab: ['全部','求带走','求闲置'],        
    currentTab: 0,
    collectList: [],
    islike:[],
    openid:0
  },
  select: {
    page: 1,
    size: 6,
    isEnd: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh() //刷新完成后停止下拉刷新动效
    this.getData()
  },
onShow:function(){
    console.log('onshow')
    this.setData({
      collectList: wx.getStorageSync('collectList')
    })
    console.log('初始化时间')
    var minutes = 1000 * 60;
    var hours = minutes * 60;
    var days = hours * 24;
    var years = days * 365;
    var t = Date.now();
    var i=0;
    for(i=0;i<this.data.collectList.length;i++){
        var y = (t-this.data.collectList[i].submitTime);
        if(y<=5*minutes){
          this.data.collectList[i].time='刚刚'
        }
        else if(y<=hours){
          this.data.collectList[i].time=Math.round(y / minutes)+' 分钟前'
        }
        else if(y<=days){
          this.data.collectList[i].time=Math.round(y / hours)+' 小时前'
        }
        else {
          this.data.collectList[i].time=Math.round(y / days)+' 天前'
        }
        this.setData({
          collectList:this.data.collectList
        })
    }
  },
  onLoad: function (options) {
    this.getOpenid()
    this.getLocaldata()
  },

  getOpenid() {
      let that = this;
      wx.cloud.callFunction({
        // 云函数名称
        name: 'getOpenId',
        // 云函数获取结果
        success: function(res) {
          console.log("getopenid云函数调用成功！",res.result.openid)
          
          //抓取数据
          that.setData({
            openid: res.result.openid
          })
          console.log(that.data.openid)
        },
        fail: function(error) {
          console.log("getopenid云函数调用失败！",error)
        },
      })
     },
  itemTap: function (event){
    var item = event.currentTarget.dataset.item


    var model = JSON.stringify(event.currentTarget.dataset.item.urls);
    var model1 = JSON.stringify(event.currentTarget.dataset.item.comment);
    console.log(model)
    console.log(item)
    wx.navigateTo({   
      url: '../item/item?userName=' + item.userName + '&submitTime=' + item.time + '&like=' + item.like.length+'&comment='+model1+'&content='+item.content+'&contact='+item.contact+'&islike='+item.islike+'&urls='+model+"&_id="+item._id+"&_openid="+this.data.openid+"&trueid="+item._openid
      +"&type="+item.type,
    })
  },
  currentTab: function (e) {
    if (this.data.currentTab == e.currentTarget.dataset.idx){
      return;
    }
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
    this.select={
      page: 1,
      size: 6,
      isEnd: false
    }
  },
  getLocaldata(){
    if(this.data.collectList.length==0){this.getData()}
  },
  getData:function(){
    console.log('getdata啦')
    var _this=this;
    var collectIDs=[]
        DBp.where({_openid:_.eq(_this.data.openid)})
        .get({
          success(res){
            collectIDs=res.data[0].myFavoriteIDs
            console.log(collectIDs)
            console.log("取出收藏列表id")
            DB.where({_id:_.in(collectIDs)})
            .get({
              success(res){
                console.log(res)
                var content = res.data;
                content.reverse();
                _this.setData({
                  collectList:content
                })
                console.log('setstor')
    
                var i=0;
                for(i=0;i< _this.data.collectList.length;i++){
                  console.log('there')
                  console.log(!_this.data.collectList[i].like)
                   if(_this.data.collectList[i].like){
                  console.log(_this.data.openid)
                  console.log(_this.data.collectList[i].like.indexOf(_this.data.openid))
                  if(_this.data.collectList[i].like.indexOf(_this.data.openid)!=-1){
                    console.log('初始点赞')
                    _this.data.collectList[i].islike=1;
                  }
                } 
              }
                _this.setData({
                  collectList:_this.data.collectList
                })
                wx.setStorageSync('collectList',_this.data.collectList);
                _this.onShow();
              }
            })
          
          }
        })
 
  },
  favorclick: function(e) {
    var item=e.currentTarget.dataset.item
    var index=e.currentTarget.dataset.index
    var like=e.currentTarget.dataset.item.like
    var _id=e.currentTarget.dataset.item._id
    var that = this;
    var id= that.data.openid;
    console.log('kai')
    if(that.data.collectList[index].islike)
    if(that.data.collectList[index].islike==1){
      console.log('点赞过')
      return 0;
      }  
    like.push(id)

    wx.cloud.callFunction({
      name:'cate',
      data: {module:'cate', action:'update', id:_id,params:{like:like}},
      success: res => {
        wx.showToast({
          title: "点赞成功"
        })
        that.data.collectList[index].like=like;
        that.data.collectList[index].islike=1;
  
        wx.setStorageSync('collectList', that.data.collectList)
        that.onShow();
      },
      fail: err => {
        console.log(err);
        wx.hideLoading();
      }
    })
  }
})