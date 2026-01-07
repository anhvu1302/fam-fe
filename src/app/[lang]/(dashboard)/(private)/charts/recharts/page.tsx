// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// Component Imports
import RechartsBarChart from './_components/RechartsBarChart'
import RechartsPieChart from './_components/RechartsPieChart'
import RechartsLineChart from './_components/RechartsLineChart'
import RechartsAreaChart from './_components/RechartsAreaChart'
import RechartsRadarChart from './_components/RechartsRadarChart'
import RechartsScatterChart from './_components/RechartsScatterChart'

const Recharts = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Recharts</Typography>
        <Typography>
          <code>recharts</code> is a third-party library. Please refer to its{' '}
          <Link
            href='https://recharts.org'
            target='_blank'
            rel='noopener noreferrer'
            className='no-underline text-primary'
          >
            official documentation
          </Link>{' '}
          for more details.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <RechartsLineChart />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <RechartsAreaChart />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <RechartsScatterChart />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <RechartsBarChart />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <RechartsRadarChart />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <RechartsPieChart />
      </Grid>
    </Grid>
  )
}

export default Recharts
