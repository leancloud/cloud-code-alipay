'use strict';
var router = require('express').Router();
var alipay = require('../utils/alipay');

router.post('/', function(req, res) {
  var params = {
    //商户网站订单系统中唯一订单号，必填
    out_trade_no: req.body.out_trade_no,
    //订单名称，必填
    subject: req.body.subject,
    //卖家支付宝帐户，必填
    seller_id: req.body.seller_id,
    // 付款金额，必填
    total_fee: req.body.total_fee,
    // 订单描述
    body: req.body.body,
    // 商品展示地址
    //需以http://开头的完整路径，例如：http://www.商户网址.com/myorder.html
    show_url: req.body.show_url
  };
  var html = alipay.getDirectPayReqHtml(params, 'get');
  res.send(html);
});

router.get('/return', function(req, res) {
  console.log('return query: ', req.query);
  alipay.verify(req.query, function(err, result) {
    console.log('result: ', err, result);
    if (err) {
      return res.send('err: ' + err);
    }
    return res.send('验证结果: ' + result);
  });
});

router.post('/notify', function(req, res) {
  console.log('notify params:', req.params);
  alipay.verify(req.params, function(err, result) {
    console.log('result: ', err, result);
    if (err) {
      return res.send('err: ' + err);
    }
    return res.send('验证结果: ' + result);
  });
});

module.exports = router;
