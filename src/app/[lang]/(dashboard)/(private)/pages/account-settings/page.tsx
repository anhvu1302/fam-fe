// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import AccountSettings from './_components'

const AccountTab = dynamic(() => import('./_components/account'))
const SecurityTab = dynamic(() => import('./_components/security'))
const BillingPlansTab = dynamic(() => import('./_components/billing-plans'))
const NotificationsTab = dynamic(() => import('./_components/notifications'))
const ConnectionsTab = dynamic(() => import('./_components/connections'))

// Vars
const tabContentList = (): { [key: string]: ReactElement } => ({
  account: <AccountTab />,
  security: <SecurityTab />,
  'billing-plans': <BillingPlansTab />,
  notifications: <NotificationsTab />,
  connections: <ConnectionsTab />
})

const AccountSettingsPage = () => {
  return <AccountSettings tabContentList={tabContentList()} />
}

export default AccountSettingsPage
