import { Diamond, Shield, Users, ArrowRight, Scale, Lock, FileCheck } from "lucide-react";
import { Link } from "react-router-dom";
import AdCarousel from "@/components/ads/AdCarousel";
import Navbar from "@/components/layout/Navbar";

const LandingPage = () => {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#FAFAF8", minHeight: "100vh", color: "#1a1a1a", overflowX: "hidden" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .btn-dark {
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          background: #1a1a1a; color: #fff; border: none;
          padding: 14px 28px; border-radius: 4px; cursor: pointer;
          transition: all 0.25s; display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
        }
        .btn-dark:hover { background: #2d7a6b; }

        .btn-outline {
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 400;
          background: transparent; color: #1a1a1a; border: 1.5px solid #d4d0c8;
          padding: 14px 28px; border-radius: 4px; cursor: pointer;
          transition: all 0.25s; display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
        }
        .btn-outline:hover { border-color: #2d7a6b; color: #2d7a6b; }

        .feature-card {
          background: #fff; border: 1px solid #eae6dd; border-radius: 8px;
          padding: 32px 28px; transition: all 0.3s;
        }
        .feature-card:hover { border-color: #2d7a6b; box-shadow: 0 8px 32px rgba(45,122,107,0.1); transform: translateY(-4px); }

        .nav-a { color: #555; text-decoration: none; font-size: 14px; transition: color 0.2s; }
        .nav-a:hover { color: #2d7a6b; }

        .section-tag {
          font-size: 12px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase;
          color: #2d7a6b; margin-bottom: 14px; display: block;
        }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .fu1 { animation: fadeUp 0.7s ease both; }
        .fu2 { animation: fadeUp 0.7s 0.15s ease both; }
        .fu3 { animation: fadeUp 0.7s 0.3s ease both; }
      `}</style>

      <Navbar />

      {/* HERO */}
      <section style={{ paddingTop: 68, minHeight: "92vh", display: "flex", alignItems: "center", background: "linear-gradient(135deg, #f5f9f7 0%, #fafaf8 60%, #fdf8f0 100%)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "60px 32px", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>

          <div className="fu1">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e8f3f0", color: "#1a6b5a", borderRadius: 20, padding: "6px 14px", fontSize: 13, marginBottom: 28 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2d7a6b", display: "inline-block" }} />
              Professional Diamond Trading Platform
            </span>

            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 400, lineHeight: 1.1, color: "#1a1a1a", marginBottom: 24 }}>
              Trade Diamonds with<br />
              <span style={{ color: "#2d7a6b", fontStyle: "italic" }}>Confidence & Clarity</span>
            </h1>

            <div style={{ width: "44px", height: 3, background: "#2d7a6b", borderRadius: 2, marginBottom: 24 }} />

            <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.85, color: "#666", maxWidth: 460, marginBottom: 40 }}>
              A secure, transparent digital platform built for professional diamond traders. Buy and sell with KYC-verified counterparties in a fully protected marketplace.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 44 }}>
              <Link to="/register"><button className="btn-dark">Create Account <ArrowRight size={15} /></button></Link>
              <Link to="/login"><button className="btn-outline">Sign In</button></Link>
            </div>

            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {[["KYC Verified", Shield], ["Escrow Protected", Lock], ["Full Audit Trail", FileCheck]].map(([label, Icon]: any) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 7, color: "#888", fontSize: 13 }}>
                  <Icon size={14} color="#2d7a6b" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero card mockup */}
          <div className="fu2" style={{ position: "relative" }}>
            <div style={{ background: "#fff", border: "1px solid #eae6dd", borderRadius: 16, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase" }}>Live Listings</span>
                <span style={{ background: "#e8f3f0", color: "#1a6b5a", fontSize: 12, padding: "4px 12px", borderRadius: 20 }}>● Active</span>
              </div>
              {[
                { shape: "Round Brilliant", carat: "2.10ct", grade: "GIA · D · VVS1", price: "$24,800" },
                { shape: "Oval Cut", carat: "1.85ct", grade: "IGI · E · VS1", price: "$16,200" },
                { shape: "Emerald Cut", carat: "3.02ct", grade: "GIA · F · VVS2", price: "$38,400" },
              ].map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < 2 ? "1px solid #f2ede4" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, background: "#f0f7f5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Diamond size={16} color="#2d7a6b" />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}>{d.shape} · {d.carat}</div>
                      <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{d.grade}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "#1a1a1a" }}>{d.price}</div>
                </div>
              ))}
              <button className="btn-dark" style={{ width: "100%", justifyContent: "center", marginTop: 18, fontSize: 13 }}>View All Listings →</button>
            </div>

            {/* Floating badge top-right */}
            <div style={{ position: "absolute", top: -14, right: -14, background: "#fff", border: "1px solid #eae6dd", borderRadius: 10, padding: "12px 16px", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 3 }}>Verified Traders</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 500, color: "#2d7a6b" }}>2,400+</div>
            </div>

            {/* Floating badge bottom-left */}
            <div style={{ position: "absolute", bottom: -14, left: -14, background: "#fff", border: "1px solid #eae6dd", borderRadius: 10, padding: "12px 16px", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 3 }}>Escrow Success</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 500, color: "#2d7a6b" }}>99.8%</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div style={{ background: "#1c2e29", padding: "36px 32px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
          {[["$240M+", "Trading Volume"], ["18,000+", "Trades Completed"], ["2,400+", "Verified Traders"], ["150+", "Countries"]].map(([num, label], i) => (
            <div key={label} style={{ textAlign: "center", padding: "0 16px", borderRight: i < 3 ? "1px solid #2e4a42" : "none" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 400, color: "#7ecfbe", lineHeight: 1 }}>{num}</div>
              <div style={{ fontSize: 12, color: "#6a8f85", marginTop: 6, letterSpacing: "0.05em" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section style={{ padding: "96px 32px", background: "#fafaf8" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ marginBottom: 56 }}>
            <span className="section-tag">Why Choose Us</span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 400, color: "#1a1a1a", lineHeight: 1.2 }}>
              Built for Diamond <em style={{ color: "#2d7a6b" }}>Professionals</em>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[
              { Icon: Users, title: "Unified Trading", desc: "Buy and sell from a single account. No role switching, just seamless transactions between verified traders." },
              { Icon: Scale, title: "Fair Pricing", desc: "Auction-based system ensures competitive, market-driven prices for every diamond listing." },
              { Icon: Shield, title: "Escrow Protection", desc: "Every payment is held securely in escrow until delivery is confirmed by both parties." },
              { Icon: FileCheck, title: "Full Transparency", desc: "Track every step of your deal with complete visibility, document trails, and real-time updates." },
              { Icon: Lock, title: "Verified Users Only", desc: "All traders undergo mandatory KYC — you always know exactly who you're dealing with." },
              { Icon: Diamond, title: "Professional Grade", desc: "Built for the diamond industry with tools, terminology, and features that professionals demand." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="feature-card">
                <div style={{ width: 44, height: 44, background: "#f0f7f5", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Icon size={20} color="#2d7a6b" />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500, marginBottom: 10, color: "#1a1a1a" }}>{title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.78, color: "#888", fontWeight: 300 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AD CAROUSEL */}
      <section style={{ padding: "0 32px 80px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <AdCarousel section="HOME_DASHBOARD" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "96px 32px", background: "#f0f7f5" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span className="section-tag">Process</span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 400, color: "#1a1a1a" }}>
              Five Steps to Your <em style={{ color: "#2d7a6b" }}>Perfect Deal</em>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16, position: "relative" }}>
            <div style={{ position: "absolute", top: 26, left: "10%", right: "10%", height: 1, background: "rgba(45,122,107,0.2)", zIndex: 0 }} />
            {[["Register", "Create your account"], ["Verify", "Complete KYC"], ["List or Bid", "Browse or list inventory"], ["Deal", "Negotiate securely"], ["Complete", "Payment & delivery"]].map(([title, desc], i) => (
              <div key={title} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", border: "2px solid #2d7a6b", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", background: "#fff" }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#2d7a6b" }}>{i + 1}</span>
                </div>
                <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 500, marginBottom: 6, color: "#1a1a1a" }}>{title}</h4>
                <p style={{ fontSize: 13, color: "#888", lineHeight: 1.65, fontWeight: 300 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section style={{ padding: "96px 32px", background: "#fafaf8" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ background: "#fff", border: "1px solid #eae6dd", borderRadius: 16, padding: "60px 64px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #2d7a6b, #7ecfbe, #2d7a6b)" }} />
            <div style={{ width: 56, height: 56, background: "#f0f7f5", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Shield size={26} color="#2d7a6b" />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 3vw, 40px)", fontWeight: 400, marginBottom: 16, color: "#1a1a1a" }}>
              Built on <em style={{ color: "#2d7a6b" }}>Trust & Security</em>
            </h2>
            <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.9, color: "#888", maxWidth: 500, margin: "0 auto 36px" }}>
              Every aspect of Reyu Diamond is designed with security first — mandatory KYC, escrow-protected payments, comprehensive audit trails, and professional dispute resolution.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {["Mandatory KYC", "Escrow Payments", "Audit Records", "Dispute Handling"].map(t => (
                <div key={t} style={{ background: "#f0f7f5", color: "#1a6b5a", fontSize: 13, padding: "8px 18px", borderRadius: 20 }}>{t}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "96px 32px", background: "#1c2e29", textAlign: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7ecfbe", marginBottom: 20, display: "block" }}>Join the Platform</span>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 58px)", fontWeight: 400, lineHeight: 1.15, marginBottom: 16, color: "#fff" }}>
          Trade with clarity.<br /><em style={{ color: "#7ecfbe" }}>Trust every transaction.</em>
        </h2>
        <p style={{ fontSize: 15, fontWeight: 300, color: "#6a8f85", marginBottom: 44, maxWidth: 420, margin: "0 auto 44px" }}>
          Join thousands of verified diamond professionals on the most secure trading platform.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/register"><button className="btn-dark" style={{ background: "#2d7a6b" }}>Create Free Account <ArrowRight size={15} /></button></Link>
          <Link to="/login"><button className="btn-outline" style={{ color: "#fff", borderColor: "#2e4a42" }}>Sign In</button></Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1a2a25", padding: "28px 32px", background: "#141f1c" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: "#2d7a6b", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Diamond size={13} color="#fff" />
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#fff" }}>Reyu Diamond</span>
          </div>
          <div style={{ fontSize: 12, color: "#3a5a52" }}>© 2024 Reyu Diamond. All rights reserved.</div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Support"].map(t => (
              <a key={t} href="#" style={{ fontSize: 13, color: "#3a5a52", textDecoration: "none" }}
                onMouseOver={e => (e.currentTarget.style.color = "#7ecfbe")}
                onMouseOut={e => (e.currentTarget.style.color = "#3a5a52")}>{t}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;