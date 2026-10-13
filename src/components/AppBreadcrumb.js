import React from 'react'
import { useLocation } from 'react-router-dom'
import routes from '../routes'
import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'

const AppBreadcrumb = () => {
  const location = useLocation()

  const getRouteName = (pathname, routes) => {
    const currentRoute = routes.find((route) => {
      const routeRegex = new RegExp(`^${route.path.replace(/:\w+/g, '[^/]+')}$`, 'i')
      return routeRegex.test(pathname)
    })

    if (currentRoute) {
      if (currentRoute.name) {
        return currentRoute.name
      } else {
        // Ambil segmen terakhir dari URL
        return decodeURIComponent(pathname.split('/').pop())
      }
    }

    // Kalau route tidak ditemukan di daftar, ambil segmen terakhir dari URL
    return decodeURIComponent(pathname.split('/').pop())
  }

  const getBreadcrumbs = (location) => {
    const breadcrumbs = []
    location.pathname.split('/').reduce((prev, curr, index, array) => {
      const currentPathname = `${prev}/${curr}`
      const routeName = getRouteName(currentPathname, routes)
      if (routeName) {
        breadcrumbs.push({
          pathname: currentPathname,
          name: routeName,
          active: index + 1 === array.length,
        })
      }
      return currentPathname
    })
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs(location)

  return (
    <CBreadcrumb className="my-0">
      <CBreadcrumbItem href="/">Home</CBreadcrumbItem>
      {breadcrumbs.map((breadcrumb, index) => (
        <CBreadcrumbItem
          key={index}
          {...(breadcrumb.active ? { active: true } : { href: breadcrumb.pathname })}
        >
          {breadcrumb.name}
        </CBreadcrumbItem>
      ))}
    </CBreadcrumb>
  )
}

export default React.memo(AppBreadcrumb)
