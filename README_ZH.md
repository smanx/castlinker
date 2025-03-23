# Cast linker
## 基于DLNA在局域网内设备投屏到web页播放，支持node运行和docker运行

[中文说明](README_ZH.md)
[English](README.md)

## 功能特点
- **跨平台支持**：兼容多个操作系统，包括 Windows、macOS 和 Linux
- **跨终端支持**：只需终端设备具备浏览器，即可完成投屏（支持 iOS 和 Android）
- **方便易用**：手机视频app可直接投屏
- **高效传输**：支持高清流媒体传输，确保流畅播放
- **暗黑模式切换**：支持默认/暗黑模式随时切换，让观影更加沉浸
- **简单易用**：用户界面友好，操作简便
- **多浏览器支持**：兼容主流浏览器，如 Chrome、Firefox、Safari 和 Edge

## 功能实现
- 后端node运行服务获取解析投屏的视频数据
- 前端照搬的[麒麟投屏](https://github.com/linzxcw/qL-play)调用后端数据播放视频
<img src="https://github.com/linzxcw/qL-play/blob/main/qL-play-w1.png?raw=true" border="0">

## 使用方法
- 运行后端node服务
- 通过ip:port访问web页面(默认端口1900)
- 手机视频app投屏时选择Cast linker，web会自动播放视频（第一次播放需要手动点击播放）

### 运行
node运行
```
npm install
```
```
npm run start
```

docker运行
```
docker run -d --name castlinker --network host smanx/castlinker
```
or修改默认端口和投屏服务的名称
```
docker run --name castlinker --network host -e CAST_LINKER_PORT=1901 -e FRIENDLY_NAME=MyServerName  smanx/castlinker
```

## 致谢  
- [麒麟投屏](https://github.com/linzxcw/qL-play)
- [Macast](https://github.com/xfangfang/Macast)