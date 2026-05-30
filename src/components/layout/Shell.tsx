import Header from './Header'
import Countdown from './Countdown'

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-brand-white">
      <Header />
      {/* pt offsets the fixed header; pb offsets the fixed countdown strip */}
      <main className="flex-1 pt-[112px] pb-[72px] md:pt-[84px]">
        {children}
      </main>
      <Countdown />
    </div>
  )
}
