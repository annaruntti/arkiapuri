import React from 'react'
import SectionedMultiSelect from 'react-native-sectioned-multi-select'
import { View, TouchableOpacity } from 'react-native'
import { MaterialIcons as Icon } from '@expo/vector-icons'
import CustomText from './CustomText'

const CategorySelect = ({
    value,
    onChange,
    isModalVisible,
    setIsModalVisible,
    toggleModal,
    categories,
}) => {
    return (
        <SectionedMultiSelect
            styles={{
                backdrop: {
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    backgroundColor: '#fff',
                    flex: 1,
                },
                modalWrapper: {
                    height: '81%',
                    position: 'relative',
                    top: '10%',
                    backgroundColor: '#fff',
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    overflow: 'hidden',
                    paddingTop: 0,
                    margin: 0,
                    marginVertical: 0,
                    marginHorizontal: 0,
                    flex: 1,
                    alignSelf: 'stretch',
                    borderRadius: 6,
                    paddingTop: 10,
                    paddingLeft: 5,
                    paddingRight: 5,
                    paddingBottom: 5,
                },
                container: {
                    marginTop: 0,
                    marginHorizontal: 0,
                    overflow: 'hidden',
                    borderRadius: 6,
                    alignSelf: 'stretch',
                    backgroundColor: '#fff',
                    flex: 1,
                    position: 'relative',
                    height: '100%',
                    paddingBottom: 80,
                },
                scrollView: {
                    maxHeight: 'calc(100% - 120px)',
                    overflow: 'auto',
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingTop: 10,
                },
                listContainer: {
                    paddingBottom: 20,
                },
                selectToggle: {
                    borderWidth: 1,
                    borderRadius: 4,
                    borderColor: '#bbb',
                    padding: 10,
                    marginBottom: 8,
                    backgroundColor: 'white',
                    minHeight: 40,
                },
                button: {
                    borderRadius: 25,
                    paddingVertical: 7,
                    paddingHorizontal: 10,
                    elevation: 2,
                    backgroundColor: '#9C86FC',
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    right: 20,
                },
                confirmText: {
                    color: 'black',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: 16,
                },
                searchBar: {
                    backgroundColor: '#fff',
                    borderWidth: 1,
                    borderColor: '#bbb',
                    borderRadius: 4,
                    marginRight: 30,
                    marginLeft: 20,
                    marginTop: 40,
                    flexDirection: 'row',
                    alignItems: 'center',
                },
                searchIconContainer: {
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                searchIcon: {
                    fontSize: 24,
                    marginRight: 5,
                    marginLeft: 5,
                    fontFamily: 'material',
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                },
                searchTextInput: {
                    fontSize: 17,
                    paddingTop: 3,
                    paddingBottom: 3,
                    fontFamily: 'Avenir',
                    fontWeight: '200',
                    color: '#000',
                    flex: '1 1 0%',
                    paddingLeft: 0,
                },
                itemText: {
                    fontSize: 16,
                    color: '#000',
                    paddingHorizontal: 8,
                    paddingVertical: 0,
                },
                subItemText: {
                    fontSize: 15,
                    color: '#000',
                    paddingLeft: 24,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                },
                selectedItemText: {
                    color: '#000',
                },
                selectedSubItemText: {
                    color: '#000',
                },
                chipContainer: {
                    backgroundColor: '#fff',
                    marginRight: 5,
                    marginBottom: 5,
                    padding: 5,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: '#ddd',
                },
                chipText: {
                    color: '#000',
                },
                separator: {
                    display: 'none',
                },
                subSeparator: {
                    display: 'none',
                },
                itemContainer: {
                    paddingVertical: 0,
                },
                subItemContainer: {
                    paddingVertical: 0,
                    marginRight: 10,
                },
                headerComponent: {
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    zIndex: 9999,
                },
            }}
            headerComponent={
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        zIndex: 9999,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => setIsModalVisible(false)}
                        style={{
                            width: 40,
                            height: 40,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        accessibilityLabel="Sulje kategorian valinta"
                    >
                        <Icon name="close" size={28} color="#000" />
                    </TouchableOpacity>
                </View>
            }
            onCancel={() => setIsModalVisible(false)}
            onToggleSelector={(isOpen) => setIsModalVisible(isOpen)}
            showCancelButton={false}
            visible={isModalVisible}
            selectToggleComponent={
                <TouchableOpacity
                    style={{
                        borderWidth: 1,
                        borderRadius: 4,
                        borderColor: '#bbb',
                        padding: 10,
                        marginBottom: 8,
                        backgroundColor: 'white',
                        minHeight: 40,
                    }}
                    onPress={toggleModal}
                >
                    <CustomText>
                        {value && value.length > 0
                            ? `${value.length} kategoriaa valittu`
                            : 'Valitse yksi tai useampi kategoria'}
                    </CustomText>
                </TouchableOpacity>
            }
            items={categories}
            IconRenderer={Icon}
            uniqueKey="id"
            subKey="children"
            displayKey="name"
            showDropDowns={true}
            expandDropDowns={true}
            showRemoveAll={true}
            onSelectedItemsChange={onChange}
            selectedItems={value}
            removeAllText="Poista kaikki"
            searchPlaceholderText="Etsi kategoriaa"
            confirmText="Tallenna kategoriat"
            selectText="Valitse yksi tai useampi kategoria"
            modalWithSafeAreaView={false}
            modalAnimationType="slide"
            selectedIconComponent={
                <Icon
                    name="check"
                    style={{
                        fontSize: 16,
                        color: 'rgb(76, 175, 80)',
                        paddingLeft: 10,
                        marginRight: 10,
                        fontFamily: 'material',
                        fontWeight: 'normal',
                        fontStyle: 'normal',
                    }}
                />
            }
        />
    )
}

export default CategorySelect
