import axios from 'axios'

const QUALITY_SERVICE = import.meta.env.VITE_QUALITY_SERVICE
const PARTNER = import.meta.env.VITE_PARTNER
const BASE_SERVER = import.meta.env.VITE_SERVER
const VITE_SERVER_DATA = import.meta.env.VITE_SERVER_DATA
const VITE_RELAY = import.meta.env.VITE_RELAY
//Master Data
export const backendProduct = axios.create({
  baseURL: `${VITE_SERVER_DATA}/api/v2/master-data/products`,
})

export const backendSupplier = axios.create({
  baseURL: `${VITE_SERVER_DATA}/api/v2/master-data/suppliers`,
})

export const backendProductTypes = axios.create({
  baseURL: `${VITE_SERVER_DATA}/api/v2/master-data/product-types`,
})

export const backendLevelInspection = axios.create({
  baseURL: `${VITE_SERVER_DATA}/api/v2/master-datalevel-inspections`,
})

//Receiving
export const backendReceiving = axios.create({
  baseURL: `${VITE_SERVER_DATA}/api/v2/receiving`,
})

export const backendTracking = axios.create({
  baseURL: `${VITE_SERVER_DATA}/api/v2/tracking`,
})

//QC Jika pakai 221
export const backendQc = axios.create({
  baseURL: `${QUALITY_SERVICE}/api/v1/quality-service`,
})

//QC Jika pakai 226 & 223 cukup pakai Vite Server Data
// export const backendQc = axios.create({
//   baseURL: `${VITE_SERVER_DATA}/api/v1/quality-service`,
// })

//Backend QC
export const backendQualityService = axios.create({
  baseURL: QUALITY_SERVICE,
})

//Warehouse
// export const backendWh = axios.create({
//   baseURL: `${VITE_SERVER_DATA}/api/v2/warehouse`,
// })
export const backendWhNew = axios.create({
  baseURL: `${VITE_SERVER_DATA}/api/v2/warehouse-new`,
})

//Generate Serial number
export const backendGenerate = axios.create({
  baseURL: `${VITE_SERVER_DATA}/api/v2/generate-pln`,
})

//Luhn
export const backendLuhn = axios.create({
  baseURL: `${VITE_SERVER_DATA}/api/v2/luhn-algorithm`,
})

//Assembly
export const backendAssembly = axios.create({
  baseURL: `${VITE_SERVER_DATA}/api/v2/assembly`,
})

//Shipping
export const backendShipping = axios.create({
  baseURL: `${VITE_SERVER_DATA}/api/v2/shipping`,
})

//uploadFile
export const backendUploadFile = axios.create({
  baseURL: `${VITE_SERVER_DATA}/api/v1/upload-service`,
})

//auth
export const backendAuth = axios.create({
  baseURL: `${VITE_SERVER_DATA}/api/v2/auth`,
})

//CDN Backend for document upload (Arsy)
export const cdnBackend = axios.create({
  baseURL: `${VITE_SERVER_DATA}/api/v2/cdn`,
})

//relay
export const backendRelay = axios.create({
  baseURL: `${VITE_RELAY}`,
})

// export const backendPartner = axios.create({
//   baseURL: `${BASE_SERVER}/v1/partner`,
// })

export const backendIncoming = axios.create({
  baseURL: `${BASE_SERVER}/v1/receiving-products`,
})

export const backendTrackedItems = axios.create({
  baseURL: `${BASE_SERVER}/v1/tracked-items`,
})

export const backendAql = axios.create({
  baseURL: `${BASE_SERVER}/v1/aql`,
})

export const backendWarehouse = axios.create({
  baseURL: `${BASE_SERVER}/v1/warehouses`,
})

export const backendPartner = axios.create({
  baseURL: PARTNER,
})
