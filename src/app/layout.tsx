import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: '钉钉考勤与薪酬管理系统',
  description: '企业考勤与薪酬一体化管理平台',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
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
