// Component Imports
import EmailWrapper from '../_components'

const EmailFolderPage = async (props: { params: Promise<{ folder: string }> }) => {
  const params = await props.params

  return <EmailWrapper folder={params.folder} />
}

export default EmailFolderPage
