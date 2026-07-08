import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="from-brand-from via-brand-via to-brand-to pointer-events-none absolute inset-x-0 -top-1/2 h-[60rem] -translate-y-1/2 bg-gradient-to-br opacity-20 blur-3xl"
      />
      <Link
        href="/"
        className="font-heading relative z-10 mb-8 text-xl font-semibold tracking-tight"
      >
        MemeForge
      </Link>
      <div className="glass-panel shadow-soft-lg relative z-10 w-full max-w-sm rounded-2xl p-8">
        {children}
      </div>
    </div>
  );
}
