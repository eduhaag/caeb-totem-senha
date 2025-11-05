import { ipcMain, IpcMainInvokeEvent } from "electron";
import { getApiServices } from "./api";
import { config } from "./main";
import { getPrinterService } from "./printer";
import { formatDate } from "./utils/formatDate";

interface Ticket {
  name: string
  therapy_id: number
  therapy_name: string
  date: Date
  priority: 'normal' | 'preferential'
  ticketNumber: number
  appointmentId: number
}

ipcMain.handle(
  "read-qr",
  async (event: IpcMainInvokeEvent, qr: string) => {
    try { 
      const [type, id] = qr.split(':')

      if(type==='P'){
        try {
          const apiService = getApiServices(config)
          const { data } = await apiService.server().post(`/tickets/totem`, {
            key: config.serverKey,
            person_exId: id
          })

          let result = false
          for(const t of data.tickets){
            result = await printTicket(t)
          }

          if(result){
            event.sender.send("ticket-event", {success:data.tickets.length})
          }
          else {
            event.sender.send("ticket-event", {printerError: true})
          }
        } catch (error) {
          event.sender.send("ticket-event", {error:'Falha de comunicação com o servidor.'})
        }
      }

      return { ok: true } 
    } 
    catch (err: any) { 
      return { ok: false, error: err?.message || String(err) } 
    } 
  }
)

async function printTicket(ticket:Ticket):Promise<boolean>{

  const printerService = getPrinterService(config)
  const printer = printerService.getPrinter()
  printer.alignCenter()

  //Cabeçalho
  printer.bold(true)
  printer.setTextSize(2,2)
  printer.println('CAEB')
  printer.setTextNormal()
  printer.newLine();
  printer.newLine();

  //Corpo
  const lines = printLongText(ticket.therapy_name.toUpperCase(), 14);
  printer.setTextSize(2,2);
  printer.bold(false)
  lines.forEach(l => {
    printer.println(l)
  })
  
  printer.setTextSize(1,1);
  printer.newLine()
  if(ticket.priority==='preferential'){
    printer.bold(false)
    printer.println('Preferencial');
    printer.newLine();
  }
  
  printer.bold(true)
  printer.setTextSize(6,6)
  if(ticket.ticketNumber<10){
    printer.println(`0${ticket.ticketNumber}`)
  }else{
    printer.println(`${ticket.ticketNumber}`)
  }
  

  //Rodapé
  printer.setTextSize(1, 1)
  printer.bold(false)
  printer.newLine()
  printer.newLine()
  printer.println(formatDate(ticket.date))


  printer.partialCut();

  let result:boolean = false
  try{
    await printer.execute()
    result = true
  } catch (error){
    result = false
    console.log(error)
  } finally {
    printer.clear()
  }

  return result
}


function printLongText(text:string, maxChars:number){
  const words = text.split(" ");
  let lines = [];
  let currentLine = "";

   for (let word of words) {
    if ((currentLine + word).length <= maxChars) {
      currentLine += word + " ";
    } else {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    }
  }
  if (currentLine.length > 0) lines.push(currentLine.trim());

  return lines;

}
