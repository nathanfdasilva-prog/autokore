'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import DiagnosticoQuiz from '@/components/quiz/DiagnosticoQuiz'
import './landing.css'

export default function LandingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const mockupWrapRef = useRef<HTMLDivElement>(null)
  const mockupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard')
  }, [user, loading])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!supportsHover) return

    const wrap = mockupWrapRef.current
    const card = mockupRef.current
    if (!wrap || !card) return

    function handleMove(e: MouseEvent) {
      const rect = wrap!.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      card!.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`
    }
    function handleLeave() {
      card!.style.transform = 'rotateY(0deg) rotateX(0deg)'
    }

    wrap.addEventListener('mousemove', handleMove)
    wrap.addEventListener('mouseleave', handleLeave)
    return () => {
      wrap.removeEventListener('mousemove', handleMove)
      wrap.removeEventListener('mouseleave', handleLeave)
    }
  }, [loading, user])

  if (loading || user) return null

  return (
    <div className="lp-wrap">
      {/* NAV */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-logo"><span>Auto</span>Kore</div>
          <div className="lp-nav-links">
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#planos">Planos</a>
            <a href="#faq">FAQ</a>
            <Link href="/login" className="btn-nav">Entrar</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div>
            <div className="lp-badge"><span className="badge-dot" />14 dias grátis para testar tudo</div>
            <h1 className="lp-h1">Sua oficina ainda roda no <span>caderno</span>? Controle tudo pelo celular.</h1>
            <p className="lp-sub">Ordens de serviço, agenda, estoque e clientes em um só lugar. Sem planilha, sem papel perdido. Teste grátis por 14 dias, sem cartão de crédito.</p>
            <div className="lp-btns">
              <Link href="/registro" className="btn-primary">Criar conta grátis →</Link>
              <a href="#como-funciona" className="btn-secondary">Ver como funciona</a>
            </div>
            <div className="lp-trust">
              <div className="trust-avatars"><span>🔧</span><span>📅</span><span>📦</span><span>+</span></div>
              <div className="trust-text"><strong>Em fase beta</strong> — entre agora e ajude a moldar o sistema</div>
            </div>
          </div>
          <div className="lp-mockup-wrap" ref={mockupWrapRef} style={{ perspective: '1000px' }}>
            <div className="lp-mockup" ref={mockupRef} style={{ transformStyle: 'preserve-3d', transition: 'transform 0.15s ease-out' }}>
              <div className="mockup-bar">
                <div className="dot dot-r" /><div className="dot dot-y" /><div className="dot dot-g" />
                <div className="mockup-url">autokore.com.br/dashboard</div>
              </div>
              <div className="mockup-body">
                <div className="dash-header"><div className="dash-title">Dashboard</div><div className="dash-date">Maio 2026</div></div>
                <div className="kpis">
                  <div className="kpi"><div className="kpi-label">OS Abertas</div><div className="kpi-val orange">12</div><div className="kpi-change">↑ 3 hoje</div></div>
                  <div className="kpi"><div className="kpi-label">Faturamento</div><div className="kpi-val">R$18k</div><div className="kpi-change">↑ 12%</div></div>
                  <div className="kpi"><div className="kpi-label">Clientes</div><div className="kpi-val">48</div><div className="kpi-change">↑ 5</div></div>
                  <div className="kpi"><div className="kpi-label">NPS</div><div className="kpi-val orange">94</div><div className="kpi-change">Excelente</div></div>
                </div>
                <div className="os-list">
                  <div className="os-item"><div className="os-info"><span className="os-name">Luiz Pereira</span><span className="os-car">Corolla 2022 - Troca de oleo</span></div><span className="os-badge badge-green">Concluido</span><span className="os-val">R$320</span></div>
                  <div className="os-item"><div className="os-info"><span className="os-name">Maria Santos</span><span className="os-car">HB20 2021 - Revisao</span></div><span className="os-badge badge-yellow">Em andamento</span><span className="os-val">R$580</span></div>
                  <div className="os-item"><div className="os-info"><span className="os-name">Carlos Lima</span><span className="os-car">Onix 2023 - Freios</span></div><span className="os-badge badge-blue">Agendado</span><span className="os-val">R$450</span></div>
                </div>
              </div>
            </div>
            <div className="floating-card"><div className="fc-label">Faturamento do mes</div><div className="fc-val">R$18.420</div><div className="fc-sub">↑ 12% vs mes anterior</div></div>
          </div>
        </div>
      </section>

      {/* FEITO POR QUEM VIVE A OFICINA */}
      <section className="lp-section" style={{background:'#0a0a0a'}}>
        <div className="lp-section-inner">
          <div className="section-label">Quem está por trás</div>
          <h2 className="section-title">Feito por quem vive a oficina por dentro</h2>
          <p className="section-sub" style={{maxWidth:'620px',margin:'0 auto'}}>
            O AutoKore nasceu da dupla que entende os dois lados do balcão: um mecânico que vive a oficina todo dia e cansou de anotar tudo em caderno e perder papel de orçamento, e um vendedor que vive de atender e fidelizar cliente. Não é teoria — é a ferramenta que a gente usa na prática.
          </p>
          <div className="features-grid" style={{marginTop:'32px'}}>
            <div className="feat-card">
              <div className="feat-icon">🔧</div>
              <div className="feat-title">A dor da bancada</div>
              <div className="feat-desc">Criado por um mecânico que está na oficina todo dia e cansou do caderno, da papelada e de esquecer a última revisão de cada cliente. Cada tela foi pensada por quem está com a mão na graxa — porque é.</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">🤝</div>
              <div className="feat-title">A dor do atendimento</div>
              <div className="feat-desc">Construído junto com quem vive de vender e fidelizar. Por isso o foco em organizar cliente, agenda e retorno — não só registrar serviço.</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">🚀</div>
              <div className="feat-title">Você molda com a gente</div>
              <div className="feat-desc">Estamos em fase beta. Entrando agora, sua opinião pesa de verdade no que vem pela frente. É a hora de entrar como fundador da comunidade.</div>
            </div>
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="lp-section" id="funcionalidades">
        <div className="lp-section-inner">
          <div className="section-label">Funcionalidades</div>
          <h2 className="section-title">Tudo que sua oficina precisa</h2>
          <p className="section-sub">Desenvolvido para oficinas mecanicas brasileiras. Sem complicacao, sem planilha, sem papel.</p>
          <div className="features-grid">
            {[
              {icon:'🔧',title:'Ordens de Servico',desc:'Crie, acompanhe e finalize OS digitalmente. Historico completo por veiculo e cliente.'},
              {icon:'📅',title:'Agendamentos',desc:'Calendario visual para organizar sua agenda. Evite conflitos e mantenha clientes informados.'},
              {icon:'📦',title:'Estoque de Pecas',desc:'Controle entradas e saidas. Alertas de estoque minimo. Historico de movimentacoes completo.'},
              {icon:'💰',title:'Faturamento',desc:'Relatorios financeiros detalhados. Acompanhe receita, ticket medio e crescimento mes a mes.'},
              {icon:'⭐',title:'NPS e Avaliacoes',desc:'Colete feedback dos clientes automaticamente apos cada servico. Melhore continuamente.'},
              {icon:'👥',title:'Gestao de Equipe',desc:'Cadastre mecanicos, acompanhe desempenho e controle o acesso de cada colaborador.'},
            ].map((f,i) => (
              <div className="feat-card" key={i}>
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="lp-how" id="como-funciona">
        <div className="lp-section-inner">
          <div className="section-label">Como funciona</div>
          <h2 className="section-title">Comece em minutos</h2>
          <div className="steps">
            {[
              {n:'1',title:'Crie sua conta',desc:'Cadastro gratuito em menos de 2 minutos. Sem cartao de credito.'},
              {n:'2',title:'Configure sua oficina',desc:'Adicione seus dados, equipe e personalize o sistema.'},
              {n:'3',title:'Cadastre clientes',desc:'Adicione clientes e veiculos facilmente.'},
              {n:'4',title:'Gerencie tudo',desc:'OS, estoque, agenda e financeiro em um so lugar.'},
            ].map((s,i) => (
              <div className="step" key={i}>
                <div className="step-num">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIAGNÓSTICO / QUIZ */}
      <section className="lp-section" style={{background:'#0a0a0a'}}>
        <div className="lp-section-inner">
          <div className="section-label" style={{textAlign:'center'}}>Diagnóstico grátis</div>
          <h2 className="section-title">Quanto sua oficina está perdendo por desorganização?</h2>
          <p className="section-sub" style={{maxWidth:'560px',margin:'0 auto 32px'}}>
            Responde 5 perguntas rápidas e descubra quantas horas por mês você está perdendo com processo manual.
          </p>
          <DiagnosticoQuiz />
        </div>
      </section>

      {/* PLANOS */}
      <section className="lp-section" id="planos">
        <div className="lp-section-inner">
          <div className="section-label">Planos</div>
          <h2 className="section-title">Simples e transparente</h2>
          <p className="section-sub">Teste grátis por 14 dias com acesso completo. Sem cartão de crédito.</p>
          <div className="pricing-grid" style={{gridTemplateColumns:'1fr',maxWidth:'380px',margin:'0 auto'}}>
            <div className="plan popular">
              <div className="popular-badge">14 dias grátis</div>
              <div className="plan-name">Profissional</div>
              <div className="plan-price">R$97<span>/mes</span></div>
              <div className="plan-sub">Após o período de teste</div>
              <ul className="plan-features">
                <li>OS ilimitadas</li>
                <li>Ate 5 usuarios</li>
                <li>Estoque completo</li>
                <li>Relatorios financeiros</li>
                <li>NPS e avaliacoes</li>
                <li>Orcamentos digitais</li>
              </ul>
              <Link href="/registro" className="btn-plan btn-plan-filled">Começar teste grátis →</Link>
            </div>
          </div>
          <p style={{textAlign:'center',color:'#6B7280',fontSize:'13px',marginTop:'20px'}}>
            Atende rede ou franquia? <a href="#contato" style={{color:'#E85D04'}}>Fale com a gente</a>.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-section" id="faq">
        <div className="lp-section-inner">
          <div className="section-label">FAQ</div>
          <h2 className="section-title">Perguntas frequentes</h2>
          <div style={{maxWidth:'680px',margin:'0 auto',display:'flex',flexDirection:'column',gap:'16px'}}>
            {[
              {p:'Como funciona o período grátis?',r:'Você tem 14 dias grátis com acesso completo ao sistema, sem precisar de cartão de crédito. Depois desse período, escolha o plano Profissional para continuar usando, sem perder nada do que já cadastrou.'},
              {p:'Preciso instalar algum programa?',r:'Não! O AutoKore funciona direto no navegador do celular ou computador. Você também pode instalar como app (PWA) na tela inicial do seu celular.'},
              {p:'Meus dados ficam seguros?',r:'Sim! Utilizamos Firebase do Google com criptografia de dados e autenticação segura. Seus dados ficam protegidos e nunca são compartilhados.'},
              {p:'Posso usar no celular?',r:'Sim! O AutoKore foi desenvolvido para funcionar perfeitamente no celular. Você consegue criar OS, consultar clientes e ver relatórios de qualquer lugar.'},
              {p:'O que acontece depois dos 14 dias?',r:'Você recebe um aviso antes do período acabar. Pode assinar o plano Profissional pra continuar usando, ou entrar em contato se tiver dúvida. Nada é cobrado sem sua ação.'},
              {p:'Posso cancelar quando quiser?',r:'Sim! Não há fidelidade. Você pode cancelar sua assinatura a qualquer momento direto pelo sistema.'},
            ].map((f,i) => (
              <div key={i} style={{background:'#111',border:'1px solid #222',borderRadius:'12px',padding:'20px'}}>
                <div style={{color:'#E85D04',fontWeight:700,fontSize:'15px',marginBottom:'8px'}}>❓ {f.p}</div>
                <div style={{color:'#9ca3af',fontSize:'14px',lineHeight:'1.6'}}>{f.r}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="lp-lead" id="contato">
        <div className="lead-inner">
          <div className="section-label" style={{textAlign:'center'}}>Comece agora</div>
          <h2 className="section-title">Pronto pra largar o caderno?</h2>
          <p style={{color:'#9CA3AF',marginTop:'12px'}}>Crie sua conta grátis em 2 minutos. Sem cartão, sem compromisso.</p>
          <div style={{textAlign:'center',margin:'24px 0 8px'}}>
            <Link href="/registro" className="btn-primary">Criar conta grátis →</Link>
          </div>
          <p style={{color:'#6B7280',fontSize:'13px',textAlign:'center',marginTop:'20px'}}>
            Atende rede ou franquia? Manda mensagem no{' '}
            <a href="https://instagram.com/autokoreapp" target="_blank" rel="noopener noreferrer" style={{color:'#E85D04'}}>Instagram</a>.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="footer-inner">
          <div className="footer-logo"><span>Auto</span>Kore</div>
          <div className="footer-links">
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#planos">Planos</a>
            <a href="#faq">FAQ</a>
            <Link href="/login">Entrar</Link>
            <Link href="/registro">Cadastrar</Link>
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/termos">Termos</Link>
          </div>
          <div className="footer-copy">© 2026 AutoKore. Todos os direitos reservados.</div>
        </div>
      </footer>
    </div>
  )
}