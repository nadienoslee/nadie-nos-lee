import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function usePageTracker() {
  const location = useLocation()

  useEffect(() => {
    const registrar = async () => {
      let sesionId = sessionStorage.getItem('nnl_session')
      if (!sesionId) {
        sesionId = crypto.randomUUID()
        sessionStorage.setItem('nnl_session', sesionId)
      }

      await supabase.from('visitas').insert({
        pagina: location.pathname,
        sesion_id: sesionId,
      })
    }

    registrar()
  }, [location.pathname])
}