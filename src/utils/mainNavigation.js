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

/**
 * Navigate to a Main tab from anywhere (Main stacks or Auth modal).
 */
export const navigateToMainTab = (navigation, routeName) => {
    navigation.navigate('Main', { screen: routeName })
}
