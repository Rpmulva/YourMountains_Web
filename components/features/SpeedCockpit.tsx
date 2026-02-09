import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import config from '../../configs';

const { width } = Dimensions.get('window');

// Define the save function signature
interface SpeedCockpitProps {
  onSave: (entry: any) => void; // <--- NEW PROP
  onCancel: () => void;
}

export default function SpeedCockpit({ onSave, onCancel }: SpeedCockpitProps) {
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [speedHistory, setSpeedHistory] = useState([0]);
  const [duration, setDuration] = useState(0);

  // Simulate Tracking Data
  useEffect(() => {
    const interval = setInterval(() => {
      const newSpeed = Math.floor(Math.random() * 25);
      setCurrentSpeed(newSpeed);
      setDuration(prev => prev + 1);
      setSpeedHistory(prev => {
        const updated = [...prev, newSpeed];
        if (updated.length > 20) updated.shift();
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // HANDLE SAVE
  const handleFinish = () => {
    const newEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        type: 'Hike', // Default for now
        duration: formatTime(duration),
        distance: (duration * 0.003).toFixed(2) + ' mi', // Fake math
        maxSpeed: Math.max(...speedHistory) + ' mph'
    };
    onSave(newEntry);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{flexDirection:'row', alignItems:'center'}}>
            <View style={styles.liveBadge}><View style={styles.dot}/><Text style={styles.liveText}>LIVE</Text></View>
            <Text style={styles.title}>Activity Tracker</Text>
        </View>
        
        {/* CANCEL BUTTON */}
        <TouchableOpacity onPress={onCancel}>
             <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainStat}>
        <Text style={styles.speedValue}>{currentSpeed}</Text>
        <Text style={styles.speedLabel}>MPH</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.statBox}>
            <Text style={styles.statLabel}>DURATION</Text>
            <Text style={styles.statValue}>{formatTime(duration)}</Text>
        </View>
        <View style={styles.statBox}>
            <Text style={styles.statLabel}>MAX SPEED</Text>
            <Text style={styles.statValue}>{Math.max(...speedHistory)}</Text>
        </View>
        <View style={styles.statBox}>
            <Text style={styles.statLabel}>AVG SPEED</Text>
            <Text style={styles.statValue}>{(speedHistory.reduce((a, b) => a + b, 0) / speedHistory.length).toFixed(1)}</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: [],
            datasets: [{ data: speedHistory }]
          }}
          width={width - 40}
          height={180}
          yAxisSuffix=" mph"
          chartConfig={{
            backgroundColor: "#000",
            backgroundGradientFrom: "#000",
            backgroundGradientTo: "#000",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            propsForDots: { r: "3", strokeWidth: "2", stroke: config.colors.exploringGold }
          }}
          bezier
          style={{ borderRadius: 16 }}
        />
      </View>

      {/* FINISH BUTTON */}
      <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
          <Text style={styles.finishText}>FINISH & SAVE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', alignItems: 'center', backgroundColor: '#000', borderRadius: 20, paddingBottom: 20 },
  header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#222' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,0,0,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginRight: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'red', marginRight: 5 },
  liveText: { color: 'red', fontSize: 10, fontWeight: 'bold' },
  title: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  
  mainStat: { alignItems: 'center', marginVertical: 20 },
  speedValue: { color: config.colors.exploringGold, fontSize: 72, fontWeight: '900' },
  speedLabel: { color: '#666', fontSize: 16, letterSpacing: 2 },

  grid: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, marginBottom: 20 },
  statBox: { alignItems: 'center', backgroundColor: '#111', padding: 15, borderRadius: 10, width: '30%' },
  statLabel: { color: '#666', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  statValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  chartContainer: { marginBottom: 20 },

  finishBtn: { width: '90%', backgroundColor: config.colors.exploringGold, padding: 18, borderRadius: 30, alignItems: 'center' },
  finishText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});