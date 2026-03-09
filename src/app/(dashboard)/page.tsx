import { redirect } from 'next/navigation'

// Корень дашборда → анкеты (основной раздел)
export default function DashboardRoot() {
  redirect('/applications')
}
