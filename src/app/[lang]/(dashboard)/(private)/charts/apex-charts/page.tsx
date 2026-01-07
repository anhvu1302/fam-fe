// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// Component Imports
import ApexBarChart from './_components/ApexBarChart'
import ApexAreaChart from './_components/ApexAreaChart'
import ApexLineChart from './_components/ApexLineChart'
import ApexRadarChart from './_components/ApexRadarChart'
import ApexDonutChart from './_components/ApexDonutChart'
import ApexColumnChart from './_components/ApexColumnChart'
import ApexScatterChart from './_components/ApexScatterChart'
import ApexHeatmapChart from './_components/ApexHeatmapChart'
import ApexRadialBarChart from './_components/ApexRadialBarChart'
import ApexCandlestickChart from './_components/ApexCandlestickChart'

const ApexCharts = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>ApexCharts</Typography>
        <Typography>
          <code>react-apexcharts</code> is a third-party library. Please refer to its{' '}
          <Link
            href='https://apexcharts.com'
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
        <ApexAreaChart />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ApexColumnChart />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ApexScatterChart />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ApexLineChart />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ApexBarChart />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ApexCandlestickChart />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ApexHeatmapChart />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ApexRadialBarChart />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ApexRadarChart />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ApexDonutChart />
      </Grid>
    </Grid>
  )
}

export default ApexCharts
