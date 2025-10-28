import { useEffect, useState } from 'react'

import Logo from './assets/logo.png'

import './App.css'

enum AppState {
  INIT = 'init',
  UPDATE_DOWNLOAD = 'update_download',
  WAITING_QR = 'waiting_qr',
  PRINTING = 'printing',
  PRINTED = 'printed',
  ERROR = 'error'
}

export default function App() {
  const [numero, setNumero] = useState('A001')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [state, setState] = useState<AppState>(AppState.INIT)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)

  useEffect(() => {
    backend.onInit(() => {
      setState(AppState.INIT)
    })

    backend.onUpdate(() => {
      setState(AppState.UPDATE_DOWNLOAD)
    })

    backend.onWaiting(() => {
      setState(AppState.WAITING_QR)
    })
  }, [])


  const handlePrint = async () => {
    setLoading(true)
    setMsg(null)
    const res = await backend.readQR(numero)
    setLoading(false)

    if (res.ok) setMsg('Impressão enviada com sucesso!')
    else setMsg(`Erro: ${res.error}`)
  }

  return (
    <main>
      <header>
        <img src={Logo} alt="Logo CAEB" />
      </header>

      <section>
        {state===AppState.INIT &&
          <div>
            <h2>Iniciando...</h2>
            <div>
              <span className="loader"></span>
            </div>
          </div>
        }
        {state=== AppState.UPDATE_DOWNLOAD &&
          <div>
            <h2>Baixando atualização...</h2>
            <p>Por favor aguarde.</p>
            <div>
              <span className="loader"></span>
            </div>
          </div>
        }
        {state===AppState.WAITING_QR && 
          <div>
            <h2>Aguardando a leitura...</h2>
            <p>Por favor, aproxime o QR Code do leitor.</p>
          </div>
        }
      </section>
    </main>
  )
}
