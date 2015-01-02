# 支付宝在云代码的示例

## 安装

### 下载代码：

```
git clone git@github.com:leancloud/cloud-code-alipay.git
```

### 修改支付宝相关的配置 `cloud/config/alipay.js`

```
module.exports = {
  sign_type: 'MD5',
  alipay_gateway: 'https://mapi.alipay.com/gateway.do?',
  https_verify_url: 'https://mapi.alipay.com/gateway.do?service=notify_verify&',
  partner: '2088000000000000',
  key: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  notify_url: 'http://xxx.avosapps.com/pay/notify',
  return_url: 'http://xxx.avosapps.com/pay/return'
}
```
* alipay_gateway: 支付宝网关，一般情况默认即可。
* https_verify_url: 支付宝回调验证 url，一般情况默认即可。
* partner: 合作者身份（PID），2088 开头的 16 位数字，可以在支付宝网站查找: https://b.alipay.com/order/pidAndKey.htm
* key: 安全校验码，数字加字幕的字符串，可以在支付宝网站查找: https://b.alipay.com/order/pidAndKey.htm
* notify_url: 支付宝异步通知 url，二级域名根据 LeanCloud 云代码配置而定。
* return_url: 支付宝同步通知 url，二级域名根据 LeanCloud 云代码配置而定。

### 部署
配置 LeanCloud appId 和 appKey
```
avoscloud app add <projectName> <appId>
```

切换目标应用

```
avoscloud checkou <projectName>
```

部署应用到测试环境和生产环境

```
avoscloud deploy && avoslcoud publish
```

**提示**: 过程中可能会提示输入 masterKey。

如果没有错误，请打开浏览器，根据自己的二级域名键入网址： `http://<yourPath>.avosapps.com`

如果看到「支付宝即时到账交易接口」的页面，恭喜你，部署成功！

## 感受一下

1. 在「支付宝即时到账交易接口」的测试页面，输入相关信息。**注意**：「卖家支付宝账户」需要和「partner」对应；金额可以输入 0.01 (表示支付 1 分钱)来进行尝试。输入完成后点击确认。
2. 你将看到跳转到支付宝页面，输入自己的支付宝账号和支付密码等完成支付。
3. 支付完成后会跳转回我们自己的应用页面，并显示 `验证结果：true`。支付流程结束。当然，你的 1 分钱也转到了对应的卖家账户 ;)

## 开发相关

### 文件说明

* `cloud/app.js`: 支付宝相关请求路由。
* `cloud/alipay.js`: 支付宝相关签名验证，生成跳转等逻辑。

### 路由信息

* `GET /`: 静态首页 `public/index.html`。
* `POST /pay`: 接受表单信息、签名，并准备跳转到支付宝。
* `GET /pay/return`: 等待支付宝同步回调，并验证调用方是否真正来自支付宝。
* `POST /pay/notify`:等待支付宝异步回调，并验证调用方是否真正来自支付宝。


