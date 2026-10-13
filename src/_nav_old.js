import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBarcode,
  cilBell,
  cilCalculator,
  cilChartLine,
  cilChartPie,
  cilCheckAlt,
  cilCog,
  cilCursor,
  cilDescription,
  cilDrop,
  cilExternalLink,
  cilFactory,
  cilGroup,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilShareBoxed,
  cilSpeedometer,
  cilSpreadsheet,
  cilStar,
  cilStorage,
  cilTag,
  cilTask,
  cilTruck,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      // text: 'NEW',
    },
  },
  {
    component: CNavTitle,
    name: 'Receiving Products',
  },
  {
    component: CNavItem,
    name: 'Purchase Order',
    to: '/receiving/purchaseOrder',
    icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Receiving Products',
    to: '/receiving/receivingHeader',
    icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Receiving List',
    to: '/receiving/receivingList',
    icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Receiving Serial QC',
    to: '/receiving/receivingserialqc',
    icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Non Serial QC List',
    to: '/receiving/receivingnonseriallist',
    icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Tracking',
  },
  {
    component: CNavItem,
    name: 'Tracking Production List',
    to: '/tracking/list',
    icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Tracking Final Product',
    to: '/tracking/finalproduct',
    icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
  },
  // {
  //   component: CNavTitle,
  //   name: 'Semi Production',
  // },
  // {
  //   component: CNavItem,
  //   name: 'Incoming Unit',
  //   to: '/semiproduction/incoming',
  //   icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavItem,
  //   name: 'Incoming Unit',
  //   to: '/semiproduction/praqc',
  //   icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavItem,
  //   name: 'QC Units',
  //   to: '/semiproduction/qcunits',
  //   icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavItem,
  //   name: 'Report QC Units',
  //   to: '/semiproduction/reportqcunit',
  //   icon: <CIcon icon={cilSpreadsheet} customClassName="nav-icon" />,
  // },
  {
    component: CNavTitle,
    name: 'Production',
  },
  // {
  //   component: CNavItem,
  //   name: 'AQL Non Barcode',
  //   to: '/production/aqlNonBarcode',
  //   icon: <CIcon icon={cilFactory} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavItem,
  //   name: 'AQL Units',
  //   to: '/production/nonAqlUnits',
  //   icon: <CIcon icon={cilFactory} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavItem,
  //   name: 'Batch Production',
  //   to: '/production/batch',
  //   icon: <CIcon icon={cilFactory} customClassName="nav-icon" />,
  // },

  {
    component: CNavGroup,
    name: 'Assembly',
    to: '/production/assembly',
    icon: <CIcon icon={cilCog} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Create PLN Order',
        to: '/production/assembly/plnorder',
      },
      {
        component: CNavItem,
        name: 'Req. Assembly Order',
        to: '/production/assembly/assemblyorder',
      },
      {
        component: CNavItem,
        name: 'Assembly Serial List',
        to: '/production/assembly/assemblyseriallist',
      },
      {
        component: CNavItem,
        name: 'Scan Before',
        to: '/production/assembly/before',
      },
      // {
      //   component: CNavItem,
      //   name: 'Quality Control',
      //   to: '/production/assembly/qc',
      // },
      {
        component: CNavItem,
        name: 'QC Assembly',
        to: '/production/serialnoaql/QC-AT003/Assembly',
      },
      // {
      //   component: CNavItem,
      //   name: 'Scan After',
      //   to: '/production/assembly/after',
      // },
    ],
  },
  // {
  //   component: CNavGroup,
  //   name: 'On Test',
  //   to: '/production/on',
  //   icon: <CIcon icon={cilCog} customClassName="nav-icon" />,
  //   items: [
  //     // {
  //     //   component: CNavItem,
  //     //   name: 'Scan Before',
  //     //   to: '/production/on/before',
  //     // },
  //     // {
  //     //   component: CNavItem,
  //     //   name: 'Quality Control',
  //     //   to: '/production/on/qc',
  //     // },
  //     {
  //       component: CNavItem,
  //       name: 'QC Test ON',
  //       to: '/production/serialnoaql/QC-OT004/Test ON',
  //     },

  //     // {
  //     //   component: CNavItem,
  //     //   name: 'Scan After',
  //     //   to: '/production/on/after',
  //     // },
  //   ],
  // },
  // {
  //   component: CNavGroup,
  //   name: 'Hipot Test',
  //   to: '/production/hipot',
  //   icon: <CIcon icon={cilCog} customClassName="nav-icon" />,
  //   items: [
  //     // {
  //     //   component: CNavItem,
  //     //   name: 'Scan Before',
  //     //   to: '/production/hipot/before',
  //     // },
  //     // {
  //     //   component: CNavItem,
  //     //   name: 'Quality Control',
  //     //   to: '/production/hipot/qc',
  //     // },
  //     {
  //       component: CNavItem,
  //       name: 'QC Hipot Test',
  //       to: '/production/serialnoaql/QC-HT005/Hipot Test',
  //     },
  //     // {
  //     //   component: CNavItem,
  //     //   name: 'Scan After',
  //     //   to: '/production/hipot/after',
  //     // },
  //   ],
  // },
  {
    component: CNavGroup,
    name: 'Calibration & Ultrasonic',
    to: '/production/calibration',
    icon: <CIcon icon={cilCog} customClassName="nav-icon" />,
    items: [
      // {
      //   component: CNavItem,
      //   name: 'Scan Before',
      //   to: '/production/calibration/before',
      // },
      // {
      //   component: CNavItem,
      //   name: 'Quality Control',
      //   to: '/production/calibration/qc',
      // },
      // {
      //   component: CNavItem,
      //   name: 'Scan After',
      //   to: '/production/calibration/after',
      // },
      {
        component: CNavItem,
        name: 'QC Calibration 1',
        to: '/production/serialnoaql/QC-CT006/Calibration 1 Test',
      },
      {
        component: CNavItem,
        name: 'QC Ultrasonic',
        to: '/production/serialnoaql/QC-U015/Ultrasonic Test',
      },
      {
        component: CNavItem,
        name: 'QC Calibration 2',
        to: '/production/serialnoaql/QC-CT2014/Calibration 2 Test',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Aging Test',
    to: '/production/aging',
    icon: <CIcon icon={cilCog} customClassName="nav-icon" />,
    items: [
      // {
      //   component: CNavItem,
      //   name: 'Batching',
      //   to: '/production/aging/batching',
      // },
      {
        component: CNavItem,
        name: 'Scan Before',
        to: '/production/aging/before',
      },
      // {
      //   component: CNavItem,
      //   name: 'Quality Control',
      //   to: '/production/aging/qc',
      // },
      {
        component: CNavItem,
        name: 'QC Aging',
        to: '/production/serialaql/QC-AT007/Aging',
      },
      // {
      //   component: CNavItem,
      //   name: 'Scan After',
      //   to: '/production/aging/after',
      // },
    ],
  },
  {
    component: CNavGroup,
    name: 'Ref. Meter',
    to: '/production/refmeter',
    icon: <CIcon icon={cilCog} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'QC Ref. Meter',
        to: '/production/serialaql/QC-RN013/QC Ref. Meter',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Finishing',
    to: '/production/finishing/clearzero',
    icon: <CIcon icon={cilCog} customClassName="nav-icon" />,
    items: [
      // {
      //   component: CNavItem,
      //   name: 'Scan Before',
      //   to: '/production/clearzero/before',
      // },
      // {
      //   component: CNavItem,
      //   name: 'Quality Control',
      //   to: '/production/clearzero/qc',
      // },
      // {
      //   component: CNavItem,
      //   name: 'Scan After',
      //   to: '/production/clearzero/after',
      // },
      // {
      //   component: CNavItem,
      //   name: 'QC Clear Zero 1',
      //   to: '/production/serialnoaql/QC-CZ1008/Clear Zero 1',
      // },
      // {
      //   component: CNavItem,
      //   name: 'Closing Cover',
      //   to: '/production/serialnoaql/QC-CC009/Closing Cover',
      // },
      // {
      //   component: CNavItem,
      //   name: 'QC Clear Zero 2',
      //   to: '/production/serialnoaql/QC-CZ2010/Clear Zero 2',
      // },
      {
        component: CNavItem,
        name: 'SCAN PLN Serial',
        to: '/production/finishing/scansidepln',
      },
      {
        component: CNavItem,
        name: 'Print Laser Post 1',
        to: '/production/finishing/printlaser/post1',
      },
      {
        component: CNavItem,
        name: 'Print Laser Post 2',
        to: '/production/finishing/printlaser/post2',
      },
      {
        component: CNavItem,
        name: 'Check Side & Cover Serial',
        to: '/production/finishing/comparePlnSerial',
      },
    ],
  },
  // {
  //   component: CNavGroup,
  //   name: 'Closing Cover',
  //   to: '/production/closingcover',
  //   icon: <CIcon icon={cilCog} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'Scan Before',
  //       to: '/production/closingcover/before',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Quality Control',
  //       to: '/production/closingcover/qc',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Scan After',
  //       to: '/production/closingcover/after',
  //     },
  //   ],
  // },
  {
    component: CNavTitle,
    name: 'Product',
  },
  {
    component: CNavItem,
    name: 'SAP Product',
    to: '/admin/product',
    icon: <CIcon icon={cilTag} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'SAP Supplier',
    to: '/admin/supplier',
    icon: <CIcon icon={cilTag} customClassName="nav-icon" />,
  },
  // {
  //   component: CNavTitle,
  //   name: 'Inventory',
  // },
  // {
  //   component: CNavItem,
  //   name: 'Inventory',
  //   to: '/inventory',
  //   icon: <CIcon icon={cilStorage} customClassName="nav-icon" />,
  // },
  {
    component: CNavTitle,
    name: 'Warehouse',
  },
  {
    component: CNavItem,
    name: 'Acc. Assembly Order',
    to: '/warehouse/outgoing/assemblyorder',
    icon: <CIcon icon={cilStorage} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'WH Stock (Opname)',
    to: '/warehouse/stock/WarehouseStock',
    icon: <CIcon icon={cilStorage} customClassName="nav-icon" />,
  },
  // {
  //   component: CNavItem,
  //   name: 'Incoming',
  //   to: '/warehouse/incoming',
  //   icon: <CIcon icon={cilStorage} customClassName="nav-icon" />,
  // },

  // {
  //   component: CNavItem,
  //   name: 'Outcoming',
  //   to: '/warehouse/outcoming',
  //   icon: <CIcon icon={cilStorage} customClassName="nav-icon" />,
  // },
  {
    component: CNavItem,
    name: 'WH Data Master',
    to: '/warehouse/warehouseMaster',
    icon: <CIcon icon={cilStorage} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Req. Receiving to WH',
    to: '/warehouse/receivingwhrequest',
    icon: <CIcon icon={cilStorage} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Req. Assembly to WH',
    to: '/warehouse/assemblywhrequest',
    icon: <CIcon icon={cilStorage} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Serial Stock Confirm',
    to: '/warehouse/serialstockconfirm',
    icon: <CIcon icon={cilStorage} customClassName="nav-icon" />,
  },

  {
    component: CNavTitle,
    name: 'Delivery',
  },
  {
    component: CNavGroup,
    name: 'Packing',
    to: '/delivery/packing',
    icon: <CIcon icon={cilShareBoxed} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Scan Packing 1',
        to: '/delivery/packing/before',
      },
      {
        component: CNavItem,
        name: 'Scan Packing 2',
        to: '/delivery/packing/after',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Scan',
    to: '/delivery/scan',
    icon: <CIcon icon={cilBarcode} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Admins',
  },
  {
    component: CNavItem,
    name: 'Generate PLN Serial',
    to: '/admin/generate/plnserial',
    icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Confirm Lassered Serial',
    to: '/admin/generate/confirmlassered',
    icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />,
  },
  // {
  //   component: CNavItem,
  //   name: 'AQL Setting',
  //   to: '/admin/aql',
  //   icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavItem,
  //   name: 'Delivery',
  //   to: '/admin/delivery',
  //   icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavItem,
  //   name: 'Dynamic Question',
  //   to: '/admin/dynamicquestion',
  //   icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavItem,
  //   name: 'Incoming',
  //   to: '/admin/incoming',
  //   icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
  // },

  // {
  //   component: CNavItem,
  //   name: 'Semi Product',
  //   to: '/admin/semiproduct',
  //   icon: <CIcon icon={cilTag} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavItem,
  //   name: 'Partner',
  //   to: '/admin/partner',
  //   icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavItem,
  //   name: 'Warehouses',
  //   to: '/admin/warehouse',
  //   icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavItem,
  //   name: 'Warehouses Approval',
  //   to: '/admin/warehouse/approval',
  //   icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavItem,
  //   name: 'Stock Balance',
  //   to: '/admin/warehouse/stock/balance',
  //   icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavItem,
  //   name: 'Stock Movement',
  //   to: '/admin/warehouse/stock/movement',
  //   icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
  // },

  // {
  //   component: CNavTitle,
  //   name: 'Theme',
  // },
  // {
  //   component: CNavItem,
  //   name: 'Colors',
  //   to: '/theme/colors',
  //   icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavItem,
  //   name: 'Typography',
  //   to: '/theme/typography',
  //   icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavTitle,
  //   name: 'Components',
  // },
  // {
  //   component: CNavGroup,
  //   name: 'Base',
  //   to: '/base',
  //   icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'Accordion',
  //       to: '/base/accordion',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Breadcrumb',
  //       to: '/base/breadcrumbs',
  //     },
  //     {
  //       component: CNavItem,
  //       name: (
  //         <React.Fragment>
  //           {'Calendar'}
  //           <CIcon icon={cilExternalLink} size="sm" className="ms-2" />
  //         </React.Fragment>
  //       ),
  //       href: 'https://coreui.io/react/docs/components/calendar/',
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Cards',
  //       to: '/base/cards',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Carousel',
  //       to: '/base/carousels',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Collapse',
  //       to: '/base/collapses',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'List group',
  //       to: '/base/list-groups',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Navs & Tabs',
  //       to: '/base/navs',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Pagination',
  //       to: '/base/paginations',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Placeholders',
  //       to: '/base/placeholders',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Popovers',
  //       to: '/base/popovers',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Progress',
  //       to: '/base/progress',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Smart Pagination',
  //       href: 'https://coreui.io/react/docs/components/smart-pagination/',
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //     {
  //       component: CNavItem,
  //       name: (
  //         <React.Fragment>
  //           {'Smart Table'}
  //           <CIcon icon={cilExternalLink} size="sm" className="ms-2" />
  //         </React.Fragment>
  //       ),
  //       href: 'https://coreui.io/react/docs/components/smart-table/',
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Spinners',
  //       to: '/base/spinners',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Tables',
  //       to: '/base/tables',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Tabs',
  //       to: '/base/tabs',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Tooltips',
  //       to: '/base/tooltips',
  //     },
  //     {
  //       component: CNavItem,
  //       name: (
  //         <React.Fragment>
  //           {'Virtual Scroller'}
  //           <CIcon icon={cilExternalLink} size="sm" className="ms-2" />
  //         </React.Fragment>
  //       ),
  //       href: 'https://coreui.io/react/docs/components/virtual-scroller/',
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //   ],
  // },
  // {
  //   component: CNavGroup,
  //   name: 'Buttons',
  //   to: '/buttons',
  //   icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'Buttons',
  //       to: '/buttons/buttons',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Buttons groups',
  //       to: '/buttons/button-groups',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Dropdowns',
  //       to: '/buttons/dropdowns',
  //     },
  //     {
  //       component: CNavItem,
  //       name: (
  //         <React.Fragment>
  //           {'Loading Button'}
  //           <CIcon icon={cilExternalLink} size="sm" className="ms-2" />
  //         </React.Fragment>
  //       ),
  //       href: 'https://coreui.io/react/docs/components/loading-button/',
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //   ],
  // },
  // {
  //   component: CNavGroup,
  //   name: 'Forms',
  //   icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'Form Control',
  //       to: '/forms/form-control',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Select',
  //       to: '/forms/select',
  //     },
  //     {
  //       component: CNavItem,
  //       name: (
  //         <React.Fragment>
  //           {'Multi Select'}
  //           <CIcon icon={cilExternalLink} size="sm" className="ms-2" />
  //         </React.Fragment>
  //       ),
  //       href: 'https://coreui.io/react/docs/forms/multi-select/',
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Checks & Radios',
  //       to: '/forms/checks-radios',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Range',
  //       to: '/forms/range',
  //     },
  //     {
  //       component: CNavItem,
  //       name: (
  //         <React.Fragment>
  //           {'Range Slider'}
  //           <CIcon icon={cilExternalLink} size="sm" className="ms-2" />
  //         </React.Fragment>
  //       ),
  //       href: 'https://coreui.io/react/docs/forms/range-slider/',
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //     {
  //       component: CNavItem,
  //       name: (
  //         <React.Fragment>
  //           {'Rating'}
  //           <CIcon icon={cilExternalLink} size="sm" className="ms-2" />
  //         </React.Fragment>
  //       ),
  //       href: 'https://coreui.io/react/docs/forms/rating/',
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Input Group',
  //       to: '/forms/input-group',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Floating Labels',
  //       to: '/forms/floating-labels',
  //     },
  //     {
  //       component: CNavItem,
  //       name: (
  //         <React.Fragment>
  //           {'Date Picker'}
  //           <CIcon icon={cilExternalLink} size="sm" className="ms-2" />
  //         </React.Fragment>
  //       ),
  //       href: 'https://coreui.io/react/docs/forms/date-picker/',
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Date Range Picker',
  //       href: 'https://coreui.io/react/docs/forms/date-range-picker/',
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //     {
  //       component: CNavItem,
  //       name: (
  //         <React.Fragment>
  //           {'Time Picker'}
  //           <CIcon icon={cilExternalLink} size="sm" className="ms-2" />
  //         </React.Fragment>
  //       ),
  //       href: 'https://coreui.io/react/docs/forms/time-picker/',
  //       badge: {
  //         color: 'danger',
  //         text: 'PRO',
  //       },
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Layout',
  //       to: '/forms/layout',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Validation',
  //       to: '/forms/validation',
  //     },
  //   ],
  // },
  // {
  //   component: CNavItem,
  //   name: 'Charts',
  //   to: '/charts',
  //   icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavGroup,
  //   name: 'Icons',
  //   icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'CoreUI Free',
  //       to: '/icons/coreui-icons',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'CoreUI Flags',
  //       to: '/icons/flags',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'CoreUI Brands',
  //       to: '/icons/brands',
  //     },
  //   ],
  // },
  // {
  //   component: CNavGroup,
  //   name: 'Notifications',
  //   icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'Alerts',
  //       to: '/notifications/alerts',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Badges',
  //       to: '/notifications/badges',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Modal',
  //       to: '/notifications/modals',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Toasts',
  //       to: '/notifications/toasts',
  //     },
  //   ],
  // },
  // {
  //   component: CNavItem,
  //   name: 'Widgets',
  //   to: '/widgets',
  //   icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
  //   badge: {
  //     color: 'info',
  //     text: 'NEW',
  //   },
  // },
  // {
  //   component: CNavTitle,
  //   name: 'Extras',
  // },
  {
    component: CNavGroup,
    name: 'Pages',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Login',
        to: '/login',
      },
      {
        component: CNavItem,
        name: 'Register',
        to: '/register',
      },
      {
        component: CNavItem,
        name: 'Error 404',
        to: '/404',
      },
      {
        component: CNavItem,
        name: 'Error 500',
        to: '/500',
      },
    ],
  },
  // {
  //   component: CNavItem,
  //   name: 'Docs',
  //   href: 'https://coreui.io/react/docs/templates/installation/',
  //   icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  // },
]

export default _nav
