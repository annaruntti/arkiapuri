import React from 'react'
import { Dimensions, Platform } from 'react-native'

// Breakpoints for responsive design
export const BREAKPOINTS = {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    large: 1440,
}

// Get current screen dimensions
export const getScreenDimensions = () => {
    const { width, height } = Dimensions.get('window')
    return { width, height }
}

// Check if current platform supports web features
export const isWeb = Platform.OS === 'web'

// Get current breakpoint
export const getCurrentBreakpoint = () => {
    const { width } = getScreenDimensions()

    if (width >= BREAKPOINTS.large) return 'large'
    if (width >= BREAKPOINTS.desktop) return 'desktop'
    if (width >= BREAKPOINTS.tablet) return 'tablet'
    return 'mobile'
}

// Check if current screen size is desktop or larger
export const isDesktop = () => {
    const { width } = getScreenDimensions()
    return width >= BREAKPOINTS.desktop
}

// Check if current screen size is tablet or larger
export const isTablet = () => {
    const { width } = getScreenDimensions()
    return width >= BREAKPOINTS.tablet
}

// Get responsive value based on screen size
export const getResponsiveValue = (values) => {
    const breakpoint = getCurrentBreakpoint()
    return values[breakpoint] || values.mobile || values.default
}

// Create responsive styles based on breakpoint
export const createResponsiveStyles = (styles) => {
    const breakpoint = getCurrentBreakpoint()
    const baseStyles = styles.base || {}
    const breakpointStyles = styles[breakpoint] || {}

    return {
        ...baseStyles,
        ...breakpointStyles,
    }
}

// Get container max width based on screen size
export const getContainerMaxWidth = () => {
    const { width } = getScreenDimensions()

    if (width >= BREAKPOINTS.large) return 1200
    if (width >= BREAKPOINTS.desktop) return 960
    if (width >= BREAKPOINTS.tablet) return 720
    return 400 // Mobile max width (current)
}

// Get responsive padding
export const getResponsivePadding = () => {
    const breakpoint = getCurrentBreakpoint()

    const paddingMap = {
        mobile: 20,
        tablet: 40,
        desktop: 60,
        large: 80,
    }

    return paddingMap[breakpoint] || paddingMap.mobile
}

// Get responsive grid columns
export const getResponsiveColumns = () => {
    const breakpoint = getCurrentBreakpoint()

    const columnMap = {
        mobile: 1,
        tablet: 2,
        desktop: 3,
        large: 4,
    }

    return columnMap[breakpoint] || columnMap.mobile
}

// Custom hook for responsive dimensions (React Native Web compatible)
export const useResponsiveDimensions = () => {
    const [dimensions, setDimensions] = React.useState(getScreenDimensions())

    React.useEffect(() => {
        const subscription = Dimensions.addEventListener(
            'change',
            ({ window }) => {
                setDimensions({ width: window.width, height: window.height })
            }
        )

        return () => subscription?.remove()
    }, [])

    return {
        ...dimensions,
        breakpoint: getCurrentBreakpoint(),
        isDesktop: isDesktop(),
        isTablet: isTablet(),
        isWeb: isWeb,
        containerMaxWidth: getContainerMaxWidth(),
        responsivePadding: getResponsivePadding(),
        responsiveColumns: getResponsiveColumns(),
    }
}
