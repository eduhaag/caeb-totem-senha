import { useEffect, useState } from 'react'

import Logo from './assets/logo.png'

import './App.css'
import {  Circle, CircleAlert, CircleCheck, LoaderCircle, QrCode, TriangleAlert, X } from 'lucide-react';
import { useScannerKeyboard } from './hooks/useScannerKeyboard';
import { validQrCode } from '../electron/utils/validQrCode';
import TicketPrinter from './components/TicketPrinter';

export enum AppState {
  INIT = 'init',
  WAITING_QR = 'waiting_qr',
  LOADING = 'loading',
  QR_ERROR = 'qr_error',
  TICKET_ERROR = 'ticket_error',
  TICKET_PRINTER_ERROR = 'ticket_printer_error',
  TICKET_SUCCESS = 'ticket-success'
}

interface InitializingState {
  step: number
  title: string;
  working: boolean;
  ok: boolean;
  error: boolean;
  errorMessage: string
}

export default function App() {
  const [state, setState] = useState<AppState>(AppState.INIT)
  const [initializingState, setInitializingState] = useState<InitializingState[]>([
    { step: 1, title: 'Verificando atualizações', working: false, ok: false, error: false, errorMessage: 'Aplicativo não atualizado.' },
    { step: 2, title: 'Verificando impressora', working: false, ok: false, error: false, errorMessage:'Falha de comunicação com a impressora. Verifique as conexões e reinicie o aplicativo' },
    { step: 3, title: 'Conectando ao servidor', working: false, ok: false, error: false, errorMessage: 'Falha de comunicação com o servidor. Verifique a conexão com a internet e reinicie o aplicativo.' },
  ])
  const [message, setMessage] = useState<string|null>(null)

  useScannerKeyboard((qr) => {
    console.log("QR lido:", qr);
    
    if(!validQrCode(qr)){
      setState(AppState.QR_ERROR)

      setTimeout(()=>{
        setState(AppState.WAITING_QR)
      },3000)
    }
    else if(state===AppState.WAITING_QR) {
      setState(AppState.LOADING)
      backend.readQR(qr)
    }    
  });

  useEffect(() => {
    backend.onInit((state) => {
      setInitializingState(prev => {
        return prev.map((item, index) =>
          index === state.step - 1
            ? {
                ...item,
                error: state.error,
                ok: state.ok,
                working: state.working
              }
            : item
        )
      })
    })

    backend.onInitFinish(async()=>{
      setState(AppState.WAITING_QR)
    })

    

    backend.onTicketEvent(async (event)=>{
      const config = await backend.getConfig()
      if(event.error){
        setState(AppState.TICKET_ERROR)
        setMessage(event.error)

        setTimeout(()=>{
          setState(AppState.WAITING_QR)
          setMessage(null)
        }, config.messagesTimeout)
      }else if(event.success){
        setState(AppState.TICKET_SUCCESS)
        setMessage(`${event.success}`)

        setTimeout(()=>{
          setState(AppState.WAITING_QR)
          setMessage(null)
        }, config.messagesTimeout)
      }else if(event.printerError){
        setState(AppState.TICKET_PRINTER_ERROR)

        setTimeout(()=>{
          setState(AppState.WAITING_QR)
        },config.messagesTimeout)
      }
    })

  }, [])


  return (
    <main className='w-full h-full min-h-screen flex flex-col gap-4 justify-center items-center bg-gradient-to-r from-[#0e8fa5] to-[#7a66ab]'>
      <header className='w-full h-fit flex justify-center py-8'>
        <img src={Logo} alt="Logo CAEB" className='w-40 h-auto' />
      </header>

      <section className='bg-white w-[95%] h-full flex-1 mb-8 rounded-md flex justify-center items-center text-center'>
        {state === AppState.INIT &&
          <div className='flex justify-center text-start flex-col gap-8'>
            <h2 className='text-cyan-600 text-5xl'>Iniciando...</h2>
            <ul className='flex items-start flex-col gap-4 text-xl w-96'>
              {initializingState.map((item, index) => (
                <li key={index}>
                  <div className='space-y-2 flex flex-col items-start'>
                    <div className={`flex items-center justify-center gap-2 ${item.working ? 'text-gray-900' : item.error ? 'text-red-500' : item.ok ? 'text-green-600' : 'text-gray-500'}`}>
                      {item.working ?
                         <LoaderCircle className='animate-spin' /> :
                        item.error ?
                          <CircleAlert /> :
                            item.ok ? <CircleCheck /> :
                            <Circle />}
                        <span>{item.title}</span>
                    </div>
                    {item.error && <small className='ml-8 text-start'>{item.errorMessage}</small>}
                  </div>

                </li>
              ))}
            </ul>
          </div>
        }

        {state === AppState.WAITING_QR  &&
          <div className='gap-16 flex flex-col items-center'>
            <h2 className='text-cyan-600 text-5xl'>Passe o <strong>QR code</strong> da carteirinha no leitor!</h2>
            <div className='relative text-center'>
              <QrCode className='w-48 h-48 text-cyan-600 ' />
              <div className='absolute top-0 -left-4  animate-scanner w-56 h-4 bg-red-500 opacity-60 rounded-xl'/>
            </div>
          </div>
        }

        {state===AppState.LOADING && 
          <div className='flex flex-col items-center text-cyan-600 gap-8'>
            <h2 className='text-cyan-600 text-5xl'>Aguarde ...</h2>
            <LoaderCircle className='w-16 h-16 animate-spin'/>
          </div>
        }

        {state === AppState.QR_ERROR  &&
          <div className='gap-16 flex flex-col items-center text-orange-600'>
            <h2 className='text-5xl'>O <strong>QR code</strong> lido é inválido!</h2>
            <div className='relative text-center'>
              <TriangleAlert className='w-48 h-48' />
            </div>
          </div>
        }

        {state === AppState.TICKET_ERROR  &&
          <div className='gap-8 flex flex-col items-center'>
            <h2 className='text-6xl text-cyan-600'>Atenção!</h2>
            <div className='flex items-center gap-3 text-center text-4xl'>
              <CircleAlert size={40} />
              <p>{message}</p>
            </div>
          </div>
        }

        {state === AppState.TICKET_SUCCESS  &&
          <div className='gap-8 flex flex-col items-center'>
            <h2 className='text-6xl text-cyan-600'>Retire {message==='1'? ' a senha!' : ' as senhas!'}</h2>
            <div className='flex items-center gap-3 text-center text-4xl'>
              {message!=='1' && <p>Foram geradas {message} para você.</p>}
            </div>
            <TicketPrinter />
          </div>
        }

        {state === AppState.TICKET_PRINTER_ERROR  &&
          <div className='gap-8 flex flex-col items-center text-red-500'>
            <TriangleAlert className='w-20 h-20 text-red-500'/>
            <h2 className='text-4xl'>Ocorreu um erro durante a impressão da senha. </h2>
            <p className='flex items-center gap-3 text-center text-3xl text-cyan-600'>
              Tente novamente.
            </p>
          </div>
        }
      </section>
    </main>
  )
}
