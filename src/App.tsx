import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { SplashScreen } from '@/screens/Splash/SplashScreen'
import { RegisterScreen } from '@/screens/Register/RegisterScreen'
import { HomeScreen } from '@/screens/Home/HomeScreen'
import { SongDetailScreen } from '@/screens/SongDetail/SongDetailScreen'
import { ChooseOpponentScreen } from '@/screens/ChooseOpponent/ChooseOpponentScreen'
import { CountdownScreen } from '@/screens/Countdown/CountdownScreen'
import { RecordingScreen } from '@/screens/Recording/RecordingScreen'
import { PlaybackScreen } from '@/screens/Playback/PlaybackScreen'
import { ResultScreen } from '@/screens/Result/ResultScreen'
import { DuelResultScreen } from '@/screens/DuelResult/DuelResultScreen'
import { LeaderboardScreen } from '@/screens/Leaderboard/LeaderboardScreen'
import { PlayerProfileScreen } from '@/screens/PlayerProfile/PlayerProfileScreen'
import { MyProfileScreen } from '@/screens/MyProfile/MyProfileScreen'
import { ROUTES } from '@/config/routes'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path={ROUTES.SPLASH}    element={<SplashScreen />} />
        <Route path={ROUTES.REGISTER}  element={<RegisterScreen />} />

        {/* Protégées */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.HOME}             element={<HomeScreen />} />
          <Route path={ROUTES.SONG_DETAIL}      element={<SongDetailScreen />} />
          <Route path={ROUTES.CHOOSE_OPPONENT}  element={<ChooseOpponentScreen />} />
          <Route path={ROUTES.COUNTDOWN}        element={<CountdownScreen />} />
          <Route path={ROUTES.RECORDING}        element={<RecordingScreen />} />
          <Route path={ROUTES.PLAYBACK}         element={<PlaybackScreen />} />
          <Route path={ROUTES.RESULT}           element={<ResultScreen />} />
          <Route path={ROUTES.DUEL_RESULT}      element={<DuelResultScreen />} />
          <Route path={ROUTES.LEADERBOARD}      element={<LeaderboardScreen />} />
          <Route path={ROUTES.PLAYER_PROFILE}   element={<PlayerProfileScreen />} />
          <Route path={ROUTES.MY_PROFILE}       element={<MyProfileScreen />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.SPLASH} replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
