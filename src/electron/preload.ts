import { contextBridge, ipcRenderer } from "electron";

export const backend = {
  readQR: async (id: string): Promise<{ok:boolean, error?:any}> =>
    await ipcRenderer.invoke("read-qr", id),
};

contextBridge.exposeInMainWorld("backend", backend);
