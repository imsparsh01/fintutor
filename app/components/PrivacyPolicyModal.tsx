import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font, spacing } from '../design/tokens';
import { typography } from '../design/typography';

const SECTIONS = [
  ['Information we collect', 'Account and authentication details; optional onboarding; an optional confirmed financial-dependant count and self-reported emergency-fund coverage in months; holdings, income, spending categories and goals you record; learning progression and streak activity; and messages while an Arya request is processed. Blank context stays unknown and is never converted to zero. FinTutor is for people aged 18 or older.'],
  ['How we use it', 'To operate and secure the app, show your records, run educational models you request, tailor explanations, maintain learning progress, troubleshoot, provide export and deletion controls, and create de-identified first-party product measurements. We do not sell personal information, use it for advertising, decide credit or insurance eligibility, or reward financial outcomes.'],
  ['Supabase and Anthropic', 'Supabase provides authentication and managed PostgreSQL. Application tables are available only through FinTutor’s authenticated backend. Anthropic processes the minimised, masked context needed for the current Arya request; FinTutor keeps no conversation memory across sessions. Product/institution names and recognised identifiers are replaced with request-local tokens before model processing. Masking reduces exposure but is not an absolute guarantee; avoid unnecessary sensitive details. No production FastAPI host has been selected, and we do not state an unverified provider retention period.'],
  ['Retention', 'Active records remain for the account lifetime unless changed, cleared or deleted. Individual learning events are retained up to 400 days; daily rollups and the summary remain for the account lifetime. Recovery-only encrypted backups may retain deleted data for up to seven days and are not used for normal serving. FinTutor does not create additional long-lived manual copies of deleted account data.'],
  ['Your controls', 'Optional context can be viewed, changed or cleared without losing access. You can correct or delete records, download active user-owned data as JSON after fresh authentication, and delete your account. Your browser or device and chosen save/share destination handle an export; FinTutor does not silently upload it. Account deletion removes active records before the authentication identity.'],
  ['Security', 'FinTutor uses TLS, Supabase-managed encryption at rest, verified tokens, backend ownership checks, restricted database roles, minimisation and request-local masking. No system is perfectly secure.'],
  ['Contact and changes', 'During the closed internal MVP, contact the FinTutor project owner through the same private channel that provided access. Material changes will be shown in-product. This policy and flow require qualified India privacy/fintech counsel review before external real-user collection or launch.'],
] as const;

export function PrivacyPolicyModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Pressable accessibilityRole="button" onPress={onClose}><Text style={styles.close}>Close</Text></Pressable>
        </View>
        <Text style={styles.meta}>Internal MVP v1 · Effective 14 August 2026</Text>
        {SECTIONS.map(([heading, body]) => (
          <View key={heading} style={styles.section}>
            <Text style={styles.heading}>{heading}</Text>
            <Text style={styles.body}>{body}</Text>
          </View>
        ))}
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.screen },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: typography.pageTitle,
  close: { fontFamily: font.uiMedium, color: colors.tutor, padding: spacing.sm },
  meta: { fontFamily: font.mono, fontSize: 12, color: colors.inkMuted, marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  heading: { fontFamily: font.uiSemibold, fontSize: 16, color: colors.ink, marginBottom: spacing.xs },
  body: { fontFamily: font.ui, fontSize: 14, lineHeight: 21, color: colors.inkSecondary },
});
