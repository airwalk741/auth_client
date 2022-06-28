const target = process.env.VUE_APP_AUTH_SERVER;
const server = process.env.VUE_APP_APP_SERVER;
const mqttServer = process.env.VUE_APP_MQTT;

const fs = require("fs");

module.exports = {
  publicPath: "./",
  outputDir: "./nginx/build",
  devServer: {
    proxy: {
      "/ws": {
        target: mqttServer,
        ws: true,
        changeOrigin: true,
        pathRewrite: { "/ws": "" },
      },
      //proxy 요청을 보낼 api 시작 부분
      "/api/main": {
        target: server,
      },
      "/api/auth": {
        target,
      },
    },
    https: {
      key: fs.readFileSync("./certs/private.pem"),
      cert: fs.readFileSync("./certs/server.crt"),
      ca: fs.readFileSync("./certs/rootca.crt"),
    },
    disableHostCheck: true,
  },
};
