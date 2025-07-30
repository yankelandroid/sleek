import { useAlarmState } from "@/hooks/use-alarm-state";
import { Alarm } from "@shared/api";
import {
  Plus,
  Edit2,
  Trash2,
  Music,
  Square,
  Upload,
  Globe,
} from "lucide-react";
import { CurrentTime } from "@/components/CurrentTime";
import { AudioPermissionManager } from "@/utils/audio-permission";
import { useEffect, useState } from "react";

function AlarmCard({
  alarm,
  onEdit,
  onDelete,
  onToggle,
  onStop,
}: {
  alarm: Alarm;
  onEdit: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onStop: (id: string) => void;
}) {
  return (
    <div
      className={`bg-alarm-surface border rounded-2xl p-5 transition-all duration-300 hover:bg-alarm-surface-light hover:scale-[1.02] animate-slide-up glass-effect ${
        alarm.isTriggered
          ? "border-red-500 bg-red-500/10 animate-pulse"
          : "border-alarm-surface-light"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          {alarm.isTriggered && (
            <div className="text-red-400 text-sm font-medium mb-2 flex items-center gap-2">
              🔔 RÉVEIL EN COURS
            </div>
          )}
          <div
            className={`text-4xl sm:text-3xl font-semibold mb-2 sm:mb-1 transition-colors duration-200 ${
              alarm.enabled ? "text-alarm-text" : "text-alarm-text-light"
            } ${alarm.isTriggered ? "text-red-400" : ""}`}
          >
            {alarm.time}
          </div>
          <div className="text-alarm-text-muted text-base mb-2 sm:mb-1">
            {alarm.label}
          </div>
          {alarm.songTitle && (
            <div className="flex items-center gap-2 text-alarm-secondary text-sm">
              {alarm.youtubeUrl ? (
                <Globe className="w-4 h-4 flex-shrink-0" />
              ) : (
                <Music className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="truncate">{alarm.songTitle}</span>
              {alarm.uploadedFileName && (
                <span className="text-xs bg-alarm-primary/20 text-alarm-primary px-2 py-0.5 rounded">
                  Uploadé
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          {alarm.isTriggered ? (
            <button
              onClick={() => onStop(alarm.id)}
              className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 button-hover-lift focus-ring animate-pulse"
            >
              <Square className="w-4 h-4 mr-1 inline" />
              Arrêter
            </button>
          ) : (
            <>
              <button
                onClick={() => onEdit(alarm)}
                className="bg-transparent border border-alarm-surface-lighter text-alarm-text-muted hover:bg-alarm-surface-lighter hover:text-alarm-text rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 button-hover-lift focus-ring"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onToggle(alarm.id)}
                className={`relative w-12 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-alarm-primary focus:ring-opacity-50 button-hover-lift ${
                  alarm.enabled
                    ? "bg-alarm-primary shadow-lg shadow-alarm-primary/30"
                    : "bg-alarm-surface-lighter"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-lg ${
                    alarm.enabled ? "left-5" : "left-0.5"
                  }`}
                />
              </button>

              <button
                onClick={() => onDelete(alarm.id)}
                className="bg-transparent text-red-400 hover:bg-red-400/10 hover:text-red-300 rounded-lg p-2 transition-all duration-200 button-hover-lift focus-ring"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onAddAlarm }: { onAddAlarm: () => void }) {
  return (
    <div className="text-center py-16 animate-bounce-in">
      <div className="w-20 h-20 bg-alarm-surface-light rounded-full flex items-center justify-center mx-auto mb-6 glass-effect animate-pulse-soft">
        <Music className="w-8 h-8 text-alarm-text-muted" />
      </div>
      <h3 className="text-xl font-medium text-alarm-text mb-2 animate-slide-down">
        Aucun réveil configuré
      </h3>
      <p className="text-alarm-text-muted mb-8 max-w-sm mx-auto animate-slide-up">
        Ajoutez votre premier réveil pour commencer à organiser vos matinées
      </p>
      <button
        onClick={onAddAlarm}
        className="bg-alarm-primary hover:bg-alarm-primary/90 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 animate-scale-in button-hover-lift focus-ring shadow-lg shadow-alarm-primary/30"
      >
        Créer mon premier réveil
      </button>
    </div>
  );
}

function AddAlarmModal({
  state,
  actions,
}: {
  state: ReturnType<typeof useAlarmState>["state"];
  actions: ReturnType<typeof useAlarmState>["actions"];
}) {
  const [audioSourceTab, setAudioSourceTab] = useState<"youtube" | "upload">(
    "youtube",
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!state.isAddingAlarm) return null;

  const isEditing = !!state.selectedAlarm?.id;

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("audio/")) {
      alert("Veuillez sélectionner un fichier audio valide.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      alert("Le fichier est trop volumineux. Taille maximale: 10MB");
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);

    try {
      // Convert file to base64 for server upload
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const tempAlarmId = `upload_${Date.now()}`;

          // Save to server via API
          const saveResponse = await fetch("/api/audio/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              alarmId: tempAlarmId,
              audioData: base64Data,
              filename: file.name,
            }),
          });

          if (!saveResponse.ok) {
            throw new Error(`Upload failed: ${saveResponse.status}`);
          }

          const saveResult = await saveResponse.json();

          if (saveResult.success && saveResult.filePath) {
            // Update alarm with uploaded file info
            actions.updateSelectedAlarm({
              songTitle: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
              localAudioPath: saveResult.filePath,
              conversionStatus: "ready",
              youtubeUrl: undefined, // Clear YouTube URL since we're using upload
            });

            console.log(`✅ File uploaded successfully: ${file.name}`);
          } else {
            throw new Error(saveResult.error || "Upload failed");
          }
        } catch (error) {
          console.error("Upload error:", error);
          alert("Erreur lors de l'upload. Veuillez réessayer.");
          setUploadedFile(null);
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        alert("Erreur lors de la lecture du fichier.");
        setIsUploading(false);
      };
    } catch (error) {
      console.error("File processing error:", error);
      alert("Erreur lors du traitement du fichier.");
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-alarm-overlay/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-alarm-surface border border-alarm-surface-light rounded-3xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in glass-effect shadow-2xl">
        <h3 className="text-xl md:text-2xl font-semibold text-alarm-text text-center mb-6 md:mb-8 animate-slide-down">
          {isEditing ? "Modifier le réveil" : "Ajouter un réveil"}
        </h3>

        <div className="space-y-6">
          {/* Time Input */}
          <div className="animate-slide-up">
            <label className="block text-alarm-text-muted text-sm font-medium mb-2">
              Heure
            </label>
            <input
              type="time"
              value={state.selectedAlarm?.time || ""}
              onChange={(e) =>
                actions.updateSelectedAlarm({ time: e.target.value })
              }
              className="w-full bg-alarm-surface-light border border-alarm-surface-lighter rounded-xl px-4 py-3 text-alarm-text text-lg focus:outline-none focus:ring-2 focus:ring-alarm-primary focus:border-transparent transition-all duration-200 focus-ring"
            />
          </div>

          {/* Label Input */}
          <div className="animate-slide-up">
            <label className="block text-alarm-text-muted text-sm font-medium mb-2">
              Libellé
            </label>
            <input
              type="text"
              placeholder="Mon réveil du matin"
              value={state.selectedAlarm?.label || ""}
              onChange={(e) =>
                actions.updateSelectedAlarm({ label: e.target.value })
              }
              className="w-full bg-alarm-surface-light border border-alarm-surface-lighter rounded-xl px-4 py-3 text-alarm-text focus:outline-none focus:ring-2 focus:ring-alarm-primary focus:border-transparent transition-all duration-200 focus-ring"
            />
          </div>

          {/* Audio Source Selection */}
          <div className="animate-slide-up">
            <label className="block text-alarm-text-muted text-sm font-medium mb-4">
              Source audio
            </label>

            {/* Tabs */}
            <div className="flex bg-alarm-surface-light rounded-xl p-1 mb-4">
              <button
                onClick={() => setAudioSourceTab("youtube")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  audioSourceTab === "youtube"
                    ? "bg-alarm-primary text-white shadow-lg"
                    : "text-alarm-text-muted hover:text-alarm-text"
                }`}
              >
                <Globe className="w-4 h-4" />
                YouTube
              </button>
              <button
                onClick={() => setAudioSourceTab("upload")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  audioSourceTab === "upload"
                    ? "bg-alarm-primary text-white shadow-lg"
                    : "text-alarm-text-muted hover:text-alarm-text"
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload MP3
              </button>
            </div>

            {/* YouTube URL Input */}
            {audioSourceTab === "youtube" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={state.youtubeQuery}
                    onChange={(e) => actions.setYoutubeQuery(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && actions.convertFromUrl()
                    }
                    className="flex-1 bg-alarm-surface-light border border-alarm-surface-lighter rounded-xl px-4 py-3 text-alarm-text focus:outline-none focus:ring-2 focus:ring-alarm-primary focus:border-transparent transition-all duration-200 focus-ring"
                  />
                  <button
                    onClick={actions.convertFromUrl}
                    disabled={state.isSearching || !state.youtubeQuery.trim()}
                    className="bg-alarm-secondary hover:bg-alarm-secondary/90 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 button-hover-lift focus-ring shadow-lg shadow-alarm-secondary/30 whitespace-nowrap"
                  >
                    {state.isSearching ? "⚡" : "Convertir"}
                  </button>
                </div>
              </div>
            )}

            {/* File Upload */}
            {audioSourceTab === "upload" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-alarm-surface-lighter rounded-xl p-6 text-center hover:border-alarm-primary/50 transition-colors duration-200">
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.ogg,.m4a"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                    className="hidden"
                    id="audio-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="audio-upload"
                    className="cursor-pointer block"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full bg-alarm-primary/10 flex items-center justify-center ${isUploading ? "animate-spin" : ""}`}
                      >
                        <Upload className="w-6 h-6 text-alarm-primary" />
                      </div>
                      <div>
                        <div className="text-alarm-text font-medium">
                          {isUploading
                            ? "Upload en cours..."
                            : "Choisir un fichier MP3"}
                        </div>
                        <div className="text-alarm-text-muted text-sm mt-1">
                          MP3, WAV, OGG, M4A • Max 10MB
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                {uploadedFile && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Music className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-green-400 font-medium">
                          Fichier uploadé avec succès
                        </div>
                        <div className="text-alarm-text-muted text-sm">
                          {uploadedFile.name} •{" "}
                          {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Selected Song Display */}
            {(state.selectedAlarm?.youtubeUrl ||
              state.selectedAlarm?.localAudioPath) &&
              state.selectedAlarm?.songTitle && (
                <div className="bg-alarm-secondary/10 border border-alarm-secondary/30 rounded-xl p-4 mb-4 animate-scale-in">
                  <div className="text-alarm-secondary text-sm font-medium mb-1">
                    {state.selectedAlarm.youtubeUrl
                      ? "Chanson YouTube sélectionnée:"
                      : "Fichier MP3 uploadé:"}
                  </div>
                  <div className="flex items-center gap-2 text-alarm-text mb-2">
                    <Music className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      {state.selectedAlarm.songTitle}
                    </span>
                  </div>
                  <div className="text-alarm-text-muted text-sm italic">
                    {state.selectedAlarm.conversionStatus === "converting" && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-alarm-secondary border-t-transparent rounded-full animate-spin"></div>
                        {state.selectedAlarm.youtubeUrl
                          ? "Conversion en cours..."
                          : "Upload en cours..."}
                      </div>
                    )}
                    {state.selectedAlarm.conversionStatus === "ready" && (
                      <div className="flex items-center gap-2">
                        <span>✅</span>
                        <span>
                          {state.selectedAlarm.youtubeUrl
                            ? "Fichier MP3 converti et prêt"
                            : "Fichier MP3 prêt pour le réveil"}
                        </span>
                      </div>
                    )}
                    {state.selectedAlarm.conversionStatus === "error" &&
                      "❌ Erreur lors du traitement"}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 animate-slide-up">
          <button
            onClick={actions.cancelAlarm}
            className="flex-1 bg-transparent border border-alarm-surface-lighter text-alarm-text-muted hover:bg-alarm-surface-light hover:text-alarm-text rounded-xl py-3 px-6 font-medium transition-all duration-200 button-hover-lift focus-ring"
          >
            Annuler
          </button>
          <button
            onClick={actions.saveAlarm}
            className="flex-1 bg-alarm-primary hover:bg-alarm-primary/90 text-white rounded-xl py-3 px-6 font-medium transition-all duration-200 button-hover-lift focus-ring shadow-lg shadow-alarm-primary/30"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const { state, actions } = useAlarmState();

  // Initialize audio permissions on component mount
  useEffect(() => {
    // Test audio capabilities and setup permissions
    AudioPermissionManager.testAudioPlayback().then((canPlay) => {
      if (canPlay) {
        console.log("🎵 Audio autoplay is available");
      } else {
        console.log(
          "🔇 Audio autoplay is restricted - will need user interaction",
        );
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Current Time Display */}
        <CurrentTime />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 animate-slide-down">
          <h1 className="text-3xl md:text-4xl font-bold text-alarm-text text-center sm:text-left">
            Mes Réveils
          </h1>
          <div className="flex gap-3">
            <button
              onClick={async () => {
                const enabled = await AudioPermissionManager.forceEnableAudio();
                if (enabled) {
                  console.log("🔊 Audio manually enabled");
                }
              }}
              className="bg-alarm-secondary hover:bg-alarm-secondary/90 text-white rounded-xl px-4 py-3 font-medium transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap button-hover-lift focus-ring shadow-lg shadow-alarm-secondary/30"
              title="Activer le son pour les réveils"
            >
              🔊
              <span className="hidden sm:inline text-sm">Son</span>
            </button>
            <button
              onClick={actions.addAlarm}
              className="bg-alarm-primary hover:bg-alarm-primary/90 text-white rounded-xl px-6 py-3 font-medium transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap animate-scale-in button-hover-lift focus-ring shadow-lg shadow-alarm-primary/30"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Ajouter un réveil</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          </div>
        </div>

        {/* Alarm List */}
        <div className="space-y-4 mb-8">
          {state.alarms.length === 0 ? (
            <EmptyState onAddAlarm={actions.addAlarm} />
          ) : (
            state.alarms.map((alarm) => (
              <AlarmCard
                key={alarm.id}
                alarm={alarm}
                onEdit={actions.editAlarm}
                onDelete={actions.deleteAlarm}
                onToggle={actions.toggleAlarm}
                onStop={actions.stopAlarm}
              />
            ))
          )}
        </div>

        {/* Add/Edit Modal */}
        <AddAlarmModal state={state} actions={actions} />
      </div>
    </div>
  );
}
