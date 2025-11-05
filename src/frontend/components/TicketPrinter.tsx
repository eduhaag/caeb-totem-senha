export default function TicketPrinter() {
  return (
    <div className="flex flex-col items-center">

      {/* Corpo da impressora */}
      <div className="bg-gray-800 w-80 h-8 rounded-lg relative flex justify-center items-end pb-6">
        
        {/* Slot da impressora (papel sai daqui para baixo) */}
        <div className="w-72 h-0 overflow-visible relative">
          
          {/* Papel começa escondido dentro da impressora e desce */}
          <div
            className="
              bg-white flex items-center w-full justify-center text-center shadow-lg rounded-b-lg border 
              overflow-hidden animate-ticket-grow"
          >
            <p className="text-3xl font-extrabold ">Senha</p>
          </div>
        </div>
      </div>

      {/* Tira do slot (parte fixa da impressora) */}
      <div className="w-40 h-2 bg-gray-700"></div>
    </div>
  );
}
