"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { TOKENS } from "@/lib/tokens";

export function SectionShell({
  number,
  title,
  subtitle,
  children,
  defaultOpen = true,
}: {
  number: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: `1px solid ${TOKENS.mist}` }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 px-1 text-left"
        style={{ background: "transparent" }}
      >
        <div className="flex items-center gap-3">
          <span
            style={{ fontFamily: "var(--font-plex-mono)", fontSize: "12px", color: TOKENS.slate, letterSpacing: "0.05em" }}
          >
            {number}
          </span>
          <div>
            <div style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "15px", fontWeight: 600, color: TOKENS.ink }}>
              {title}
            </div>
            {subtitle ? <div style={{ fontSize: "12px", color: TOKENS.slate, marginTop: "2px" }}>{subtitle}</div> : null}
          </div>
        </div>
        {open ? <ChevronUp size={16} color={TOKENS.slate} /> : <ChevronDown size={16} color={TOKENS.slate} />}
      </button>
      {open ? <div className="pb-5 px-1">{children}</div> : null}
    </div>
  );
}

export function Field({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block mb-3">
      <span
        style={{
          fontSize: "11px",
          fontFamily: "var(--font-plex-mono)",
          color: TOKENS.slate,
          letterSpacing: "0.03em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <input
        {...props}
        className="w-full mt-1 px-3 py-2 rounded outline-none transition"
        style={{
          border: `1px solid ${TOKENS.mist}`,
          fontFamily: "var(--font-plex-sans)",
          fontSize: "13.5px",
          color: TOKENS.ink,
          background: "#fff",
        }}
        onFocus={(e) => (e.target.style.borderColor = TOKENS.blue)}
        onBlur={(e) => (e.target.style.borderColor = TOKENS.mist)}
      />
    </label>
  );
}

export function TextArea({ label, ...props }: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block mb-3">
      <span
        style={{
          fontSize: "11px",
          fontFamily: "var(--font-plex-mono)",
          color: TOKENS.slate,
          letterSpacing: "0.03em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <textarea
        {...props}
        className="w-full mt-1 px-3 py-2 rounded outline-none transition"
        style={{
          border: `1px solid ${TOKENS.mist}`,
          fontFamily: "var(--font-plex-sans)",
          fontSize: "13.5px",
          color: TOKENS.ink,
          background: "#fff",
          resize: "vertical",
          minHeight: "70px",
        }}
        onFocus={(e) => (e.target.style.borderColor = TOKENS.blue)}
        onBlur={(e) => (e.target.style.borderColor = TOKENS.mist)}
      />
    </label>
  );
}

export function IconBtn({
  onClick,
  children,
  danger,
  disabled,
}: {
  onClick: () => void;
  children: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 px-2 py-1 rounded transition disabled:opacity-50"
      style={{
        fontFamily: "var(--font-plex-mono)",
        fontSize: "11px",
        color: danger ? TOKENS.red : TOKENS.blue,
        border: `1px solid ${danger ? "#E7C9C2" : TOKENS.mist}`,
        background: "#fff",
      }}
    >
      {children}
    </button>
  );
}

export function PreviewSection({ title, accent, children }: { title: string; accent: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "11.5px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: accent,
          borderBottom: `1.5px solid ${accent}`,
          paddingBottom: 3,
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
