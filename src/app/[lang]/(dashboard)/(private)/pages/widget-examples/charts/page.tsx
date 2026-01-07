// MUI Imports
import Grid from '@mui/material/Grid'

// Components Imports
import EarningReports from '../../_components/widget-examples/charts/EarningReports'
import SupportTracker from '../../_components/widget-examples/charts/SupportTracker'
import Sales from '../../_components/widget-examples/charts/Sales'
import RevenueReport from '../../_components/widget-examples/charts/RevenueReport'
import ProjectStatus from '../../_components/widget-examples/charts/ProjectStatus'
import EarningReportsWithTabs from '../../_components/widget-examples/charts/EarningReportsWithTabs'
import TotalEarning from '../../_components/widget-examples/charts/TotalEarning'
import CarrierPerformance from '../../_components/widget-examples/charts/CarrierPerformance'
import DeliveryExceptions from '../../_components/widget-examples/charts/DeliveryExceptions'
import VehicleOverview from '../../_components/widget-examples/charts/VehicleOverview'
import InterestedTopics from '../../_components/widget-examples/charts/InterestedTopics'

const Charts = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }}>
        <EarningReports />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SupportTracker />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Sales />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <RevenueReport />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <ProjectStatus />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <EarningReportsWithTabs />
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <TotalEarning />
      </Grid>
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <CarrierPerformance />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <DeliveryExceptions />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 8 }}>
        <VehicleOverview />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <InterestedTopics />
      </Grid>
    </Grid>
  )
}

export default Charts
