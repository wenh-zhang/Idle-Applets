
Page({
  data:{
    item:{},
    urls:[],
    comment:[],
    nowcomment:[],
    iscollect:0
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
  var bean=JSON.parse(options.urls);
  var bean1=JSON.parse(options.comment);
    console.log(options);
    console.log(bean);
    this.setData({
      comment:bean1,
      urls:bean,
      item:options
    })

    var collectList=wx.getStorageSync('collectList');
    console.log(collectList)
    var i=0;
    if(collectList.length)
    for(i=0;i<collectList.length;i++){
      if(this.data.item._id==collectList[i]._id){
        console.log('findit'+i)
        this.setData({
          iscollect:1
        })
      }
    }
  },
  previewImage(e) {
    //获取当前图片的下标
    console.log(e.currentTarget)

    var index = e.currentTarget.dataset.index;
    console.log('dd')

    console.log(index)
    //所有图片
    var img = this.data.urls;
    wx.previewImage({
      //当前显示图片
      current: img[index],
      //所有图片
      urls:img
    })
  },
  commentInput:function(e)
  {
    this.setData({
      descrition: e.detail.value
    })
    console.log('textarea事件 联系方式：',this.data.descrition)
  },  
  commentInput:function(e)
  {
    this.setData({
      nowcomment: e.detail.value
    })
    console.log('textarea事件 联系方式：',this.data.nowcomment)
  },
  submitComment:function(e){
    if(this.data.nowcomment=="") 
    {
      wx.showToast({
        title: '评论不能为空',
        duration:1000,
        icon:"none"
      })
      return
    }
    console.log('dd')
    console.log(this.data.comment)
    this.data.comment.push(this.data.nowcomment);
    console.log(this.data.comment)
    var newcom=this.data.comment;
    var that=this;
    console.log('update')


    wx.cloud.callFunction({
      name:'cate',
      data:{module:'cate', action:'update', id:this.data.item._id,params:{ comment:newcom}},
      success: res => {
        wx.showToast({
          title: "评论成功"
        })
        that.data.nowcomment="";
        that.setData({ comment:newcom,
          nowcomment:""})
        
          if(that.data.iscollect==1){
            var collectList=wx.getStorageSync('collectList');
            for(i=0;i<collectList.length;i++){
              if(collectList[i]._id.indexOf(that.data.item._id)!=-1)
              {
                console.log("找到了")
                collectList[i].comment=that.data.comment;
                break;
              }
            } 
            wx.setStorageSync('collectList', collectList)
          }
  
          if(that.data.item.trueid==that.data.item._openid){
            var raiseList=wx.getStorageSync('raiseList');
            for(i=0;i<raiseList.length;i++){
              if(raiseList[i]._id.indexOf(that.data.item._id)!=-1)
              {
                console.log("找到了")
                raiseList[i].comment=that.data.comment;
                break;
              }
            } 
            wx.setStorageSync('raiseList', raiseList)
          }
        var sendList=wx.getStorageSync('sendList');
        console.log(that.data.item._id)
        console.log(sendList)
        var i=0;
        for(i=0;i<sendList.length;i++){
          if(sendList[i]._id.indexOf(that.data.item._id)!=-1)
          {
            console.log("找到了")
            sendList[i].comment=that.data.comment;
            break;
          }
        } 
        console.log(sendList[i].comment)
        wx.setStorageSync('sendList', sendList)
      },
      fail: err => {
        console.log(err);
        wx.hideLoading();
      }
    })

    // coludRequest('cate', {module:'cate', action:'update', id:this.data.item._id,params:{ comment:newcom}}, function (data) {
    //   wx.showToast({
    //     title: "评论成功"
    //   })
    //   that.data.nowcomment="";
    //   that.setData({ comment:newcom,
    //     nowcomment:""})
      
    //     if(that.data.iscollect==1){
    //       var collectList=wx.getStorageSync('collectList');
    //       for(i=0;i<collectList.length;i++){
    //         if(collectList[i]._id.indexOf(that.data.item._id)!=-1)
    //         {
    //           console.log("找到了")
    //           collectList[i].comment=that.data.comment;
    //           break;
    //         }
    //       } 
    //       wx.setStorageSync('collectList', collectList)
    //     }

    //     if(that.data.item.trueid==that.data.item._openid){
    //       var raiseList=wx.getStorageSync('raiseList');
    //       for(i=0;i<raiseList.length;i++){
    //         if(raiseList[i]._id.indexOf(that.data.item._id)!=-1)
    //         {
    //           console.log("找到了")
    //           raiseList[i].comment=that.data.comment;
    //           break;
    //         }
    //       } 
    //       wx.setStorageSync('raiseList', raiseList)
    //     }
    //   var sendList=wx.getStorageSync('sendList');
    //   console.log(that.data.item._id)
    //   console.log(sendList)
    //   var i=0;
    //   for(i=0;i<sendList.length;i++){
    //     if(sendList[i]._id.indexOf(that.data.item._id)!=-1)
    //     {
    //       console.log("找到了")
    //       sendList[i].comment=that.data.comment;
    //       break;
    //     }
    //   } 
    //   console.log(sendList[i].comment)
    //   wx.setStorageSync('sendList', sendList)
    // })

    // wx.cloud.database().collection('infolist').doc(this.data.item._id).update({
    //   data:{
    //     comment:newcom
    //   },
    //   success:res=>{
    //     wx.showToast({
    //       title: "评论成功"
    //     })
    //     that.data.nowcomment="";
    //     that.setData({ comment:newcom,
    //       nowcomment:""})
              
    //     var sendList=wx.getStorageSync('sendList');
    //     console.log(that.data.item._id)
    //     console.log(sendList)
    //     var i=0;
    //     for(i=0;i<sendList.length;i++){
    //       if(sendList[i]._id.indexOf(that.data.item._id)!=-1)
    //       {
    //         console.log("找到了")
    //         sendList[i].comment=that.data.comment;
    //         break;
    //       }
    //     } 
    //     console.log(sendList[i].comment)
    //     wx.setStorageSync('sendList', sendList)
    //   },
    // })

  },
  collect:function(){
    var _this=this;
    if(this.data.iscollect==1){
      console.log('收藏过')
      return 0;
      }
      console.log('ganshi')
      var collectList=wx.getStorageSync('collectList');
      if(!collectList)collectList=[];
      _this.data.iscollect=1;
      _this.data.item.comment=_this.data.comment;
      _this.data.item.urls=_this.data.urls;
      _this.data.item.iscollect=_this.data.iscollect;
      _this.setData({
        item:_this.data.item
      })
      collectList.push(_this.data.item);
      console.log(collectList);
      var collectid=[];
      var i=0;
      for(i=0;i<collectList.length;i++){
        collectid.push(collectList[i]._id)
      }
      console.log(collectid)
      console.log(_this.data.item._openid)

      wx.cloud.callFunction({
        name:'update',
        data:{module:'cate', action:'update1', id:_this.data.item._openid,params:{ myFavoriteIDs:collectid}},
        success: res => {
          console.log(data)
          _this.setData({
            iscollect:1
          })
          wx.setStorageSync('collectList',collectList)
        },
        fail: err => {
          console.log(err);
          wx.hideLoading();
        }
      })

      // coludRequest('cate', {module:'cate', action:'update1', id:_this.data.item._openid,params:{ myFavoriteIDs:collectid}}, function (data) {
      //   console.log(data)
      //   wx.showToast({
      //     title: ""
      //   })
      //   _this.setData({
      //     iscollect:1
      //   })
      //   wx.setStorageSync('collectList',collectList)

      // })

    wx.cloud.database().collection('person').where({_openid:wx.cloud.database().command.eq(_this.data.item._openid)}).update({ 
      data: {
        myFavoriteIDs:collectid
      },
      success:res=>{
        console.log(res)
        wx.showToast({
          title: ""
        })
        _this.setData({
          iscollect:1
        })
        wx.setStorageSync('collectList',collectList)
      },
    })
  }
})