'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Opcao {
  label: string
  score: number
  hours?: number
}

interface Pergunta {
  eyebrow: string
  texto: string
  opcoes: Opcao[]
}

const PERGUNTAS: Pergunta[] = [
  {
    eyebrow: 'Rotina',
    texto: 'Como você registra suas ordens de serviço hoje?',
    opcoes: [
      { label: 'No papel', score: 4 },
      { label: 'Numa planilha', score: 3 },
      { label: 'Já uso outro sistema', score: 1 },
      { label: 'Não registro de forma fixa', score: 5 },
    ],
  },
  {
    eyebrow: 'Volume',
    texto: 'Quantos veículos você atende por semana, em média?',
    opcoes: [
      { label: 'Até 5', score: 1 },
      { label: 'De 6 a 15', score: 2 },
      { label: 'De 16 a 30', score: 3 },
      { label: 'Mais de 30', score: 4 },
    ],
  },
  {
    eyebrow: 'Estoque',
    texto: 'Já perdeu peça no estoque ou comprou duplicado por falta de controle?',
    opcoes: [
      { label: 'Sempre', score: 5 },
      { label: 'Às vezes', score: 3 },
      { label: 'Raramente', score: 1 },
      { label: 'Nunca', score: 0 },
    ],
  },
  {
    eyebrow: 'Atendimento',
    texto: 'Como você envia orçamento pro cliente hoje?',
    opcoes: [
      { label: 'Só de boca, na ligação', score: 4 },
      { label: 'Digito tudo no WhatsApp na mão', score: 3 },
      { label: 'Escrevo no papel', score: 4 },
      { label: 'Já uso algo automatizado', score: 1 },
    ],
  },
  {
    eyebrow: 'Tempo',
    texto: 'Quanto tempo por semana você gasta organizando OS, cobrando cliente e controlando estoque?',
    opcoes: [
      { label: 'Menos de 2 horas', score: 1, hours: 1.5 },
      { label: 'De 2 a 5 horas', score: 3, hours: 3.5 },
      { label: 'De 5 a 10 horas', score: 4, hours: 7.5 },
      { label: 'Mais de 10 horas', score: 5, hours: 12 },
    ],
  },
]

const MAX_SCORE = 23

type Etapa = 'pergunta' | 'carregando' | 'resultado'

