// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  await db.collection('todos').add({
    // data 字段表示需新增的 JSON 数据
    data: {
      //_id: wxContext.OPENID, // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
      calss:true,
      track:[]
    },
    success: function (res) {
      // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
      console.log(res)
      return res
    }
  })
  
}