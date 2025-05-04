import React from 'react'
import { View, StyleSheet } from 'react-native'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'

const SearchBar = ({ onLocationSelect, placeholder = "Search for a location" }) => {
  return (
    <GooglePlacesAutocomplete
      placeholder={placeholder}
      fetchDetails={true}
      onPress={(data, details = null) => {
        if (details) {
          onLocationSelect({
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
            name: data.description,
          })
        }
      }}
      query={{
        key: 'AIzaSyAfXVo5RN43UZp0Y4I1SYA2831HcdSl2xs',
        language: 'en',
      }}
      styles={{
        container: {
          flex: 0,
        },
        textInputContainer: {
          backgroundColor: 'transparent',
        },
        textInput: {
          height: 40,
          color: '#5d5d5d',
          fontSize: 16,
          backgroundColor: '#f9f9f9',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#ddd',
          paddingHorizontal: 10,
        },
        listView: {
          backgroundColor: 'white',
          borderRadius: 8,
          marginTop: 5,
        },
        row: {
          padding: 13,
          height: 50,
        },
        separator: {
          height: 1,
          backgroundColor: '#eee',
        },
        description: {
          fontSize: 14,
        },
        poweredContainer: {
          display: 'none',
        },
      }}
    />
  )
}

export default SearchBar