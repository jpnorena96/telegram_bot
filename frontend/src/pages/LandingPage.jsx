import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight, Shield, Calendar, Bell, Star,
  Globe, FileText, MessageCircle, Building2, CheckCircle2, Menu, X
} from "lucide-react";
import logoImg from "../assets/Logo.jpeg";

/* ─── Intersection Observer Hook ─── */
const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

/* ─── Animated Counter ─── */
const Counter = ({ target, suffix = "", dur = 2200 }) => {
  const [val, setVal] = useState(0);
  const [ref, inView] = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    let s = 0;
    const step = target / (dur / 16);
    const t = setInterval(() => {
      s += step;
      if (s >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(s));
    }, 16);
    return () => clearInterval(t);
  }, [inView, target, dur]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
};

/* ════════════════════════════════════════
   COMPONENT
════════════════════════════════════════ */
const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [heroRef, heroInView] = useInView(0.1);
  const [statsRef, statsInView] = useInView(0.2);
  const [processRef, processInView] = useInView(0.1);
  const [agencyRef, agencyInView] = useInView(0.1);
  const [pricingRef, pricingInView] = useInView(0.05);
  const [testRef, testInView] = useInView(0.1);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  /* ── Dynamic Data using t() ── */
  const NAV_LINKS = [
    { href: "#proceso", label: t('nav.process') },
    { href: "#planes", label: t('nav.plans') },
    { href: "#agencias", label: t('nav.agencies') },
  ];

  const PROCESS_STEPS = [
    { icon: FileText, step: "01", title: t('process.step1_title'), desc: t('process.step1_desc') },
    { icon: Calendar, step: "02", title: t('process.step2_title'), desc: t('process.step2_desc') },
    { icon: Bell, step: "03", title: t('process.step3_title'), desc: t('process.step3_desc') },
    { icon: Shield, step: "04", title: t('process.step4_title'), desc: t('process.step4_desc') },
  ];


  const PLANS_AGENCY = [
    {
      name: t('pricing.b2b_start_name'), price: "$34", originalPrice: "$69", period: "mes", desc: t('pricing.b2b_start_desc'), highlight: true, badge: "50% OFF 3 MESES",
      features: ["Portal Marca Blanca (White-label)", "Hasta 50 clientes simultáneos", "Dashboard de monitoreo global", "Notificaciones B2C automáticas", "Soporte técnico estándar"],
      cta: t('pricing.cta_b2b'),
    },
    {
      name: t('pricing.b2b_pro_name'), price: "$74", originalPrice: "$149", period: "mes", desc: t('pricing.b2b_pro_desc'), highlight: false, badge: "50% OFF 3 MESES",
      features: ["Todo en Agencia Starter", "Clientes y perfiles ilimitados", "Adelanto VIP (máxima prioridad)", "Dominio personalizado (CNAME)", "Ejecutivo de cuenta exclusivo"],
      cta: t('pricing.cta_b2b'),
    },
  ];

  const STATS = [
    { value: 5800, suffix: "+", label: t('stats.visas') },
    { value: 147, suffix: "", label: t('stats.days') },
    { value: 98, suffix: "%", label: t('stats.success') },
    { value: 42, suffix: "+", label: t('stats.countries') },
  ];

  const TESTIMONIALS = [
    { name: t('testimonials.t1_name'), role: t('testimonials.t1_role'), text: t('testimonials.t1_text'), stars: 5 },
    { name: t('testimonials.t2_name'), role: t('testimonials.t2_role'), text: t('testimonials.t2_text'), stars: 5 },
    { name: t('testimonials.t3_name'), role: t('testimonials.t3_role'), text: t('testimonials.t3_text'), stars: 5 },
  ];

  /* ── Styles ── */
  const S = {
    page: { background: "var(--bg)", minHeight: "100vh", overflowX: "hidden", position: "relative" },
    nav: {
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 2.5rem", height: 72,
      transition: "all 0.3s ease",
      background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(10px)" : "none",
      borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.03)" : "none",
    },
    logo: { display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.2rem", fontWeight: 800, cursor: "pointer", color: "var(--text-1)" },
    logoIcon: { color: "var(--lime)" },
    reveal: (inView, delay = 0) => ({
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
    }),
  };

  return (
    <div style={S.page}>
      {/* ── NAVBAR ── */}
      <nav style={S.nav}>
        <div style={S.logo} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <img src={logoImg} alt="AdelantaVisa" style={{ height: 32, width: 'auto', borderRadius: '4px' }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }} className="hide-on-mobile">
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href}
              style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-2)", transition: "color 0.2s" }}
              onMouseOver={e => (e.target.style.color = "var(--lime)")}
              onMouseOut={e => (e.target.style.color = "var(--text-2)")}
            >{l.label}</a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }} className="hide-on-mobile">
          <div style={{ display: "flex", gap: "0.5rem", marginRight: "1rem" }}>
            <button onClick={() => changeLanguage('en')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: i18n.language === 'en' ? 'bold' : 'normal', color: i18n.language === 'en' ? 'var(--lime)' : 'var(--text-3)' }}>EN</button>
            <span style={{ color: 'var(--border)' }}>|</span>
            <button onClick={() => changeLanguage('es')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: i18n.language === 'es' ? 'bold' : 'normal', color: i18n.language === 'es' ? 'var(--lime)' : 'var(--text-3)' }}>ES</button>
            <span style={{ color: 'var(--border)' }}>|</span>
            <button onClick={() => changeLanguage('pt')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: i18n.language === 'pt' ? 'bold' : 'normal', color: i18n.language === 'pt' ? 'var(--lime)' : 'var(--text-3)' }}>PT</button>
          </div>
          <button onClick={() => navigate("/login")} className="btn btn-outline" style={{ fontSize: "0.875rem" }}>{t('nav.login')}</button>
          <button onClick={() => navigate("/register")} className="btn btn-lime" style={{ fontSize: "0.875rem" }}>{t('nav.start')} <ArrowRight size={16} /></button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="btn btn-icon btn-sm hide-on-desktop"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div style={{ position: 'fixed', top: '70px', left: 0, right: 0, bottom: 0, background: 'var(--bg)', zIndex: 99, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-1)' }}>
                {l.label}
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: '1rem' }}>
              <button onClick={() => changeLanguage('en')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: i18n.language === 'en' ? 'bold' : 'normal', color: i18n.language === 'en' ? 'var(--lime)' : 'var(--text-3)' }}>EN</button>
              <button onClick={() => changeLanguage('es')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: i18n.language === 'es' ? 'bold' : 'normal', color: i18n.language === 'es' ? 'var(--lime)' : 'var(--text-3)' }}>ES</button>
              <button onClick={() => changeLanguage('pt')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: i18n.language === 'pt' ? 'bold' : 'normal', color: i18n.language === 'pt' ? 'var(--lime)' : 'var(--text-3)' }}>PT</button>
            </div>
            <button onClick={() => navigate("/login")} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>{t('nav.login')}</button>
            <button onClick={() => navigate("/register")} className="btn btn-lime" style={{ width: '100%', justifyContent: 'center' }}>{t('nav.start')} <ArrowRight size={16} /></button>
          </div>
        </div>
      )}

      {/* ── HERO (SPLIT LAYOUT) ── */}
      <section ref={heroRef} className="hero-section" style={{ position: "relative", zIndex: 1, padding: "8rem 1.5rem 4rem", background: "var(--surface)" }}>
        <div className="flex-col-mobile" style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: "3rem", flexWrap: "wrap" }}>
          <div className="w-full-mobile text-center-mobile" style={{ flex: "1 1 400px", ...S.reveal(heroInView, 0) }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 1rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 99, fontSize: "0.75rem", fontWeight: 700, color: "var(--lime)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <Shield size={14} /> {t('hero.badge')}
            </div>
            <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "1.5rem", color: "var(--text-1)" }}>
              {t('hero.title')}<br />
              <span className="text-gradient-accent">{t('hero.title_highlight')}</span>
            </h1>
            <p style={{ fontSize: "1.125rem", color: "var(--text-2)", marginBottom: "2.5rem", lineHeight: 1.7, maxWidth: 550 }}>
              {t('hero.desc')}
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button onClick={() => navigate("/register")} className="btn btn-lime" style={{ padding: "0.9rem 2.25rem", fontSize: "1rem" }}>
                {t('hero.cta_primary')} <ArrowRight size={18} />
              </button>
              <a href="#proceso" className="btn btn-outline" style={{ padding: "0.9rem 2.25rem", fontSize: "1rem", background: "var(--bg)" }}>
                {t('hero.cta_secondary')}
              </a>
            </div>
            <div style={{ marginTop: "2.5rem", display: "flex", gap: "2rem", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "0.2rem" }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="var(--gold)" color="var(--gold)" />)}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-3)", fontWeight: 500 }}>
                {t('hero.trust_text')}
              </div>
            </div>
          </div>
          <div style={{ flex: "1 1 500px", position: "relative", ...S.reveal(heroInView, 0.2) }}>
            <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 40px rgba(15, 23, 42, 0.1)" }}>
              <img src="/images/hero.png" alt="Global Travel" style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.4), transparent)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section ref={statsRef} style={{ padding: "4rem 2rem", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", textAlign: "center" }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ opacity: statsInView ? 1 : 0, transition: `opacity 0.7s ease ${i * 0.1}s` }}>
              <div style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "0.5rem", color: "var(--lime)" }}>
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--text-2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROCESO ── */}
      <section id="proceso" ref={processRef} style={{ padding: "7rem 2rem", background: "var(--surface-2)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "1rem", ...S.reveal(processInView, 0) }}>{t('process.title')}</h2>
            <p style={{ fontSize: "1.1rem", color: "var(--text-2)", maxWidth: 600, margin: "0 auto", lineHeight: 1.7, ...S.reveal(processInView, 0.1) }}>
              {t('process.desc')}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {PROCESS_STEPS.map((step, i) => (
              <div key={i} className="panel" style={{ ...S.reveal(processInView, 0.1 + i * 0.1), padding: "2.5rem" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
                  <step.icon size={26} color="var(--lime)" strokeWidth={1.5} />
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--lime)", fontWeight: 700, marginBottom: "0.5rem" }}>{t('process.step_label')} {step.step}</div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-1)" }}>{step.title}</h3>
                <p style={{ color: "var(--text-2)", lineHeight: 1.6, fontSize: "0.95rem" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AGENCY BANNER (IMAGE INTEGRATION) ── */}
      <section id="agencias" ref={agencyRef} style={{ padding: "0", background: "var(--bg)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))" }}>
          <div style={{ position: "relative", minHeight: 400 }}>
            <img src="/images/business.png" alt="Corporate Team" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ padding: "6rem 4rem", display: "flex", flexDirection: "column", justifyContent: "center", background: "var(--text-1)", color: "#fff" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 1rem", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 99, fontSize: "0.75rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.5rem", alignSelf: "flex-start" }}>
              <Building2 size={14} /> {t('agency.badge')}
            </div>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "1.5rem", lineHeight: 1.1 }}>
              {t('agency.title')}
            </h2>
            <p style={{ fontSize: "1.1rem", color: "var(--text-3)", marginBottom: "2.5rem", lineHeight: 1.7, maxWidth: 500 }}>
              {t('agency.desc')}
            </p>
            <div>
              <button onClick={() => { document.getElementById("planes")?.scrollIntoView(); }} className="btn" style={{ background: "#fff", color: "var(--text-1)", border: "none", padding: "1rem 2rem" }}>
                {t('agency.cta')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="planes" ref={pricingRef} style={{ padding: "7rem 2rem", background: "var(--surface)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "1rem", ...S.reveal(pricingInView, 0) }}>{t('pricing.title')}</h2>
            <p style={{ fontSize: "1.1rem", color: "var(--text-2)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7, ...S.reveal(pricingInView, 0.1) }}>
              {t('pricing.desc')}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem", maxWidth: 900, margin: "0 auto", marginTop: "3rem" }}>
              {PLANS_AGENCY.map((plan, i) => (
                <div key={i} className="panel" style={{ padding: "3rem", position: "relative", border: plan.highlight ? "2px solid var(--lime)" : "1px solid var(--border)", boxShadow: plan.highlight ? "0 20px 40px rgba(79, 70, 229, 0.1)" : "0 4px 10px rgba(0,0,0,0.02)", ...S.reveal(true, i * 0.1) }}>
                  {plan.badge && (
                    <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", padding: "4px 16px", borderRadius: 99, fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.06em", background: "var(--lime)", color: "#000", whiteSpace: "nowrap" }}>
                      {plan.badge}
                    </div>
                  )}
                  <div style={{ marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 700, color: plan.highlight ? "var(--lime)" : "var(--text-1)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{plan.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "1.5rem", color: "var(--text-3)", textDecoration: "line-through", fontWeight: 600 }}>
                      ${parseInt(plan.price.replace('$', '')) * 2}
                    </span>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "0.3rem", marginBottom: "0.25rem" }}>
                      <span style={{ fontSize: "3.5rem", fontFamily: "var(--font-heading)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, color: "var(--text-1)" }}>{plan.price}</span>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-3)", paddingBottom: "0.6rem", fontWeight: 600, textTransform: "uppercase" }}>/ {plan.period}</span>
                    </div>
                  </div>
                  <p style={{ color: "var(--text-3)", fontSize: "0.95rem", marginBottom: "2.5rem", lineHeight: 1.6, minHeight: 48 }}>{plan.desc}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2.5rem 0", flex: 1 }}>
                    {plan.features.map((f, j) => (
                      <li key={j} style={{ display: "flex", gap: "0.85rem", marginBottom: "1.25rem", alignItems: "flex-start" }}>
                        <CheckCircle2 size={20} color={i === 1 ? "var(--lime)" : "var(--text-3)"} style={{ flexShrink: 0, marginTop: 1 }} />
                        <span style={{ color: "var(--text-2)", fontSize: "1rem", lineHeight: 1.5, fontWeight: i === 1 ? 500 : 400 }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => navigate("/register")} className={i === 1 ? "btn btn-lime" : "btn btn-outline"} style={{ width: "100%", padding: "1rem", justifyContent: "center", fontSize: "1rem" }}>
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section ref={testRef} style={{ padding: "7rem 2rem", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", ...S.reveal(testInView, 0) }}>{t('testimonials.title')}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="panel" style={{ ...S.reveal(testInView, i * 0.1), padding: "2.5rem" }}>
                <div style={{ display: "flex", gap: "4px", marginBottom: "1.25rem" }}>
                  {[...Array(t.stars)].map((_, j) => <Star key={j} size={16} color="var(--gold)" fill="var(--gold)" />)}
                </div>
                <p style={{ color: "var(--text-2)", lineHeight: 1.7, fontSize: "0.95rem", marginBottom: "1.5rem", fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "auto" }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 700, color: "var(--text-1)", flexShrink: 0 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-1)" }}>{t.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: "6rem 2rem", background: "var(--surface-2)" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center", background: "var(--lime)", borderRadius: 32, padding: "clamp(3rem, 6vw, 5rem) clamp(2rem, 5vw, 4rem)", boxShadow: "0 20px 40px rgba(37, 99, 235, 0.2)" }}>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "1.25rem", color: "#fff" }}>
            {t('cta.title1')}<br />{t('cta.title2')}
          </h2>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.8)", maxWidth: 520, margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
            {t('cta.desc')}
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/register")} className="btn" style={{ padding: "1rem 2.5rem", fontSize: "1rem", background: "#fff", color: "var(--lime)", border: "none" }}>
              {t('cta.btn_primary')}
            </button>
            <button onClick={() => navigate("/login")} className="btn btn-outline" style={{ padding: "1rem 2.5rem", fontSize: "1rem", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>
              {t('cta.btn_secondary')}
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "4rem 2rem", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "3rem", marginBottom: "3rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem", fontWeight: 800, marginBottom: "1rem", color: "var(--text-1)" }}>
                <img src={logoImg} alt="AdelantaVisa" style={{ height: 32, width: 'auto', borderRadius: '4px' }} />
              </div>
              <p style={{ color: "var(--text-3)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                {t('footer.desc')}
              </p>
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-1)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>{t('footer.solutions')}</div>
              {[t('footer.s1'), t('footer.s2'), t('footer.s3'), t('footer.s4')].map(l => (
                <div key={l} style={{ marginBottom: "0.6rem" }}><a href="#" style={{ color: "var(--text-2)", fontSize: "0.9rem" }}>{l}</a></div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-1)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>{t('footer.legal')}</div>
              {[t('footer.l1'), t('footer.l2'), t('footer.l3')].map(l => (
                <div key={l} style={{ marginBottom: "0.6rem" }}><a href="#" style={{ color: "var(--text-2)", fontSize: "0.9rem" }}>{l}</a></div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-1)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>{t('footer.contact')}</div>
              <div style={{ color: "var(--text-2)", fontSize: "0.95rem", lineHeight: "1.8" }}>
                <div>+573053574923</div>
                <div>info@adelantavisa.com</div>
                <div>Lunes - Viernes, 9:00 - 18:00 EST</div>
                <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--lime)", fontWeight: 600 }}>
                  <MessageCircle size={16} /> {t('footer.c_portal')}
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", color: "var(--text-3)", fontSize: "0.85rem" }}>
            <div>{t('footer.rights')}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 500 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} />
              {t('footer.status')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
