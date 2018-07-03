let app = getApp();
const uploadFile = require("../../vendor/upload.js");
const until = require("../../vendor/until.js");

Page({
    data: {
      chatLists: [],
      scrollTop: 0,
      uid: 123,
      chatroomid: 226
    },
    onLoad(){
      this.chat = this.selectComponent("#chat");
      this.chat.notify();
    }
})