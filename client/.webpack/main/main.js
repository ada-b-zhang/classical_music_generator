"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs");
function readConfig() {
  try {
    let configPath = path.join(electron.app.getAppPath(), "config.json");
    if (!fs.existsSync(configPath)) {
      configPath = path.join(electron.app.getAppPath(), "src/main/config.json");
    }
    const configData = fs.readFileSync(configPath, "utf8");
    return JSON.parse(configData);
  } catch (error) {
    console.error("Error reading config file:", error);
    return null;
  }
}
function createWindow() {
  var _a, _b;
  const config = readConfig();
  const mainWindow = new electron.BrowserWindow({
    width: ((_a = config == null ? void 0 : config.window) == null ? void 0 : _a.width) || 1200,
    height: ((_b = config == null ? void 0 : config.window) == null ? void 0 : _b.height) || 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(electron.app.getAppPath(), "renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
//# sourceMappingURL=main.js.map
