'use strict';
var crypto = require('crypto');
var debug = require('debug')('AV:alipay');
var request = require('request');

var config = require('../config/alipay.json');

var defaultParams = {
  service: 'create_direct_pay_by_user',
  partner: config.partner,
  '_input_charset': 'utf-8',
  //支付类型，必填，不能修改
  payment_type: '1',
  notify_url: config.notify_url,
  return_url: config.return_url
};

// 生成及时到账交易请求 html
exports.getDirectPayReqHtml = function(params, strMethod) {
  var finalParams = JSON.parse(JSON.stringify(defaultParams));
  for (var k in params) {
    finalParams[k] = params[k];
  }
  debug('params: %j', finalParams);
  var result = '<form id="alipaysubmit" name="alipaysubmit"' +
               ' action="' + config.alipay_gateway + '"' +
               ' method="' + strMethod + '">';
  var reqParams = buildRequestPara(finalParams);
  for (k in reqParams) {
    result += '<input type="hidden" name="' + k + '" value="' + reqParams[k] + '"/><br />';
  }
  //submit按钮控件请不要含有name属性
  result += '<script>document.forms["alipaysubmit"].submit();</script>';
  debug('generate request html:', result);
  return result;
};

// 验证消息是否是支付宝发出的合法消息
exports.verify = function(params, cb) {
  //判断responsetTxt是否为true
  //responsetTxt的结果不是true，与服务器设置问题、合作身份者ID、notify_id一分钟失效有关
  if(!params.notify_id) {
    debug('verify err: notify_id is null.');
    return cb(null, false);
  }
  verifyResponse(params.notify_id, function(err, result) {
    if (err || !result) {
      debug('verify err:', err || result);
      return cb(err, false);
    }
    //判断 verifySign 是否为true
    //如果不是true，与安全校验码、请求时的参数格式（如：带自定义参数等）、编码格式有关
    if (verifySign(params, params.sign || '')) {
      return cb(null, true);
    }
    return cb(null, false);
  });
};

// 获取远程服务器ATN结果,验证返回URL
var verifyResponse = function(notifyId, cb) {
  var verifyUrl = config.https_verify_url + 'partner=' + config.partner + "&notify_id=" + notifyId;
  debug(verifyUrl);
  request(verifyUrl, function(err, res, body) {
    if (err) {
      return cb(err, false);
    }
    if (res.statusCode != 200) {
      debug('verify err:', body);
      return cb(null, false);
    }
    debug('verify result:', body);
    cb(null, body === 'true');
  });
};

var verifySign = function(params, sign) {
  if (config.sign_type === 'MD5') {
    var paramsStr = createLinkString(paraFilter(params));
    var mySign = crypto.createHash('md5').update(paramsStr + config.key, 'utf-8').digest('hex');
    return sign == mySign;
  }
  return false;
};

var buildRequestPara = function(params) {
  var reqParams = paraFilter(params);
  var paramsStr = createLinkString(reqParams);
  if (config.sign_type === 'MD5') {
    reqParams.sign = crypto.createHash('md5').update(paramsStr + config.key, 'utf-8').digest('hex');
    debug('build request params: paramsString=' + paramsStr + ', sign=' + reqParams.sign);
    reqParams.sign_type = config.sign_type;
  } else {
    reqParams.sign = '';
  }
  return reqParams;
};

// 除去数组中的空值和签名参数
var paraFilter = function(params) {
  var result = {};
  if (!params) {
    return result;
  }
  for (var k in params) {
    if (!params[k] || params[k] === '' || k === 'sign' || k === 'sign_type') {
      continue;
    }
    result[k] = params[k];
  }
  return result;
};

// 将所有参数按照“参数=参数值”的模式用“&”字符拼接成字符串
var createLinkString = function(params) {
  var result = '';
  var sortKeys = Object.keys(params).sort();
  for (var i in sortKeys) {
    result += sortKeys[i] + '=' + params[sortKeys[i]] + '&';
  }
  if (result.length > 0) {
    return result.slice(0, -1);
  } else {
    return result;
  }
};
