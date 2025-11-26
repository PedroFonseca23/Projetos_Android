import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getDashboardStats } from '../database/database';

const StatCard = ({ icon, title, value }) => (
  <View style={s.statCard}>
    <Ionicons name={icon} size={24} color="#00A79D" />
    <Text style={s.statValue}>{value || 0}</Text>
    <Text style={s.statTitle}>{title}</Text>
  </View>
);

const PopularItem = ({ item, index }) => (
  <View style={s.itemRow}>
    <Text style={s.itemRank}>#{index + 1}</Text>
    <Text style={s.itemTitle} numberOfLines={1}>{item.title}</Text>
    <Text style={s.itemViews}>{item.viewCount} {item.viewCount === 1 ? 'clique' : 'cliques'}</Text>
  </View>
);

const DashboardScreen = () => {
 
  const [stats, setStats] = useState({
    totalViews: 0,
    totalProducts: 0,
    totalUsers: 0,
    popularProducts: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await getDashboardStats();
    
      if (data) {
        setStats(data);
      }
    } catch (e) {
      console.error("Erro no Dashboard:", e);

    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  return (
    <SafeAreaView style={s.container} edges={['bottom', 'left', 'right']}>
      <ScrollView>
        <View style={s.content}>
          <Text style={s.title}>Dashboard</Text>
          
          {isLoading ? (
            <ActivityIndicator size="large" color="#00A79D" style={{marginTop: 50}} />
          ) : (
            <>
              <View style={s.statsGrid}>
                <StatCard icon="eye-outline" title="Total de Cliques" value={stats.totalViews} />
                <StatCard icon="images-outline" title="Quadros Cadastrados" value={stats.totalProducts} />
                <StatCard icon="people-outline" title="Usuários Totais" value={stats.totalUsers} />
              </View>

              <Text style={s.sectionTitle}>Quadros Mais Populares</Text>
              <View style={s.listContainer}>
                {stats.popularProducts && stats.popularProducts.length > 0 ? (
                  stats.popularProducts.map((item, index) => (
                    <PopularItem key={index} item={item} index={index} />
                  ))
                ) : (
                  <Text style={s.emptyText}>Nenhum clique registrado ainda.</Text>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { backgroundColor: '#1f1f1f', borderRadius: 8, padding: 15, width: '48%', marginBottom: 10, alignItems: 'flex-start', borderWidth: 1, borderColor: '#333' },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 8 },
  statTitle: { fontSize: 14, color: '#aaa', marginTop: 4 },
  sectionTitle: { fontSize: 22, fontWeight: '600', color: '#fff', marginTop: 20, marginBottom: 15, borderTopWidth: 1, borderTopColor: '#333', paddingTop: 20 },
  listContainer: { backgroundColor: '#1f1f1f', borderRadius: 8, padding: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
  itemRank: { fontSize: 16, color: '#aaa', width: 30 },
  itemTitle: { fontSize: 16, color: '#fff', flex: 1, marginHorizontal: 10 },
  itemViews: { fontSize: 16, color: '#00A79D', fontWeight: '600' },
  emptyText: { color: '#aaa', textAlign: 'center', padding: 20 }
});

export default DashboardScreen;