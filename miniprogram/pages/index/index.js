//index.js
const app = getApp()
var pencilTrack = new Array()
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    isClear: false
  },

  onLoad: function() {
    // 获取画布上下文
    this.context = wx.createCanvasContext('my-canvas');  // 参数必须和canvas组件中canvas-id值相同
    if (!wx.cloud) {
      wx.redirectTo({
        
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })

    wx.showShareMenu({
      withShareTicket: true
    })
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },
  // 刚开始触摸
  touchStart(e) {
    // 获取触摸点坐标
    this.startX = e.changedTouches[0].x
    this.startY = e.changedTouches[0].y

    // 画笔配置
    this.context.setStrokeStyle('red');  // 颜色 
    this.context.setLineWidth(5);        // 粗细 
    this.context.setLineCap('round');    // 线头形状
    this.context.setLineJoin('round');   // 交叉处形状
  },

  // 开始移动
  touchMove(e) {
    // 移动时坐标
    var moveX = e.changedTouches[0].x
    var moveY = e.changedTouches[0].y

    // 判断是否是橡皮檫
    if (this.data.isClear) {
      // 是
      // 以当前坐标点为中心创建20*20像素的橡皮檫
      let rectOriX = this.startX - 10;
      let rectOriY = this.startY - 10;
      this.context.clearRect(rectOriX, rectOriY, 20, 20);
    } else {
      // 不是
      this.context.moveTo(this.startX, this.startY);  // 找到起点
      this.context.lineTo(moveX, moveY);              // 找到终点
      this.context.stroke();                          // 描绘路径
      
      pencilTrack.push(moveX);
      pencilTrack.push(moveY);
    }

    // 改变起点坐标
    this.startX = moveX;
    this.startY = moveY;
    this.context.draw(true);  // 画
  },
  touchEnd(){
    console.log("pencilTrack:" + pencilTrack)
    pencilTrack = [];
  },

  // 橡皮檫
  clear() {
    // 每次点击都变成相反的状态
    this.setData({
      isClear: !this.data.isClear
    })
  },

  onGetOpenid(){
    wx.cloud.callFunction({
      // 云函数名称
      name: 'datasync',
      // 传给云函数的参数
      data: {
      },
      success: function (res) {
        console.log(res)
      },
      fail: console.error
    })
  }

})
