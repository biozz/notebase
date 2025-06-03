import { useLocalStorage } from '#imports'

interface NotebaseConfig {
  dateLocales: string
  showFilters: boolean
  showExtra: boolean
  showTabsSorting: boolean
}
const DEFAULT_DATE_LOCALE = 'en-CA'
const DEFAULT_SHOW_FILTERS = false
const DEFAULT_SHOW_EXTRA = true
const DEFAULT_SHOW_TABS_SORTING = false

const DEFAULT_CONFIG: NotebaseConfig = {
  dateLocales: DEFAULT_DATE_LOCALE,
  showFilters: DEFAULT_SHOW_FILTERS,
  showExtra: DEFAULT_SHOW_EXTRA,
  showTabsSorting: DEFAULT_SHOW_TABS_SORTING,
}
const useNotebaseLocalConfig = () =>
  useLocalStorage<NotebaseConfig>('notebase-config', DEFAULT_CONFIG, { deep: true })

export function useNotebaseConfig() {
  const config = useNotebaseLocalConfig()

  function setDateLocale(locale: string) {
    config.value.dateLocales = locale
  }

  function setShowFilters(show: boolean) {
    config.value.showFilters = show
  }

  function setShowExtra(show: boolean) {
    config.value.showExtra = show
  }

  function setShowTabsSorting(show: boolean) {
    config.value.showTabsSorting = show
  }

  return {
    config,
    setDateLocale,
    setShowFilters,
    setShowExtra,
    setShowTabsSorting,
  }
}
