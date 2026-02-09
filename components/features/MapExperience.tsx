import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Keyboard, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Conditionally import Mapbox - only available in development builds, not Expo Go
let Mapbox: any = null;
let MAPBOX_AVAILABLE = false;

try {
  Mapbox = require('@rnmapbox/maps').default;
  MAPBOX_AVAILABLE = true;
  const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
  if (MAPBOX_TOKEN) {
    Mapbox.setAccessToken(MAPBOX_TOKEN);
  } else {
    console.warn('Mapbox token missing. Set EXPO_PUBLIC_MAPBOX_TOKEN.');
  }
} catch (error) {
  // Mapbox not available (e.g., running in Expo Go)
  console.warn('Mapbox not available - running in Expo Go or native module not linked');
}

export default function MapExperience({ onClose, onStartActivity }: { onClose?: () => void, onStartActivity?: () => void }) {
  const cameraRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const [currentZoom, setCurrentZoom] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const router = useRouter();

  // --- EXIT LOGIC ---
  const handleExit = () => {
    if (onClose) {
      onClose();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      // If no history, force back to the main index
      router.replace('/'); 
    }
  };
  
  // Show fallback UI if Mapbox is not available
  if (!MAPBOX_AVAILABLE || !Mapbox) {
    return (
      <View style={styles.page}>
        <SafeAreaView style={styles.fallbackContainer}>
          <View style={styles.fallbackContent}>
            <Text style={styles.fallbackTitle}>Map Feature</Text>
            <Text style={styles.fallbackText}>
              The map feature requires a development build with native modules enabled.
            </Text>
            <Text style={styles.fallbackSubtext}>
              This feature is not available in Expo Go. Build a development build to use maps.
            </Text>
            <TouchableOpacity style={styles.fallbackButton} onPress={handleExit}>
              <Text style={styles.fallbackButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // --- SEARCH LOGIC ---
  const handleSearch = async () => {
    Keyboard.dismiss();
    if (!searchText.trim()) return;

    try {
      const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
      if (!MAPBOX_TOKEN) {
        Alert.alert('Mapbox token missing', 'Set EXPO_PUBLIC_MAPBOX_TOKEN to use search.');
        return;
      }
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchText)}.json?access_token=${MAPBOX_TOKEN}&bbox=-109,37,-102,41`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const result = data.features[0];
        const [longitude, latitude] = result.center;
        
        cameraRef.current?.setCamera({
          centerCoordinate: [longitude, latitude],
          zoomLevel: 14,
          animationDuration: 2000,
        });
        setCurrentZoom(14);
      } else {
        Alert.alert("Not Found", "Location not found.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- TAP/CLICK LOGIC ---
  const handleMapPress = async (event: any) => {
    const { screenPoint } = event.properties;
    if (!screenPoint) return;

    // FIXED: Explicitly typed as a tuple for TypeScript
    const hitBox: [number, number, number, number] = [
      screenPoint[1] - 30, // top
      screenPoint[0] + 30, // right
      screenPoint[1] + 30, // bottom
      screenPoint[0] - 30, // left
    ];

    const featuresInBox = await mapRef.current?.queryRenderedFeaturesInRect(
      hitBox,
      undefined, 
      undefined
    );

    if (featuresInBox && featuresInBox.features.length > 0) {
      // Prioritize Trails/Paths first
      const foundFeature = featuresInBox.features.find((f: any) => {
        const props = f.properties || {};
        const isTrail = props.class === 'path' || props.class === 'track' || props.class === 'pedestrian';
        return isTrail;
      });

      if (foundFeature) {
        setSelectedFeature(foundFeature);
      } else {
        // Fallback: Parks or Peaks
        const poiFeature = featuresInBox.features.find((f: any) => f.properties?.name);
        if (poiFeature) {
           setSelectedFeature(poiFeature);
        } else {
           setSelectedFeature(null);
        }
      }
    } else {
      setSelectedFeature(null);
    }
  };

  // --- ZOOM LOGIC ---
  const handleZoom = (increment: boolean) => {
    const newZoom = increment ? currentZoom + 1 : currentZoom - 1;
    setCurrentZoom(newZoom);
    cameraRef.current?.setCamera({ zoomLevel: newZoom, animationDuration: 500 });
  };

  return (
    <View style={styles.page}>
      
      <View style={styles.container}>
        <Mapbox.MapView 
          ref={mapRef}
          style={styles.map} 
          styleURL="mapbox://styles/mapbox/outdoors-v12"
          onPress={handleMapPress}
          logoEnabled={false}
          attributionEnabled={false}
        >
          <Mapbox.Camera
            ref={cameraRef}
            zoomLevel={currentZoom}
            centerCoordinate={[-106.0384, 39.5792]} 
          />
          <Mapbox.UserLocation visible={true} />
        </Mapbox.MapView>
      </View>

      <SafeAreaView style={styles.uiOverlay} pointerEvents="box-none">
        
        {/* HEADER ROW */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.closeButton} onPress={handleExit}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>

          <View style={styles.searchWrapper}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search trails..."
              placeholderTextColor="#888"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* ZOOM CONTROLS */}
        <View style={styles.zoomContainer}>
          <TouchableOpacity style={styles.zoomBtn} onPress={() => handleZoom(true)}>
            <Text style={styles.zoomText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.zoomBtn, { marginTop: 12 }]} onPress={() => handleZoom(false)}>
            <Text style={styles.zoomText}>-</Text>
          </TouchableOpacity>
        </View>

        {/* INFO CARD */}
        {selectedFeature && (
          <View style={styles.cardContainer}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                {selectedFeature.properties?.name || "Unnamed Trail"}
              </Text>
              <Text style={styles.cardSubtitle}>
                Type: {selectedFeature.properties?.class || "Path"}
              </Text>
              
              {selectedFeature.properties?.elevation && (
                 <Text style={styles.cardDetail}>Elevation: {selectedFeature.properties.elevation}m</Text>
              )}
              
              <TouchableOpacity 
                style={styles.cardCloseBtn} 
                onPress={() => setSelectedFeature(null)}
              >
                <Text style={styles.cardCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000' },
  container: { height: '100%', width: '100%' },
  map: { flex: 1 },
  uiOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  
  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 60, // Adjusted for safe area manually
  },
  closeButton: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: {width:0, height:2}, elevation: 5
  },
  closeIcon: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  
  searchWrapper: { flex: 1 },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 22,
    paddingVertical: 12, paddingHorizontal: 20,
    fontSize: 16,
    shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: {width:0, height:2}, elevation: 3
  },

  // Zoom
  zoomContainer: {
    position: 'absolute',
    right: 16,
    top: '40%',
  },
  zoomBtn: {
    width: 48, height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: {width:0, height:2}, elevation: 5
  },
  zoomText: { fontSize: 28, color: '#333', lineHeight: 30 },

  // Card
  cardContainer: {
    position: 'absolute',
    bottom: 40,
    left: 16, right: 16,
    alignItems: 'center',
  },
  cardContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: {width:0, height:4}, elevation: 10
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#222', marginBottom: 4 },
  cardSubtitle: { fontSize: 16, color: '#666', marginBottom: 16, textTransform: 'capitalize' },
  cardDetail: { fontSize: 14, color: '#444' },
  cardCloseBtn: { alignSelf: 'flex-end', marginTop: 10, padding: 8 },
  cardCloseText: { color: '#007AFF', fontWeight: '600', fontSize: 16 },
  
  // Fallback styles for when Mapbox is not available
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  fallbackContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 320,
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
  },
  fallbackText: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  fallbackSubtext: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  fallbackButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  fallbackButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});