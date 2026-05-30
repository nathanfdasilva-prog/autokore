'use client'
import Link from 'next/link'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useAuth } from '@/lib/context/AuthContext'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import './landing.css'

const RECAPTCHA_SITE_KEY = '6LcFufQsAAAACtanHMaZQhEqolT6eoD3xR2bELT'

export default function LandingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [nome, setNome] = useState('')
  const [tel, setTel] = useState('')
  const [msg, setMsg] = useState('🔒 Seus dados são privados. Não enviamos spam.')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard')
  }, [user, loading])

  if (loading || user) return null

  const capturarLead = async () => {
    if (!nome.trim() || !tel.trim()) { setMsg('⚠️ Preencha seu nome e WhatsApp.'); return }
    const telLimpo = tel.replace(/\D/g, '')
    if (telLimpo.length < 10) { setMsg('⚠️ Digite um WhatsApp valido com DDD.'); return }
    setEnviando(true)
    try {
      if (typeof window !== 'undefined' && (window as any).grecaptcha) {
        await new Promise<void>((resolve) => { (window as any).grecaptcha.ready(resolve) })
        const token = await (window as any).grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'lead_form' })
        if (!token) throw new Error('reCAPTCHA falhou')
      }
      await addDoc(collection(db, 'leads'), {
        nome:      nome.trim(),
        whatsapp:  telLimpo,
        createdAt: serverTimestamp(),
        origem:    'landing_page',
      })
      // Dispara evento de conversão no GA4
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'generate_lead', {
          event_category: 'engagement',
          event_label: 'landing_page_form',
        })
      }
      setMsg(`✅ Obrigado, ${nome}! Te avisaremos em breve.`)
      setNome(''); setTel('')
    } catch (e) {
      setMsg('❌ Erro ao enviar. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="lp-wrap">
      <Script src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`} strategy="lazyOnload" />

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
            <div className="lp-badge"><span className="badge-dot" />Novo: Avaliações NPS integradas</div>
            <h1 className="lp-h1">Gestão completa para sua <span>oficina mecânica</span></h1>
            <p className="lp-sub">Do agendamento ao faturamento. Controle ordens de serviço, estoque, equipe e clientes em um só lugar.</p>
            <div className="lp-btns">
              <Link href="/registro" className="btn-primary">Começar grátis →</Link>
              <a href="#planos" className="btn-secondary">Ver planos</a>
            </div>
            <div className="lp-trust">
              <div className="trust-avatars"><span>KL</span><span>MS</span><span>RB</span><span>+</span></div>
              <div className="trust-text"><strong>Oficinas ativas</strong> usando o AutoKore hoje</div>
            </div>
          </div>
          <div className="lp-mockup-wrap">
            <div className="lp-mockup">
              <div className="mockup-bar">
                <div className="dot dot-r" /><div className="dot dot-y" /><div className="dot dot-g" />
                <div className="mockup-url">autokore.vercel.app/dashboard</div>
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
                  <div className="os-item"><div className="os-info"><span className="os-name">Joao Pereira</span><span className="os-car">Corolla 2022 - Troca de oleo</span></div><span className="os-badge badge-green">Concluido</span><span className="os-val">R$320</span></div>
                  <div className="os-item"><div className="os-info"><span className="os-name">Maria Santos</span><span className="os-car">HB20 2021 - Revisao</span></div><span className="os-badge badge-yellow">Em andamento</span><span className="os-val">R$580</span></div>
                  <div className="os-item"><div className="os-info"><span className="os-name">Carlos Lima</span><span className="os-car">Onix 2023 - Freios</span></div><span className="os-badge badge-blue">Agendado</span><span className="os-val">R$450</span></div>
                </div>
              </div>
            </div>
            <div className="floating-card"><div className="fc-label">Faturamento do mes</div><div className="fc-val">R$18.420</div><div className="fc-sub">↑ 12% vs mes anterior</div></div>
          </div>
        </div>
      </section>

      {/* LOGOS */}
      <div className="logos-section">
        <div className="logos-inner">
          <div className="logos-label">Tecnologia confiavel por baixo</div>
          <div className="logos-row">
            <div className="logo-item">Firebase</div>
            <div className="logo-item">Next.js</div>
            <div className="logo-item">Vercel</div>
            <div className="logo-item">WhatsApp API</div>
            <div className="logo-item">Google Auth</div>
          </div>
        </div>
      </div>

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

      {/* DEPOIMENTOS */}
      <section className="lp-section" style={{background:'#0a0a0a'}}>
        <div className="lp-section-inner">
          <div className="section-label">Depoimentos</div>
          <h2 className="section-title">O que dizem nossas oficinas</h2>
          <div className="features-grid">
            {[
              {nome:'Carlos Souza',oficina:'CS Mecânica',nota:'⭐⭐⭐⭐⭐',texto:'Antes eu anotava tudo em caderno. Hoje controlo minhas OS, estoque e clientes pelo celular. Melhorou muito minha organização!'},
              {nome:'Ana Lima',oficina:'Auto Center Lima',nota:'⭐⭐⭐⭐⭐',texto:'O sistema de agendamento me ajudou a acabar com os conflitos de horário. Meus clientes adoram receber a confirmação pelo WhatsApp.'},
              {nome:'Roberto Alves',oficina:'Oficina Alves',nota:'⭐⭐⭐⭐⭐',texto:'Em menos de uma semana já estava usando tudo. O suporte é excelente e o sistema é muito intuitivo. Recomendo!'},
            ].map((d,i) => (
              <div className="feat-card" key={i}>
                <div style={{fontSize:'18px',marginBottom:'8px'}}>{d.nota}</div>
                <div style={{color:'#d1d5db',fontSize:'14px',fontStyle:'italic',marginBottom:'12px'}}>"{d.texto}"</div>
                <div style={{color:'#E85D04',fontWeight:700,fontSize:'13px'}}>{d.nome}</div>
                <div style={{color:'#6b7280',fontSize:'12px'}}>{d.oficina}</div>
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

      {/* PLANOS */}
      <section className="lp-section" id="planos">
        <div className="lp-section-inner">
          <div className="section-label">Planos</div>
          <h2 className="section-title">Simples e transparente</h2>
          <p className="section-sub">Comece gratis, cresca no seu ritmo. Sem taxas escondidas.</p>
          <div className="pricing-grid">
            <div className="plan">
              <div className="plan-name">Gratis</div>
              <div className="plan-price">R$0<span>/mes</span></div>
              <div className="plan-sub">Para comecar a organizar</div>
              <ul className="plan-features">
                <li>Ate 30 OS por mes</li>
                <li>1 usuario</li>
                <li>Clientes e veiculos</li>
                <li>Agendamentos basicos</li>
                <li className="off">Estoque de pecas</li>
                <li className="off">Relatorios financeiros</li>
                <li className="off">Suporte prioritario</li>
              </ul>
              <Link href="/registro" className="btn-plan btn-plan-filled">Começar grátis agora</Link>
            </div>
            <div className="plan popular">
              <div className="popular-badge">Mais popular</div>
              <div className="plan-name">Profissional</div>
              <div className="plan-price">R$97<span>/mes</span></div>
              <div className="plan-sub">Para oficinas em crescimento</div>
              <ul className="plan-features">
                <li>OS ilimitadas</li>
                <li>Ate 5 usuarios</li>
                <li>Estoque completo</li>
                <li>Relatorios financeiros</li>
                <li>NPS e avaliacoes</li>
                <li>Orcamentos digitais</li>
                <li className="off">Rede de oficinas</li>
              </ul>
              <Link href="/registro" className="btn-plan btn-plan-filled">Comecar agora</Link>
            </div>
            <div className="plan">
              <div className="plan-name">Rede</div>
              <div className="plan-price">R$247<span>/mes</span></div>
              <div className="plan-sub">Para redes e franquias</div>
              <ul className="plan-features">
                <li>Tudo do Profissional</li>
                <li>Usuarios ilimitados</li>
                <li>Multiplas unidades</li>
                <li>Painel consolidado</li>
                <li>Relatorios por unidade</li>
                <li>API de integracao</li>
                <li>Suporte dedicado</li>
              </ul>
              <a href="https://wa.me/5569999999999?text=Olá!%20Tenho%20interesse%20no%20plano%20Rede%20do%20AutoKore." target="_blank" rel="noopener noreferrer" className="btn-plan btn-plan-outline">Falar com vendas</a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-section" id="faq">
        <div className="lp-section-inner">
          <div className="section-label">FAQ</div>
          <h2 className="section-title">Perguntas frequentes</h2>
          <div style={{maxWidth:'680px',margin:'0 auto',display:'flex',flexDirection:'column',gap:'16px'}}>
            {[
              {p:'Como funciona o período grátis?',r:'Durante a fase beta o AutoKore é totalmente gratuito para todos os usuários. Você tem acesso completo ao sistema sem precisar de cartão de crédito. Quando lançarmos os planos pagos, você será avisado com antecedência.'},
              {p:'Preciso instalar algum programa?',r:'Não! O AutoKore funciona direto no navegador do celular ou computador. Você também pode instalar como app (PWA) na tela inicial do seu celular.'},
              {p:'Meus dados ficam seguros?',r:'Sim! Utilizamos Firebase do Google com criptografia de dados e autenticação segura. Seus dados ficam protegidos e nunca são compartilhados.'},
              {p:'Posso usar no celular?',r:'Sim! O AutoKore foi desenvolvido para funcionar perfeitamente no celular. Você consegue criar OS, consultar clientes e ver relatórios de qualquer lugar.'},
              {p:'O que acontece após o período beta?',r:'Você receberá um aviso por e-mail antes de qualquer cobrança. Poderá escolher continuar no plano grátis (com limitações) ou fazer upgrade para um plano pago. Nada muda sem seu consentimento.'},
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

      {/* LEAD */}
      <section className="lp-lead">
        <div className="lead-inner">
          <div className="section-label" style={{textAlign:'center'}}>Lista de espera</div>
          <h2 className="section-title">Quer ser avisado das novidades?</h2>
          <p style={{color:'#9CA3AF',marginTop:'12px'}}>Deixe seu WhatsApp e te avisamos sobre atualizacoes e novos recursos.</p>
          <div className="lead-form">
            <input className="lead-input" type="text" placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} disabled={enviando} />
            <input className="lead-input" type="tel" placeholder="WhatsApp (11) 99999-9999" value={tel} onChange={e => setTel(e.target.value)} disabled={enviando} />
            <button className="btn-primary" onClick={capturarLead} disabled={enviando} style={{opacity: enviando ? 0.7 : 1}}>
              {enviando ? 'Enviando...' : 'Quero ser avisado'}
            </button>
          </div>
          <div className="lead-note">{msg}</div>
          <p style={{fontSize:'11px',color:'#4B5563',marginTop:'8px'}}>
            Protegido por reCAPTCHA — <a href="https://policies.google.com/privacy" style={{color:'#6B7280'}}>Privacidade</a> e <a href="https://policies.google.com/terms" style={{color:'#6B7280'}}>Termos</a>
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
          </div>
          <div className="footer-copy">© 2026 AutoKore. Todos os direitos reservados.</div>
        </div>
      </footer>
    </div>
  )
}