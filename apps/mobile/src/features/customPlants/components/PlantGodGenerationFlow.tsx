import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { spacing } from "@sprout/design-tokens";
import { useRouter } from "expo-router";
import { AppButton } from "../../../components/AppButton";
import { useTheme } from "../../../providers/ThemeProvider";
import { usePlantGeneration } from "../hooks/usePlantGeneration";
import { GeneratedPlantPreview } from "./GeneratedPlantPreview";
import { GenerationPromptSheet } from "./GenerationPromptSheet";
import { CustomPlantCelebrationSheet } from "./CustomPlantCelebrationSheet";
import { PlantGenerationFailureSheet } from "./PlantGenerationFailureSheet";
export function PlantGodGenerationFlow({
  onSaved,
  onCompleted,
  onFailed,
  onCreditLockedChange,
}: {
  onSaved(): void;
  onCompleted(): void;
  onFailed(): void;
  onCreditLockedChange(locked: boolean): void;
}) {
  const router = useRouter();
  const theme = useTheme();
  const [open, setOpen] = useState(false),
    [previewOpen, setPreviewOpen] = useState(false),
    [celebrationOpen, setCelebrationOpen] = useState(false),
    [failureOpen, setFailureOpen] = useState(false),
    [prompt, setPrompt] = useState(""),
    [name, setName] = useState("");
  const generation = usePlantGeneration();
  useEffect(() => {
    if (generation.job?.status === "preview_ready") {
      setName(generation.job.suggestedName ?? "");
      setOpen(false);
    }
    if (generation.job?.status === "failed") {
      setOpen(false);
      setPreviewOpen(false);
      setFailureOpen(true);
    }
  }, [generation.job]);
  useEffect(() => {
    if (generation.error && !generation.job) setFailureOpen(true);
  }, [generation.error, generation.job]);
  const preview = generation.job?.status === "preview_ready";
  const generating =
    generation.busy ||
    Boolean(
      generation.job &&
        ["queued", "moderating", "planning", "generating", "validating", "repairing"].includes(
          generation.job.status,
        ),
    );
  useEffect(() => {
    onCreditLockedChange(generating || preview);
  }, [generating, onCreditLockedChange, preview]);
  function startGeneration(): void {
    setOpen(false);
    void generation.generate(prompt);
  }
  return (
    <>
      <View style={styles.root}>
        {generating ? (
          <View
            style={[
              styles.status,
              {
                backgroundColor: theme.dark ? "rgba(255,225,112,.09)" : "rgba(255,255,255,.5)",
                borderColor: theme.dark ? "rgba(225,179,45,.42)" : "rgba(122,82,0,.24)",
              },
            ]}
          >
            <View style={styles.statusHeading}>
              <View
                style={[styles.statusDot, { backgroundColor: theme.dark ? "#F5D34D" : "#A77400" }]}
              />
              <Text style={[styles.statusTitle, { color: theme.dark ? "#FFF1A8" : "#3E300C" }]}>
                Creating your plant
              </Text>
            </View>
            <Text style={[styles.statusCopy, { color: theme.dark ? "#D9C679" : "#765D1A" }]}>
              {generation.job?.currentStep ?? "Plant God is creating your plant in the background."}
            </Text>
          </View>
        ) : (
          <AppButton
            tone="disco"
            label={preview ? "Generation finished" : "Create custom plant"}
            disabled={generation.busy}
            onPress={() => (preview ? setPreviewOpen(true) : setOpen(true))}
          />
        )}
      </View>
      <GenerationPromptSheet
        visible={open && !preview}
        prompt={prompt}
        busy={generation.busy}
        error={generation.error}
        onChange={setPrompt}
        onGenerate={startGeneration}
        onClose={() => setOpen(false)}
      />
      {preview && generation.job ? (
        <GeneratedPlantPreview
          visible={previewOpen}
          job={generation.job}
          name={name}
          busy={generation.busy}
          error={generation.error}
          onNameChange={setName}
          onSave={() =>
            void generation.save(name).then((saved) => {
              if (!saved) return;
              setPrompt("");
              setPreviewOpen(false);
              setCelebrationOpen(true);
              onSaved();
            })
          }
          onClose={() => setPreviewOpen(false)}
        />
      ) : null}
      <CustomPlantCelebrationSheet
        job={celebrationOpen ? generation.job : null}
        onVisitSanctuary={() => {
          setCelebrationOpen(false);
          generation.reset();
          onCompleted();
          router.push("/(tabs)/sanctuary");
        }}
      />
      <PlantGenerationFailureSheet
        visible={failureOpen}
        message={generation.job?.failureMessage ?? generation.error ?? "Please try again later."}
        onClose={() => {
          setFailureOpen(false);
          generation.reset();
          onFailed();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: { width: "100%" },
  status: {
    minHeight: 92,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: spacing.sm,
    justifyContent: "center",
  },
  statusHeading: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  statusDot: { width: 9, height: 9, borderRadius: 999 },
  statusTitle: { flex: 1, fontFamily: "Outfit_700Bold", fontSize: 15, lineHeight: 19 },
  statusCopy: { fontFamily: "Outfit_400Regular", fontSize: 13, lineHeight: 19 },
});
