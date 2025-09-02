import { AntDesign, Feather, FontAwesome6 } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import CustomText from './CustomText'

const DesktopNavigation = ({ activeRoute }) => {
    const navigation = useNavigation()

    const navigationItems = [
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

    const handleNavigation = (routeName) => {
        navigation.navigate(routeName)
    }

    return (
        <View style={styles.container}>
            <View style={styles.navigationList}>
                {navigationItems.map((item) => {
                    const isActive = activeRoute === item.name
                    const { IconComponent } = item

                    return (
                        <TouchableOpacity
                            key={item.name}
                            style={[
                                styles.navigationItem,
                                isActive && styles.activeNavigationItem,
                            ]}
                            onPress={() => handleNavigation(item.name)}
                        >
                            <IconComponent
                                name={item.icon}
                                size={20}
                                color={isActive ? '#9C86FC' : '#666'}
                                style={styles.icon}
                            />
                            <CustomText
                                style={[
                                    styles.navigationText,
                                    isActive && styles.activeNavigationText,
                                ]}
                            >
                                {item.label}
                            </CustomText>
                        </TouchableOpacity>
                    )
                })}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 240,
        backgroundColor: '#fff',
        borderRightWidth: 1,
        borderRightColor: '#e0e0e0',
        paddingVertical: 20,
        height: '100%',
    },
    navigationList: {
        flex: 1,
    },
    navigationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginHorizontal: 10,
        borderRadius: 8,
        marginBottom: 4,
    },
    activeNavigationItem: {
        backgroundColor: '#f0edff',
        borderWidth: 1,
        borderColor: '#9C86FC',
    },
    icon: {
        marginRight: 12,
        width: 20,
    },
    navigationText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeNavigationText: {
        color: '#9C86FC',
        fontWeight: '600',
    },
})

export default DesktopNavigation
