export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f8f9fa] via-white to-[#e7e8e9] p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
