import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Check, ArrowRight, RefreshCw, Shield } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import axios from "axios";
import { API } from "@/App";

const PhoneVerification = ({ onVerified, onSkip, token }) => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [formattedPhone, setFormattedPhone] = useState("");
  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSendOtp = async () => {
    const numbers = phone.replace(/\D/g, "");
    if (numbers.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/phone/send-otp`, {
        phone_number: numbers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFormattedPhone(res.data.phone_number);
      setStep("otp");
      setResendTimer(60);
      toast.success("Verification code sent!");
    } catch (err) {
      const message = err.response?.data?.detail || "Failed to send verification code";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/phone/verify-otp`, {
        phone_number: formattedPhone,
        otp: otpString
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Phone verified successfully!");
      onVerified(formattedPhone);
    } catch (err) {
      const message = err.response?.data?.detail || "Invalid verification code";
      toast.error(message);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp(["", "", "", "", "", ""]);
    await handleSendOtp();
  };

  return (
    <div className="w-full max-w-md mx-auto" data-testid="phone-verification">
      {step === "phone" ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#d4af37] flex items-center justify-center">
              <Phone className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="font-serif text-2xl tracking-tight">Verify Your Phone</h2>
              <p className="text-sm text-theme-muted">One phone number per account</p>
            </div>
          </div>

          <div className="bg-theme-secondary border border-theme p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#a3e635] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-theme-muted">
                <p className="font-medium text-theme mb-1">Why we need your phone</p>
                <p>To prevent abuse and ensure one account per user, we verify phone numbers. Your number is kept private and secure.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono tracking-widest uppercase text-theme-muted">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(555) 555-5555"
                className="w-full bg-transparent border-b border-theme focus:border-[#d4af37] text-theme px-0 py-3 outline-none transition-colors placeholder:text-theme-dim font-mono text-lg tracking-wide"
                data-testid="phone-input"
              />
            </div>

            <p className="text-xs text-theme-dim">
              By providing your phone number, you agree to receive a one-time verification code via SMS. 
              Standard message rates may apply. See our{" "}
              <a href="/privacy" target="_blank" className="text-[#d4af37] hover:underline">Privacy Policy</a>
              {" "}and{" "}
              <a href="/terms" target="_blank" className="text-[#d4af37] hover:underline">Terms of Service</a>.
            </p>

            <Button
              onClick={handleSendOtp}
              disabled={loading || phone.replace(/\D/g, "").length < 10}
              className="w-full bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs py-4 h-auto"
              data-testid="send-otp-btn"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Send Verification Code
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#d4af37] flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-black" />
            </div>
            <h2 className="font-serif text-2xl tracking-tight mb-2">Enter Verification Code</h2>
            <p className="text-theme-muted">
              We sent a 6-digit code to<br />
              <span className="font-mono text-theme">{formattedPhone}</span>
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="w-12 h-14 bg-theme-secondary border border-theme focus:border-[#d4af37] text-center text-2xl font-mono outline-none transition-colors"
                data-testid={`otp-input-${i}`}
              />
            ))}
          </div>

          <Button
            onClick={handleVerifyOtp}
            disabled={loading || otp.join("").length !== 6}
            className="w-full bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs py-4 h-auto mb-4"
            data-testid="verify-otp-btn"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Verify Phone
              </>
            )}
          </Button>

          <div className="text-center">
            <button
              onClick={handleResend}
              disabled={resendTimer > 0}
              className={`text-sm ${resendTimer > 0 ? 'text-theme-dim' : 'text-[#d4af37] hover:underline'}`}
            >
              {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend code"}
            </button>
            <span className="mx-2 text-theme-dim">•</span>
            <button
              onClick={() => setStep("phone")}
              className="text-sm text-theme-muted hover:text-theme"
            >
              Change number
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PhoneVerification;
