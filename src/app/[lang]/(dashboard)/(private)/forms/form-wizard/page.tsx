// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// Component Imports
import StepperLinearWithValidation from './_components/StepperLinearWithValidation'
import StepperAlternativeLabel from './_components/StepperAlternativeLabel'
import StepperVerticalWithNumbers from './_components/StepperVerticalWithNumbers'
import StepperVerticalWithoutNumbers from './_components/StepperVerticalWithoutNumbers'
import StepperCustomHorizontal from './_components/StepperCustomHorizontal'
import StepperCustomVertical from './_components/StepperCustomVertical'

const FormWizard = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Stepper</Typography>
        <Typography>
          Please refer to MUI&#39;s official docs for more details on component&#39;s{' '}
          <Link
            href='https://mui.com/material-ui/react-stepper'
            target='_blank'
            rel='noopener noreferrer'
            className='no-underline text-primary'
          >
            usage guide
          </Link>{' '}
          and{' '}
          <Link
            href='https://mui.com/material-ui/react-stepper/#api'
            target='_blank'
            rel='noopener noreferrer'
            className='no-underline text-primary'
          >
            API documentation
          </Link>
          .
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h5'>Linear Stepper with Validation</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <StepperLinearWithValidation />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h5'>Alternative Label</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <StepperAlternativeLabel />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <StepperVerticalWithNumbers />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <StepperVerticalWithoutNumbers />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h5'>Custom Horizontal Stepper</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <StepperCustomHorizontal />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h5'>Custom Vertical Stepper</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <StepperCustomVertical />
      </Grid>
    </Grid>
  )
}

export default FormWizard
