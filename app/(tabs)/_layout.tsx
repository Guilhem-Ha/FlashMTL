import React, { useRef, useState, useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import PagerView from 'react-native-pager-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { Colors } from '../../constants/theme'
import { tabScrollCallbacks } from '../../lib/tabScrollRefs'

import FeedScreen from './index'
import TransportScreen from './transport'
import ProfilScreen from './profil'

const TABS = [
  { emoji: '⚡', label: 'Offres' },
  { emoji: '🚗', label: 'Transport' },
  { emoji: '👤', label: 'Profil' },
]

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  const scale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.25, duration: 120, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4 }),
      ]).start()
    }
  }, [focused])

  return (
    <Animated.Text
      style={{ fontSize: 22, opacity: focused ? 1 : 0.4, transform: [{ scale }] }}
    >
      {emoji}
    </Animated.Text>
  )
}

export default function TabLayout() {
  const insets = useSafeAreaInsets()
  const bottomPad = Math.max(insets.bottom, 8)
  const tabBarHeight = 52 + bottomPad

  const [activePage, setActivePage] = useState(0)
  const pagerRef = useRef<PagerView>(null)

  const handleTabPress = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (index === activePage) {
      // Tap active tab → scroll to top
      tabScrollCallbacks[index]?.()
    } else {
      pagerRef.current?.setPage(index)
    }
  }, [activePage])

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={e => setActivePage(e.nativeEvent.position)}
        overdrag={false}
      >
        <View key="0" style={{ flex: 1 }}>
          <FeedScreen active={activePage === 0} />
        </View>
        <View key="1" style={{ flex: 1 }}>
          <TransportScreen active={activePage === 1} />
        </View>
        <View key="2" style={{ flex: 1 }}>
          <ProfilScreen active={activePage === 2} />
        </View>
      </PagerView>

      {/* Tab bar */}
      <View style={[styles.tabBar, { height: tabBarHeight, paddingBottom: bottomPad }]}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={i}
            style={styles.tabItem}
            onPress={() => handleTabPress(i)}
            activeOpacity={0.7}
          >
            <TabIcon emoji={tab.emoji} focused={activePage === i} />
            <Text style={[styles.tabLabel, activePage === i && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.cream,
    borderTopWidth: 1,
    borderTopColor: Colors.creamDark,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.3,
    color: Colors.inkMuted,
  },
  tabLabelActive: {
    color: Colors.accent,
  },
})
