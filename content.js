// 添加API配置
let API_CONFIG = {
  url: "https://api.siliconflow.cn/v1/chat/completions",
  key: ""
};

/**
 * 创建下载按钮
 * @returns {HTMLElement} 下载按钮元素
 */
function createDownloadButton() {
  const container = document.createElement('div');
  container.className = 'bilibili-subtitle-downloader';
  
  // 创建操作按钮容器
  const actionButtons = document.createElement('div');
  actionButtons.className = 'action-buttons';
  
  // 创建下载原字幕按钮
  const originalButton = document.createElement('button');
  originalButton.className = 'download-btn';
  originalButton.textContent = '下载原字幕';
  originalButton.addEventListener('click', handleOriginalSubtitleDownload);
  
  // 创建下载AI笔记按钮
  const aiButton = document.createElement('button');
  aiButton.className = 'download-btn';
  aiButton.textContent = '下载AI笔记';
  aiButton.addEventListener('click', handleAINotesDownload);
  
  // 创建主按钮
  const mainButton = document.createElement('button');
  mainButton.className = 'download-btn';
  mainButton.textContent = '字幕工具';
  
  // 添加按钮到容器
  actionButtons.appendChild(originalButton);
  actionButtons.appendChild(aiButton);
  container.appendChild(actionButtons);
  container.appendChild(mainButton);
  
  return container;
}

/**
 * 创建API密钥输入框
 * @returns {HTMLElement} 输入框容器元素
 */
function createApiKeyInput() {
  const container = document.createElement('div');
  container.className = 'api-key-input-container';
  
  const input = document.createElement('input');
  input.type = 'password';
  input.className = 'api-key-input';
  input.placeholder = '请输入您的API密钥';
  
  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'api-key-buttons';
  
  const submitButton = document.createElement('button');
  submitButton.className = 'api-key-btn api-key-submit';
  submitButton.textContent = '确定';
  
  const cancelButton = document.createElement('button');
  cancelButton.className = 'api-key-btn api-key-cancel';
  cancelButton.textContent = '取消';
  
  buttonsDiv.appendChild(cancelButton);
  buttonsDiv.appendChild(submitButton);
  
  container.appendChild(input);
  container.appendChild(buttonsDiv);
  
  return container;
}

/**
 * 获取字幕URL
 * @returns {Promise<string>} 字幕URL
 */
function getSubtitleUrl() {
  return new Promise((resolve) => {
    // 检查是否已经存在字幕请求URL
    const checkExistingRequest = () => {
      const requests = performance.getEntriesByType('resource');
      const subtitleRequest = requests.find(r => r.name.includes('aisubtitle.hdslb.com'));
      if (subtitleRequest) {
        resolve(subtitleRequest.name);
        return true;
      }
      return false;
    };

    // 如果当前没有字幕请求，提示用户打开字幕
    if (!checkExistingRequest()) {
      alert('请先打开视频字幕（点击播放器右下角的"CC"按钮），然后再点击下载');
      
      // 不再自动监听和触发下载
      resolve(null);
      
      /* 移除自动监听和触发
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const subtitleEntry = entries.find(entry => entry.name.includes('aisubtitle.hdslb.com'));
        if (subtitleEntry) {
          resolve(subtitleEntry.name);
          observer.disconnect();
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
      */
    }
  });
}

/**
 * 处理原始字幕下载
 */
