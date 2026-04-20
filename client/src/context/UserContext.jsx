import { createContext, useContext } from 'react'
import { AuthContext } from './AuthContext'

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const auth = useContext(AuthContext)

  return (
    <UserContext.Provider value={auth}>
      {children}
    </UserContext.Provider>
  )
}
