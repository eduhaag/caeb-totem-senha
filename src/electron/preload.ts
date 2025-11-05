import { contextBridge, ipcRenderer } from "electron";
import { on } from "events";

export const backend = {
  readQR: async (id: string): Promise<{ok:boolean, error?:any}> =>
    await ipcRenderer.invoke("read-qr", id),
  getConfig: async () => await ipcRenderer.invoke("get-config"),
  saveConfig: async (newConfig:any) => await ipcRenderer.invoke("save-config", newConfig),
  loadConfig: (callback: (config:any) => void) =>{
    return ipcRenderer.on("config", (_,config) => callback(config))
  },
  onInit: (callback: (state:any) => void) =>{
    return ipcRenderer.on("init", (_,state) => callback(state))
  },
  onInitFinish: (callback: () => void) =>{
    return ipcRenderer.on("init-finish", () => callback())
  },
  onTicketEvent: (callback: (event:any) => void) =>{
    return ipcRenderer.on("ticket-event", (_,event) => callback(event))
  }
};

contextBridge.exposeInMainWorld("backend", backend);
