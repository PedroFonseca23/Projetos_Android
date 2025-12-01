import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { getDashboardStats } from '../database/database';
import { useTheme } from '../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
  const { theme, isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const processChartData = (salesHistory) => {
    if (!salesHistory || salesHistory.length === 0) {
        return { labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"], datasets: [{ data: [0, 0, 0, 0, 0, 0] }] };
    }

    const labels = salesHistory.slice(-6).map(s => {
        const d = new Date(s.date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
    });
    const data = salesHistory.slice(-6).map(s => s.totalAmount);

    return {
        labels: labels.length > 0 ? labels : ["Sem dados"],
        datasets: [{ data: data.length > 0 ? data : [0] }]
    };
  };

  const loadStats = async () => {
    setLoading(true);
    const data = await getDashboardStats();
    setStats(data);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => { loadStats(); }, [])
  );

  const StatCard = ({ icon, title, value, color, sub }) => (
    <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[s.iconBg, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={[s.cardValue, { color: theme.text }]}>{value}</Text>
        <Text style={[s.cardTitle, { color: theme.textSecondary }]}>{title}</Text>
        {sub && <Text style={[s.cardSub, { color: color }]}>{sub}</Text>}
    </View>
  );

  const PopularItem = ({ item, index }) => (
    <View style={[s.rankItem, { borderBottomColor: theme.border }]}>
        <Text style={[s.rankIndex, { color: theme.textSecondary }]}>#{index + 1}</Text>
        <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[s.rankTitle, { color: theme.text }]}>{item.title}</Text>
            <View style={s.progressBarBg}>
                <View style={[s.progressBarFill, { width: `${Math.min(item.viewCount * 10, 100)}%`, backgroundColor: theme.primary }]} />
            </View>
        </View>
        <Text style={[s.rankViews, { color: theme.primary }]}>{item.viewCount} views</Text>
    </View>
  );

  if (loading) return <View style={[s.container, s.center, { backgroundColor: theme.background }]}><ActivityIndicator size="large" color={theme.primary} /></View>;

  const chartData = processChartData(stats?.salesHistory);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        
        <View style={s.header}>
            <Text style={[s.headerTitle, { color: theme.text }]}>Dashboard</Text>
            <Text style={[s.headerSub, { color: theme.textSecondary }]}>Visão geral do negócio</Text>
        </View>

        <View style={s.chartContainer}>
            <Text style={[s.sectionTitle, { color: theme.text, marginLeft: 20 }]}>Receita de Vendas</Text>
            <LineChart
                data={chartData}
                width={screenWidth} 
                height={220}
                yAxisLabel="R$ "
                chartConfig={{
                    backgroundColor: theme.background,
                    backgroundGradientFrom: theme.background,
                    backgroundGradientTo: theme.background,
                    decimalPlaces: 0, 
                    color: (opacity = 1) => `rgba(0, 167, 157, ${opacity})`, 
                    labelColor: (opacity = 1) => theme.textSecondary,
                    style: { borderRadius: 16 },
                    propsForDots: { r: "5", strokeWidth: "2", stroke: theme.primary }
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 16 }}
            />
        </View>

        <View style={s.grid}>
            <StatCard 
                icon="cash-outline" color="#34C759" 
                title="Receita Total" value={`R$ ${stats?.totalRevenue.toFixed(2)}`} 
                sub="+12% essa semana"
            />
            <StatCard 
                icon="checkmark-done-circle-outline" color="#007AFF" 
                title="Quadros Vendidos" value={stats?.totalSold} 
                sub="Estoque atualizado"
            />
            <StatCard 
                icon="images-outline" color="#FF9500" 
                title="Em Estoque" value={stats?.totalProducts} 
                sub="Disponíveis agora"
            />
            <StatCard 
                icon="eye-outline" color="#FF2D55" 
                title="Total Visualizações" value={stats?.totalViews} 
                sub="Interesse alto"
            />
        </View>

        <View style={[s.rankContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[s.sectionTitle, { color: theme.text, marginBottom: 15 }]}>Mais Visitados</Text>
            {stats?.popularProducts.length > 0 ? (
                stats.popularProducts.map((item, index) => (
                    <PopularItem key={index} item={item} index={index} />
                ))
            ) : (
                <Text style={{ color: theme.textSecondary, textAlign: 'center', padding: 20 }}>
                    Ainda sem dados suficientes.
                </Text>
            )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20 },
  headerTitle: { fontSize: 32, fontWeight: 'bold' },
  headerSub: { fontSize: 14 },
  
  chartContainer: { marginBottom: 20 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, justifyContent: 'space-between' },
  card: { width: '48%', padding: 15, borderRadius: 16, marginBottom: 15, borderWidth: 1, elevation: 2 },
  iconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 2 },
  cardTitle: { fontSize: 12, fontWeight: '600' },
  cardSub: { fontSize: 10, marginTop: 5, fontWeight: 'bold' },

  rankContainer: { margin: 20, padding: 20, borderRadius: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  rankItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  rankIndex: { fontSize: 16, fontWeight: 'bold', width: 30 },
  rankTitle: { fontSize: 14, fontWeight: '600', marginBottom: 5 },
  rankViews: { fontSize: 12, fontWeight: 'bold' },
  
  progressBarBg: { height: 4, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 2, width: '100%' },
  progressBarFill: { height: '100%', borderRadius: 2 },
});

export default DashboardScreen;