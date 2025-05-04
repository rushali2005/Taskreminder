import { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Alert, Text, SafeAreaView, Platform, StatusBar, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SearchBar from "./SearchBar";
import MapViewStyle from "../constants/MapViewStyle.json";
import * as Speech from 'expo-speech'; // ✅ For voice reminders
import 'react-native-get-random-values';


type LocationType = {
  coords: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
};

type DestinationType = {
  latitude: number;
  longitude: number;
  name?: string;
};

export default function MapScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<LocationType | null>(null);
  const [source, setSource] = useState<DestinationType | null>(null);
  const [destination, setDestination] = useState<DestinationType | null>(null);
  const [useCustomSource, setUseCustomSource] = useState<boolean>(false);
  const mapRef = useRef<MapView | null>(null);

  const GOOGLE_MAPS_API_KEY = "AIzaSyAfXVo5RN43UZp0Y4I1SYA2831HcdSl2xs";

  const defaultLatitude = 19.0584;
  const defaultLongitude = 72.8842;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required.");
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLocation as LocationType);
    })();
  }, []);

  // ✅ Live location tracking to detect destination arrival
  useEffect(() => {
    let watchId: Location.LocationSubscription;

    const startTracking = async () => {
      if (!destination) return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission required!");
        return;
      }

      watchId = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Highest, distanceInterval: 10 },
        async (loc) => {
          const { latitude, longitude } = loc.coords;

          const distance = getDistanceFromLatLonInKm(
            latitude,
            longitude,
            destination.latitude,
            destination.longitude
          );

          console.log(`Distance to destination: ${distance} km`);

          if (distance <= 0.05) {
            Speech.speak(`You have reached ${destination.name || "your destination"}`);
            Alert.alert("Task Completed", `You reached ${destination.name || "your destination"}!`);
            watchId.remove(); // ✅ Stop tracking
          }
        }
      );
    };

    startTracking();

    return () => {
      if (watchId) watchId.remove();
    };
  }, [destination]);

  // ✅ Distance calculation helper
  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  }

  function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  const handleSourceSelect = (selected: DestinationType) => {
    setSource(selected);
    setUseCustomSource(true);
    mapRef.current?.animateToRegion({
      latitude: selected.latitude,
      longitude: selected.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 1000);
  };

  const handleDestinationSelect = (selected: DestinationType) => {
    setDestination(selected);
    mapRef.current?.animateToRegion({
      latitude: selected.latitude,
      longitude: selected.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 1000);
  };

  const initialRegion: Region = {
    latitude: location?.coords?.latitude ?? defaultLatitude,
    longitude: location?.coords?.longitude ?? defaultLongitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const originCoords = useCustomSource && source
    ? { latitude: source.latitude, longitude: source.longitude }
    : location?.coords
      ? { latitude: location.coords.latitude, longitude: location.coords.longitude }
      : null;

  const saveLocationsAndReturn = () => {
    if (!source && !destination) {
      Alert.alert("Error", "Please select at least one location.");
      return;
    }

    const locationData = {
      source: source
        ? {
            latitude: source.latitude,
            longitude: source.longitude,
            name: source.name || "Custom Source",
          }
        : null,
      destination: destination
        ? {
            latitude: destination.latitude,
            longitude: destination.longitude,
            name: destination.name || "Custom Destination",
          }
        : null,
    };

    router.push({
      pathname: "/addtask",
      params: { locationData: JSON.stringify(locationData) },
    });
  };

  const useCurrentLocationAsSource = () => {
    if (!location?.coords) {
      Alert.alert("Error", "Current location is not available.");
      return;
    }

    const currentLoc = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      name: "My Current Location",
    };

    setSource(currentLoc);
    setUseCustomSource(true);
    mapRef.current?.animateToRegion({
      latitude: currentLoc.latitude,
      longitude: currentLoc.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBarWrapper}>
          <Text style={styles.searchLabel}>Source:</Text>
          <SearchBar onLocationSelect={handleSourceSelect} placeholder="Enter source location" />
        </View>
        <View style={styles.searchBarWrapper}>
          <Text style={styles.searchLabel}>Destination:</Text>
          <SearchBar onLocationSelect={handleDestinationSelect} placeholder="Enter destination" />
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          showsUserLocation
          showsMyLocationButton
          showsCompass
          customMapStyle={MapViewStyle}
          initialRegion={initialRegion}
        >
          {location?.coords && !useCustomSource && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Your Current Location"
              pinColor="blue"
            />
          )}

          {source && (
            <Marker
              coordinate={{
                latitude: source.latitude,
                longitude: source.longitude,
              }}
              title={source.name || "Source"}
              pinColor="green"
            />
          )}

          {destination && (
            <Marker
              coordinate={{
                latitude: destination.latitude,
                longitude: destination.longitude,
              }}
              title={destination.name || "Destination"}
              pinColor="red"
            />
          )}

          {originCoords && destination && (
            <MapViewDirections
              origin={originCoords}
              destination={{
                latitude: destination.latitude,
                longitude: destination.longitude,
              }}
              apikey={"AIzaSyAfXVo5RN43UZp0Y4I1SYA2831HcdSl2xs"}
              strokeWidth={4}
              strokeColor="black"
              optimizeWaypoints
            />
          )}
        </MapView>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={useCurrentLocationAsSource}>
            <Ionicons name="locate" size={18} color="white" />
            <Text style={styles.actionButtonText}>Current Location</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={saveLocationsAndReturn}>
            <Ionicons name="save" size={18} color="white" />
            <Text style={styles.actionButtonText}>Save Locations</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    zIndex: 10, 
    elevation: 10, 
  },
  searchBarWrapper: {
    marginBottom: 12,
    zIndex: 5, 
  },
  searchLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 14,
    color: '#333',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  actionButton: {
    backgroundColor: '#4facfe',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButton: {
    backgroundColor: '#2ecc71',
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 8,
  },
});
