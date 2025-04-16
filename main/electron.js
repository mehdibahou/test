const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { startServer } = require("next/dist/server/lib/start-server");
const getPort = require("get-port-please").getPort;

const isDev = process.env.NODE_ENV === "development";
let serverProcess = null;
let mainWindow = null;

function startBackendServer() {
  const backappDir = isDev
    ? path.join(__dirname, "../backapp")
    : path.join(process.resourcesPath, "backapp");

  serverProcess = spawn("node", ["server.js"], {
    cwd: backappDir,
    detached: false,
    stdio: "pipe",
  });

  serverProcess.stdout.on("data", (data) => {
    console.log(`Backend: ${data}`);
  });

  serverProcess.stderr.on("data", (data) => {
    console.error(`Backend Error: ${data}`);
  });

  return new Promise((resolve) => setTimeout(resolve, 2000));
}

async function startNextServer() {
  const port = await getPort({ portRange: [3000, 3100] });
  const nextDir = path.join(__dirname, "../app");

  await startServer({
    dir: nextDir,
    hostname: "localhost",
    port,
    isDev: false,
    allowRetry: true,
    customServer: false,
  });

  return port;
}

async function createWindow() {
  if (mainWindow) return;

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  await startBackendServer();

  try {
    if (isDev) {
      await mainWindow.loadURL("http://localhost:3000");
      mainWindow.webContents.openDevTools();
    } else {
      const port = await startNextServer();
      await mainWindow.loadURL(`http://localhost:${port}`);
    }
  } catch (error) {
    console.error("Failed to load URL:", error);
    app.quit();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  createWindow();
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
