import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import CustomText from './CustomText'
import ResponsiveModal from './ResponsiveModal'
import Button from './Button'

const PantryScanLockedModal = ({
    visible,
    onClose,
    onAddManually,
    reason,
    manualButtonTitle = 'Lisää tuote manuaalisesti',
    upgradeMessage,
}) => {
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (reason === 'quota_exceeded') {
            setMessage(
                'Tämän kuun AI-kiintiö on käytetty. Kiintiö nollautuu seuraavan kauden alussa.'
            )
        } else if (reason === 'household_too_large') {
            setMessage(
                'Perheessä on liikaa jäseniä tälle sopimukselle. Enintään kuusi jäsentä voi jakaa AI-kiintiön.'
            )
        } else if (reason === 'not_configured' || reason === 'budget_exceeded') {
            setMessage(
                'AI-skannaus ei ole juuri nyt käytettävissä. Voit lisätä tiedot manuaalisesti.'
            )
        } else {
            setMessage(
                upgradeMessage ||
                    'Pentterin skannaus kameralla kuuluu maksulliseen sopimukseen. Ilmaisella tilillä voit lisätä tuotteet manuaalisesti.'
            )
        }
    }, [reason, upgradeMessage])

    return (
        <ResponsiveModal
            visible={visible}
            onClose={onClose}
            title="AI-skannaus"
            maxWidth={480}
        >
            <View style={styles.container}>
                <CustomText style={styles.text}>{message}</CustomText>
                <Button
                    title={manualButtonTitle}
                    onPress={onAddManually || onClose}
                    style={styles.button}
                />
            </View>
        </ResponsiveModal>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 12,
    },
    text: {
        fontSize: 16,
        marginBottom: 16,
        lineHeight: 22,
    },
    button: {
        backgroundColor: '#AE9CFC',
    },
})

export default PantryScanLockedModal
