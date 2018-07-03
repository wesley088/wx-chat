var PM = require("./vendor/page.js").PM;

App({
  pages: new PM(),
  socketOpen: false, // ws长连接状态
  connFailCnt: 0, // ws重新建立连接失败次数
  onLaunch: function () {
    this.initWSConn();
  },
  initWSConn: function() {
    var app = this;
   
    if(app.socketOpen == false) {  
      
      wx.onSocketOpen(function(res) {
        console.log("socket open success");
        app.socketOpen = true;
      });
      
      wx.onSocketClose(function(res) {
        app.socketOpen = false;
      })
      wx.onSocketMessage(function(res) {
        // 收到notify后，根据name将消息分发到各个page
        var pkg = JSON.parse(res.data);
       
        var name = pkg.name;
        var data = pkg.data;

        if(name == "newmsg") {
          app.pages.get("pages/index/index") && app.pages.get("pages/index/index").notify(name, data);
        }
      });
      wx.connectSocket({
        url: 'wss://brother.agentbase.cn/api/ws',
      });
     
    } else {
      wx.sendSocketMessage({
        data: '',
        fail: function() {
          app.connFailCnt += 1;
          if(app.connFailCnt > 3) {
            wx.closeSocket();
            app.socketOpen = false;
            console.log("socket heart beat fail, retry connect");
          }
        },
        success: function(res) {
          app.connFailCnt = 0;
          
        },
      })
    }

    setTimeout(app.initWSConn, 500); // 500ms一次心跳
  }
})