// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// Components Imports
import CardInfluencingInfluencerWithImg from '../../_components/widget-examples/basic/CardInfluencingInfluencerWithImg'
import CardUser from '../../_components/widget-examples/basic/CardUser'
import CardWithCollapse from '../../_components/widget-examples/basic/CardWithCollapse'
import CardMobile from '../../_components/widget-examples/basic/CardMobile'
import CardHorizontalRatings from '../../_components/widget-examples/basic/CardHorizontalRatings'
import CardWatch from '../../_components/widget-examples/basic/CardWatch'
import CardLifetimeMembership from '../../_components/widget-examples/basic/CardLifetimeMembership'
import CardInfluencingInfluencer from '../../_components/widget-examples/basic/CardInfluencingInfluencer'
import CardVerticalRatings from '../../_components/widget-examples/basic/CardVerticalRatings'
import CardSupport from '../../_components/widget-examples/basic/CardSupport'
import CardWithTabs from '../../_components/widget-examples/basic/CardWithTabs'
import CardWithTabsCenter from '../../_components/widget-examples/basic/CardWithTabsCenter'
import CardTwitter from '../../_components/widget-examples/basic/CardTwitter'
import CardFacebook from '../../_components/widget-examples/basic/CardFacebook'
import CardLinkedIn from '../../_components/widget-examples/basic/CardLinkedIn'

const Basic = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h3'>Basic Cards</Typography>
        <Divider />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CardInfluencingInfluencerWithImg />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CardUser />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CardWithCollapse />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CardMobile />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CardHorizontalRatings />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CardWatch />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <CardLifetimeMembership />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CardInfluencingInfluencer />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CardVerticalRatings />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CardSupport />
      </Grid>
      <Grid size={{ xs: 12 }} className='pbs-12'>
        <Typography variant='h3'>Navigation Cards</Typography>
        <Divider />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CardWithTabs />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CardWithTabsCenter />
      </Grid>
      <Grid size={{ xs: 12 }} className='pbs-12'>
        <Typography variant='h3'>Solid Cards</Typography>
        <Divider />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CardTwitter />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CardFacebook />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CardLinkedIn />
      </Grid>
    </Grid>
  )
}

export default Basic
