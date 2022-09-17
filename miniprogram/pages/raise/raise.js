// miniprogram/pages/famous/famous.js
wx.cloud.init()
const db = wx.cloud.database()
const infoCollection = db.collection('infolist')
const personCollection=db.collection('person')
const _=db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    types: [
      { name: 1, value: '求带走' ,checked:true},
      { name: 2, value: '求闲置' },],
    type:1,//发布类型 （1求带走 2求闲置）
    descrition:'',//物品描述
    contact:'',//联系方式
    count: 6, //设置最多6张图片
    img: [],//详情图片
    cloudUrls:[],//图片的云存储路径
    nickname:'',//用户昵称
    openid:'',//用户唯一的openid
    _id:'',//记录该用户信息对应记录的_id
  },

  contactInput:function(e)
  {
    this.setData({
      contact: e.detail.value
    })
    console.log('input事件 联系方式：',this.data.contact)
  },
  descritionInput:function(e)
  {
    this.setData({
      descrition: e.detail.value
    })
    console.log('textarea事件 联系方式：',this.data.descrition)
  },
  //发布类型
  typesChange:function(e)
  {
    this.setData({
      type:e.detail.value
    })
    console.log('发布类型checkbox发生change事件，携带type值为：', this.data.type);
  },



  //添加上传图片
  chooseImageTap: function () {
    var that = this;
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      itemColor: "IndianRed",
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            that.chooseWxImage('album')
          } else if (res.tapIndex == 1) {
            that.chooseWxImage('camera')
          }
        }
      }
    })
   
  },
  // 图片本地路径
  chooseWxImage: function (type) {
    var that = this;
    var img = that.data.img;
    var num = that.data.count - img.length; //设置最多6张图片

    wx.chooseImage({
      count: num,
      sizeType: ["compressed"], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: [type], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
      
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths;
        let newList = this.data.img;
        for (let i = 0; i < tempFilePaths.length; i++) {
          newList.push(tempFilePaths[i]);
        }
        this.setData({
          img: newList
        }, () => {
          console.log("加入成功"+this.data.img)
        })
        // console.log("tempFilePaths:"+JSON.stringify(tempFilePaths))
      }
    })

  },
 deleteImage(e) {
    let self = this;
    let index = e.target.dataset.index;
    let img = self.data.img;
    img.splice(index, 1);
    this.setData({
    img: img,
    })
  },
  previewImage(e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var img = this.data.img;
    wx.previewImage({
      //当前显示图片
      current: img[index],
      //所有图片
      urls: img
    })
  },
  userUpload:function(e)
  {
    var hasUserInfo=wx.getStorageSync('hasUserInfo')
    console.log(hasUserInfo)
    if(!hasUserInfo)
    {
      wx.switchTab({
        url: '../my/my'
      })
      wx.showToast({
        title: '请先登录',
        icon:'none',
        duration:1500
      })
      return
    }
    let that=this
    if(this.data.descrition=="") 
    {
      wx.showToast({
        title: '物品描述不能为空',
        duration:1000,
        icon:"none"
      })
      return
    }
      if(this.data.contact=="") 
    {
      wx.showToast({
        title: '联系方式不能为空',
        duration:1000,
        icon:"none"
      })
      return
    }

    that.getOpenid() //调用上传方法

  },

  getOpenid() {
    let that = this;
    wx.cloud.callFunction({
    // 云函数名称
    name: 'getOpenId',
    // 云函数获取结果
    success: function(res) {
      console.log("getopenid云函数调用成功！",res.result.openid)
      
      //抓取数据
      that.setData({
        openid: res.result.openid
      })

      let img=that.data.img
      that.uploadImgsToDB(img)
     },
      fail: function(error) {
        console.log("getopenid云函数调用失败！",error)
      },
    })
   },



  uploadImgsToDB:function(img)
  {
    let that=this
    wx.showLoading({
      title:"正在上传......",
      mask:true
    })  
    let promiseArr = [];//创建一个数组来存储一会的promise操作
    
    for (let i = 0; i < img.length; i++) 
    {    
      promiseArr.push(new Promise((reslove, reject) => {     //往数据中push promise 操作
    
      let item = img[i];  //一个一个取出图片数组的临时地址
    
      let suffix = /\.\w+$/.exec(item)[0];//利用正则表达式取出图片的后缀名
    
      wx.cloud.uploadFile({
        cloudPath: new Date().getTime() + suffix, // 上传云存储的图片名称  利用时间戳给图片新起一个名字
        filePath: item, // 图片临时地址赋值

        success: res => {
          that.setData({
            cloudUrls: that.data.cloudUrls.concat(res.fileID)     //执行的成功的把 将返回的云存储张图片的地址 一个一个拼接到 data的fileIDs数组中 一会这个就是插入到云数据库中的字段
          });
          console.log(res.fileID)//输出上传后图片的返回地址
          reslove();//如果执行成功  就将执行成功的回调函数
        },
    
        fail: res => {
          console.log(res)
          wx.hideLoading()
          wx.showToast({
            title: "上传失败，请检查网络！",
            icon: "none",
            duration: 2000
          })
        }
      })
    }));
  }
    Promise.all(promiseArr).then(res => {   //等promise数组都做完后做then方法
    
      var user=wx.getStorageSync('user')
      that.setData({
        nickname:user.nickName
      })
      console.log("图片上传完成后再执行")
      infoCollection.add({
        // data 字段表示需新增的 JSON 数据
        data: {
          userName:user.nickName,
          submitTime: Date.now(),
          type:that.data.type,
          like:[],
          comment:[],
          content:that.data.descrition,
          contact:that.data.contact,
          urls:that.data.cloudUrls,
        },
        success:res=>{
          wx.hideLoading()
          wx.showToast({
            title: "上传成功",
            duration: 1500
          })
          console.log("商品信息表更新完成")
        },
        fail(res) {
          console.log(res)
          wx.hideLoading()
          wx.showToast({
            title: "上传失败，请检查网络！",
            icon: "none",
            duration: 2000
          })
        },
      })
      personCollection.where({
        _openid:_.eq(that.data.openid)
      })
      .get({
        success: function(res) {
          
        console.log(res)
        console.log("获取该用户信息")
        var data=res.data
        if (Object.keys(data).length === 0) 
        {
          console.log("数据库新增新用户")
          personCollection.add({
            data:{
            myFavoriteIDs:"",
            nickName:that.data.nickname
            }
          })
        }
        else{
          console.log("该用户已登记")
        }
        that.onLoad()
        },
        fail:function(res){
        }
      })

    })
  },

  refreshData()
  {
    this.setData({
      types: [
        { name: 1, value: '求带走' ,checked:true},
        { name: 2, value: '求闲置' },],
    type:1,//发布类型 （1求带走 2求闲置）
    descrition:'',//物品描述
    contact:'',//联系方式
    count: 6, //设置最多6张图片
    img: [],//详情图片
    cloudUrls:[],//图片的云存储路径
  })
  console.log("测试下拉刷新")
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.stopPullDownRefresh() //刷新完成后停止下拉刷新动效
    this.refreshData()
   
    

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
    this.onLoad();
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

  }
})