import React from 'react';
import { Box } from '@mui/material';

const LoadingAnimation = ({ 
  width = '100%', 
  height = '90px', 
  variant = 'card',
  style = {}
}) => {
  // Different variants for different use cases
  const variants = {
    // For stats cards
    stats: {
      container: {
        width: width,
        height: '100px',
        background: '#ffffff',
        borderRadius: '8px',
        padding: '12px 10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        ...style
      },
      icon: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'linear-gradient(120deg, #e5e5e5 30%, #f0f0f0 38%, #f0f0f0 40%, #e5e5e5 48%)',
        backgroundSize: '200% 100%',
        backgroundPosition: '100% 0',
        animation: 'shimmer 2s infinite',
        margin: '0 auto 8px'
      },
      title: {
        width: '60px',
        height: '20px',
        borderRadius: '4px',
        background: 'linear-gradient(120deg, #e5e5e5 30%, #f0f0f0 38%, #f0f0f0 40%, #e5e5e5 48%)',
        backgroundSize: '200% 100%',
        backgroundPosition: '100% 0',
        animation: 'shimmer 2s infinite',
        margin: '0 auto 6px'
      },
      subtitle: {
        width: '80px',
        height: '12px',
        borderRadius: '4px',
        background: 'linear-gradient(120deg, #e5e5e5 30%, #f0f0f0 38%, #f0f0f0 40%, #e5e5e5 48%)',
        backgroundSize: '200% 100%',
        backgroundPosition: '100% 0',
        animation: 'shimmer 2s infinite',
        margin: '0 auto'
      }
    },
    // For table cards
    table: {
      container: {
        width: width,
        height: height,
        background: '#ffffff',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        ...style
      },
      main: {
        width: '100%',
        height: '40px',
        borderRadius: '4px',
        background: 'linear-gradient(120deg, #e5e5e5 30%, #f0f0f0 38%, #f0f0f0 40%, #e5e5e5 48%)',
        backgroundSize: '200% 100%',
        backgroundPosition: '100% 0',
        animation: 'shimmer 2s infinite',
        marginBottom: '8px'
      },
      sub: {
        width: '80%',
        height: '12px',
        borderRadius: '4px',
        background: 'linear-gradient(120deg, #e5e5e5 30%, #f0f0f0 38%, #f0f0f0 40%, #e5e5e5 48%)',
        backgroundSize: '200% 100%',
        backgroundPosition: '100% 0',
        animation: 'shimmer 2s infinite',
        margin: '0 auto'
      }
    },
    // For menu items
    menu: {
      container: {
        width: width,
        height: height,
        background: '#ffffff',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        ...style
      },
      image: {
        width: '100%',
        height: '120px',
        borderRadius: '6px',
        background: 'linear-gradient(120deg, #e5e5e5 30%, #f0f0f0 38%, #f0f0f0 40%, #e5e5e5 48%)',
        backgroundSize: '200% 100%',
        backgroundPosition: '100% 0',
        animation: 'shimmer 2s infinite',
        marginBottom: '8px'
      },
      title: {
        width: '90%',
        height: '16px',
        borderRadius: '4px',
        background: 'linear-gradient(120deg, #e5e5e5 30%, #f0f0f0 38%, #f0f0f0 40%, #e5e5e5 48%)',
        backgroundSize: '200% 100%',
        backgroundPosition: '100% 0',
        animation: 'shimmer 2s infinite',
        marginBottom: '6px'
      },
      price: {
        width: '60px',
        height: '14px',
        borderRadius: '4px',
        background: 'linear-gradient(120deg, #e5e5e5 30%, #f0f0f0 38%, #f0f0f0 40%, #e5e5e5 48%)',
        backgroundSize: '200% 100%',
        backgroundPosition: '100% 0',
        animation: 'shimmer 2s infinite'
      }
    },
    // For menu items as horizontal rows
    'menu-row': {
      container: {
        width: width,
        height: height || '80px',
        background: '#ffffff',
        borderRadius: '0px',
        padding: '12px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        ...style
      },
      image: {
        width: '70px',
        height: '60px',
        borderRadius: '6px',
        background: 'linear-gradient(120deg, #e5e5e5 30%, #f0f0f0 38%, #f0f0f0 40%, #e5e5e5 48%)',
        backgroundSize: '200% 100%',
        backgroundPosition: '100% 0',
        animation: 'shimmer 2s infinite',
        flexShrink: 0
      },
      content: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      },
      title: {
        width: '80%',
        height: '14px',
        borderRadius: '4px',
        background: 'linear-gradient(120deg, #e5e5e5 30%, #f0f0f0 38%, #f0f0f0 40%, #e5e5e5 48%)',
        backgroundSize: '200% 100%',
        backgroundPosition: '100% 0',
        animation: 'shimmer 2s infinite'
      },
      description: {
        width: '100%',
        height: '12px',
        borderRadius: '4px',
        background: 'linear-gradient(120deg, #e5e5e5 30%, #f0f0f0 38%, #f0f0f0 40%, #e5e5e5 48%)',
        backgroundSize: '200% 100%',
        backgroundPosition: '100% 0',
        animation: 'shimmer 2s infinite'
      },
      price: {
        width: '50px',
        height: '12px',
        borderRadius: '4px',
        background: 'linear-gradient(120deg, #e5e5e5 30%, #f0f0f0 38%, #f0f0f0 40%, #e5e5e5 48%)',
        backgroundSize: '200% 100%',
        backgroundPosition: '100% 0',
        animation: 'shimmer 2s infinite'
      }
    },
    // For table rows
    'table-row': {
      container: {
        width: width,
        height: height || '50px',
        background: '#ffffff',
        borderRadius: '0px',
        padding: '0px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        ...style
      },
      cell: {
        height: '16px',
        borderRadius: '4px',
        background: 'linear-gradient(120deg, #e5e5e5 30%, #f0f0f0 38%, #f0f0f0 40%, #e5e5e5 48%)',
        backgroundSize: '200% 100%',
        backgroundPosition: '100% 0',
        animation: 'shimmer 2s infinite'
      }
    }
  };

  const config = variants[variant] || variants.card;

  if (variant === 'stats') {
    return (
      <Box sx={config.container}>
        <Box sx={config.icon} />
        <Box sx={config.title} />
        <Box sx={config.subtitle} />
      </Box>
    );
  }

  if (variant === 'menu') {
    return (
      <Box sx={config.container}>
        <Box sx={config.image} />
        <Box sx={config.title} />
        <Box sx={config.price} />
      </Box>
    );
  }

  if (variant === 'menu-row') {
    return (
      <Box sx={config.container}>
        <Box sx={config.image} />
        <Box sx={config.content}>
          <Box sx={config.title} />
          <Box sx={config.description} />
        </Box>
        <Box sx={config.price} />
      </Box>
    );
  }

  if (variant === 'table-row') {
    return (
      <Box sx={config.container}>
        <Box sx={{ width: '40px', px: 1 }}>
          <Box sx={{ ...config.cell, width: '20px', height: '20px', borderRadius: '3px' }} />
        </Box>
        <Box sx={{ flex: 1, px: 1.2 }}>
          <Box sx={{ ...config.cell, width: '80px' }} />
        </Box>
        <Box sx={{ flex: 1, px: 1.2 }}>
          <Box sx={{ ...config.cell, width: '60px' }} />
        </Box>
        <Box sx={{ flex: 2, px: 1.2 }}>
          <Box sx={{ ...config.cell, width: '100px' }} />
        </Box>
        <Box sx={{ flex: 1, px: 1.2 }}>
          <Box sx={{ ...config.cell, width: '70px' }} />
        </Box>
        <Box sx={{ flex: 1, px: 1.2 }}>
          <Box sx={{ ...config.cell, width: '80px' }} />
        </Box>
        <Box sx={{ flex: 1, px: 1.2 }}>
          <Box sx={{ ...config.cell, width: '90px' }} />
        </Box>
        <Box sx={{ flex: 1, px: 1.2 }}>
          <Box sx={{ ...config.cell, width: '60px' }} />
        </Box>
        <Box sx={{ flex: 1, px: 1.2 }}>
          <Box sx={{ ...config.cell, width: '70px' }} />
        </Box>
      </Box>
    );
  }

  // Default table variant
  return (
    <Box sx={config.container}>
      <Box sx={config.main} />
      <Box sx={config.sub} />
    </Box>
  );
};

export default LoadingAnimation;

