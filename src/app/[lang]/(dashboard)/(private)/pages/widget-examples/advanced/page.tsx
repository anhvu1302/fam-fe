// MUI Imports
import Grid from '@mui/material/Grid'

// Components Imports
import MonthlyCampaignState from '../../_components/widget-examples/advanced/MonthlyCampaignState'
import ActiveProjects from '../../_components/widget-examples/advanced/ActiveProjects'
import SourceVisits from '../../_components/widget-examples/advanced/SourceVisits'
import SalesByCountries from '../../_components/widget-examples/advanced/SalesByCountries'
import EarningReports from '../../_components/widget-examples/advanced/EarningReports'
import BrowserStates from '../../_components/widget-examples/advanced/BrowserStates'
import Orders from '../../_components/widget-examples/advanced/Orders'
import Transactions from '../../_components/widget-examples/advanced/Transactions'
import PopularProducts from '../../_components/widget-examples/advanced/PopularProducts'
import TopCourses from '../../_components/widget-examples/advanced/TopCourses'
import UpcomingWebinar from '../../_components/widget-examples/advanced/UpcomingWebinar'
import AssignmentProgress from '../../_components/widget-examples/advanced/AssignmentProgress'
import DeliveryPerformance from '../../_components/widget-examples/advanced/DeliveryPerformance'
import VehicleCondition from '../../_components/widget-examples/advanced/VehicleCondition'
import PopularInstructors from '../../_components/widget-examples/advanced/PopularInstructors'
import LastTransaction from '../../_components/widget-examples/advanced/LastTransaction'
import ActivityTimeline from '../../_components/widget-examples/advanced/ActivityTimeline'
import WebsiteAnalyticsSlider from '../../_components/widget-examples/advanced/WebsiteAnalyticsSlider'
import Congratulations from '../../_components/widget-examples/advanced/Congratulations'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const Advanced = async () => {
  // Vars
  const serverMode = await getServerMode()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <MonthlyCampaignState />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <ActiveProjects />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <SourceVisits />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <SalesByCountries />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <EarningReports />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <BrowserStates />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Orders />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Transactions />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <PopularProducts />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <TopCourses />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <UpcomingWebinar />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <AssignmentProgress />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <DeliveryPerformance />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <VehicleCondition />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <PopularInstructors />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <LastTransaction serverMode={serverMode} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ActivityTimeline />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <WebsiteAnalyticsSlider />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Congratulations />
      </Grid>
    </Grid>
  )
}

export default Advanced
