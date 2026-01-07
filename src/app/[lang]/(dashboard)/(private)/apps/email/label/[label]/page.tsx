// Component Imports
import EmailWrapper from '../../_components'

const EmailLabelPage = async (props: { params: Promise<{ label: string }> }) => {
  const params = await props.params

  return <EmailWrapper label={params.label} />
}

export default EmailLabelPage