async function handleOriginalSubtitleDownload() {
  try {
    const subtitleApiUrl = await getSubtitleUrl();
    if (!subtitleApiUrl) {
      return;
    }
    
    const response = await fetch(subtitleApiUrl);
    if (!response.ok) {
      throw new Error('字幕加载失败');
    }
    
    const data = await response.json();
    if (!data.body || !Array.isArray(data.body)) {
      throw new Error('字幕数据格式错误');
    }
    
    const subtitles = data.body
      .map(item => `${item.content}`)
      .join('\n');
    
    const subtitleBlob = new Blob([subtitles], { type: 'text/plain;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(subtitleBlob);
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `bilibili_subtitle_${Date.now()}.txt`;
    a.click();
    
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('下载原字幕失败:', error);
    alert('下载原字幕失败: ' + error.message);
  }
}

/**
 * 处理API密钥输入
 * @returns {Promise<string>} API密钥
 */
function handleApiKeyInput() {
  return new Promise((resolve, reject) => {
    const container = document.querySelector('.api-key-input-container') || createApiKeyInput();
    document.querySelector('.bilibili-subtitle-downloader').appendChild(container);
    
    const input = container.querySelector('.api-key-input');
    const submitButton = container.querySelector('.api-key-submit');
    const cancelButton = container.querySelector('.api-key-cancel');
    
    // 显示输入框
    container.classList.add('active');
    input.focus();
    
    // 处理提交
    function handleSubmit() {
      const apiKey = input.value.trim();
      if (apiKey) {
        API_CONFIG.key = apiKey;
        container.classList.remove('active');
        resolve(apiKey);
      } else {
        alert('请输入有效的API密钥');
      }
    }
    
    // 处理取消
    function handleCancel() {
      container.classList.remove('active');
      reject(new Error('用户取消输入'));
    }
    
    // 绑定事件
    submitButton.onclick = handleSubmit;
    cancelButton.onclick = handleCancel;
    
    // 支持回车提交
    input.onkeypress = (e) => {
      if (e.key === 'Enter') {
        handleSubmit();
      }
    };
  });
}

/**
 * 处理AI笔记下载
 */
async function handleAINotesDownload() {
  try {
    // 首先检查是否有API密钥
    if (!API_CONFIG.key) {
      await handleApiKeyInput();
    }
    
    // 获取字幕URL
    const subtitleApiUrl = await getSubtitleUrl();
    if (!subtitleApiUrl) {
      return;
    }

    // 获取到字幕URL后，再添加loading状态和创建输出框
    const aiButton = document.querySelector('.action-buttons .download-btn:nth-child(2)');
    aiButton.classList.add('loading');
    aiButton.textContent = '生成中...';
    
    // 创建或获取输出框
    let outputDiv = document.querySelector('.ai-output');
    if (!outputDiv) {
      outputDiv = document.createElement('div');
      outputDiv.className = 'ai-output';
      document.querySelector('.bilibili-subtitle-downloader').appendChild(outputDiv);
    }
    outputDiv.textContent = '';
    outputDiv.classList.add('active');
    
    // 获取字幕内容
    const response = await fetch(subtitleApiUrl);
    if (!response.ok) {
      throw new Error('字幕加载失败');
    }
    
    const data = await response.json();
    if (!data.body || !Array.isArray(data.body)) {
      throw new Error('字幕数据格式错误');
    }
    
    const subtitles = data.body
      .map(item => `${item.content}`)
      .join('\n');

    // 调用AI生成笔记（使用流式传输）
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_CONFIG.key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "model": "deepseek-ai/DeepSeek-R1",
        "messages": [
          {
            "role": "user",
            "content": `请将以下视频字幕内容整理成一篇结构化的笔记：\n\n${subtitles}`
          }
        ],
        "stream": true,
        "temperature": 0.7,
        "max_tokens": 2048
      })
    };

    const aiResponse = await fetch(API_CONFIG.url, options);
    if (!aiResponse.ok) {
      throw new Error(`AI请求失败: ${aiResponse.status}`);
    }

    // 处理流式响应
    const reader = aiResponse.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            console.log('AI笔记生成完成');
            break;
          }
          
          try {
            const jsonData = JSON.parse(data);
            const content = jsonData.choices[0]?.delta?.content || '';
            if (content) {
              outputDiv.textContent += content;
              // 自动滚动到底部
              outputDiv.scrollTop = outputDiv.scrollHeight;
              fullResponse += content;
            }
          } catch (e) {
            console.error('解析AI响应失败:', e);
          }
        }
      }
    }

    // 下载完整的笔记内容
    const notesBlob = new Blob([fullResponse], { type: 'text/markdown;charset=utf-8' });
    const notesUrl = URL.createObjectURL(notesBlob);
    
    const notesLink = document.createElement('a');
    notesLink.href = notesUrl;
    notesLink.download = `bilibili_notes_${Date.now()}.md`;
    notesLink.click();
    
    URL.revokeObjectURL(notesUrl);

    // 添加延时，让用户能看到生成完成
    setTimeout(() => {
      outputDiv.classList.remove('active');
    }, 1000); // 1秒后隐藏输出框

  } catch (error) {
    if (error.message !== '用户取消输入') {
      console.error('生成AI笔记失败:', error);
      alert('生成AI笔记失败: ' + error.message);
    }
    document.querySelector('.ai-output')?.classList.remove('active');
  } finally {
    const aiButton = document.querySelector('.action-buttons .download-btn:nth-child(2)');
    aiButton.classList.remove('loading');
    aiButton.textContent = '下载AI笔记';
  }
}

// 修改按钮插入时机
function insertButton() {
  const existingButton = document.querySelector('.bilibili-subtitle-downloader');
  if (!existingButton) {
    const button = createDownloadButton();
    document.body.appendChild(button);
    console.log('字幕下载按钮已插入');
  }
}

// 使用多个事件来确保按钮被插入
document.addEventListener('DOMContentLoaded', insertButton);
window.addEventListener('load', insertButton);
// 延迟插入以确保页面完全加载
setTimeout(insertButton, 2000); 