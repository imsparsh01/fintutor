import { StyleSheet, View } from 'react-native';
import { colors } from '../design/tokens';

export type TabIconName = 'home' | 'portfolio' | 'goals' | 'tools' | 'chat';

type Props = {
  name: TabIconName;
  color: string;
  focused: boolean;
};

/**
 * Small code-native icon set for primary navigation. Keeping these shapes local
 * avoids adding an icon dependency for five simple, app-specific glyphs.
 */
export function TabIcon({ name, color, focused }: Props) {
  return (
    <View style={[styles.frame, focused && styles.frameFocused]}>
      {name === 'home' && (
        <View style={styles.homeIcon}>
          <View style={[styles.homeRoof, { borderColor: color }]} />
          <View style={[styles.homeBody, { borderColor: color }]}>
            <View style={[styles.homeDoor, { backgroundColor: color }]} />
          </View>
        </View>
      )}

      {name === 'portfolio' && (
        <View style={styles.portfolioIcon}>
          <View style={[styles.portfolioHandle, { borderColor: color }]} />
          <View style={[styles.portfolioCase, { borderColor: color }]}>
            <View style={[styles.portfolioRule, { backgroundColor: color }]} />
            <View style={[styles.portfolioClasp, { backgroundColor: color }]} />
          </View>
        </View>
      )}

      {name === 'goals' && (
        <View style={[styles.goalOuter, { borderColor: color }]}>
          <View style={[styles.goalMiddle, { borderColor: color }]}>
            <View style={[styles.goalCentre, { backgroundColor: color }]} />
          </View>
        </View>
      )}

      {name === 'tools' && (
        <View style={[styles.calculator, { borderColor: color }]}>
          <View style={[styles.calculatorDisplay, { backgroundColor: color }]} />
          <View style={styles.calculatorKeys}>
            {[0, 1, 2, 3].map((key) => (
              <View key={key} style={[styles.calculatorKey, { backgroundColor: color }]} />
            ))}
          </View>
        </View>
      )}

      {name === 'chat' && (
        <View style={styles.chatIcon}>
          <View style={[styles.chatBubble, { borderColor: color }]}>
            <View style={styles.chatDots}>
              {[0, 1, 2].map((dot) => (
                <View key={dot} style={[styles.chatDot, { backgroundColor: color }]} />
              ))}
            </View>
          </View>
          <View style={[styles.chatTail, { borderColor: color }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: 34,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameFocused: { backgroundColor: colors.tutorSoft },

  homeIcon: { width: 20, height: 20, alignItems: 'center' },
  homeRoof: {
    position: 'absolute',
    top: 1,
    width: 13,
    height: 13,
    borderTopWidth: 1.8,
    borderLeftWidth: 1.8,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  homeBody: {
    position: 'absolute',
    bottom: 1,
    width: 15,
    height: 11,
    borderWidth: 1.8,
    borderTopWidth: 0,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  homeDoor: { width: 3, height: 6, borderTopLeftRadius: 1, borderTopRightRadius: 1 },

  portfolioIcon: { width: 21, height: 19, justifyContent: 'flex-end' },
  portfolioHandle: {
    position: 'absolute',
    top: 0,
    left: 7,
    width: 8,
    height: 6,
    borderWidth: 1.7,
    borderBottomWidth: 0,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  portfolioCase: {
    height: 15,
    borderWidth: 1.8,
    borderRadius: 3,
    overflow: 'hidden',
  },
  portfolioRule: { position: 'absolute', left: 0, right: 0, top: 6, height: 1.5 },
  portfolioClasp: {
    position: 'absolute',
    top: 4,
    left: 8,
    width: 4,
    height: 5,
    borderRadius: 1,
  },

  goalOuter: {
    width: 20,
    height: 20,
    borderWidth: 1.7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalMiddle: {
    width: 11,
    height: 11,
    borderWidth: 1.7,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCentre: { width: 3.5, height: 3.5, borderRadius: 2 },

  calculator: { width: 17, height: 21, borderWidth: 1.7, borderRadius: 3, padding: 3 },
  calculatorDisplay: { height: 3, borderRadius: 1, marginBottom: 4 },
  calculatorKeys: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  calculatorKey: { width: 3.5, height: 3.5, borderRadius: 1 },

  chatIcon: { width: 21, height: 20 },
  chatBubble: {
    width: 21,
    height: 16,
    borderWidth: 1.8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatDots: { flexDirection: 'row', gap: 2.5 },
  chatDot: { width: 2.5, height: 2.5, borderRadius: 2 },
  chatTail: {
    position: 'absolute',
    left: 4,
    bottom: 1,
    width: 7,
    height: 7,
    borderLeftWidth: 1.8,
    transform: [{ rotate: '-35deg' }],
  },
});
