import { app, BrowserWindow, dialog } from "electron";
import { join } from "path";
import { autoUpdater } from 'electron-updater'

import "./api";

const isDev = process.env.DEV != undefined;
const isPreview = process.env.PREVIEW != undefined;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else if (isPreview) {
    mainWindow.webContents.openDevTools();
    mainWindow.loadFile("dist/index.html");
  } else {
    mainWindow.loadFile("dist/index.html");
  }

 
}


autoUpdater.autoDownload = false;          // não baixa automaticamente
autoUpdater.autoInstallOnAppQuit = false;

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

   // Verifica e baixa atualizações
  autoUpdater.checkForUpdates()
});

autoUpdater.on('update-available', (info) => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Atualização disponível',
    message: `Uma nova versão (${info.version}) está disponível.`,
    detail: 'Deseja atualizar agora?',
    buttons: ['Sim', 'Depois']
  }).then(result => {
    if (result.response === 0) { // "Sim"
      mainWindow?.webContents.send("update");
      autoUpdater.downloadUpdate()
    }else{
      mainWindow?.webContents.send("waiting");
    }


  })
})

autoUpdater.on("update-not-available", () => {
  mainWindow?.webContents.send("waiting");
});


autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Atualização pronta',
    message: 'A atualização foi baixada. Reiniciar agora?',
    buttons: ['Reiniciar', 'Depois']
  }).then(result => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall()
    }else{
      mainWindow?.webContents.send("waiting");
    }
  })
})

// Quando o download progride
autoUpdater.on("download-progress", (progress) => {
  mainWindow?.webContents.send("update-progress", progress);
});

autoUpdater.on("update-downloaded", () => {
  mainWindow?.webContents.send("waiting");
});




// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
