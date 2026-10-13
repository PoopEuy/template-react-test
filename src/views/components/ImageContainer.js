import React from 'react'
import { CImage } from '@coreui/react'

const ImageContainer = ({ src, alt, height = '300px' }) => (
  <div
    style={{
      width: '100%',
      height: '450px', // tinggi seragam
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      border: '1px solid #eee',
      borderRadius: '8px',
      background: '#fafafa',
    }}
  >
    <CImage
      src={src}
      alt={alt}
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
      }}
    />
  </div>
)

export default ImageContainer
