import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import CustomText from './CustomText'
import {
    MAIN_NAV_ITEMS,
    navigateToMainTab,
} from '../utils/mainNavigation'

const DesktopNavigation = ({ activeRoute }) => {
    const navigation = useNavigation()

    return (
        <View style={styles.container}>
            <View style={styles.navigationList}>
                {MAIN_NAV_ITEMS.map((item) => {
                    const isActive = activeRoute === item.name
                    const { IconComponent } = item

                    return (
                        <TouchableOpacity
                            key={item.name}
                            style={[
                                styles.navigationItem,
                                isActive && styles.activeNavigationItem,
                            ]}
                            onPress={() =>
                                navigateToMainTab(navigation, item.name)
                            }
                        >
                            <IconComponent
                                name={item.icon}
                                size={20}
                                color={isActive ? '#5844BB' : '#666'}
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
        borderColor: '#5844BB',
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
        color: '#5844BB',
        fontWeight: '600',
    },
})

export default DesktopNavigation
