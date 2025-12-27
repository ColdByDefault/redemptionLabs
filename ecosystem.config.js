module.exports = {
  apps: [
    {
      name: "homelab-landing-nextjs",
      script: "npm",
      args: "start",
      cwd: "/var/www/homelab-landing-nextjs",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/log/pm2/homelab-landing-nextjs-error.log",
      out_file: "/var/log/pm2/homelab-landing-nextjs-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
    },
  ],
};
