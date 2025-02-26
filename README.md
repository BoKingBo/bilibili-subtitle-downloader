# B站字幕输出 Chrome扩展

## 功能描述
- 自动识别bilibili.com域名
- 提供悬浮下载按钮
- 捕获并下载视频字幕为TXT文件
- 使用AI生成视频内容笔记（需要API密钥）
- 支持实时显示AI生成过程

## 使用方法
1. 安装扩展后，访问任意B站视频页面
2. 页面右侧会出现"字幕工具"悬浮按钮
3. 将鼠标悬停在按钮上，会显示两个选项：
   - 下载原字幕：直接下载视频的原始字幕文本
   - 下载AI笔记：使用AI生成结构化的视频笔记

### 下载原字幕
1. 确保视频已打开字幕（点击播放器右下角的"CC"按钮）
2. 点击"下载原字幕"按钮
3. 字幕将以TXT格式保存到本地

### 下载AI笔记
1. 确保视频已打开字幕
2. 点击"下载AI笔记"按钮
3. 首次使用时需要输入DeepSeek API密钥
4. AI开始生成笔记，生成过程会实时显示
5. 生成完成后自动下载markdown格式的笔记文件

## API密钥说明
- 需要DeepSeek API密钥才能使用AI笔记功能
- API密钥可以在 https://siliconflow.cn 注册获取
- 密钥输入后会临时保存在当前会话中
- 出于安全考虑，刷新页面后需要重新输入

## 技术实现
- 基于 Manifest V3 规范
- 使用 Content Script 注入页面
- 通过拦截网络请求获取字幕数据
- 集成 DeepSeek API 实现AI笔记生成
- 支持流式输出显示生成过程

## 注意事项
1. 使用前需要先打开视频字幕
2. AI笔记功能需要有效的API密钥
3. 生成过程中请保持页面打开
4. 建议在网络状况良好时使用AI功能

## 隐私说明
- 扩展不会保存或上传任何个人数据
- API密钥仅在当前会话中临时使用
- 字幕内容仅用于生成笔记，不会用于其他用途 