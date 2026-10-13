import { useEffect, useRef } from 'react'
import { X, Printer } from 'lucide-react'

export default function BarcodeLabelModal({ product, onClose }) {
  const svgRef = useRef(null)

  useEffect(() => {
    import('jsbarcode').then(({ default: JsBarcode }) => {
      if (svgRef.current && product.barcode) {
        JsBarcode(svgRef.current, product.barcode, {
          format: 'CODE128',
          width: 2,
          height: 60,
          fontSize: 14,
          margin: 10,
        })
      }
    })
  }, [product.barcode])

  const handlePrint = () => window.print()

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header no-print">
          <h3>Barcode Label</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="barcode-label-sheet" id="invoice-print-area">
          <p className="barcode-label-name">{product.name}</p>
          {product.barcode ? (
            <svg ref={svgRef}></svg>
          ) : (
            <p className="muted small">Is product ka koi barcode set nahi hai.</p>
          )}
          <p className="mono small">Rs {product.sellingPrice}</p>
        </div>

        <div className="modal-actions no-print">
          <button className="btn btn--ghost" onClick={onClose}>Close</button>
          <button className="btn btn--primary" onClick={handlePrint} disabled={!product.barcode}>
            <Printer size={15} /> Print Label
          </button>
        </div>
      </div>
    </div>
  )
}
