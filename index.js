const http = require('http');
const fs = require('fs');
const path = require('path');
const ssdp = require('node-ssdp');
const xml2js = require('xml2js');

// 定义全局变量来存储 uri
let storedUri = '';

// 创建 SSDP 服务器
const server = new ssdp.Server({
    location: {
        port: 3000,
        path: '/xml/Description.xml'
    },
    udn: 'uuid:your-unique-device-id'
});

// 添加设备类型
server.addUSN('urn:schemas-upnp-org:device:MediaRenderer:1');

// 启动 SSDP 服务器
server.start(() => {
    console.log('SSDP 服务器已启动');
});

// 创建 HTTP 服务器处理请求
const httpServer = http.createServer((req, res) => {
    if (req.url === '/xml/Description.xml') {
        // 提供设备描述文件
        const filePath = path.join(__dirname, 'xml/Description.xml');
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/xml' });
                res.end(data);
            }
        });
    } else if (['AVTransport.xml', 'RenderingControl.xml', 'ConnectionManager.xml'].some(file => req.url.endsWith(file))) {
        const fileName = ['AVTransport.xml', 'RenderingControl.xml', 'ConnectionManager.xml'].find(file => req.url.endsWith(file));
        const filePath = path.join(__dirname, 'xml', fileName);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/xml' });
                res.end(data);
            }
        });

    }

    else if (req.url.startsWith('/upnp/control/') || req.url.includes('/AVTransport/action')) {
        // 处理控制请求
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        // 处理控制请求时，添加对播放相关操作的处理
        req.on('end', () => {
            xml2js.parseString(body, (err, result) => {
                if (err) {
                    console.error('解析控制请求失败:', err);
                    res.writeHead(500);
                    res.end('Internal Server Error');
                } else {
                    console.log('收到控制请求:', Date.now(), req.url);
                    // console.log('收到控制请求:', Date.now(), req.url, body);
                    // 检查是否为播放请求
                    if (result && result['s:Envelope'] && result['s:Envelope']['s:Body']) {
                        const body = result['s:Envelope']['s:Body'][0];
                        if (body['u:SetAVTransportURI']) {
                            const uri = body['u:SetAVTransportURI'][0]['CurrentURI'][0];
                            // 存储 uri
                            storedUri = uri;
                            console.log('收到播放请求，视频 URI:', uri);
                        }
                    }
                    res.writeHead(200, { 'Content-Type': 'text/xml' });
                    res.end('<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body></s:Body></s:Envelope>');
                }
            });
        });
    } else if (req.url === '/getUrl') {
        // 处理 getUrl 请求
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(storedUri);
    } else {
        console.log('收到未知请求:', req.url);
        res.writeHead(404);
        res.end('Not Found');
    }
});

// 启动 HTTP 服务器
httpServer.listen(3000, () => {
    console.log('HTTP 服务器已启动，监听端口 3000');
});

// 处理退出事件
process.on('SIGINT', () => {
    server.stop();
    httpServer.close();
    process.exit();
});
