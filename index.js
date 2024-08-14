const { spawn, execSync } = require('child_process');

// 给予 start.sh 脚本执行权限
execSync('chmod +x ./start.sh');

// 启动脚本
const process = spawn('./start.sh', [], { shell: true });

process.stdout.on('data', (data) => {
  console.log(`${data}`);
});

process.stderr.on('data', (data) => {
  console.error(`${data}`);
});

process.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

process.on('error', (error) => {
  console.error(`Error: ${error.message}`);
});
