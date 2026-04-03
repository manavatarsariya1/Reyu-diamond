import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Diamond, LayoutDashboard, LogOut, ShieldCheck, Megaphone } from "lucide-react";
import type { RootState } from "@/app/store";
import { logout } from "@/features/auth/auth.Slice";
import { LayoutContext } from "@/utils/Layoutcontext";
import NotificationBell from "../notifications/NotificationBell";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Safely consume context - only if inside DashboardLayout
  const layoutCtx = useContext(LayoutContext);
  const isCollapsed = layoutCtx?.isCollapsed ?? true;
  const inDashboard = !!layoutCtx;

  const handleLogout = () => {
    sessionStorage.setItem("didRun", "");
    dispatch(logout());
    navigate("/login");
  };

  // Sidebar widths from DashboardLayout: 20 (80px) and 72 (288px)
  const navLeft = inDashboard ? (isCollapsed ? "80px" : "288px") : "0";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500;700&display=swap');

        .ryu-nav {
          font-family: 'DM Sans', sans-serif;
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px) saturate(180%);
          border-bottom: 1px solid rgba(234, 230, 221, 0.5);
          height: 72px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @media (max-width: 768px) {
          .ryu-nav { left: 0 !important; }
        }

        .ryu-nav-inner {
          max-width: 1400px; margin: 0 auto;
          padding: 0 40px; height: 100%;
          display: flex; align-items: center; justify-content: space-between;
        }

        .ryu-logo {
          display: flex; align-items: center; gap: 12px; text-decoration: none;
          transition: transform 0.2s ease;
        }
        .ryu-logo:hover { transform: scale(1.02); }

        .ryu-logo-icon {
          width: 38px; height: 38px; 
          background: linear-gradient(135deg, #2d7a6b 0%, #1a4d43 100%);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 8px 16px rgba(45, 122, 107, 0.2);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .ryu-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 21px; font-weight: 600; 
          background: linear-gradient(to right, #1a1a1a, #4a4a4a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.01em;
        }

        .ryu-links { display: flex; align-items: center; gap: 32px; }
        .ryu-link {
          font-size: 14px; font-weight: 500; color: #4b5563;
          text-decoration: none; transition: all 0.3s ease;
          position: relative;
          padding: 4px 0;
        }
        .ryu-link::after {
          content: '';
          position: absolute; bottom: 0; left: 0; width: 0; height: 2px;
          background: #2d7a6b;
          transition: width 0.3s ease;
          border-radius: 2px;
        }
        .ryu-link:hover { color: #2d7a6b; }
        .ryu-link:hover::after { width: 100%; }

        .ryu-promote {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 600; color: #2d7a6b;
          background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
          padding: 6px 16px; border-radius: 100px;
          text-decoration: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(45, 122, 107, 0.1);
          box-shadow: 0 2px 4px rgba(45, 122, 107, 0.05);
        }
        .ryu-promote:hover { 
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(45, 122, 107, 0.15);
          background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%);
        }

        .ryu-actions { display: flex; align-items: center; gap: 12px; }

        .ryu-btn-ghost {
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          background: transparent; color: #4b5563; border: none;
          padding: 10px 20px; border-radius: 12px; cursor: pointer;
          transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
        }
        .ryu-btn-ghost:hover { color: #2d7a6b; background: rgba(45, 122, 107, 0.05); }

        .ryu-btn-primary {
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
          background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%);
          color: #fff; border: none;
          padding: 10px 24px; border-radius: 12px; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
          text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .ryu-btn-primary:hover { 
          background: linear-gradient(135deg, #2d7a6b 0%, #1a4d43 100%);
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(45, 122, 107, 0.25);
        }

        .ryu-btn-outline {
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          background: #fff; color: #1a1a1a; border: 1px solid #e5e7eb;
          padding: 10px 24px; border-radius: 12px; cursor: pointer;
          transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .ryu-btn-outline:hover { 
          border-color: #2d7a6b; color: #2d7a6b; 
          background: rgba(45, 122, 107, 0.02);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .ryu-btn-admin {
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          background: #1c2e29; color: #7ecfbe; border: 1px solid rgba(126, 207, 190, 0.2);
          padding: 9px 20px; border-radius: 10px; cursor: pointer;
          transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;
          box-shadow: 0 4px 12px rgba(28, 46, 41, 0.15);
        }
        .ryu-btn-admin:hover { 
          background: #2d7a6b; color: #fff; 
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(45, 122, 107, 0.25);
        }

        .ryu-btn-logout {
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
          background: transparent; color: #9ca3af; border: none;
          padding: 8px 16px; border-radius: 8px; cursor: pointer;
          transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px;
        }
        .ryu-btn-logout:hover { color: #ef4444; background: #fef2f2; }

        .ryu-divider {
          width: 1px; height: 24px; background: rgba(234, 230, 221, 0.8); margin: 0 8px;
        }

        .ryu-avatar {
          width: 36px; height: 36px; border-radius: 12px;
          background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
          border: 1px solid rgba(45, 122, 107, 0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 700; color: #2d7a6b;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(45, 122, 107, 0.08);
        }
      `}</style>

      <nav 
        className="ryu-nav" 
        style={{ left: navLeft }}
      >
        <div className="ryu-nav-inner">

          {/* Logo */}
          <Link to="/" className="ryu-logo">
            <div className="ryu-logo-icon">
              <Diamond size={16} color="#fff" />
            </div>
            <span className="ryu-logo-text">Reyu Diamond</span>
          </Link>

          {/* Nav links */}
          <div className="ryu-links">
            <Link to="/" className="ryu-link">Home</Link>
            <Link to="/marketplace" className="ryu-link">Marketplace</Link>
            {user && user.role !== "admin" && (
              <Link to="/ads" className="ryu-promote">
                <Megaphone size={13} />
                Promote
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="ryu-actions">
            {!user ? (
              <>
                <Link to="/login"><button className="ryu-btn-ghost">Login</button></Link>
                <Link to="/register"><button className="ryu-btn-primary">Create Account →</button></Link>
              </>
            ) : (
              <>
                {/* Avatar */}
                <div className="ryu-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>

                <NotificationBell />

                <div className="ryu-divider" />

                {user.role === "admin" ? (
                  <button className="ryu-btn-admin" onClick={() => navigate("/admin")}>
                    <ShieldCheck size={14} />
                    Admin Panel
                  </button>
                ) : (
                  <button className="ryu-btn-outline" onClick={() => navigate("/dashboard")}>
                    <LayoutDashboard size={14} />
                    Dashboard
                  </button>
                )}

                <button className="ryu-btn-logout" onClick={handleLogout}>
                  <LogOut size={13} />
                  Logout
                </button>
              </>
            )}
          </div>

        </div>
      </nav>

      {/* Spacer so content doesn't hide behind fixed nav */}
      <div style={{ height: 68 }} />
    </>
  );
};

export default Navbar;