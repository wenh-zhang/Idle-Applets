// 云函数入口文件
const cloud = require('wx-server-sdk')
 
cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.module) {
    case 'cate': {
      console.log('hre')
      return cate(event)
    }
    default: {
      return '模块不存在'
    }
  }
}
 
//分类管理
async function cate(event){
  try {
    switch(event.action){
      case 'add':{
        return await db.collection('infolist').add({data:event.params})
      }
      case 'delete': {
        return await db.collection('infolist').where(event.map).remove();
      }
      case 'update': {
        console.log('hre')
        return await db.collection("infolist").doc(event.id).update({ data: event.params });
      }
      case 'update1': {
        return await  db.collection("infolist").where({_openid:cloud.database().command.eq(event.id)}).update({ data: event.params })
      }
      default: {
        return '方法不存在'
      }
    }   
  } catch (e) {
    return e;
  }
}