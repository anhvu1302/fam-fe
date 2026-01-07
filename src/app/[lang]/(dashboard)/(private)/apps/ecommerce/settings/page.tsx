// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import Settings from '../_components/settings'

const StoreDetailsTab = dynamic(() => import('../_components/settings/store-details'))
const PaymentsTab = dynamic(() => import('../_components/settings/payments'))
const CheckoutTab = dynamic(() => import('../_components/settings/checkout'))
const ShippingDeliveryTab = dynamic(() => import('../_components/settings/ShippingDelivery'))
const LocationsTab = dynamic(() => import('../_components/settings/locations'))
const NotificationsTab = dynamic(() => import('../_components/settings/Notifications'))

// Vars
const tabContentList = (): { [key: string]: ReactElement } => ({
  'store-details': <StoreDetailsTab />,
  payments: <PaymentsTab />,
  checkout: <CheckoutTab />,
  'shipping-delivery': <ShippingDeliveryTab />,
  locations: <LocationsTab />,
  notifications: <NotificationsTab />
})

const eCommerceSettings = () => {
  return <Settings tabContentList={tabContentList()} />
}

export default eCommerceSettings
