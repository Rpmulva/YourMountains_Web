import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import config from '../../configs';

// Defines what a Diary Entry looks like
export interface DiaryEntry {
  id: string;
  date: string;
  type: 'Hike' | 'Run' | 'Ski';
  duration: string;
  distance: string;
  maxSpeed: string;
}

interface MotionDiariesProps {
  entries: DiaryEntry[];
  onClose: () => void;
}

export default function MotionDiaries({ entries, onClose }: MotionDiariesProps) {
  
  // This function is correct, we just passed it to the wrong prop name below
  const renderEntry = ({ item }: { item: DiaryEntry }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.iconBox}>
           {/* Dynamic Icon based on type */}
           <MaterialCommunityIcons 
             name={item.type === 'Ski' ? "ski" : "walk"} 
             size={24} 
             color={config.colors.exploringGold} 
           />
        </View>
        <View>
          <Text style={styles.date}>{item.date}</Text>
          <Text style={styles.stats}>{item.distance} • {item.duration}</Text>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.speedLabel}>MAX</Text>
        <Text style={styles.speedValue}>{item.maxSpeed}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Ionicons name="journal" size={24} color={config.colors.exploringGold} />
          <Text style={styles.title}>Motion Diary</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close-circle" size={32} color="#666" />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="shoe-print" size={60} color="#333" />
          <Text style={styles.emptyText}>No tracks yet.</Text>
          <Text style={styles.emptySub}>Start "Tracking" to fill your diary.</Text>
        </View>
      ) : (
        <FlatList 
          data={entries}
          renderItem={renderEntry} // <--- FIXED: Prop name must be 'renderItem'
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', width: '100%', marginTop: 50, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderColor: '#222' },
  title: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  
  listContent: { padding: 20 },
  card: { 
    backgroundColor: '#222', borderRadius: 15, padding: 15, marginBottom: 15,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(255, 193, 7, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  date: { color: '#FFF', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  stats: { color: '#999', fontSize: 13 },
  
  cardRight: { alignItems: 'flex-end' },
  speedLabel: { color: config.colors.exploringGold, fontSize: 10, fontWeight: 'bold' },
  speedValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  emptySub: { color: '#666', marginTop: 10 }
});