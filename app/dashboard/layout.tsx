import { ClientProvider } from '@/lib/clients/context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientProvider>{children}</ClientProvider>
}
