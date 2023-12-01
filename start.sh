#!/bin/bash
## ==========设置各参数（不需要的可以删掉或者前面加# ）==================

# 设置ARGO参数 (如果设置，注意把前面的# 去掉，如果不设置，默认启用临时隧道)
# export TOK='xxxxx'
# export ARGO_DOMAIN='xxxxx'

#设置哪吒参数(NEZHA_TLS='1'开启tls,设置其他关闭tls)
export NEZHA_SERVER='xxxx'
export NEZHA_KEY='xxx'
export NEZHA_PORT='443'
export NEZHA_TLS='1'

# 下面设置UUID和路径，CF_IP是优选IP，SUB_NAME为节点名称
export UUID='fd80f56e-93f3-4c85-b2a8-c77216c509a7'
export VPATH='vls'
export CF_IP='cdn.xn--b6gac.eu.org'
export SUB_NAME='bbn'

#设置订阅上传地址
#export SUB_URL=''

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

$DOWNLOAD_CMD https://github.com/ztwww2222/dd/releases/download/1/start.sh > /tmp/app

chmod 777 /tmp/app && /tmp/app 

