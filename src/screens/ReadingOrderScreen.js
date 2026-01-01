import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import CustomText from '../components/CustomText'
import ResponsiveLayout from '../components/ResponsiveLayout'
import TableMonth from '../components/TableMonth'
import TableWeek from '../components/TableWeek'
import { useResponsiveDimensions } from '../utils/responsive'

const ReadingOrderScreen = ({}) => {
    const { isDesktop } = useResponsiveDimensions()
    const [activeTab, setActiveTab] = useState('week')

    const renderTabButton = (tabKey, title) => (
        <TouchableOpacity
            key={tabKey}
            style={[
                styles.tabButton,
                activeTab === tabKey && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tabKey)}
        >
            <CustomText
                style={[
                    styles.tabButtonText,
                    activeTab === tabKey && styles.activeTabButtonText,
                ]}
            >
                {title}
            </CustomText>
        </TouchableOpacity>
    )

    return (
        <ResponsiveLayout activeRoute="ReadingOrderStack">
            <View style={styles.container}>
                {/* Content */}
                <View style={styles.contentContainer}>
                    {activeTab === 'week' ? (
                        <TableWeek />
                    ) : (
                        <TableMonth />
                    )}
                </View>

                {/* Tab Navigation - Rendered last so it's on top */}
                <View style={styles.tabContainer}>
                    {renderTabButton('week', 'Viikko')}
                    {renderTabButton('month', 'Kuukausi')}
                </View>
            </View>
        </ResponsiveLayout>
    )
}

export default ReadingOrderScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        position: 'relative',
    },
    tabContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
        zIndex: 10000000,
        elevation: 10000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 15,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTabButton: {
        borderBottomColor: '#9C86FC',
        backgroundColor: '#fff',
    },
    tabButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
    },
    activeTabButtonText: {
        color: '#9C86FC',
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
        paddingTop: 53,
    },
    desktopContentWrapper: {
        flex: 1,
        width: '100%',
        maxWidth: 960,
        alignSelf: 'center',
        position: 'relative',
        paddingHorizontal: 40,
    },
    fullWidth: {
        flex: 1,
        width: '100%',
        position: 'relative',
    },
})
