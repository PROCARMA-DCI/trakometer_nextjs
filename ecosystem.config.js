module.exports = {
  apps: [
    {
      name: "trakometer",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 4003 --hostname 127.0.0.1",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
