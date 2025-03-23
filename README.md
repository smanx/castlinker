# Cast Linker
## Casting to a Web Page for Playback on LAN Devices Based on DLNA, Supporting Node and Docker Runtime

[中文说明](README_ZH.md)
[English](README.md)

## Features
- **Cross-Platform Support**: Compatible with multiple operating systems, including Windows, macOS, and Linux
- **Cross-Device Support**: Only requires a browser on the terminal device to complete casting (supports iOS and Android)
- **Easy to Use**: Direct casting from mobile video apps
- **Efficient Transmission**: Supports high-definition streaming media transmission to ensure smooth playback
- **Dark Mode Toggle**: Supports default/dark mode switching at any time for a more immersive viewing experience
- **User-Friendly**: Intuitive user interface and simple operation
- **Multi-Browser Support**: Compatible with mainstream browsers such as Chrome, Firefox, Safari, and Edge

## Implementation
- Backend node service to fetch and parse the casted video data
- Frontend adapted from [qL-play](https://github.com/linzxcw/qL-play) to call backend data for video playback
<img src="https://github.com/linzxcw/qL-play/blob/main/qL-play-w1.png?raw=true" border="0">

## Usage
- Run the backend node service
- Access the web page via ip:port (default port 1900)
- Select Cast Linker when casting from a mobile video app, and the web page will automatically play the video (first playback requires a manual click)

### Running
Node
```
npm install
```
```
npm run start
```

docker
```
docker run -d --name castlinker --network host smanx/castlinker
```
or modify the default port
```
docker run -d --name castlinker --network host -e CAST_LINKER_PORT=1901 smanx/castlinker
```

## Acknowledgments  
- [qL-play](https://github.com/linzxcw/qL-play)
- [Macast](https://github.com/xfangfang/Macast)