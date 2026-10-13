import { useEffect, useRef, useState } from 'react'
import { X, Camera, AlertTriangle } from 'lucide-react'

const SCANNER_ELEMENT_ID = 'stoqvia-barcode-scanner'

export default function BarcodeScannerModal({ onDetected, onClose }) {
  const scannerRef = useRef(null)
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(true)

  useEffect(() => {
    let html5QrCode
    let cancelled = false

    import('html5-qrcode')
      .then(({ Html5Qrcode }) => {
        if (cancelled) return
        html5QrCode = new Html5Qrcode(SCANNER_ELEMENT_ID)
        scannerRef.current = html5QrCode

        html5QrCode
          .start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 150 } },
            (decodedText) => {
              onDetected(decodedText)
            },
            () => {
              // per-frame decode failures are normal — ignore
            }
          )
          .then(() => setStarting(false))
          .catch(() => {
            setError('Camera access nahi mila. Browser permissions check karein ya manually barcode type karein.')
            setStarting(false)
          })
      })
      .catch(() => {
        setError('Scanner load nahi ho saka.')
        setStarting(false)
      })

    return () => {
      cancelled = true
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current.clear()
        })
      }
    }
  }, [onDetected])

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal modal--small scanner-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><Camera size={17} style={{ marginRight: 6, verticalAlign: -3 }} />Scan Barcode</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {error ? (
          <div className="scanner-error">
            <AlertTriangle size={22} />
            <p>{error}</p>
          </div>
        ) : (
          <>
            {starting && <p className="muted small" style={{ marginBottom: 10 }}>Camera shuru ho rahi hai...</p>}
            <div id={SCANNER_ELEMENT_ID} className="scanner-viewport" />
            <p className="muted small scanner-hint">Barcode ko camera ke samne rakhein</p>
          </>
        )}
      </div>
    </div>
  )
}
