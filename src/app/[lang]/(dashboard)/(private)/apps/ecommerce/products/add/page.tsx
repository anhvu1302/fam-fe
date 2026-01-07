// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import ProductAddHeader from '../../_components/products/add/ProductAddHeader'
import ProductInformation from '../../_components/products/add/ProductInformation'
import ProductImage from '../../_components/products/add/ProductImage'
import ProductVariants from '../../_components/products/add/ProductVariants'
import ProductInventory from '../../_components/products/add/ProductInventory'
import ProductPricing from '../../_components/products/add/ProductPricing'
import ProductOrganize from '../../_components/products/add/ProductOrganize'

const eCommerceProductsAdd = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ProductAddHeader />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <ProductInformation />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ProductImage />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ProductVariants />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ProductInventory />
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <ProductPricing />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ProductOrganize />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default eCommerceProductsAdd
