'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function LandingPage() {
  const [nome, setNome] = useState('')
  const [tel, setTel] = useState('')
  const [msg, setMsg] = useState('🔒 Seus dados são privados. Não enviamos spam.')

  function capturarLead() {
    if (!nome || !tel) { setMsg('⚠️ Preencha seu nome e WhatsApp.'); return }
    setMsg(`✅ Obrigado, ${nome}! Te avisaremos em breve.`)
    setNome(''); setTel('')
  }

  return (
    <>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        :root{
          --orange:#E8500A;--orange-light:#FF6B2B;--dark:#0F0F0F;--dark2:#1A1A1A;
          --dark3:#242424;--gray:#6B7280;--gray-light:#9CA3AF;--border:#2A2A2A;
          --white:#FFFFFF;--text:#F9FAFB;
        }
        body{font-family:'Inter',sans-serif;background:var(--dark);color:var(--text);line-height:1.6;overflow-x:hidden}
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500&display=swap');
        .lp-nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(15,15,15,0.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);padding:0 5%}
        .lp-nav-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:68px}
        .lp-logo{font-family:'Sora',sans-serif;font-size:22px;font-weight:800;color:var(--white)}
        .lp-logo span{color:var(--orange)}
        .lp-nav-links{display:flex;align-items:center;gap:32px}
        .lp-nav-links a{font-size:14px;color:var(--gray-light);text-decoration:none;transition:color 0.2s}
        .lp-nav-links a:hover{color:var(--white)}
        .btn-nav{background:var(--orange);color:var(--white)!important;padding:9px 22px;border-radius:8px;font-size:14px;font-weight:500}
        .lp-hero{min-height:100vh;display:flex;align-items:center;padding:100px 5% 80px;position:relative;overflow:hidden}
        .lp-hero::before{content:'';position:absolute;top:-200px;right:-200px;width:600px;height:600px;background:radial-gradient(circle,rgba(232,80,10,0.12) 0%,transparent 70%);pointer-events:none}
        .lp-hero-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
        .lp-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(232,80,10,0.12);border:1px solid rgba(232,80,10,0.3);border-radius:100px;padding:6px 16px;font-size:13px;color:var(--orange);margin-bottom:24px;font-weight:500}
        .badge-dot{width:6px;height:6px;background:var(--orange);border-radius:50%;animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .lp-h1{font-family:'Sora',sans-serif;font-size:52px;font-weight:800;line-height:1.1;margin-bottom:24px;letter-spacing:-1px}
        .lp-h1 span{color:var(--orange)}
        .lp-sub{font-size:18px;color:var(--gray-light);line-height:1.7;margin-bottom:40px;max-width:480px}
        .lp-btns{display:flex;gap:16px;flex-wrap:wrap}
        .btn-primary{background:var(--orange);color:var(--white);padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;font-family:'Sora',sans-serif;transition:all 0.2s;display:inline-block;text-decoration:none}
        .btn-primary:hover{background:var(--orange-light);transform:translateY(-1px)}
        .btn-secondary{background:transparent;color:var(--white);padding:14px 32px;border-radius:10px;font-size:15px;font-weight:500;border:1px solid var(--border);transition:all 0.2s;display:inline-block;text-decoration:none}
        .btn-secondary:hover{border-color:var(--gray);background:var(--dark2)}
        .lp-trust{margin-top:48px;display:flex;align-items:center;gap:16px}
        .trust-avatars{display:flex}
        .trust-avatars span{width:36px;height:36px;border-radius:50%;border:2px solid var(--dark);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;margin-left:-8px;background:var(--dark3);color:var(--gray-light)}
        .trust-avatars span:first-child{margin-left:0}
        .trust-text{font-size:13px;color:var(--gray)}
        .trust-text strong{color:var(--white)}
        .lp-mockup-wrap{position:relative}
        .lp-mockup{background:var(--dark2);border:1px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,0.6)}
        .mockup-bar{background:var(--dark3);padding:12px 16px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--border)}
        .dot{width:10px;height:10px;border-radius:50%}
        .dot-r{background:#FF5F57}.dot-y{background:#FFBD2E}.dot-g{background:#28CA41}
        .mockup-url{flex:1;background:rgba(255,255,255,0.05);border-radius:6px;padding:4px 12px;font-size:11px;color:var(--gray);margin-left:8px}
        .mockup-body{padding:20px}
        .dash-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
        .dash-title{font-family:'Sora',sans-serif;font-size:16px;font-weight:700;color:var(--white)}
        .dash-date{font-size:11px;color:var(--gray)}
        .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}
        .kpi{background:var(--dark3);border-radius:10px;padding:12px;border:1px solid var(--border)}
        .kpi-label{font-size:10px;color:var(--gray);margin-bottom:4px}
        .kpi-val{font-family:'Sora',sans-serif;font-size:20px;font-weight:700;color:var(--white)}
        .kpi-val.orange{color:var(--orange)}
        .kpi-change{font-size:10px;color:#22C55E;margin-top:2px}
        .os-list{display:flex;flex-direction:column;gap:8px}
        .os-item{background:var(--dark3);border-radius:8px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;border:1px solid var(--border)}
        .os-info{display:flex;flex-direction:column;gap:2px}
        .os-name{font-size:12px;font-weight:500;color:var(--white)}
        .os-car{font-size:10px;color:var(--gray)}
        .os-badge{font-size:10px;padding:3px 10px;border-radius:100px;font-weight:500}
        .badge-green{background:rgba(34,197,94,0.15);color:#22C55E}
        .badge-yellow{background:rgba(234,179,8,0.15);color:#EAB308}
        .badge-blue{background:rgba(59,130,246,0.15);color:#3B82F6}
        .os-val{font-size:11px;font-weight:600;color:var(--white)}
        .floating-card{position:absolute;bottom:-20px;left:-30px;background:var(--dark2);border:1px solid var(--border);border-radius:12px;padding:14px 18px;box-shadow:0 20px 40px rgba(0,0,0,0.4)}
        .fc-label{font-size:11px;color:var(--gray);margin-bottom:4px}
        .fc-val{font-family:'Sora',sans-serif;font-size:24px;font-weight:800;color:var(--orange)}
        .fc-sub{font-size:11px;color:var(--gray-light)}
        .logos-section{padding:40px 5%;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
        .logos-inner{max-width:1200px;margin:0 auto;text-align:center}
        .logos-label{font-size:13px;color:var(--gray);margin-bottom:24px}
        .logos-row{display:flex;justify-content:center;align-items:center;gap:48px;flex-wrap:wrap}
        .logo-item{font-family:'Sora',sans-serif;font-size:18px;font-weight:700;color:var(--border);letter-spacing:-0.5px}
        .lp-section{padding:100px 5%}
        .lp-section-inner{max-width:1200px;margin:0 auto}
        .section-label{font-size:13px;font-weight:500;color:var(--orange);letter-spacing:2px;text-transform:uppercase;margin-bottom:16px}
        .section-title{font-family:'Sora',sans-serif;font-size:40px;font-weight:800;line-height:1.15;letter-spacing:-0.5px;margin-bottom:16px}
        .section-sub{font-size:17px;color:var(--gray-light);max-width:520px;line-height:1.7;margin-bottom:64px}
        .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .feat-card{background:var(--dark2);border:1px solid var(--border);border-radius:16px;padding:32px;transition:border-color 0.2s}
        .feat-card:hover{border-color:rgba(232,80,10,0.4)}
        .feat-icon{width:48px;height:48px;background:rgba(232,80,10,0.12);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:22px}
        .feat-title{font-family:'Sora',sans-serif;font-size:17px;font-weight:700;color:var(--white);margin-bottom:10px}
        .feat-desc{font-size:14px;color:var(--gray-light);line-height:1.7}
        .lp-how{padding:100px 5%;background:var(--dark2);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
        .steps{display:grid;grid-template-columns:repeat(4,1fr);gap:32px;margin-top:64px}
        .step{text-align:center}
        .step-num{width:56px;height:56px;border-radius:50%;background:var(--dark3);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-family:'Sora',sans-serif;font-size:18px;font-weight:800;color:var(--orange)}
        .step-title{font-family:'Sora',sans-serif;font-size:15px;font-weight:700;color:var(--white);margin-bottom:8px}
        .step-desc{font-size:13px;color:var(--gray);line-height:1.6}
        .pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:64px}
        .plan{background:var(--dark2);border:1px solid var(--border);border-radius:20px;padding:40px 32px;position:relative;transition:transform 0.2s}
        .plan:hover{transform:translateY(-4px)}
        .plan.popular{border-color:var(--orange);background:linear-gradient(180deg,rgba(232,80,10,0.06) 0%,var(--dark2) 100%)}
        .popular-badge{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--orange);color:var(--white);font-size:12px;font-weight:600;padding:4px 20px;border-radius:100px;font-family:'Sora',sans-serif;white-space:nowrap}
        .plan-name{font-family:'Sora',sans-serif;font-size:14px;font-weight:600;color:var(--gray);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
        .plan-price{font-family:'Sora',sans-serif;font-size:48px;font-weight:800;color:var(--white);margin-bottom:4px}
        .plan-price span{font-size:16px;font-weight:400;color:var(--gray)}
        .plan-sub{font-size:13px;color:var(--gray);margin-bottom:32px}
        .plan-features{list-style:none;display:flex;flex-direction:column;gap:12px;margin-bottom:40px}
        .plan-features li{font-size:14px;color:var(--gray-light);display:flex;align-items:center;gap:10px}
        .plan-features li::before{content:'✓';color:var(--orange);font-weight:700;font-size:13px}
        .plan-features li.off{color:var(--border)}
        .plan-features li.off::before{content:'✗';color:var(--border)}
        .btn-plan{width:100%;padding:14px;border-radius:10px;font-family:'Sora',sans-serif;font-size:15px;font-weight:600;text-align:center;display:block;transition:all 0.2s;text-decoration:none}
        .btn-plan-outline{background:transparent;color:var(--white);border:1px solid var(--border)}
        .btn-plan-outline:hover{border-color:var(--gray)}
        .btn-plan-filled{background:var(--orange);color:var(--white)}
        .btn-plan-filled:hover{background:var(--orange-light)}
        .lp-lead{padding:100px 5%;background:var(--dark2);border-top:1px solid var(--border)}
        .lead-inner{max-width:600px;margin:0 auto;text-align:center}
        .lead-form{display:flex;gap:12px;margin-top:32px;flex-wrap:wrap;justify-content:center}
        .lead-input{flex:1;min-width:200px;background:var(--dark3);border:1px solid var(--border);border-radius:10px;padding:14px 18px;font-size:15px;color:var(--white);outline:none;transition:border-color 0.2s;font-family:'Inter',sans-serif}
        .lead-input::placeholder{color:var(--gray)}
        .lead-input:focus{border-color:var(--orange)}
        .lead-note{font-size:12px;color:var(--gray);margin-top:16px}
        .lp-footer{padding:48px 5%;border-top:1px solid var(--border)}
        .footer-inner{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:24px}
        .footer-logo{font-family:'Sora',sans-serif;font-size:20px;font-weight:800;color:var(--white)}
        .footer-logo span{color:var(--orange)}
        .footer-links{display:flex;gap:32px}
        .footer-links a{font-size:13px;color:var(--gray);text-decoration:none;transition:color 0.2s}
        .footer-links a:hover{color:var(--white)}
        .footer-copy{font-size:12px;color:var(--gray)}
        @media(max-width:900px){
          .lp-hero-inner{grid-template-columns:1fr}
          .lp-mockup-wrap{display:none}
          .lp-h1{font-size:36px}
          .features-grid,.pricing-grid{grid-template-columns:1fr}
          .steps{grid-template-columns:repeat(2,1fr)}
          .lp-nav-links a:not(.btn-nav){display:none}
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-logo"><span>Auto</span>Kore</div>
          <div className="lp-nav-links">
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#planos">Planos</a>
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
              <div className="trust-avatars">
                <span>KL</span><span>MS</span><span>RB</span><span>+</span>
              </div>
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
                <div className="dash-header">
                  <div className="dash-title">Dashboard</div>
                  <div className="dash-date">Maio 2026</div>
                </div>
                <div className="kpis">
                  <div className="kpi"><div className="kpi-label">OS Abertas</div><div className="kpi-val orange">12</div><div className="kpi-change">↑ 3 hoje</div></div>
                  <div className="kpi"><div className="kpi-label">Faturamento</div><div className="kpi-val">R$18k</div><div className="kpi-change">↑ 12%</div></div>
                  <div className="kpi"><div className="kpi-label">Clientes</div><div className="kpi-val">48</div><div className="kpi-change">↑ 5</div></div>
                  <div className="kpi"><div className="kpi-label">NPS</div><div className="kpi-val orange">94</div><div className="kpi-change">Excelente</div></div>
                </div>
                <div className="os-list">
                  <div className="os-item">
                    <div className="os-info"><span className="os-name">Joao Pereira</span><span className="os-car">Corolla 2022 - Troca de oleo</span></div>
                    <span className="os-badge badge-green">Concluido</span>
                    <span className="os-val">R$320</span>
                  </div>
                  <div className="os-item">
                    <div className="os-info"><span className="os-name">Maria Santos</span><span className="os-car">HB20 2021 - Revisao</span></div>
                    <span className="os-badge badge-yellow">Em andamento</span>
                    <span className="os-val">R$580</span>
                  </div>
                  <div className="os-item">
                    <div className="os-info"><span className="os-name">Carlos Lima</span><span className="os-car">Onix 2023 - Freios</span></div>
                    <span className="os-badge badge-blue">Agendado</span>
                    <span className="os-val">R$450</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="floating-card">
              <div className="fc-label">Faturamento do mes</div>
              <div className="fc-val">R$18.420</div>
              <div className="fc-sub">↑ 12% vs mes anterior</div>
            </div>
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

      {/* FEATURES */}
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

      {/* HOW IT WORKS */}
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

      {/* PRICING */}
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
              <Link href="/registro" className="btn-plan btn-plan-outline">Criar conta gratis</Link>
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
              <Link href="/registro" className="btn-plan btn-plan-outline">Falar com vendas</Link>
            </div>
          </div>
        </div>
      </section>

      {/* LEAD */}
      <section className="lp-lead">
        <div className="lead-inner">
          <div className="section-label" style={{textAlign:'center'}}>Lista de espera</div>
          <h2 className="section-title">Quer ser avisado das novidades?</h2>
          <p style={{color:'var(--gray-light)',marginTop:'12px'}}>Deixe seu WhatsApp e te avisamos sobre atualizacoes e novos recursos.</p>
          <div className="lead-form">
            <input className="lead-input" type="text" placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} />
            <input className="lead-input" type="tel" placeholder="WhatsApp (11) 99999-9999" value={tel} onChange={e => setTel(e.target.value)} />
            <button className="btn-primary" onClick={capturarLead} style={{border:'none',cursor:'pointer',whiteSpace:'nowrap'}}>Quero ser avisado</button>
          </div>
          <div className="lead-note">{msg}</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="footer-inner">
          <div className="footer-logo"><span>Auto</span>Kore</div>
          <div className="footer-links">
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#planos">Planos</a>
            <Link href="/login">Entrar</Link>
            <Link href="/registro">Cadastrar</Link>
          </div>
          <div className="footer-copy">© 2026 AutoKore. Todos os direitos reservados.</div>
        </div>
      </footer>
    </>
  )
}