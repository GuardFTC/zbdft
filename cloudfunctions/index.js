const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // 使用当前云环境
});

exports.main = async (event, context) => {
  const { code } = event;

  // 调用微信接口换取 openId 和 session_key
  const result = await cloud.openapi.auth.code2Session({
    js_code: code,
    appid: 'your-appid', // 替换为你的小程序 AppID
    secret: 'your-appsecret' // 替换为你的小程序 AppSecret
  });

  return {
    openid: result.openid,
    session_key: result.session_key
  };
};