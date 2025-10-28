import { useState } from 'react'

import Logo from './assets/logo.png'

import './App.css'

export default function App() {
  const [numero, setNumero] = useState('A001')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

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
      <section className='waiting-read'>
        <img src={Logo} alt="Logo CAEB" />
       <div>
         <h2>Aguardando a leitura...</h2>
          <p>Por favor, aproxime o QR Code do leitor.</p>
       </div>
      </section>
    </main>
  )
}
