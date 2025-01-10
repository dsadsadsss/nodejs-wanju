const { spawn, execSync } = require('child_process');
const fs = require('fs');
const http = require('http');

// 创建 HTTP 服务器
const PORT = process.env.SERVER_PORT || process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World\n');
});

let currentProcess = null;

// 检查文件权限并尝试设置可执行权限
const ensureExecutable = () => {
  try {
    if (!fs.existsSync('./start.sh')) {
      console.error('\x1b[31mError: start.sh does not exist\x1b[0m');
      process.exit(1);
    }

    const stats = fs.statSync('./start.sh');
    const mode = stats.mode;
    
    if ((mode & fs.constants.S_IXUSR) !== 0) {
      console.log('\x1b[32m✔ start.sh is already executable\x1b[0m');
      return;
    }

    try {
      execSync('chmod +x ./start.sh');
      console.log('\x1b[32m✔ Successfully set execute permission for start.sh\x1b[0m');
    } catch (error) {
      if (!fs.accessSync('./start.sh', fs.constants.X_OK)) {
        console.warn('\x1b[33m⚠ Could not set execute permission, but file appears to be executable\x1b[0m');
        return;
      }
      console.error('\x1b[31m✘ Cannot set execute permission. Please ensure start.sh is executable manually\x1b[0m');
      console.error('\x1b[36mRun: chmod +x start.sh\x1b[0m');
      process.exit(1);
    }
  } catch (error) {
    console.error('\x1b[31m✘ Error checking file permissions:', error.message, '\x1b[0m');
    process.exit(1);
  }
};

// 启动脚本并保持运行
const startProcess = () => {
  console.log(`\x1b[32m➤ Starting script...\x1b[0m`);
  
  const childProcess = spawn('./start.sh', [], {
    stdio: 'pipe',
    detached: false,
    env: { ...process.env, PORT }
  });

  // 处理标准输出
  childProcess.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`\x1b[36m${line}\x1b[0m`);
      }
    });
  });

  // 处理错误输出
  childProcess.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.error(`\x1b[31m${line}\x1b[0m`);
      }
    });
  });

  // 处理进程退出
  childProcess.on('close', (code) => {
    console.log(`\x1b[33m⚠ Process exited with code ${code}, restarting...\x1b[0m`);
    setTimeout(startProcess, 1000);
  });

  // 处理进程错误
  childProcess.on('error', (error) => {
    if (error.code === 'EACCES') {
      console.error(`\x1b[31m✘ Permission denied. Please ensure start.sh has execute permission\x1b[0m`);
      console.error('\x1b[36mRun: chmod +x start.sh\x1b[0m');
      process.exit(1);
    }
    console.error(`\x1b[31m✘ Error: ${error.message}\x1b[0m`);
    setTimeout(startProcess, 1000);
  });

  return childProcess;
};

// 启动 HTTP 服务器
server.listen(PORT, () => {
  console.log(`\x1b[32m✔ HTTP Server running on port ${PORT}\x1b[0m`);
});

// 处理服务器错误
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\x1b[31m✘ Port ${PORT} is already in use\x1b[0m`);
    process.exit(1);
  }
  console.error(`\x1b[31m✘ Server error: ${error.message}\x1b[0m`);
});

// 启动前检查权限
console.log(`\x1b[34m➤ Checking file permissions...\x1b[0m`);
ensureExecutable();

// 启动进程
currentProcess = startProcess();

// 优雅关闭
const shutdown = () => {
  server.close(() => {
    console.log(`\x1b[34m➤ HTTP server closed\x1b[0m`);
    process.exit(0);
  });
};

// 处理退出信号
process.on('SIGINT', () => {
  console.log(`\x1b[34m➤ Received SIGINT. Cleaning up...\x1b[0m`);
  shutdown();
});

process.on('SIGTERM', () => {
  console.log(`\x1b[34m➤ Received SIGTERM. Cleaning up...\x1b[0m`);
  shutdown();
});
