const { spawn, execSync } = require('child_process');
const fs = require('fs');
const http = require('http');

// 设置端口，默认为3000
const PORT = process.env.PORT || 3000;

// 创建HTTP服务器
const createServer = () => {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('bello world');
  });

  server.listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`);
  });

  server.on('error', (error) => {
    console.error(`Server error: ${error.message}`);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use.`);
    }
  });
};

// 检查tmpapp进程是否存在
const checkProcessExists = () => {
  console.log('Checking if tmpapp process is running...');
  
  // 使用多种Linux命令检查进程是否存在
  const commands = [
    'ps -ef | grep tmpapp | grep -v grep',
    'pgrep -f tmpapp',
    'pidof tmpapp',
    'ps aux | grep tmpapp | grep -v grep'
  ];
  
  // 如果所有命令都检测不到进程，则返回false（表示进程不存在）
  for (const cmd of commands) {
    try {
      const result = execSync(cmd, { stdio: ['pipe', 'pipe', 'ignore'] });
      if (result && result.toString().trim()) {
        console.log(`Process tmpapp found using command: ${cmd}`);
        return true; // 进程存在
      }
    } catch (error) {
      // 命令执行失败或没有找到进程，继续尝试下一个命令
    }
  }
  
  console.log('No tmpapp process found, safe to start.');
  return false; // 所有命令都检测不到进程
};

// 检查文件权限并尝试设置可执行权限
const ensureExecutable = () => {
  try {
    // 检查文件是否存在
    if (!fs.existsSync('./start.sh')) {
      console.error('Error: start.sh does not exist');
      process.exit(1);
    }

    // 检查当前权限
    const stats = fs.statSync('./start.sh');
    const mode = stats.mode;
    
    // 如果已经有执行权限，就不需要修改
    if ((mode & fs.constants.S_IXUSR) !== 0) {
      console.log('start.sh is already executable');
      return;
    }

    // 尝试添加执行权限
    try {
      execSync('chmod +x ./start.sh');
      console.log('Successfully set execute permission for start.sh');
    } catch (error) {
      // 如果chmod失败，检查是否仍然可以执行（可能之前就有权限）
      if (!fs.accessSync('./start.sh', fs.constants.X_OK)) {
        console.error('Warning: Could not set execute permission, but file appears to be executable');
        return;
      }
      console.error('Cannot set execute permission. Please ensure start.sh is executable manually');
      console.error('You can run: chmod +x start.sh');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error checking file permissions:', error.message);
    process.exit(1);
  }
};

// 启动脚本并保持运行
const startProcess = () => {
  const process = spawn('./start.sh', [], {
    stdio: 'pipe',
    detached: false
  });

  process.stdout.on('data', (data) => {
    console.log(`${data}`);
  });

  process.stderr.on('data', (data) => {
    console.error(`${data}`);
  });

  process.on('close', (code) => {
    console.log(`Process exited with code ${code}, restarting...`);
    setTimeout(startProcess, 1000);
  });

  process.on('error', (error) => {
    if (error.code === 'EACCES') {
      console.error('Permission denied. Please ensure start.sh has execute permission');
      console.error('You can run: chmod +x start.sh');
      process.exit(1);
    }
    console.error(`Error: ${error.message}`);
    setTimeout(startProcess, 1000);
  });
};

// 启动HTTP服务器
createServer();

// 检查进程
if (checkProcessExists()) {
  console.log('tmpapp process already exists. Not starting start.sh');
} else {
  // 启动前检查权限
  console.log('Checking file permissions...');
  ensureExecutable();

  // 启动进程
  console.log('Starting process...');
  startProcess();
}

// 处理退出信号
process.on('SIGINT', () => {
  console.log('Received SIGINT. Performing cleanup...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Performing cleanup...');
  process.exit(0);
});
