import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import CustomText from './CustomText'
import {
    MAIN_NAV_ITEMS,
    navigateToMainTab,
} from '../utils/mainNavigation'

/**
 * Bottom tab bar matching TabNavigator — usable outside the tab navigator
 * (e.g. Auth screens) so guests keep app navigation visible.
 */
const MainTabBar = ({ activeRoute }) => {
    const navigation = useNavigation()

    return (
        <View style={styles.container}>
            {MAIN_NAV_ITEMS.map((item) => {
                const focused = activeRoute === item.name
                const { IconComponent } = item
                const iconColor = focused ? '#5844BB' : 'black'

                return (
                    <TouchableOpacity
                        key={item.name}
                        style={[
                            styles.tabItem,
                            focused && styles.tabItemFocused,
                        ]}
                        onPress={() =>
                            navigateToMainTab(navigation, item.name)
                        }
                        accessibilityRole="button"
                        accessibilityState={{ selected: focused }}
                        accessibilityLabel={item.label}
                    >
                        <IconComponent
                            name={item.icon}
                            size={24}
                            color={iconColor}
                        />
                        <CustomText
                            style={[
                                styles.tabLabel,
                                focused && styles.tabLabelFocused,
                            ]}
                        >
                            {item.label}
                        </CustomText>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 80,
        paddingBottom: 10,
        paddingTop: 0,
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#e5e7eb',
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 5,
        paddingBottom: 15,
        paddingHorizontal: 0,
        borderTopWidth: 0,
        flex: 1,
    },
    tabItemFocused: {
        borderTopWidth: 3,
        borderTopColor: '#5844BB',
    },
    tabLabel: {
        fontSize: 10,
        color: '#000',
        marginTop: 2,
        textAlign: 'center',
    },
    tabLabelFocused: {
        color: '#5844BB',
    },
})

export default MainTabBar
