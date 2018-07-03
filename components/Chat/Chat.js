let speakerInterval = null;
let app = getApp();
const uploadFile = require("../../vendor/upload.js");
const until = require("../../vendor/until.js");
const PM = require("../../vendor/page.js").PM;
Component({
    data: {
        height: 0,  //屏幕高度
        isShow: false, //emoji是否显示
        emojiChar: "☺-😋-😌-😍-😏-😜-😝-😞-😔-😪-😭-😁-😂-😃-😅-😆-👿-😒-😓-😔-😏-😖-😘-😚-😒-😡-😢-😣-😤-😢-😨-😳-😵-😷-😸-😻-😼-😽-😾-😿-🙊-🙋-🙏-✈-🚇-🚃-🚌-🍄-🍅-🍆-🍇-🍈-🍉-🍑-🍒-🍓-🐔-🐶-🐷-👦-👧-👱-👩-👰-👨-👲-👳-💃-💄-💅-💆-💇-🌹-💑-💓-💘-🚲",
        //0x1f---
        emoji: [
            "60a", "60b", "60c", "60d", "60f",
            "61b", "61d", "61e", "61f",
            "62a", "62c", "62e",
            "602", "603", "605", "606", "608",
            "612", "613", "614", "615", "616", "618", "619", "620", "621", "623", "624", "625", "627", "629", "633", "635", "637",
            "63a", "63b", "63c", "63d", "63e", "63f",
            "64a", "64b", "64f", "681",
            "68a", "68b", "68c",
            "344", "345", "346", "347", "348", "349", "351", "352", "353",
            "414", "415", "416",
            "466", "467", "468", "469", "470", "471", "472", "473",
            "483", "484", "485", "486", "487", "490", "491", "493", "498", "6b4"
        ],
        emojis: [],//qq、微信原始表情
        chatContent: '',
        isFocus: false,
        voices: [],
        speakerUrl:'./img/speak0.png',
        speakerUrlPrefix:'./img/speak',
        speakerUrlSuffix:'.png',
        isSpeaking: false ,
        isChat: true,  
        chatHeight: 0,
        scrollTop: 0,
        isPlay: false,
        src: '',
        isAnd: false,
        touchStart: 0,
        touchMove: 0,
        touchEnd: 0,
        isCancel: false,
        emojiUnicode: []
    },
    properties: {
        //设置聊天组件的高度
        contentHeight: {
            type: Number,
            value: 100
        },
        //传入用户的uid
        uid: {
            type: Number,
            value: 456881
        },
        //传入聊天房间的id
        chatroomid: {
            type: Number,
            value: 100
        },
        chatLists: {
            type: Array,
            value: []
        }
    },

    ready() {
        let _this = this;
        //样式兼容
        wx.getSystemInfo({
            success(res){
                if(res.screenHeight === 640) {
                    _this.setData({
                        isAnd: true
                    })
                } else {
                    _this.setData({
                        isAnd: false
                    })
                }
            }
        })
        //缓存本页面
        app.pages.add(this); 
        //获取之前的聊天信息
        this.getPreMessage()
        
        //获取屏幕的高度
        wx.getSystemInfo({
            success(res){
                _this.setData({
                    height: res.windowHeight * (_this.data.contentHeight / 100),
                    chatHeight: res.windowHeight * (_this.data.contentHeight / 100) - 49
                })
            }
        })
        //emoji表情
        let em = {}, emChar = this.data.emojiChar.split("-");
        let emojis = []
        this.data.emoji.forEach( (v, i) => {
            em = {
                char: emChar[i],
                emoji: "0x1f" + v
            };
            emojis.push(em)
        });
        this.setData({
            emojis: emojis
        });

    },
    methods: {
        //通知
        notify: function(name, data) {
            console.log("new msg evnet");
            // 收到notify后，按照seq增量拉新消息
            this.onMeaasge();
        },
        //获取之前的聊天信息
        getPreMessage(){
            wx.showLoading({
                title: "拼命加载中..."
            })
            wx.request({
                method: "POST",
                url: 'https://brother.agentbase.cn/api/chat',
                data: {
                    "uid": this.data.uid,
                    "action": "fetch_msg",
                    "chatroomid": this.data.chatroomid,
                    "seq": 1
                },
                success: (res) => {
                    let chatLists = res.data.data;   
                    let len = chatLists.length;//遍历的数组的长度
                    this.setData({
                        chatLists: until.changeEmoji(chatLists),
                        scrollTop: 1000 * len  // 这里我们的单对话区域最高1000，取了最大值，应该有方法取到精确的
                    });
                    wx.hideLoading();
                }
            })
        },
        //拉取最新消息
        onMeaasge(){
            wx.onSocketMessage((data) => {
                wx.request({
                    method: "POST",
                    url: 'https://brother.agentbase.cn/api/chat',
                    data: {
                        "uid": this.data.uid,
                        "action": "fetch_msg",
                        "chatroomid": this.data.chatroomid,
                        "seq": 1
                    },
                    success: (res) => {
                        let chatLists = res.data.data;
                        let len = chatLists.length //遍历的数组的长度
                        this.setData({
                            chatLists: until.changeEmoji(chatLists),
                            scrollTop: 1000 * len  // 这里我们的单对话区域最高1000，取了最大值，应该有方法取到精确的
                        });
                    }
                })
            })
        },
        //是否显示emoji表情框
        showEmoji(){
            this.setData({
                isShow: !this.data.isShow
            })
        },
        //选择emoji表情
        emojiChoose(e){
            let emojiUnicode = this.data.emojiUnicode;
            emojiUnicode.push(`[${e.currentTarget.dataset.oxf}]`)
            this.setData({
                chatContent: this.data.chatContent + `${e.currentTarget.dataset.emoji}`,
                emojiUnicode: emojiUnicode
            })
        },
        //input聚焦事件
        focus(){
            this.setData({
                isShow: false,
                isFocus: true
            })
        },
        //input输入事件
        bindinput(e){
            this.setData({
                chatContent: e.detail.value
            })
        },
        //显示聊天框或者语音框
        toggleChat(){
            this.setData({
                isChat: !this.data.isChat
            })
            if(this.data.isChat) {
                this.setData({
                    isFocus: true
                })
            }
        },
        //录音按钮按下事件
        touchdown(e){
            this.setData({
                touchStart: e.changedTouches[0].pageY
            })
            let _this = this
            this.setData({
                isSpeaking: true,
            })
            this.speaking();
            //开始录音
            let recorderManager = wx.getRecorderManager()

            recorderManager.onStart(() => {
                console.log('recorder start')
            })
           
            
            const options = {
                duration: 600000,
                sampleRate: 44100,
                numberOfChannels: 1,
                encodeBitRate: 192000,
                format: 'aac'
            }
              
            recorderManager.start(options);
            this.recorderManager = recorderManager;
        },
        //滑动事件
        touchmove(e) {
            this.setData({
                touchMove: e.changedTouches[0].pageY
            })
            if(this.data.touchMove !== 0 && (this.data.touchMove - this.data.touchStart) < -30) {
                this.setData({
                    isSpeaking: false,
                    isCancel: true
                })
                
            } else {
                this.setData({
                    isSpeaking: true,
                    isCancel: false
                })
            }
        },
        //录音结束事件
        touchup(){
            this.setData({
                isSpeaking: false,
                isCancel: false,
                speakerUrl: './img/speak0.png',
            })
            clearInterval(speakerInterval);
            if( this.data.touchMove !== 0 && (this.data.touchMove - this.data.touchStart) < -30) {
                this.setData({
                    touchMove: 0,
                    touchStart: 0
                })
                wx.showToast({
                    title: '取消语音',
                    icon: 'none'
                })
                this.recorderManager.onStop((res) => {
                    console.log(res)
                })
            } else {
                wx.sendSocketMessage({
                    data: '',
                    success:(res) => {
                        //停止录音后的事件
                        this.recorderManager.onStop((res) => {
                            const { tempFilePath } = res;
                            this.setData({
                                src: tempFilePath
                            })
                            //上传录音
                            uploadFile(this.data.uid, tempFilePath, (key) => {
                                wx.request({
                                    method: "POST",
                                    url: 'https://brother.agentbase.cn/api/chat',
                                    data: {
                                        "uid": this.data.uid,
                                        "action": "send_voice_msg",
                                        "chatroomid": this.data.chatroomid,
                                        "voice_url": key.split('chatvoice/')[1]
                                    },
                                    success: (res) => {
                                        this.onMeaasge()
                                    }
                                })
                            }, (err) => {
                                console.log(err)
                            })
                        })
                       
                    }
                })
            }
            this.recorderManager.stop();
                    
        },
        //播放录音
        playVoice(e){
            let _this = this;
            if(this.innerAudioContext){
                this.innerAudioContext.destroy();
            }
            
            let voice = e.currentTarget.dataset.content;
            this.innerAudioContext = wx.createInnerAudioContext();
            this.innerAudioContext.pause();
            this.innerAudioContext.src = voice;
            this.innerAudioContext.play();
            this.innerAudioContext.onPlay(() => {
              console.log('开始播放')
            });
            this.innerAudioContext.onEnded(() => {
              console.log('reach end');
            });
            this.innerAudioContext.onError((res) => {
                console.log(res.errMsg)
                console.log(res.errCode)
            })
           
        },
        //提交聊天记录
        submitChat(){
            if(this.data.chatContent === '') {
                return
            }
            let param = this.data.chatContent;
            let  regRule = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/;
            if(param.match(regRule)) {
                for(let i = 0; i < this.data.emojiUnicode.length; i++) {
                    param = param.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/, this.data.emojiUnicode[i]);
                }
            }
            wx.sendSocketMessage({
                data: '',
                success:(res) => {
                    wx.request({
                        method: "POST",
                        url: 'https://brother.agentbase.cn/api/chat',
                        data: {
                            "uid": this.data.uid,
                            "action": "send_msg",
                            "chatroomid": this.data.chatroomid,
                            "content": param
                        },
                        success: (res) => {
                            this.setData({
                                chatContent: '',
                                emojiUnicode: [],
                                chatLists: until.changeEmoji(this.data.chatLists),
                                isFocus: true
                            })
                        }
                    })
                    
                }
            })
           
        },
        // 麦克风帧动画 
        speaking() {
            //话筒帧动画 
            let i = 0;
            let _this = this;
            speakerInterval = setInterval(function() {
                i++;
                i = i % 6;
                _this.setData({
                    speakerUrl: _this.data.speakerUrlPrefix + i + _this.data.speakerUrlSuffix,
                });
            }, 300);
        }
    }
})