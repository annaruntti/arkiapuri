import { View } from 'react-native'

/** Wrapper kept so add/search chrome stays on a stable layout path across platforms. */
const PrimaryActionFade = ({ children, style }) => (
    <View style={style}>{children}</View>
)

export default PrimaryActionFade
