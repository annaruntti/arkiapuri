import ToggleButton from './ToggleButton'

const GenericFilter = ({
    selectedFilters,
    showFilters,
    onToggleShowFilters,
    buttonText = 'Suodata',
    disabled = false,
}) => {
    return (
        <ToggleButton
            variant="pill"
            label={buttonText}
            icon="filter-list"
            expanded={showFilters}
            onPress={onToggleShowFilters}
            badge={selectedFilters?.length}
            disabled={disabled}
        />
    )
}

export default GenericFilter
