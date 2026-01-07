// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import DialogAddCard from '../_components/dialog-examples/DialogAddCard'
import DialogEditUserInfo from '../_components/dialog-examples/DialogEditUserInfo'
import DialogAuthentication from '../_components/dialog-examples/DialogAuthentication'
import DialogAddNewAddress from '../_components/dialog-examples/DialogAddNewAddress'
import DialogShareProject from '../_components/dialog-examples/DialogShareProject'
import DialogReferEarn from '../_components/dialog-examples/DialogReferEarn'
import DialogPaymentMethod from '../_components/dialog-examples/DialogPaymentMethod'
import DialogPaymentProviders from '../_components/dialog-examples/DialogPaymentProviders'
import DialogCreateApp from '../_components/dialog-examples/DialogCreateApp'
import DialogPricing from '../_components/dialog-examples/DialogPricing'

// Data Imports
import { getPricingData } from '@/app/server/actions'

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/pages/pricing` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */

/* const getPricingData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/pages/pricing`)

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json()
} */

const DialogExamples = async () => {
  // Vars
  const data = await getPricingData()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DialogAddCard />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DialogEditUserInfo />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DialogAuthentication />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DialogAddNewAddress />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DialogShareProject />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DialogReferEarn />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DialogPaymentMethod />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DialogPaymentProviders />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DialogPricing data={data} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DialogCreateApp />
      </Grid>
    </Grid>
  )
}

export default DialogExamples
