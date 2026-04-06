const buildEnv = process.env.BUILD_ENV || "dev";

/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId: "com.meetup.proximity-chat",
  productName: "Meetup",
  directories: {
    output: "release",
    buildResources: "assets",
  },
  files: [
    "dist/**/*",
    "dist-electron/**/*",
    "node_modules/**/*",
    "package.json",
  ],
  win: {
    target: buildEnv === "dev" ? "dir" : "nsis",
    icon: "assets/icon.ico",
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
  },
  extraMetadata: {
    main: "dist-electron/src/main/index.js",
  },
};
