import { Client } from 'ssh2';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const config = {
  host: process.env.ECS_HOST || '61.29.254.143',
  port: parseInt(process.env.ECS_PORT || '22', 10),
  username: process.env.ECS_USERNAME || 'root',
  password: process.env.ECS_PASSWORD || 'DD321j654p987',
  remotePath: process.env.ECS_REMOTE_PATH || '/opt/culture-os',
};

async function run() {
  console.log('🚀 Starting Automatic Deployment pipeline to ECS...');

  // Step 1: Run build locally
  try {
    console.log('📦 Step 1: Building application locally...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build successful.');
  } catch (error) {
    console.error('❌ Build failed locally. Please fix compiler errors before deploying.');
    process.exit(1);
  }

  // Step 2: Create a deployment tar archive
  const archiveName = 'deploy-package.tar.gz';
  try {
    console.log('🗜️ Step 2: Archiving build artifacts...');
    // Create tar.gz excluding node_modules, .git, .github and the deploy scripts themselves
    execSync(`tar -czf ${archiveName} dist package.json package-lock.json ecosystem.config.cjs .env.example`, { stdio: 'inherit' });
    console.log(`✅ Compressed archive created: ${archiveName}`);
  } catch (error) {
    console.error('❌ Archiving failed:', error);
    process.exit(1);
  }

  // Step 3: Run SSH & SFTP Connection
  const conn = new Client();
  
  console.log('🔌 Connecting to ECS server via SSH...');
  conn.on('ready', () => {
    console.log('✅ SSH Connection established successfully!');
    
    // SFTP upload
    conn.sftp((err, sftp) => {
      if (err) {
        console.error('❌ SFTP session failed:', err);
        cleanupLocalArchive(archiveName);
        conn.end();
        process.exit(1);
      }
      
      console.log('📁 Step 3: Uploading deployment archive via SFTP...');
      const localFile = path.resolve(archiveName);
      const remoteFile = path.join(config.remotePath, archiveName);
      
      sftp.fastPut(localFile, remoteFile, {}, (uploadErr) => {
        if (uploadErr) {
          console.error('❌ Archive upload failed:', uploadErr);
          cleanupLocalArchive(archiveName);
          conn.end();
          process.exit(1);
        }
        
        console.log(`✅ Upload completed: ${remoteFile}`);
        
        // Step 4: Run Remote Commands
        console.log('⚙️ Step 4: Extracting archive and restarting deployment on ECS...');
        const command = `
          cd ${config.remotePath} && \
          tar -xzf ${archiveName} && \
          npm install --omit=dev --no-audit --no-fund && \
          pm2 restart culture-os || pm2 start ecosystem.config.cjs && \
          pm2 save && \
          rm -f ${archiveName}
        `;
        
        conn.exec(command, (execErr, stream) => {
          if (execErr) {
            console.error('❌ Execution failed on remote server:', execErr);
            cleanupLocalArchive(archiveName);
            conn.end();
            process.exit(1);
          }
          
          stream.on('close', (code, signal) => {
            conn.end();
            cleanupLocalArchive(archiveName);
            
            if (code === 0) {
              console.log('\n✨🎉 ============================================== 🎉✨');
              console.log('🌍 CultureOS Deployment succeeded!');
              console.log(`🔗 App Domain: https://culture-os.shuntian.uk`);
              console.log(`🔗 Direct IP: http://${config.host}:3000`);
              console.log('✨🎉 ============================================== 🎉✨\n');
            } else {
              console.error(`❌ Remote deployment failed with exit code ${code}`);
              process.exit(1);
            }
          }).on('data', (data) => {
            process.stdout.write(`[ECS STDOUT] ${data}`);
          }).stderr.on('data', (data) => {
            process.stderr.write(`[ECS STDERR] ${data}`);
          });
        });
      });
    });
  }).connect({
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password
  });
}

function cleanupLocalArchive(archiveName) {
  try {
    if (fs.existsSync(archiveName)) {
      fs.unlinkSync(archiveName);
      console.log(`🧹 Cleaned up local temporary archive ${archiveName}`);
    }
  } catch (err) {
    console.error('Error during cleanup:', err);
  }
}

run();
