import type { Metadata } from 'next'
import './globals.css'
import { AppShell } from '@/components/layout/AppShell'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: '钉钉考勤与薪酬管理系统',
  description: '企业考勤与薪酬一体化管理平台',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <AppShell>{children}</AppShell>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontSize: '14px',
              borderRadius: '10px',
              background: '#1e293b',
              color: '#fff',
            }
          }}
        />
      </body>
    </html>
  )
}
