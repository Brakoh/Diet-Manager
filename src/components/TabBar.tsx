import { IconFile, IconShop, IconSwap, IconToday } from './icons'

export type TabId = 'oggi' | 'sostituzioni' | 'spesa' | 'file'

const TABS: { id: TabId; label: string; icon: typeof IconToday }[] = [
  { id: 'oggi', label: 'Oggi', icon: IconToday },
  { id: 'sostituzioni', label: 'Sostituzioni', icon: IconSwap },
  { id: 'spesa', label: 'Spesa', icon: IconShop },
  { id: 'file', label: 'File', icon: IconFile },
]

export function TabBar({ tab, onTab }: { tab: TabId; onTab: (tab: TabId) => void }) {
  return (
    <nav className="tabbar" aria-label="Sezioni">
      {TABS.map((item) => {
        const Icon = item.icon
        const active = tab === item.id
        return (
          <button
            key={item.id}
            type="button"
            className="tab"
            aria-current={active ? 'page' : undefined}
            data-testid={`tab-${item.id}`}
            onClick={() => onTab(item.id)}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
