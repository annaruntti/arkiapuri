import { AntDesign, Feather, FontAwesome6 } from '@expo/vector-icons'

/** Shared main app destinations (bottom tabs + desktop sidebar). */
export const MAIN_NAV_ITEMS = [
    {
        name: 'HomeStack',
        label: 'Arkiapuri',
        icon: 'home',
        IconComponent: Feather,
    },
    {
        name: 'MealsStack',
        label: 'Ateriat',
        icon: 'bowl-food',
        IconComponent: FontAwesome6,
    },
    {
        name: 'PantryStack',
        label: 'Pentteri',
        icon: 'database',
        IconComponent: AntDesign,
    },
    {
        name: 'ShoppingListStack',
        label: 'Ostoslista',
        icon: 'shopping-cart',
        IconComponent: Feather,
    },
    {
        name: 'ReadingOrderStack',
        label: 'Lukujärjestys',
        icon: 'calendar',
        IconComponent: AntDesign,
    },
]

const TAB_ROOT_SCREENS = {
    ShoppingListStack: 'Ostoslista',
}

/**
 * Navigate to a Main tab from anywhere (Main stacks or Auth modal).
 * Shopping lists always open the list picker, not a previously opened list.
 */
export const navigateToMainTab = (navigation, routeName) => {
    const rootScreen = TAB_ROOT_SCREENS[routeName]
    if (rootScreen) {
        navigation.navigate('Main', {
            screen: routeName,
            params: { screen: rootScreen },
        })
        return
    }

    navigation.navigate('Main', { screen: routeName })
}
