const http = require('http');
const fs = require('fs');
const path = require('path');
const ssdp = require('node-ssdp');
const xml2js = require('xml2js');

// 定义全局变量来存储 uri
let storedUri = '';

// 定义端口参数
const PORT = process.env.CAST_LINKER_PORT || 1900;

// 创建 SSDP 服务器
const server = new ssdp.Server({
    location: {
        port: PORT,
        path: '/xml/Description.xml'
    },
    udn: 'uuid:cast-linker-device-id'
});

// 添加设备类型
server.addUSN('urn:schemas-upnp-org:device:MediaRenderer:1');

// 启动 SSDP 服务器
server.start(() => {
    console.log('SSDP 服务器已启动');
});

// 创建 HTTP 服务器处理请求
const httpServer = http.createServer((req, res) => {
    if (req.url === '/') {
        // 提供 HTML 页面
        const filePath = path.join(__dirname, 'index.html');
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (req.url.startsWith('/static')) {
        // 处理静态文件请求
        const staticPath = path.join(__dirname, 'static', req.url.slice('/static'.length));
        fs.readFile(staticPath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not Found');
            } else {
                const extname = path.extname(staticPath);
                let contentType = 'text/plain';
                switch (extname) {
                    case '.html':
                        contentType = 'text/html';
                        break;
                    case '.css':
                        contentType = 'text/css';
                        break;
                    case '.js':
                        contentType = 'text/javascript';
                        break;
                    case '.png':
                        contentType = 'image/png';
                        break;
                    case '.jpg':
                    case '.jpeg':
                        contentType = 'image/jpeg';
                        break;
                    case '.json':
                        contentType = 'application/json';
                        break;
                }
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });
    } else if (req.url === '/xml/Description.xml') {
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
    } else if (req.url.startsWith('/upnp/control/') || req.url.includes('/AVTransport/action')) {
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
    } else if (req.url === '/get_url') {
        // 处理 get_url 请求，以 JSON 格式返回，url 为 storedUri
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ url: storedUri }));
    } else {
        console.log('收到未知请求:', req.url);
        res.writeHead(404);
        res.end('Not Found');
    }
});

// 启动 HTTP 服务器
httpServer.listen(PORT, () => {
    console.log(`HTTP 服务器已启动，监听端口 ${PORT}`);
});

// 处理退出事件
process.on('SIGINT', () => {
    server.stop();
    httpServer.close();
    process.exit();
});


// 获取环境变量中的 FRIENDLY_NAME
const friendlyName = process.env.FRIENDLY_NAME || 'Cast Linker';

if (friendlyName) {
    // 定义 Description.xml 文件的路径
    const xmlFilePath = path.join(__dirname, 'xml', 'Description.xml');

    // 读取文件内容
    fs.readFile(xmlFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件时出错:', err);
            return;
        }

        // 使用正则表达式替换 friendlyName 标签内的内容
        const newData = data.replace(/<friendlyName>.*<\/friendlyName>/, `<friendlyName>${friendlyName}</friendlyName>`);

        // 将修改后的内容写回文件
        fs.writeFile(xmlFilePath, newData, 'utf8', (writeErr) => {
            if (writeErr) {
                console.error('写入文件时出错:', writeErr);
                return;
            }
            console.log('friendlyName 已成功更新为:', friendlyName);
        });
    });
}

