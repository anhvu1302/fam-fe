// MUI Imports
import Grid from '@mui/material/Grid'

// Components Imports
import CardActionsTable from '../../_components/widget-examples/actions/Table'
import CardActionCollapsible from '../../_components/widget-examples/actions/Collapsible'
import CardActionRefreshContent from '../../_components/widget-examples/actions/RefreshContent'
import CardActionRemoveCard from '../../_components/widget-examples/actions/RemoveCard'
import CardActionAll from '../../_components/widget-examples/actions/AllActions'

const Actions = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CardActionsTable />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CardActionCollapsible />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CardActionRefreshContent />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CardActionRemoveCard />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CardActionAll />
      </Grid>
    </Grid>
  )
}

export default Actions
