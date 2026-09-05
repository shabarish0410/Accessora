import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Visitor, Purpose, PURPOSE, C, genTempId } from "../types";
import { BackBar, BigBtn } from "./Atoms";
import { VoiceTextInput } from "./VoiceTextInput";
import { VisitorService } from "../services/visitors";
import { TranslationService } from "../services/TranslationService";
import { supabase } from "../services/supabase";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4;

type SpeechLang = "en-IN" | "te-IN";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validateMobile(n: string): boolean {
  return /^[6-9]\d{9}$/.test(n);
}

// ─── StepHead ─────────────────────────────────────────────────────────────────

function StepHead({
  icon,
  title,
  sub,
}: {
  icon: string;
  title: string;
  sub: string;
}) {
  return (
    <View style={s.stepHead}>
      <Text style={s.stepIcon}>{icon}</Text>
      <Text style={s.stepTitle}>{title}</Text>
      <Text style={s.stepSub}>{sub}</Text>
    </View>
  );
}

// ─── Step 1: Camera + Name ────────────────────────────────────────────────────

function CameraStep({
  photoUri,
  name,
  origin,
  onPhotoTaken,
  onRetake,
  setName,
  setOrigin,
}: {
  photoUri: string;
  name: string;
  origin: string;
  onPhotoTaken: (uri: string) => void;
  onRetake: () => void;
  setName: (v: string) => void;
  setOrigin: (v: string) => void;
}) {
  const [perm, requestPerm] = useCameraPermissions();
  const camRef = useRef<CameraView>(null);
  const [capturing, setCapturing] = useState(false);
  const [camErr, setCamErr] = useState<string | null>(null);

  const takePhoto = async () => {
    if (!camRef.current || capturing) return;
    setCapturing(true);
    setCamErr(null);
    try {
      const pic = await camRef.current.takePictureAsync({ quality: 0.7 });
      onPhotoTaken(pic.uri);
    } catch {
      setCamErr("Failed to capture. Please try again.");
    } finally {
      setCapturing(false);
    }
  };

  // ── Photo captured: preview + name form ──────────────────────────────────
  if (photoUri) {
    return (
      <View>
        <StepHead
          icon="📸"
          title="Photo Captured"
          sub="Enter visitor details below"
        />

        <View style={s.previewRow}>
          <Image
            source={{ uri: photoUri }}
            style={s.capturedPhoto}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={s.retakeBtn}
            onPress={onRetake}
            accessibilityLabel="Retake visitor photo"
          >
            <Text>🔄</Text>
            <Text style={s.retakeTxt}>Retake</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.fieldLabel}>Visitor Name *</Text>
        <VoiceTextInput
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor={C.textMuted}
          style={s.input}
          lang="en-IN"
        />

        <Text style={s.fieldLabel}>Organisation / Place (optional)</Text>
        <VoiceTextInput
          value={origin}
          onChangeText={setOrigin}
          placeholder="e.g. Ministry of Finance, Mumbai"
          placeholderTextColor={C.textMuted}
          style={s.input}
          lang="en-IN"
        />
      </View>
    );
  }

  // ── Permission loading ────────────────────────────────────────────────────
  if (!perm) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={s.hint}>Checking camera access…</Text>
      </View>
    );
  }

  // ── Permission denied ────────────────────────────────────────────────────
  if (!perm.granted) {
    return (
      <View style={s.center}>
        <Text style={s.bigIcon}>📷</Text>
        <Text style={s.errTitle}>Camera Access Required</Text>
        <Text style={s.errSub}>
          Please allow camera access to photograph the visitor.
        </Text>
        <TouchableOpacity
          style={s.permBtn}
          onPress={requestPerm}
          accessibilityLabel="Grant camera permission"
        >
          <Text style={s.permBtnTxt}>Grant Camera Access</Text>
        </TouchableOpacity>
        {camErr && <Text style={s.errInline}>{camErr}</Text>}
      </View>
    );
  }

  // ── Live camera view ──────────────────────────────────────────────────────
  return (
    <View>
      <StepHead
        icon="📷"
        title="Capture Visitor Photo"
        sub="Position visitor in frame and tap capture"
      />
      <View style={s.cameraWrap}>
        <CameraView
          ref={camRef}
          style={s.camera}
          facing="back"
          accessibilityLabel="Camera preview"
        />
        <View style={s.captureOverlay}>
          <TouchableOpacity
            onPress={takePhoto}
            disabled={capturing}
            style={[s.captureBtn, capturing && { opacity: 0.6 }]}
            accessibilityLabel="Capture visitor photo"
          >
            {capturing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={s.captureBtnIcon}>📸</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      {camErr && <Text style={s.errInline}>{camErr}</Text>}
    </View>
  );
}

