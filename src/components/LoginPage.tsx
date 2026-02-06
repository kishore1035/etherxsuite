import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import logoImage from "figma:asset/14bd33c00fb18a1e46e6fbec8038e908490efbfd.png";
import { Icon3D } from "./ui/Icon3D";

interface LoginPageProps {
  onLogin: (emailOrPhone: string) => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

export function LoginPage({ onLogin, onSwitchToSignup, onForgotPassword }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load remembered credentials on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    const wasRemembered = localStorage.getItem('rememberMe') === 'true';
    
    if (wasRemembered && rememberedEmail && rememberedPassword) {
      setEmail(rememberedEmail);
      setPassword(rememberedPassword);
      setRememberMe(true);
    }
  }, []);

  // Login with password verification
  const handleLogin = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    setIsLoading(true);
    try {
      // Retrieve stored credentials from localStorage
      const storedPassword = localStorage.getItem(`user_password_${email}`);
      
      if (storedPassword) {
        // Verify password
        if (storedPassword === password) {
          const userName = localStorage.getItem(`user_name_${email}`) || email;
          
          // Handle Remember Me
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
            localStorage.setItem('rememberedPassword', password);
            localStorage.setItem('rememberMe', 'true');
          } else {
            localStorage.removeItem('rememberedEmail');
            localStorage.removeItem('rememberedPassword');
            localStorage.removeItem('rememberMe');
          }
          
          toast.success(`Welcome back, ${userName}!`);
          localStorage.setItem('userEmail', email);
          localStorage.setItem('isAuthenticated', 'true');
          await new Promise((resolve) => setTimeout(resolve, 500));
          onLogin(email);
        } else {
          toast.error("Incorrect password. Please try again.");
          setIsLoading(false);
        }
      } else {
        // No account found
        toast.error("No account found. Please sign up first.");
        setIsLoading(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="dark" style={{ minHeight: '100vh', width: '100%' }}>
      <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          {/* Decorative glow element */}
          <div className="auth-header">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-block mb-4"
            >
              <div className="w-16 h-16 flex items-center justify-center mx-auto">
                <img src={logoImage} alt="EtherX Excel" className="w-full h-full object-contain" />
              </div>
            </motion.div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue to EtherX Excel</p>
          </div>

          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <div className="relative">
                <img src="/icons/3d/mail.svg" alt="" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', opacity: 0.7 }} />
                <input
                  id="email"
                  type="email"
                  placeholder="reshmabanu2328@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input login-input"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="relative">
                <img src="/icons/3d/lock.svg" alt="" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', opacity: 0.7, pointerEvents: 'none' }} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input login-input"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                  style={{ 
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    padding: '0',
                    margin: '0',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    minWidth: '36px',
                    minHeight: '36px',
                    boxSizing: 'border-box',
                    willChange: 'transform',
                    transition: 'transform 0.15s ease',
                    outline: 'none'
                  }}
                >
                  <img 
                    src={showPassword ? "/icons/3d/eye-off.svg" : "/icons/3d/eye.svg"} 
                    alt="" 
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      opacity: 0.7, 
                      display: 'block',
                      pointerEvents: 'none',
                      flexShrink: 0
                    }} 
                  />
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
              <label 
                className="flex items-center cursor-pointer" 
                style={{ 
                  gap: '0.5rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="cursor-pointer"
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: 'rgb(255, 207, 64)',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                />
                <span style={{ 
                  color: 'rgb(255, 255, 255)',
                  WebkitTextFillColor: 'rgb(255, 255, 255)',
                  fontSize: '0.875rem',
                  userSelect: 'none',
                  lineHeight: '1'
                }}>
                  Remember me
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center mt-3">
              <button
                onClick={onForgotPassword}
                type="button"
                className="auth-link"
                style={{ color: 'rgb(255, 255, 255)', backgroundColor: 'transparent', WebkitTextFillColor: 'rgb(255, 255, 255)' }}
              >
                Forgot Password?
              </button>
            </div>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <div className="auth-links">
              <span style={{ color: 'rgb(255, 255, 255)', WebkitTextFillColor: 'rgb(255, 255, 255)' }}>Don't have an account? </span>
              <button
                onClick={onSwitchToSignup}
                type="button"
                className="auth-link"
                style={{ color: 'rgb(255, 255, 255)', backgroundColor: 'transparent', WebkitTextFillColor: 'rgb(255, 255, 255)' }}
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}
