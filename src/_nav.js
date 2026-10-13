import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilLibrary } from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavTitle,
    name: 'Menu',
  },
  {
    component: CNavItem,
    name: 'Products',
    to: '/products',
    icon: <CIcon icon={cilLibrary} customClassName="nav-icon" />,
  },
]

export default _nav
