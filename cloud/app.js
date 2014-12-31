// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();

var alipay = require('cloud/alipay');

// App 全局配置
app.use(express.bodyParser());    // 读取请求 body 的中间件

app.post('/pay', function(req, res) {
  var params = {
    //卖家支付宝帐户
    //必填
    seller_email: req.param('seller_email'),
    //商户网站订单系统中唯一订单号，必填
    out_trade_no: req.param('out_trade_no'),
    //订单名称，必填
    subject: req.param('subject'),
    // 付款金额，必填
    total_fee: req.param('total_fee'),
    // 订单描述
    body: req.param('body'),
    // 商品展示地址
    //需以http://开头的完整路径，例如：http://www.商户网址.com/myorder.html
    show_url: req.param('show_url')
  }
  var html = alipay.getDirectPayReqHtml(params, 'get');
  res.send(html);
})

app.get('/pay/return', function(req, res) {
  console.log('return query: ', req.query);
  alipay.verify(req.query, function(err, result) {
    console.log('result: ', err, result);
    if (err) {
      return res.send('err: ' + err);
    }
    return res.send('验证结果: ' + result);
  })
})

app.post('/pay/notify', function(req, res) {
  console.log('notify params:', req.params);
  alipay.verify(req.params, function(err, result) {
    console.log('result: ', err, result);
    if (err) {
      return res.send('err: ' + err);
    }
    return res.send('验证结果: ' + result);
  })
})

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();