// ─── Step 2: Purpose (free text + English/Telugu speech) ──────────────────────

function PurposeStep({
  reason,
  setReason,
}: {
  reason: string;
  setReason: (v: string) => void;
}) {
  const [lang, setLang] = useState<SpeechLang>("en-IN");

  return (
    <View>
      <StepHead
        icon="💬"
        title="Purpose of Visit"
        sub="Type or speak the reason (optional)"
      />

      <View style={s.langRow}>
        <Text style={s.langLabel}>🎤 Speak in:</Text>
        {(["en-IN", "te-IN"] as SpeechLang[]).map((l) => (
          <TouchableOpacity
            key={l}
            onPress={() => setLang(l)}
            style={[
              s.langBtn,
              lang === l && {
                borderColor: C.primary,
                backgroundColor: `${C.primary}15`,
              },
            ]}
            accessibilityLabel={`Speak in ${
              l === "en-IN" ? "English" : "Telugu"
            }`}
          >
            <Text
              style={[
                s.langBtnTxt,
                { color: lang === l ? C.primary : C.textSecondary },
              ]}
            >
              {l === "en-IN" ? "English" : "తెలుగు"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <VoiceTextInput
        value={reason}
        onChangeText={setReason}
        placeholder="Purpose / reason for visit…"
        placeholderTextColor={C.textMuted}
        style={[s.input, s.multiline]}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        lang={lang}
        voiceEnabled={true}
      />

      <Text style={s.optionalNote}>
        ✎ This field is optional — you may skip it.
      </Text>
    </View>
  );
}

// ─── Step 3: Visitor Type ──────────────────────────────────────────────────────

function TypeStep({
  purpose,
  setPurpose,
}: {
  purpose: Purpose | null;
  setPurpose: (p: Purpose) => void;
}) {
  return (
    <View>
      <StepHead
        icon="🎯"
        title="Visitor Type"
        sub="Select the category for this visit"
      />
      <View style={s.purposeGrid}>
        {(Object.keys(PURPOSE) as Purpose[]).map((p) => {
          const cfg = PURPOSE[p];
          const sel = purpose === p;
          return (
            <TouchableOpacity
              key={p}
              onPress={() => setPurpose(p)}
              style={[
                s.purposeCard,
                {
                  backgroundColor: sel ? cfg.bg : C.surface,
                  borderColor: sel ? cfg.color : C.border,
                },
              ]}
              accessibilityLabel={`Visitor type: ${cfg.label}${
                sel ? ", selected" : ""
              }`}
            >
              <Text style={s.purposeIcon}>{cfg.icon}</Text>
              <Text
                style={[
                  s.purposeLabel,
                  { color: sel ? cfg.color : C.textPrimary },
                ]}
              >
                {cfg.label}
              </Text>
              {sel && (
                <Text style={[s.purposeSel, { color: cfg.color }]}>✓</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Step 4: Mobile Number ─────────────────────────────────────────────────────

function MobileStep({
  mobile,
  setMobile,
}: {
  mobile: string;
  setMobile: (v: string) => void;
}) {
  const isValid = validateMobile(mobile);
  const isTen = mobile.length === 10;

  return (
    <View>
      <StepHead
        icon="📱"
        title="Mobile Number"
        sub="Enter visitor's 10-digit Indian mobile number"
      />

      <View
        style={[
          s.mobileDisplay,
          { borderColor: isValid ? C.success : C.border },
        ]}
      >
        <Text style={s.countryCode}>🇮🇳 +91</Text>
        <View style={s.digitRow}>
          {mobile
            .padEnd(10, "·")
            .split("")
            .map((ch, i) => (
              <Text
                key={i}
                style={[s.digit, { opacity: i < mobile.length ? 1 : 0.3 }]}
              >
                {ch}
              </Text>
            ))}
        </View>
        {isValid && <Text style={s.validTxt}>✓ Valid number</Text>}
        {isTen && !isValid && (
          <Text style={[s.validTxt, { color: C.error }]}>
            ✕ Must start with 6, 7, 8 or 9
          </Text>
        )}
      </View>

      <View style={s.keypadGrid}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map(
          (k, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                if (k === "⌫") setMobile(mobile.slice(0, -1));
                else if (k && mobile.length < 10) setMobile(mobile + k);
              }}
              disabled={!k}
              style={[
                s.keyBtn,
                {
                  backgroundColor: k === "⌫" ? `${C.error}15` : C.surface,
                  opacity: k ? 1 : 0,
                },
              ]}
              accessibilityLabel={
                k === "⌫" ? "Delete last digit" : k ? `Digit ${k}` : undefined
              }
            >
              <Text
                style={[
                  s.keyTxt,
                  { color: k === "⌫" ? C.error : C.textPrimary },
                ]}
              >
                {k}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
}

// ─── Confirmation Screen ───────────────────────────────────────────────────────

function ConfirmScreen({
  name,
  photoUri,
  purpose,
  mobile,
  visitorId,
  smsStatus,
  onDone,
}: {
  name: string;
  photoUri: string;
  purpose: Purpose;
  mobile: string;
  visitorId: string;
  smsStatus: "pending" | "sent" | "failed";
  onDone: () => void;
}) {
  const cfg = PURPOSE[purpose];
  return (
    <ScrollView contentContainerStyle={s.confirmWrap}>
      <Text style={s.confirmMark}>✅</Text>
      <Text style={s.confirmTitle}>Visitor Checked In!</Text>
      <Text style={s.confirmSub}>Registration complete</Text>

      {photoUri !== "" && (
        <Image source={{ uri: photoUri }} style={s.confirmAvatar} />
      )}
      <Text style={s.confirmName}>{name}</Text>
      <Text style={s.confirmType}>
        {cfg.icon} {cfg.label}
      </Text>

      {/* Visitor ID badge */}
      <View style={s.idCard}>
        <Text style={s.idLabel}>VISITOR PASS ID</Text>
        <Text style={s.idNumber}>{visitorId}</Text>
        <Text style={s.idHint}>Show this ID at the gate when leaving</Text>
      </View>

      {/* SMS status */}
      <View
        style={[
          s.smsCard,
          {
            borderColor:
              smsStatus === "sent"
                ? C.success
                : smsStatus === "failed"
                ? C.error
                : C.warning,
            backgroundColor:
              smsStatus === "sent"
                ? `${C.success}10`
                : smsStatus === "failed"
                ? `${C.error}10`
                : `${C.warning}10`,
          },
        ]}
      >
        {smsStatus === "pending" ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ActivityIndicator size="small" color={C.warning} />
            <Text style={[s.smsTxt, { color: C.warning }]}>Sending SMS…</Text>
          </View>
        ) : smsStatus === "sent" ? (
          <Text style={[s.smsTxt, { color: C.success }]}>
            ✓ SMS sent to +91 {mobile} — Visitor ID: {visitorId}
          </Text>
        ) : (
          <Text style={[s.smsTxt, { color: C.error }]}>
            ⚠ SMS could not be sent. Please note your Visitor ID: {visitorId}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={s.doneBtn}
        onPress={onDone}
        accessibilityLabel="Done, return to home screen"
      >
        <Text style={s.doneTxt}>✓ Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Main Flow Orchestrator ────────────────────────────────────────────────────

export function AddVisitorFlow({
  onSubmit,
  onBack,
}: {
  onSubmit: () => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState(1);

  // Form data
  const [photoUri, setPhotoUri] = useState("");
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [reason, setReason] = useState("");
  const [purpose, setPurpose] = useState<Purpose | null>(null);
  const [mobile, setMobile] = useState("");
  const [inputLanguage, setInputLanguage] = useState<"English" | "Hindi" | "Telugu">("English");

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [visitorId, setVisitorId] = useState("");
  const [smsStatus, setSmsStatus] = useState<"pending" | "sent" | "failed">(
    "pending"
  );

  const isValidMobile = validateMobile(mobile);

  const canGoNext = (): boolean => {
    if (step === 1) return !!photoUri && !!name.trim();
    if (step === 2) return true; // reason is optional
    if (step === 3) return !!purpose;
    if (step === 4) return isValidMobile;
    return false;
  };

  const handleSubmit = async () => {
    if (!purpose || !name.trim() || !isValidMobile || !photoUri || submitting)
      return;
    setSubmitting(true);

    const tempId = genTempId();
    setVisitorId(tempId);
    setSmsStatus("pending");

    try {
      // 1. Translate Purpose and Origin (Name remains untouched)
      const translatedReason = await TranslationService.translate(reason.trim(), inputLanguage);
      const translatedOrigin = await TranslationService.translate(origin.trim(), inputLanguage);

      // 2. Create visitor
      const visitorId = await VisitorService.createVisitor({
        tempId: tempId,
        name: name.trim(),
        purpose,
        reason: translatedReason || undefined,
        mobile,
        origin: translatedOrigin || "Not specified",
        status: "pending",
        purposeOriginal: reason.trim() || undefined,
        purposeEnglish: translatedReason || undefined,
        originOriginal: origin.trim() || undefined,
        originEnglish: translatedOrigin || "Not specified",
        inputLanguage: inputLanguage,
      });

      if (!visitorId) {
        throw new Error("Failed to create visitor record.");
      }

      try {
        // 2. Upload photo
        const response = await fetch(photoUri);
        const blob = await response.blob();
        
        let fileExt = photoUri.split('.').pop();
        if (!fileExt || fileExt.length > 5 || photoUri.startsWith('data:')) {
          fileExt = 'jpg';
        }
        
        const fileName = `${visitorId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('visitor-photos')
          .upload(fileName, blob, {
            contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`
          });

        if (uploadError) throw uploadError;

        // 3. Update visitor photo_path
        const updated = await VisitorService.updateVisitorPhoto(visitorId, fileName);
        if (!updated) {
          // If we fail to update the photo path, rollback storage and visitor
          await supabase.storage.from('visitor-photos').remove([fileName]);
          throw new Error("Failed to link photo to visitor.");
        }

        // Success
        setConfirmed(true);
        setTimeout(() => {
          setSmsStatus("sent");
          setSubmitting(false);
          onSubmit();
        }, 1500);
      } catch (photoError) {
        // Rollback visitor record if photo upload/link fails
        await VisitorService.deleteVisitor(visitorId);
        throw photoError;
      }
    } catch (error) {
      alert("Error adding visitor: " + (error as Error).message);
      setSubmitting(false);
    }
  };

  // ── Confirmation ────────────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <View style={s.container}>
        <ConfirmScreen
          name={name}
          photoUri={photoUri}
          purpose={purpose!}
          mobile={mobile}
          visitorId={visitorId}
          smsStatus={smsStatus}
          onDone={onBack}
        />
      </View>
    );
  }

  // ── Step labels ─────────────────────────────────────────────────────────────
  const nextLabel = () => {
    if (step === TOTAL_STEPS)
      return submitting ? "Submitting…" : "✓ Submit & Generate Pass";
    if (step === 1) return "Next — Enter Purpose →";
    if (step === 2) return "Next — Select Type →";
    if (step === 3) return "Next — Enter Mobile →";
    return "Next →";
  };

  const handleBack = () => {
    if (step > 1) setStep((n) => n - 1);
    else onBack();
  };

  return (
    <View style={s.container}>
      <BackBar title="New Visitor Check-in" onBack={handleBack} />

      {/* Language Selector */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingTop: 10, gap: 10, justifyContent: 'center' }}>
        {(["English", "Hindi", "Telugu"] as const).map(lang => (
          <TouchableOpacity 
            key={lang} 
            onPress={() => setInputLanguage(lang)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 16,
              borderRadius: 20,
              backgroundColor: inputLanguage === lang ? C.primary : C.surface,
              borderWidth: 1,
              borderColor: inputLanguage === lang ? C.primary : C.border,
            }}
          >
            <Text style={{ color: inputLanguage === lang ? '#fff' : C.textSecondary, fontWeight: '600' }}>
              {lang === 'Hindi' ? 'हिंदी' : lang === 'Telugu' ? 'తెలుగు' : 'English'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Progress bar */}
      <View style={s.progressRow}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <View
            key={i}
            style={[
              s.progressSeg,
              { backgroundColor: i + 1 <= step ? C.primary : C.border },
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {step === 1 && (
          <CameraStep
            photoUri={photoUri}
            name={name}
            origin={origin}
            onPhotoTaken={setPhotoUri}
            onRetake={() => setPhotoUri("")}
            setName={setName}
            setOrigin={setOrigin}
          />
        )}
        {step === 2 && <PurposeStep reason={reason} setReason={setReason} />}
        {step === 3 && (
          <TypeStep purpose={purpose} setPurpose={setPurpose} />
        )}
        {step === 4 && (
          <MobileStep mobile={mobile} setMobile={setMobile} />
        )}

        <View style={{ marginTop: 24 }}>
          <BigBtn
            label={nextLabel()}
            color={step === TOTAL_STEPS ? C.success : C.primary}
            disabled={!canGoNext() || (step === TOTAL_STEPS && submitting)}
            onClick={
              step === TOTAL_STEPS
                ? handleSubmit
                : () => setStep((n) => n + 1)
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  progressRow: {
    flexDirection: "row",
    gap: 6,
    paddingTop: 14,
    paddingHorizontal: 20,
  },
  progressSeg: { flex: 1, height: 5, borderRadius: 3 },
  scroll: { padding: 20, paddingBottom: 48 },

  // StepHead
  stepHead: { alignItems: "center", marginBottom: 24 },
  stepIcon: { fontSize: 48, marginBottom: 10 },
  bigIcon: { fontSize: 48 },
  stepTitle: { fontWeight: "900", fontSize: 22, color: C.textPrimary },
  stepSub: {
    color: C.textSecondary,
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },

  // Camera
  cameraWrap: {
    borderRadius: 20,
    overflow: "hidden",
    height: 320,
    position: "relative",
    marginBottom: 20,
  },
  camera: { flex: 1 },
  captureOverlay: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  captureBtnIcon: { fontSize: 28 },
  center: { alignItems: "center", paddingVertical: 48, gap: 16 },
  hint: { color: C.textSecondary, fontSize: 14 },
  errTitle: { fontWeight: "800", fontSize: 18, color: C.textPrimary },
  errSub: {
    color: C.textSecondary,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  permBtn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  permBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
  errInline: { color: C.error, fontSize: 13, marginTop: 8 },

  // Photo preview
  previewRow: { alignItems: "center", marginBottom: 20, gap: 12 },
  capturedPhoto: {
    width: 160,
    height: 160,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: C.primary,
  },
  retakeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    backgroundColor: C.surface,
  },
  retakeTxt: { color: C.textSecondary, fontWeight: "600", fontSize: 14 },

  // Fields
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: C.textPrimary,
    marginBottom: 12,
  },
  flex1: { flex: 1, marginBottom: 0 },
  multiline: { minHeight: 88, paddingTop: 14 },
  rowWithMic: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  // Mic button
  micBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  micIcon: { fontSize: 22 },

  // Language selector / speech
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  langLabel: { color: C.textSecondary, fontSize: 14, fontWeight: "600" },
  langBtn: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  langBtnTxt: { fontSize: 14, fontWeight: "700" },
  statusMsg: { fontSize: 13, lineHeight: 18, marginTop: 4, marginBottom: 4 },
  mutedNote: { color: C.textMuted, fontSize: 12, marginTop: 8 },
  optionalNote: {
    color: C.textMuted,
    fontSize: 12,
    marginTop: 10,
    textAlign: "center",
  },

  // Visitor Type
  purposeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 24,
  },
  purposeCard: {
    width: "47%",
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 10,
  },
  purposeIcon: { fontSize: 44 },
  purposeLabel: { fontWeight: "800", fontSize: 15 },
  purposeSel: { fontSize: 16, fontWeight: "900" },

  // Mobile keypad
  mobileDisplay: {
    backgroundColor: C.surface,
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  countryCode: { fontSize: 16, color: C.textSecondary, fontWeight: "600" },
  digitRow: { flexDirection: "row", justifyContent: "center", gap: 4 },
  digit: {
    fontSize: 30,
    fontWeight: "900",
    color: C.textPrimary,
    letterSpacing: 4,
  },
  validTxt: { color: C.success, fontSize: 12, fontWeight: "700", marginTop: 4 },
  keypadGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  keyBtn: {
    width: "30%",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  keyTxt: { fontSize: 22, fontWeight: "700" },

  // Confirmation
  confirmWrap: {
    alignItems: "center",
    padding: 24,
    paddingBottom: 60,
    gap: 12,
  },
  confirmMark: { fontSize: 64, marginBottom: 4 },
  confirmTitle: { fontWeight: "900", fontSize: 26, color: C.textPrimary },
  confirmSub: { color: C.textSecondary, fontSize: 14 },
  confirmAvatar: {
    width: 120,
    height: 120,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: C.primary,
    marginVertical: 8,
  },
  confirmName: { fontWeight: "800", fontSize: 22, color: C.textPrimary },
  confirmType: { fontSize: 16, color: C.textSecondary, fontWeight: "600" },
  idCard: {
    backgroundColor: C.primaryDark,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 40,
    alignItems: "center",
    marginVertical: 12,
    width: "100%",
    gap: 6,
  },
  idLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },
  idNumber: {
    color: "#fff",
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: 10,
  },
  idHint: { color: "rgba(255,255,255,0.55)", fontSize: 12 },
  smsCard: { borderWidth: 1, borderRadius: 14, padding: 14, width: "100%" },
  smsTxt: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  doneBtn: {
    backgroundColor: C.success,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginTop: 8,
    width: "100%",
    alignItems: "center",
  },
  doneTxt: { color: "#fff", fontWeight: "900", fontSize: 18 },
});
