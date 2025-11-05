import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { join } from "path";
import { autoUpdater } from 'electron-updater'
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";
import { getPrinterService } from "./printer";
import {getApiServices} from './api'

import "./services";
import { delay } from "./utils/dalay";

const isDev = process.env.DEV != undefined;
const isPreview = process.env.PREVIEW != undefined;

let mainWindow: BrowserWindow | null = null;

export let config: any = null;

function getConfigFilePath() {
  // caminho do arquivo de config na pasta de usuário
  return join(app.getPath("userData"), "config.json");
}

function getDefaultConfigPath() {
  // caminho do arquivo de config padrão empacotado
  return join(__dirname, "../config.json");
}

function loadConfig() {
  const userConfigPath = getConfigFilePath();

  // Se ainda não existe no userData, copia o padrão
  if (!existsSync(userConfigPath)) {
    copyFileSync(getDefaultConfigPath(), userConfigPath);
  }

  // Lê sempre a versão da pasta userData
  const data = readFileSync(userConfigPath, "utf8");
  config = JSON.parse(data);
}

function saveConfig(newConfig: any) {
  const userConfigPath = getConfigFilePath();
  writeFileSync(userConfigPath, JSON.stringify(newConfig, null, 2));
}

async function startupRoutine():Promise<boolean> {
  // Se for produção, checa updates primeiro
 
  mainWindow?.webContents.send("init", {step: 1, ok:false, error:false, working:true });
  await delay(3000)
  if (config.mode === "production") {
    const updateAvailable = await checkForUpdatesFlow();
    if (updateAvailable) return false // usuário está atualizando → não checar impressora agora
  }else {
    mainWindow?.webContents.send("init", {step: 1, ok:true, error:false, working:false});
  }
  // Se chegou aqui, app pode verificar impressora
  mainWindow?.webContents.send("init", {step: 2, ok:false, error:false, working:true });
  await delay(3000)
  const printerService = getPrinterService(config);
  const printerOk = await printerService.checkConnection();

  if (!printerOk) {
    mainWindow?.webContents.send("init", {step: 2, ok:false, error:true, working:false });
    return false;
  } else{
    mainWindow?.webContents.send("init", {step: 2, ok:true, error:false, working:false });
  }

  mainWindow?.webContents.send("init", {step: 3, ok:false, error:false, working:true });
  await delay(3000)
  const apiServices = getApiServices(config);
  try {
    const server = apiServices.server();
    await server.get("/healthcheck");
    mainWindow?.webContents.send("init", {step: 3, ok:true, error:false, working:false });
  } catch (error) {
    console.error("Erro ao conectar ao servidor:", error);
    mainWindow?.webContents.send("init", {step: 3, ok:false, error:true, working:false });
    return false
  }

  return true
}

function checkForUpdatesFlow(): Promise<boolean> {
  return new Promise((resolve) => {
    autoUpdater.checkForUpdates().then(check=>{
      if(!check){
        mainWindow?.webContents.send("init", {step: 1, ok:true, error:false, working:false });
        resolve(false);
      }
    });   

    autoUpdater.once("update-available", (info) => {
      dialog.showMessageBox({
        type: "info",
        title: "Atualização disponível",
        message: `Uma nova versão (${info.version}) está disponível.`,
        detail: "Deseja atualizar agora?",
        buttons: ["Sim", "Depois"]
      }).then(result => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
        } else {
          mainWindow?.webContents.send("init", {step: 1, ok:false, error:true, working:false });
          resolve(false);
        }
      });
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
          mainWindow?.webContents.send("init", {step: 1, ok:false, error:true, working:false });
          resolve(false);
        }
      })
    })

    autoUpdater.once("update-not-available", () => {
      mainWindow?.webContents.send("init", {step: 1, ok:true, error:false, working:false });
      resolve(false);
    });
  });
}

 function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    autoHideMenuBar: true,
    icon: join(__dirname, "../resources/icon.ico"),
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


ipcMain.handle("get-config", () => {
  return config;
});

ipcMain.handle("save-config", (_, newConfig) => {
  saveConfig(newConfig);
  return true;
});


autoUpdater.autoDownload = false;          // não baixa automaticamente
autoUpdater.autoInstallOnAppQuit = false;

app.whenReady().then(async() => {
  loadConfig();
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  


  mainWindow?.webContents.once("did-finish-load", async () => {
    mainWindow?.webContents.send('config', config)
    const ok = await startupRoutine();
    
    if(ok){
      mainWindow?.webContents.send("init-finish");
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
