// Component Imports
import TwoStepsV2 from '../../_components/auth/TwoStepsV2'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const TwoStepsV2Page = async () => {
  // Vars
  const mode = await getServerMode()

  return <TwoStepsV2 mode={mode} />
}

export default TwoStepsV2Page
