import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import * as OTPAuth from "otpauth";

function App() {
  const [secret, setSecret] = useState("");
  const [totp, setTotp] = useState(null);
  const [otp, setOtp] = useState("");
  const [remaining, setRemaining] = useState(30);
  const [inputCode, setInputCode] = useState("");
  const [result, setResult] = useState("");

  const generateSecret = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const bytes = new Uint8Array(20);

    crypto.getRandomValues(bytes);

    let newSecret = "";

    bytes.forEach((b) => {
      newSecret += chars[b % chars.length];
    });

    const newTotp = new OTPAuth.TOTP({
      issuer: "SecureOTP",
      label: "student",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(newSecret),
    });

    setSecret(newSecret);
    setTotp(newTotp);
    setResult("");
  };

  useEffect(() => {
    if (!totp) return;

    const update = () => {
      const token = totp.generate();

      setOtp(token);

      const now = Math.floor(Date.now() / 1000);
      setRemaining(30 - (now % 30));
    };

    update();

    const timer = setInterval(update, 1000);

    return () => clearInterval(timer);
  }, [totp]);

  const verifyOTP = () => {
    if (!totp) return;

    const delta = totp.validate({
      token: inputCode,
      window: 1,
    });

    if (delta !== null) {
      setResult("✅ 인증 성공");
    } else {
      setResult("❌ 인증 실패");
    }
  };

  const otpAuthUrl = totp ? totp.toString() : "";

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "0 auto",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1>🔐 Secure OTP</h1>

      <button onClick={generateSecret}>
        비밀키 생성
      </button>

      {secret && (
        <>
          <h3>Secret</h3>
          <p>{secret}</p>

          <h3>QR 코드</h3>

          <QRCodeSVG value={otpAuthUrl} size={220} />

         

          <h3>⏳ {remaining}초 남음</h3>

          <input
            type="text"
            maxLength={6}
            placeholder="6자리 OTP 입력"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
          />

          <br />
          <br />

          <button onClick={verifyOTP}>
            인증하기
          </button>

          <h2>{result}</h2>
        </>
      )}
    </div>
  );
}

export default App;