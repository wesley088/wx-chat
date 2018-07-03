// 全局唯一文件名构成 uid_timestamp_seq
// seq每秒内自增，只是为了应对极端情况，不太可能出现1s内发多条语音的情况，因此多数情况下文件名是uid_timestamp_0
var lastKeyInfo = {
  "timestamp": 0,
  "seq": 0,
}

/*
  uid:
  filepath: 录制语音后的临时文件路径
  successCallback: 回调参数为上传后的语音文件key，可用于填充voice_url字段
  errorCallback:
*/
var uploadFile = function (uid, filePath, successCallback, errorCallback) {
  // 上传前先获取上传授权
  wx.request({
    method: "POST",
    url: 'https://brother.agentbase.cn/api/upload',
    data: {
      'action': 'get_token',
    },
    success: function (res) {
      var data = null;
      if (res.data.rtn != 0) {
        console.error("http error", res.data.rtn, res.data.msg);
        return;
      } else {
        data = res.data.data;
      }
      // 生成唯一文件名
      var timeNow = (new Date()).valueOf();
      var newSeq = null;
      if (timeNow > lastKeyInfo.timestamp) {
        newSeq = 0;
        lastKeyInfo.timestamp = timeNow;
        lastKeyInfo.seq = newSeq;
      } else {
        newSeq = lastKeyInfo.seq + 1;
        lastKeyInfo.seq = newSeq;
      }

      var key =  data.dir + String(uid) + "_" + String(timeNow) + "_" + String(newSeq);
      var host = data.host ;
      var accessid = data.accessid;
      var policyBase64 = data.policy;
      var signature = data.signature;

      console.log("generate new key for voice_url", key);

      wx.uploadFile({
        url: host,
        filePath: filePath,
        name: 'file',
        formData: {
          'key': key,
          'OSSAccessKeyId': accessid,
          'policy': policyBase64,
          'Signature': signature,
          'success_action_status': '200',
          'x-oss-object-acl': 'public-read',
        },
        success: function (res) {
          if (res.statusCode != 200) {
            errorCallback(res);
            return;
          }
          successCallback(key);
        },
        fail: function (err) {
          errorCallback(err);
        },
      });
    },
  });
}

module.exports = uploadFile;