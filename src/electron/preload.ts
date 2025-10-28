import { contextBridge, ipcRenderer } from "electron";

export const backend = {
  readQR: async (id: string): Promise<{ok:boolean, error?:any}> =>
    await ipcRenderer.invoke("read-qr", id),

  onInit: (callback: () => void) =>
    ipcRenderer.on("init", () => callback()),

  onUpdate: (callback: () => void) =>
    ipcRenderer.on("update", () => callback()),

  onWaiting: (callback: (progress: any) => void) => 
    ipcRenderer.on("waiting", (_, progress) => callback(progress)),
};

contextBridge.exposeInMainWorld("backend", backend);
