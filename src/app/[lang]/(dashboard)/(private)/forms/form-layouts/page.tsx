// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// Component Imports
import FormLayoutsBasic from './_components/FormLayoutsBasic'
import FormLayoutsIcon from './_components/FormLayoutsIcons'
import FormLayoutsSeparator from './_components/FormLayoutsSeparator'
import FormLayoutsTabs from './_components/FormLayoutsTabs'
import FormLayoutsCollapsible from './_components/FormLayoutsCollapsible'
import FormLayoutsAlignment from './_components/FormLayoutsAlignment'

const FormLayouts = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormLayoutsBasic />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormLayoutsIcon />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FormLayoutsSeparator />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h5'>Form with Tabs</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FormLayoutsTabs />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h5'>Collapsible Sections</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FormLayoutsCollapsible />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FormLayoutsAlignment />
      </Grid>
    </Grid>
  )
}

export default FormLayouts
