'use client'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🔧</div>

      <div style={{
        fontSize: '120px',
        fontWeight: 900,
        color: '#E85D04',
        lineHeight: 1,
        marginBottom: '8px',
      }}>
        404
      </div>

      <h1 style={{
        fontSize: '24px',
        fontWeight: 700,
        color: '#ffffff',
        marginBottom: '12px',
      }}>
        Página não encontrada
      </h1>

      <p style={{
        fontSize: '15px',
        color: '#6b7280',
        maxWidth: '360px',
        lineHeight: '1.6',
        marginBottom: '32px',
      }}>
        Parece que essa página foi para a oficina e não voltou ainda. Vamos te levar de volta ao início.
      </p>

      <Link href="/" style={{
        background: '#E85D04',
        color: '#ffffff',
        padding: '14px 32px',
        borderRadius: '8px',
        fontWeight: 700,
        fontSize: '15px',
        textDecoration: 'none',
        display: 'inline-block',
      }}>
        Voltar para o início
      </Link>

      <div style={{
        marginTop: '48px',
        fontSize: '22px',
        fontWeight: 800,
        color: '#ffffff',
      }}>
        <span style={{ color: '#E85D04' }}>Auto</span>Kore
      </div>
    </div>
  )
}