export default function ContainedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {children}
    </div>
  )
}


