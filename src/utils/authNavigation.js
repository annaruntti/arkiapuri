/**
 * Capture the current Main (tab) location so Auth can return there on back.
 */
export const getMainReturnTo = (navigation) => {
    let nav = navigation

    while (nav) {
        const state = nav.getState?.()
        const routes = state?.routes
        if (!routes || typeof state.index !== 'number') {
            nav = nav.getParent?.()
            continue
        }

        const names = routes.map((route) => route.name)
        const isTabNavigator =
            names.includes('HomeStack') || names.includes('ProfileStack')

        if (isTabNavigator) {
            const tabRoute = routes[state.index]
            const stackState = tabRoute.state

            if (stackState?.routes?.length) {
                const stackIndex =
                    typeof stackState.index === 'number'
                        ? stackState.index
                        : stackState.routes.length - 1
                const screen = stackState.routes[stackIndex]

                return {
                    screen: tabRoute.name,
                    params: {
                        screen: screen.name,
                        params: screen.params,
                    },
                }
            }

            return { screen: tabRoute.name }
        }

        nav = nav.getParent?.()
    }

    return undefined
}

/**
 * Open an Auth screen as a modal, remembering where to return on back.
 */
export const openAuthScreen = (navigation, screenName, params = {}) => {
    const returnTo = params.returnTo ?? getMainReturnTo(navigation)

    navigation.navigate('Auth', {
        state: {
            routes: [
                {
                    name: screenName,
                    params: {
                        ...params,
                        returnTo,
                    },
                },
            ],
            index: 0,
        },
    })
}
