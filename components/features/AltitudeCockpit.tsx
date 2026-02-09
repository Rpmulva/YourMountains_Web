import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Sensors from 'expo-sensors';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import config from '../../configs';

export default function AltitudeCockpit() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [compassHeading, setCompassHeading] = useState(0);

  // 1. GET PERMISSIONS & LOCATION
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      const locSub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 },
        (newLoc) => setLocation(newLoc)
      );

      return () => locSub.remove();
    })();
  }, []);

  // 2. GET COMPASS DATA
  useEffect(() => {
    Sensors.Magnetometer.setUpdateInterval(100);
    const sub = Sensors.Magnetometer.addListener((data) => {
      let angle = Math.atan2(data.y, data.x); 
      if (angle >= 0) {
        angle = angle * (180 / Math.PI);
      } else {
        angle = (angle + 2 * Math.PI) * (180 / Math.PI);
      }
      setCompassHeading(angle - 90 >= 0 ? angle - 90 : angle + 271);
    });

    return () => sub.remove();
  }, []);

  // Helpers
  const toFeet = (meters: number) => Math.round(meters * 3.28084);
  const getCardinalDirection = (deg: number) => {
    const val = Math.floor((deg / 22.5) + 0.5);
    const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
  };

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={config.colors.primary} />
        <Text style={styles.loadingText}>Calibrating Sensors...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Ionicons name="airplane-outline" size={24} color={config.colors.primary} />
        <Text style={styles.headerTitle}>ALTIMETER & COMPASS</Text>
      </View>

      {/* ALTITUDE DISPLAY */}
      <View style={styles.bigDataCircle}>
         <Text style={styles.bigLabel}>ALTITUDE</Text>
         <Text style={styles.bigValue} numberOfLines={1} adjustsFontSizeToFit={true}>
           {location.coords.altitude ? toFeet(location.coords.altitude).toLocaleString() : '---'}
         </Text>
         <Text style={styles.unit}>FEET</Text>
      </View>

      {/* COMPASS STRIP */}
      <View style={styles.compassContainer}>
         <Text style={styles.compassLabel}>HEADING</Text>
         <View style={styles.compassRow}>
            <Ionicons 
                name="navigate-circle-outline" 
                size={50} 
                color="#FFF" 
                style={{ transform: [{ rotate: `${compassHeading}deg` }] }} 
            />
            <View style={styles.compassTextContainer}>
                <Text style={styles.compassValue}>{Math.round(compassHeading)}°</Text>
                <Text style={styles.compassDirection}>{getCardinalDirection(compassHeading)}</Text>
            </View>
         </View>
      </View>

      {/* GRID DATA */}
      <View style={styles.grid}>
         <View style={styles.gridItem}>
             <Text style={styles.gridLabel}>LATITUDE</Text>
             <Text style={styles.gridValue}>{location.coords.latitude.toFixed(4)}</Text>
         </View>
         <View style={styles.gridItem}>
             <Text style={styles.gridLabel}>LONGITUDE</Text>
             <Text style={styles.gridValue}>{location.coords.longitude.toFixed(4)}</Text>
         </View>
         <View style={[styles.gridItem, { width: '100%' }]}>
             <Text style={styles.gridLabel}>GPS ACCURACY</Text>
             <Text style={styles.gridValue}>+/- {Math.round(location.coords.accuracy || 0)} meters</Text>
         </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A', 
    borderRadius: 20, padding: 20, margin: 20, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10, elevation: 10, width: '90%', 
  },
  loadingContainer: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#AAA' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { color: config.colors.primary, fontWeight: 'bold', fontSize: 16, marginLeft: 10, letterSpacing: 2 },
  bigDataCircle: {
      width: 180, height: 180, borderRadius: 90, borderWidth: 4, borderColor: '#333',
      justifyContent: 'center', alignItems: 'center', marginBottom: 20, backgroundColor: '#222', paddingHorizontal: 10,
  },
  bigLabel: { color: '#666', fontSize: 12, letterSpacing: 1 },
  bigValue: { color: '#FFF', fontSize: 42, fontWeight: 'bold', textAlign: 'center', width: '100%' },
  unit: { color: config.colors.primary, fontSize: 14, fontWeight: 'bold', marginTop: -5 },
  compassContainer: { width: '100%', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 20 },
  compassLabel: { color: '#666', fontSize: 10, marginBottom: 5 },
  compassRow: { flexDirection: 'row', alignItems: 'center' },
  compassTextContainer: { marginLeft: 15 },
  compassValue: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  compassDirection: { color: config.colors.primary, fontSize: 18, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
  gridItem: { width: '48%', backgroundColor: '#252525', padding: 10, borderRadius: 10, marginBottom: 10, alignItems: 'center' },
  gridLabel: { color: '#666', fontSize: 10, marginBottom: 3 },
  gridValue: { color: '#EEE', fontWeight: 'bold', fontSize: 16 },
});