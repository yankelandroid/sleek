import { useAlarmState } from '@/hooks/use-alarm-state';
import { Alarm } from '@shared/api';
import { Plus, Edit2, Trash2, Music } from 'lucide-react';

function AlarmCard({ alarm, onEdit, onDelete, onToggle }: {
  alarm: Alarm;
  onEdit: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="bg-alarm-surface border border-alarm-surface-light rounded-2xl p-5 transition-all duration-300 hover:bg-alarm-surface-light hover:scale-[1.02] animate-slide-up glass-effect">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div
            className={`text-4xl sm:text-3xl font-semibold mb-2 sm:mb-1 transition-colors duration-200 ${
              alarm.enabled ? 'text-alarm-text' : 'text-alarm-text-light'
            }`}
          >
            {alarm.time}
          </div>
          <div className="text-alarm-text-muted text-base mb-2 sm:mb-1">
            {alarm.label}
          </div>
          {alarm.songTitle && (
            <div className="flex items-center gap-2 text-alarm-secondary text-sm">
              <Music className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{alarm.songTitle}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <button
            onClick={() => onEdit(alarm)}
            className="bg-transparent border border-alarm-surface-lighter text-alarm-text-muted hover:bg-alarm-surface-lighter hover:text-alarm-text rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 button-hover-lift focus-ring"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onToggle(alarm.id)}
            className={`relative w-12 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-alarm-primary focus:ring-opacity-50 button-hover-lift ${
              alarm.enabled ? 'bg-alarm-primary shadow-lg shadow-alarm-primary/30' : 'bg-alarm-surface-lighter'
            }`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-lg ${
                alarm.enabled ? 'left-5' : 'left-0.5'
              }`}
            />
          </button>

          <button
            onClick={() => onDelete(alarm.id)}
            className="bg-transparent text-red-400 hover:bg-red-400/10 hover:text-red-300 rounded-lg p-2 transition-all duration-200 button-hover-lift focus-ring"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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

function AddAlarmModal({ state, actions }: {
  state: ReturnType<typeof useAlarmState>['state'];
  actions: ReturnType<typeof useAlarmState>['actions'];
}) {
  if (!state.isAddingAlarm) return null;

  const isEditing = !!state.selectedAlarm?.id;

  return (
    <div className="fixed inset-0 bg-alarm-overlay/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-alarm-surface border border-alarm-surface-light rounded-3xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in glass-effect shadow-2xl">
        <h3 className="text-xl md:text-2xl font-semibold text-alarm-text text-center mb-6 md:mb-8 animate-slide-down">
          {isEditing ? 'Modifier le réveil' : 'Ajouter un réveil'}
        </h3>

        <div className="space-y-6">
          {/* Time Input */}
          <div className="animate-slide-up">
            <label className="block text-alarm-text-muted text-sm font-medium mb-2">
              Heure
            </label>
            <input
              type="time"
              value={state.selectedAlarm?.time || ''}
              onChange={(e) => actions.updateSelectedAlarm({ time: e.target.value })}
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
              value={state.selectedAlarm?.label || ''}
              onChange={(e) => actions.updateSelectedAlarm({ label: e.target.value })}
              className="w-full bg-alarm-surface-light border border-alarm-surface-lighter rounded-xl px-4 py-3 text-alarm-text focus:outline-none focus:ring-2 focus:ring-alarm-primary focus:border-transparent transition-all duration-200 focus-ring"
            />
          </div>

          {/* YouTube Search */}
          <div className="animate-slide-up">
            <label className="block text-alarm-text-muted text-sm font-medium mb-2">
              Chanson YouTube
            </label>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="text"
                placeholder="Rechercher une chanson..."
                value={state.youtubeQuery}
                onChange={(e) => actions.setYoutubeQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && actions.searchYoutube()}
                className="flex-1 bg-alarm-surface-light border border-alarm-surface-lighter rounded-xl px-4 py-3 text-alarm-text focus:outline-none focus:ring-2 focus:ring-alarm-primary focus:border-transparent transition-all duration-200 focus-ring"
              />
              <button
                onClick={actions.searchYoutube}
                disabled={state.isSearching}
                className="bg-alarm-secondary hover:bg-alarm-secondary/90 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 button-hover-lift focus-ring shadow-lg shadow-alarm-secondary/30 whitespace-nowrap"
              >
                {state.isSearching ? '🔍' : 'Rechercher'}
              </button>
            </div>

            {/* Selected Song Display */}
            {state.selectedAlarm?.youtubeUrl && (
              <div className="bg-alarm-secondary/10 border border-alarm-secondary/30 rounded-xl p-4 mb-4 animate-scale-in">
                <div className="text-alarm-secondary text-sm font-medium mb-1">
                  Chanson sélectionnée:
                </div>
                <div className="flex items-center gap-2 text-alarm-text mb-2">
                  <Music className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{state.selectedAlarm.songTitle}</span>
                </div>
                <div className="text-alarm-text-muted text-sm italic">
                  {state.selectedAlarm.conversionStatus === 'converting' && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-alarm-secondary border-t-transparent rounded-full animate-spin"></div>
                      Conversion en cours...
                    </div>
                  )}
                  {state.selectedAlarm.conversionStatus === 'ready' && '✅ Fichier MP3 prêt pour le réveil'}
                  {state.selectedAlarm.conversionStatus === 'error' && '❌ Erreur lors de la conversion'}
                </div>
              </div>
            )}

            {/* Search Results */}
            {state.searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto border border-alarm-surface-lighter rounded-xl bg-alarm-surface-light">
                {state.searchResults.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => actions.selectSong(song)}
                    className="p-3 border-b border-alarm-surface-lighter last:border-b-0 cursor-pointer hover:bg-alarm-surface-lighter transition-colors duration-200 flex items-center gap-3"
                  >
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-12 h-9 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-alarm-text text-sm font-medium truncate">
                        {song.title}
                      </div>
                      <div className="text-alarm-text-muted text-xs">
                        {song.channel} • {song.duration}
                      </div>
                    </div>
                  </div>
                ))}
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 animate-slide-down">
          <h1 className="text-3xl md:text-4xl font-bold text-alarm-text text-center sm:text-left">
            Mes Réveils
          </h1>
          <button
            onClick={actions.addAlarm}
            className="bg-alarm-primary hover:bg-alarm-primary/90 text-white rounded-xl px-6 py-3 font-medium transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap animate-scale-in button-hover-lift focus-ring shadow-lg shadow-alarm-primary/30"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Ajouter un réveil</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
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
