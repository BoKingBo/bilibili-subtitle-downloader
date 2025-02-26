// API配置
const API_CONFIG = {
  url: "https://api.siliconflow.cn/v1/chat/completions",
  key: "", 
  model: "deepseek-ai/DeepSeek-R1"
};

/**
 * 调用DeepSeek API生成笔记
 * @param {string} subtitle 字幕内容
 * @returns {Promise<string>} 生成的笔记内容
 */
async function generateNotes(subtitle) {
  try {
    const response = await fetch(API_CONFIG.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: API_CONFIG.model,
        messages: [
          {
            role: "user",
            content: `请将以下视频字幕内容整理成一篇markdown格式的笔记,重点提炼主要内容:\n\n${subtitle}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
        response_format: { type: "text" }
      })
    });

    if (!response.ok) {
      throw new Error('API请求失败');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('生成笔记失败:', error);
    throw error;
  }
}

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GENERATE_NOTES') {
    generateNotes(request.subtitle)
      .then(notes => {
        sendResponse({ success: true, notes });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // 表示会异步发送响应
  }
});

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