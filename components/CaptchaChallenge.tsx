"use client";

import * as React from "react";
import { ShieldCheck, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

interface CaptchaChallengeProps {
  onVerify: (verified: boolean) => void;
  isVerified: boolean;
}

export function CaptchaChallenge({ onVerify, isVerified }: CaptchaChallengeProps) {
  const [num1, setNum1] = React.useState<number>(0);
  const [num2, setNum2] = React.useState<number>(0);
  const [userAnswer, setUserAnswer] = React.useState<string>("");
  const [hasError, setHasError] = React.useState(false);

  const generateProblem = React.useCallback(() => {
    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 8) + 1;
    setNum1(n1);
    setNum2(n2);
    setUserAnswer("");
    setHasError(false);
    onVerify(false);
  }, [onVerify]);

  React.useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserAnswer(val);

    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed === num1 + num2) {
      setHasError(false);
      onVerify(true);
    } else {
      if (val.length >= String(num1 + num2).length) {
        setHasError(true);
      } else {
        setHasError(false);
      }
      onVerify(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/80 bg-muted/30 p-3 text-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span>Security Verification</span>
        </div>
        <button
          type="button"
          onClick={generateProblem}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
          title="Refresh captcha"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center font-mono font-bold text-sm bg-background border border-border/80 px-3 py-1.5 rounded-lg select-none tracking-widest text-primary shadow-xs">
          {num1} + {num2} = ?
        </div>

        <input
          type="number"
          placeholder="Answer"
          value={userAnswer}
          onChange={handleInputChange}
          disabled={isVerified}
          className="h-8 w-24 rounded-lg border border-border bg-background px-2.5 text-center font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
        />

        {isVerified && (
          <div className="flex items-center gap-1 text-emerald-500 font-semibold text-xs animate-fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Verified</span>
          </div>
        )}
      </div>

      {hasError && !isVerified && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>Incorrect answer. Please solve the equation.</span>
        </p>
      )}
    </div>
  );
}
