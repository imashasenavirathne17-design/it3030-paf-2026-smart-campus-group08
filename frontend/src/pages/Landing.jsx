import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building, 
  Calendar, 
  Wrench, 
  Bell,
  ArrowRight, 
  CheckCircle, 
  Shield, 
  Zap,
  Clock, 
  BarChart, 
  Users, 
  Globe, 
  Mail, 
  Phone
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function Landing() {
  const navigate = useNavigate()

  const features = [
    { title: 'Resource Management', desc: 'Centralized directory for all campus facilities and academic resources.', icon: Building, bg: '#EBF8FF', color: '#87CEEB' },
    { title: 'Smart Bookings', desc: 'Real-time availability and instant reservation for study spaces.', icon: Calendar, bg: '#F3E8FF', color: '#B794F4' },
    { title: 'Maintenance Hub', desc: 'Automated ticketing and tracking for all facility maintenance.', icon: Wrench, bg: '#FEF3C7', color: '#FBBF24' },
    { title: 'Campus Alerts', desc: 'Critical notifications and operational updates delivered instantly.', icon: Bell, bg: '#FEE2E2', color: '#EF4444' },
  ]

  const steps = [
    { num: '01', title: 'Connect', desc: 'Log in with your university credentials safely.' },
    { num: '02', title: 'Explore', desc: 'Browse available resources and campus facilities.' },
    { num: '03', title: 'Request', desc: 'Book a space or report an issue in two clicks.' },
    { num: '04', title: 'Track', desc: 'Stay updated with real-time status notifications.' },
  ]

  const benefits = [
    { title: 'Efficiency', desc: 'Reduce manual paperwork and waiting times by 60%.', icon: Zap, bg: '#f0fdf4' },
    { title: 'Analytics', desc: 'Gain deep insights into resource utilization trends.', icon: BarChart, bg: '#f5f3ff' },
    { title: 'Collaboration', desc: 'Bridge the gap between students and administration.', icon: Users, bg: '#fff7ed' },
    { title: 'Scalability', desc: 'Designed to grow with your university ecosystem.', icon: Globe, bg: '#f0f9ff' },
  ]

  return (
    <div style={styles.page}>
      <Navbar />
      {/* 1. HERO SECTION */}
      <section style={styles.hero}>
        <div className="container">
          <div style={styles.heroInner}>
            <div style={styles.heroContent}>
              <div style={styles.badge}>
                <div style={styles.badgeDot} />
                <span>Next-Gen Campus Hub</span>
              </div>
              <h1 style={styles.heroTitle}>
                Streamline Campus <br/>
                <span style={{ color: '#B794F4' }}>Operations</span> with Ease
              </h1>
              <p style={styles.heroSub}>
                The unified platform for university resource management, 
                smart scheduling, and automated maintenance tracking.
              </p>
              <div style={styles.heroActions}>
                <button onClick={() => navigate('/signup')} className="btn btn-primary btn-lg">
                  Get Started Free <ArrowRight size={20} style={{ marginLeft: 8 }} />
                </button>
                <button style={styles.secondaryBtn}>View Platform Demo</button>
              </div>
            </div>
            <div style={styles.heroVisual}>
              <div style={styles.mockupContainer}>
                <DashboardPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section id="features" style={styles.section}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Everything you need to manage campus</h2>
            <p style={styles.sectionDesc}>Powerful tools designed specifically for modern higher education institutions.</p>
          </div>
          <div style={styles.featureGrid}>
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div style={{ ...styles.iconBox, background: f.bg }}>
                  <f.icon size={24} color={f.color} />
                </div>
                <h3 style={styles.cardTitle}>{f.title}</h3>
                <p style={styles.cardDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="solutions" style={styles.sectionBg}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>How It Works</h2>
            <p style={styles.sectionDesc}>Get started with Smart Campus in four simple steps.</p>
          </div>
          <div style={styles.stepsContainer}>
            {steps.map((s, i) => (
              <div key={i} style={styles.stepItem}>
                {i < steps.length - 1 && <div style={styles.stepLine} />}
                <div style={styles.stepNum}>{s.num}</div>
                <h4 style={styles.stepTitle}>{s.title}</h4>
                <p style={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DATA SECTION */}
      <section style={styles.section}>
        <div className="container">
          <div style={styles.previewContainer}>
            <div style={styles.previewText}>
              <h2 style={styles.sectionTitle}>Data-Driven Insights</h2>
              <p style={styles.sectionDesc}>
                Monitor campus activity in real-time with our comprehensive analytics dashboard. 
                Track bookings and resource availability at a glance.
              </p>
              <ul style={styles.previewList}>
                {['Real-time Analytics', 'Booking Overviews', 'Resource Tracking'].map(item => (
                  <li key={item} style={styles.previewListItem}>
                    <CheckCircle size={18} color="#B794F4" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={styles.previewVisual}>
              <DashboardPreview expanded={true} />
            </div>
          </div>
        </div>
      </section>

      {/* 5. BENEFITS SECTION */}
      <section style={styles.sectionBg}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Built for Excellence</h2>
            <p style={styles.sectionDesc}>Experience the advantages of a fully integrated campus ecosystem.</p>
          </div>
          <div style={styles.benefitsGrid}>
            {benefits.map((b, i) => (
              <div key={i} className="benefit-card">
                <div style={{ ...styles.benefitIconBox, background: b.bg }}>
                  <b.icon size={20} color="#374151" />
                </div>
                <h4 style={styles.benefitTitle}>{b.title}</h4>
                <p style={styles.benefitDesc}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA SECTION */}
      <section style={styles.ctaSection}>
        <div className="container">
          <div style={styles.ctaCard}>
            <h2 style={styles.ctaTitle}>Start managing your campus smarter today</h2>
            <p style={styles.ctaDesc}>Join forward-thinking universities streamlining their daily operations.</p>
            <button onClick={() => navigate('/login')} className="btn-cta">
              <Zap size={18} fill="#374151" /> Sign in with Google
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

function DashboardPreview({ expanded = false }) {
  return (
    <div style={styles.mockup}>
      <div style={styles.mockupHeader}>
        <div style={styles.mockupDots}>
          <span style={{ ...styles.mockupDot, background: '#FEE2E2' }} />
          <span style={{ ...styles.mockupDot, background: '#FEF3C7' }} />
          <span style={{ ...styles.mockupDot, background: '#D1FAE5' }} />
        </div>
      </div>
      <div style={styles.mockupBody}>
        <div style={styles.mockupStats}>
          <div style={styles.mockStat}><div style={styles.mockStatVal} /></div>
          <div style={styles.mockStat}><div style={styles.mockStatVal} /></div>
          {expanded && <div style={styles.mockStat}><div style={styles.mockStatVal} /></div>}
        </div>
        <div style={styles.mockupGrid}>
          <div style={styles.mockMain} />
          <div style={styles.mockSide} />
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { background: '#fff' },
  section: { padding: '100px 0' },
  sectionBg: { padding: '100px 0', background: '#F9FAFB' },
  sectionHeader: { textAlign: 'center', marginBottom: '64px' },
  sectionTitle: { fontSize: '36px', fontWeight: 800, marginBottom: '16px', color: '#374151', letterSpacing: '-0.02em' },
  sectionDesc: { fontSize: '18px', color: '#9CA3AF', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 },

  hero: { padding: '140px 0 100px', background: 'radial-gradient(circle at top right, #f0f9ff 0%, #fff 40%)' },
  heroInner: { display: 'flex', alignItems: 'center', gap: '80px' },
  heroContent: { flex: 1 },
  heroTitle: { fontSize: '64px', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.025em', color: '#374151', fontWeight: 900 },
  heroSub: { fontSize: '20px', color: '#9CA3AF', marginBottom: '40px', lineHeight: 1.6 },
  heroActions: { display: 'flex', gap: '16px' },
  secondaryBtn: { padding: '14px 28px', borderRadius: '12px', background: '#fff', border: '1px solid #E5E7EB', color: '#374151', fontSize: '16px', fontWeight: 600, cursor: 'pointer' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: '#EBF8FF', color: '#87CEEB', borderRadius: '99px', fontSize: '13px', fontWeight: 700, marginBottom: '24px' },
  badgeDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#B794F4' },

  heroVisual: { flex: 1.2 },
  mockupContainer: { transform: 'perspective(1000px) rotateY(-5deg)' },

  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' },
  iconBox: { width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' },
  cardTitle: { fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#374151' },
  cardDesc: { fontSize: '15px', color: '#9CA3AF', lineHeight: 1.6 },

  stepsContainer: { display: 'flex', gap: '40px' },
  stepItem: { flex: 1, position: 'relative' },
  stepNum: { width: '48px', height: '48px', background: '#B794F4', color: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, marginBottom: '24px', position: 'relative', zIndex: 2 },
  stepTitle: { fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#374151' },
  stepDesc: { fontSize: '15px', color: '#9CA3AF', lineHeight: 1.6 },
  stepLine: { position: 'absolute', top: '24px', left: '48px', right: '-40px', height: '1px', background: '#E5E7EB', zIndex: 1 },

  previewContainer: { display: 'flex', alignItems: 'center', gap: '100px' },
  previewText: { flex: 1 },
  previewVisual: { flex: 1.5 },
  previewList: { listStyle: 'none', padding: 0, marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' },
  previewListItem: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', fontWeight: 600, color: '#374151' },

  benefitsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' },
  benefitIconBox: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  benefitTitle: { fontSize: '17px', fontWeight: 700, color: '#374151' },
  benefitDesc: { fontSize: '15px', color: '#9CA3AF', lineHeight: 1.6 },

  ctaSection: { padding: '100px 0' },
  ctaCard: { background: 'linear-gradient(135deg, #87CEEB 0%, #B794F4 100%)', padding: '80px 40px', borderRadius: '32px', textAlign: 'center', color: '#fff' },
  ctaTitle: { fontSize: '40px', fontWeight: 800, marginBottom: '16px' },
  ctaDesc: { fontSize: '18px', opacity: 0.8, marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' },

  mockup: { background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', overflow: 'hidden' },
  mockupHeader: { background: '#F9FAFB', padding: '12px 16px', borderBottom: '1px solid #E5E7EB' },
  mockupDots: { display: 'flex', gap: '6px' },
  mockupDot: { width: '8px', height: '8px', borderRadius: '50%' },
  mockupBody: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' },
  mockupStats: { display: 'flex', gap: '16px' },
  mockStat: { flex: 1, height: '60px', background: '#F1F5F9', borderRadius: '12px' },
  mockStatVal: { width: '40%', height: '8px', background: '#E5E7EB', borderRadius: '4px', margin: '16px' },
  mockupGrid: { display: 'flex', gap: '16px' },
  mockMain: { flex: 3, height: '140px', background: '#F1F5F9', borderRadius: '12px' },
  mockSide: { flex: 1, height: '140px', background: '#F1F5F9', borderRadius: '12px' },
}
