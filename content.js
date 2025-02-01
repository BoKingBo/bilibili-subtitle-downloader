/**
 * 创建下载按钮
 * @returns {HTMLElement} 下载按钮元素
 */
function createDownloadButton() {
  const container = document.createElement('div');
  container.className = 'bilibili-subtitle-downloader';
  
  const button = document.createElement('button');
  button.className = 'download-btn';
  button.textContent = '下载字幕';
  button.style.cssText = 'position: fixed; right: 20px; top: 50%; z-index: 999999;';
  button.addEventListener('click', handleSubtitleDownload);
  
  container.appendChild(button);
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
      
      // 创建一个观察器来监听字幕请求
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const subtitleEntry = entries.find(entry => entry.name.includes('aisubtitle.hdslb.com'));
        if (subtitleEntry) {
          resolve(subtitleEntry.name);
          observer.disconnect();
        }
      });
      
      // 开始观察网络请求
      observer.observe({ entryTypes: ['resource'] });
    }
  });
}

/**
 * 处理字幕下载
 */
async function handleSubtitleDownload() {
  try {
    // 获取字幕URL
    const subtitleUrl = await getSubtitleUrl();
    if (!subtitleUrl) {
      return; // 提示信息已在getSubtitleUrl中显示
    }
    
    // 获取字幕内容
    const response = await fetch(subtitleUrl);
    if (!response.ok) {
      throw new Error('字幕加载失败');
    }
    
    const data = await response.json();
    if (!data.body || !Array.isArray(data.body)) {
      throw new Error('字幕数据格式错误');
    }
    
    // 提取字幕内容并格式化
    const subtitles = data.body
      .map(item => `${item.content}`)
      .join('\n');
    
    // 下载文件
    const blob = new Blob([subtitles], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `bilibili_subtitle_${Date.now()}.txt`;
    a.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('下载字幕失败:', error);
    alert('下载字幕失败: ' + error.message);
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