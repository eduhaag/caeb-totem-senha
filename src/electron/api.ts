import { ipcMain, IpcMainInvokeEvent } from "electron";

ipcMain.handle(
  "read-qr",
  async (event: IpcMainInvokeEvent, id: string) => {
   try { 
   console.log("Lendo QR para ID:", id);    
    return { ok: true } 
  } 
  catch (err: any) { 
    return { ok: false, error: err?.message || String(err) } 
  } 
  }
);
