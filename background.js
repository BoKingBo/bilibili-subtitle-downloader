/**
 * 监听网络请求
 */
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    if (details.url.includes('aisubtitle.hdslb.com')) {
      // 可以在这里处理字幕URL的拦截
      console.log('捕获到字幕请求:', details.url);
    }
  },
  { urls: ["*://*.hdslb.com/*"] }
); 