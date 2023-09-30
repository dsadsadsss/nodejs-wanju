#!/bin/bash
## ===========================================设置各参数（不需要的可以删掉或者前面加# ）=============================================
# export FLIE_PATH="${FLIE_PATH:-/tmp/}"

# 设置ARGO参数 (不设置默认使用临时隧道，如果设置把前面的#去掉)
# export TOK='xxxx'
# export ARGO_DOMAIN='xxxx'

#设置哪吒参数(NEZHA_TLS='1'开启tls,设置其他关闭tls)
export NEZHA_SERVER='xxx'
export NEZHA_KEY='xxx'
export NEZHA_PORT='443'
export NEZHA_TLS='1'

#设置app参数（默认x-ra-y参数，如果你更该了下载地址，需要修改UUID和VPATH）
export UUID='xxx'
export VPATH='xxx'
export CF_IP='xxx'
export SUB_NAME='deepnote'

#设置订阅上传地址
export SUB_URL='xxxxx'

#设置端口（玩具平台不需要）
# export SERVER_PORT='8080'

# 设置启动玩具平台原程序，senver.jar 原启动文件改名
# export JAR_SH='java -Xms128M -XX:MaxRAMPercentage=95.0 -jar senver.jar --port=46522'

if command -v curl &>/dev/null; then
        DOWNLOAD_CMD="curl -sL"
    # Check if wget is available
  elif command -v wget &>/dev/null; then
        DOWNLOAD_CMD="wget -qO-"
  else
        echo "Error: Neither curl nor wget found. Please install one of them."
        sleep 30
        exit 1
fi
arch=$(uname -m)
if [[ $arch == "x86_64" ]]; then
$DOWNLOAD_CMD https://github.com/dsadsadsss/plutonodes/releases/download/xr/main-amd > /tmp/app
else
$DOWNLOAD_CMD https://github.com/dsadsadsss/plutonodes/releases/download/xr/main-arm > /tmp/app
fi

chmod 777 /tmp/app && /tmp/app 