export default function DiagnosticoQuiz() {
  const router = useRouter()
  const [etapa, setEtapa]         = useState<Etapa>('pergunta')
  const [indice, setIndice]       = useState(0)
  const [respostas, setRespostas] = useState<Opcao[]>([])

  function responder(opcao: Opcao) {
    const novas = [...respostas]
    novas[indice] = opcao
    setRespostas(novas)

    if (indice < PERGUNTAS.length - 1) {
      setIndice(indice + 1)
    } else {
      setEtapa('carregando')
      setTimeout(() => setEtapa('resultado'), 800)
    }
  }

  function voltar() {
    if (indice > 0) setIndice(indice - 1)
  }

  function irParaCadastro(tier: string) {
    router.push(`/registro?origem=quiz&score=${tier}`)
  }

  const totalScore  = respostas.reduce((sum, r) => sum + (r?.score ?? 0), 0)
  const pct         = Math.min(100, Math.round((totalScore / MAX_SCORE) * 100))
  const horasResp   = respostas[4]
  const weeklyHours = horasResp?.hours ?? 3
  const monthlyHours = Math.round(weeklyHours * 4.3)

  let tier = 'baixo', tierLabel = 'Já é bem organizado', tierDesc = 'Sua oficina está à frente da média — mas ainda dá pra automatizar o que resta e ganhar ainda mais tempo livre.', tierColor = '#6FAE73'
  if (pct >= 65) {
    tier = 'alto'; tierLabel = 'Risco alto de perda'
    tierDesc = 'Sua oficina está perdendo tempo e dinheiro toda semana com processo manual. Isso é dinheiro saindo do seu bolso todo mês.'
    tierColor = '#E8452F'
  } else if (pct >= 35) {
    tier = 'medio'; tierLabel = 'Dá pra melhorar bastante'
    tierDesc = 'Você já tem alguma organização, mas ainda perde tempo com tarefas que um sistema resolveria em segundos.'
    tierColor = '#E8A604'
  }

  const radius = 80, cx = 110, cy = 110
  const angle  = 180 - (pct / 100) * 180
  const rad    = (angle * Math.PI) / 180
  const needleX = cx + (radius - 14) * Math.cos(rad)
  const needleY = cy - (radius - 14) * Math.sin(rad)

  const progressPct = etapa === 'resultado' ? 100 : ((indice) / PERGUNTAS.length) * 100 + 10

  return (
    <div style={{
      maxWidth: 460, margin: '0 auto', background: '#111', border: '1px solid #222',
      borderRadius: 18, overflow: 'hidden', position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #B04803, #E85D04, #B04803)' }} />

      <div style={{ padding: '22px 24px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #222' }}>
        <div style={{ fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#E85D04' }} />
          Diagnóstico da Oficina
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>
          {etapa === 'resultado' ? 'Resultado' : `Pergunta ${indice + 1} de ${PERGUNTAS.length}`}
        </div>
      </div>

      <div style={{ height: 4, background: '#1a1a1a', margin: '0 24px', borderRadius: 2, overflow: 'hidden', marginTop: 14 }}>
        <div style={{ height: '100%', background: '#E85D04', width: `${progressPct}%`, transition: 'width .4s ease' }} />
      </div>

      <div style={{ padding: '28px 24px 24px', minHeight: 360, display: 'flex', flexDirection: 'column' }}>
        {etapa === 'pergunta' && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#E85D04', marginBottom: 10 }}>
              {PERGUNTAS[indice].eyebrow}
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginBottom: 22 }}>
              {PERGUNTAS[indice].texto}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PERGUNTAS[indice].opcoes.map((op, i) => (
                <button key={i} onClick={() => responder(op)}
                  style={{
                    textAlign: 'left', background: '#1a1a1a', border: '1px solid #222', color: '#fff',
                    padding: '15px 16px', borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color .15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#E85D04')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#222')}>
                  <span>{op.label}</span>
                  <span style={{ color: '#9ca3af' }}>→</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 'auto', paddingTop: 20 }}>
              {indice > 0 && (
                <button onClick={voltar} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  ← Voltar
                </button>
              )}
            </div>
          </>
        )}

        {etapa === 'carregando' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#E85D04', textTransform: 'uppercase', marginBottom: 10 }}>Diagnóstico</div>
            <h3 style={{ fontSize: 22, fontWeight: 700 }}>Analisando suas respostas...</h3>
          </div>
        )}

        {etapa === 'resultado' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
            <svg width="220" height="130" viewBox="0 0 220 130">
              <path d="M 30 110 A 80 80 0 0 1 190 110" fill="none" stroke="#1a1a1a" strokeWidth="14" strokeLinecap="round" />
              <path d="M 30 110 A 80 80 0 0 1 190 110" fill="none" stroke={tierColor} strokeWidth="14" strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 251.3} 251.3`} />
              <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              <circle cx={cx} cy={cy} r="6" fill="#fff" />
            </svg>
            <div style={{ fontSize: 34, fontWeight: 800, color: tierColor, marginTop: -8 }}>{pct}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 14 }}>
              Nível de desorganização
            </div>

            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{tierLabel}</div>
            <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.55, marginBottom: 6 }}>{tierDesc}</p>

            <div style={{ display: 'flex', gap: 10, margin: '18px 0 6px', width: '100%' }}>
              <div style={{ flex: 1, background: '#1a1a1a', border: '1px solid #222', borderRadius: 12, padding: '14px 10px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#E85D04' }}>{weeklyHours}h</div>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>por semana</div>
              </div>
              <div style={{ flex: 1, background: '#1a1a1a', border: '1px solid #222', borderRadius: 12, padding: '14px 10px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#E85D04' }}>{monthlyHours}h</div>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>por mês</div>
              </div>
            </div>

            <button onClick={() => irParaCadastro(tier)}
              style={{
                marginTop: 20, width: '100%', background: '#E85D04', color: '#1A0F06', border: 'none',
                padding: 15, borderRadius: 12, fontWeight: 700, fontSize: 15.5, cursor: 'pointer',
              }}>
              Criar minha conta grátis →
            </button>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 14 }}>
              Sem cartão de crédito. Cancele quando quiser.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}