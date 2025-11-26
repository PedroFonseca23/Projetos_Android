import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StrengthBar = ({ pw }) => {
  const scoreObj = (() => {
    if (!pw) return { score: 0, label: 'Muito fraca' };
    let s = 0;
    if (pw.length >= 8) s += 0.3;
    if (/[a-z]/.test(pw)) s += 0.15;
    if (/[A-Z]/.test(pw)) s += 0.2;
    if (/\d/.test(pw)) s += 0.2;
    if (/[^A-Za-z0-9]/.test(pw)) s += 0.15;
    s = Math.min(1, s);
    return { score: s, label: s > 0.7 ? 'Forte' : s > 0.4 ? 'Média' : 'Fraca' };
  })();

  const width = `${Math.round(scoreObj.score * 100)}%`;
  const color = scoreObj.score > 0.7 ? '#00C851' : scoreObj.score > 0.4 ? '#ffbb33' : '#ff4444';

  return (
    <View style={s.strengthWrap}>
      <View style={s.strengthBg}>
        <View style={[s.strengthFill, { width, backgroundColor: color }]} />
      </View>
      <Text style={s.strLabel}>{scoreObj.label}</Text>
    </View>
  );
};

const s = StyleSheet.create({
  strengthWrap: { marginTop: -5, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  strengthBg: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 4, overflow: 'hidden', marginRight: 10 },
  strengthFill: { height: 8, borderRadius: 4 },
  strLabel: { color: '#fff', fontSize: 12 },
});

export default StrengthBar;