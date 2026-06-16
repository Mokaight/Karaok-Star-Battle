export const ROUTES = {
  SPLASH:            '/',
  REGISTER:          '/inscription',
  HOME:              '/accueil',
  SONG_DETAIL:       '/chansons/:songId',
  CHOOSE_OPPONENT:   '/chansons/:songId/adversaire',
  COUNTDOWN:         '/chansons/:songId/countdown',
  RECORDING:         '/chansons/:songId/enregistrement',
  PLAYBACK:          '/chansons/:songId/reecoute',
  RESULT:            '/chansons/:songId/resultat',
  DUEL_RESULT:       '/chansons/:songId/resultat-duel',
  LEADERBOARD:       '/chansons/:songId/classement',
  PLAYER_PROFILE:    '/joueurs/:playerId',
  MY_PROFILE:        '/mon-profil',
} as const

export type RoutePath = typeof ROUTES[keyof typeof ROUTES]

export function songRoute(base: string, songId: string): string {
  return base.replace(':songId', songId)
}

export function playerRoute(playerId: string): string {
  return ROUTES.PLAYER_PROFILE.replace(':playerId', playerId)
}
