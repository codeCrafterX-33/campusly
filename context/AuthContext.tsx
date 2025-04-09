import { createContext, useState } from "react";

const AuthContext = createContext<any>(undefined);

interface USER {
  id: number;
  name: string;
  email: string;
  image: string;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<USER | undefined>(undefined);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
