// Component Imports
import Fleet from '../_components/fleet'

const FleetPage = () => {
  return <Fleet mapboxAccessToken={process.env.MAPBOX_ACCESS_TOKEN!} />
}

export default FleetPage
