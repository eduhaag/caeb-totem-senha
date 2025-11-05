import { useEffect, useRef, useState } from "react";

export function useScannerKeyboard(onScan: (code:string)=>void){
  const bufferRef = useRef("");
  const lastTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [locked, setLocked] = useState(false);
  const [scannerSound, setScannerSound] = useState(false)

    const ignoredKeys = new Set([
    "Shift", "Alt", "Control", "Meta", "CapsLock", "Tab",
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
    "Escape", "Backspace", "Insert", "Delete", "Home",
    "End", "PageUp", "PageDown"
  ]);

  useEffect(()=>{
    initialize()
  },[])

  useEffect(() => {
    // Se estiver em Vite/CRA e colocou em /public, use caminho absoluto:
    audioRef.current = new Audio("/beep.mp3");
    audioRef.current.preload = "auto";
    // opcional: volume entre 0.0 e 1.0
    audioRef.current.volume = 0.9;
  }, []);

  useEffect(()=>{
    const handler = (e: KeyboardEvent)=>{
      if (ignoredKeys.has(e.key)) return;

      const now = Date.now()
      const diff = now - lastTimeRef.current
      lastTimeRef.current = now

      // Se o intervalo entre teclas for grande, começa um novo buffe
      if(diff > 80){
        bufferRef.current=""
      }

      if(e.key === 'Enter'){
        if (locked) return
        setLocked(true)

        // toca o som
        if(scannerSound){
          const audio = audioRef.current
          if (audio) {
            audio.play().catch((err) => {
              console.warn("Não foi possível tocar áudio automaticamente:", err)
            });
          }
        }

        const qr = bufferRef.current
        bufferRef.current = ''

        setTimeout(() => setLocked(false), 1500)
        if(qr.length > 0){
          onScan(qr)
        }
      }else{
        bufferRef.current += e.key
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener("keydown", handler)
  },[onScan])

  const initialize = async()=>{
    const config = await backend.getConfig()

    setScannerSound(config.scannerSound)
  }
}