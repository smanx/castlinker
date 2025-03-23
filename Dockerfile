# 基础镜像
FROM node:20-alpine

# 创建工作目录
WORKDIR /app

# 复制项目中的所有文件到工作目录
COPY . .

# 安装项目依赖
RUN npm install

# 暴露端口，这里使用代码里的默认端口 1900
# EXPOSE 1900

# 运行 Node.js 应用
CMD ["node", "index.js"]
