/**
 * Componente Modal reutilizável
 * Elimina duplicação de código dos 6 modais diferentes
 */
export default function Modal({ isOpen, title, children, error, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 8,
        maxWidth: 500,
        width: '100%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <h2 style={{ marginBottom: 16 }}>{title}</h2>
        
        {error && (
          <div style={{ 
            padding: 12, 
            backgroundColor: '#fee', 
            color: '#c00', 
            borderRadius: 4, 
            marginBottom: 16 
          }}>
            {error}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
