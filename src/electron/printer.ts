// electron/printer.ts
import { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine, printer } from "node-thermal-printer";
import fs from "fs";

let _instance: PrinterService | null = null;

export class PrinterService {
  private _printer: ThermalPrinter;
  private devMode: boolean = process.env.DEV != undefined;
  private timeout:number

  constructor(private printerInterface: string, private mode: string, timeout: number) {
    this._printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: printerInterface,
      characterSet: CharacterSet.PC860_PORTUGUESE,
      removeSpecialCharacters: false,
      lineCharacter: "-",
      options:{
        timeout: 5000
      }
    });
    this.devMode = mode==='development';
    this.timeout = timeout;
  }

  async checkConnection(): Promise<boolean> {
    if(this.devMode){
      return true;      
    }

    try {
      const isConnected = await this._printer.isPrinterConnected();
      return isConnected;
    } catch (error) {
      console.error("Erro ao verificar impressora:", error);
      return false;
    }
  }

  getPrinter() {
   return this._printer
  }
}

/**
 * Cria ou retorna a instância única de PrinterService.
 */
export function getPrinterService(config: any): PrinterService {
  if (!_instance) {
    if (!config?.printer) throw new Error("Configuração da impressora ausente");
    _instance = new PrinterService(config.printer, config.mode, config.printerTimeout);
  }
  return _instance;
}
