"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Client } from "./clients-types";

interface ClientContextValue {
  clients: Client[];
  selectedClient: Client | null;
  selectedClientId: string | null;
  setSelectedClient: (c: Client | null) => void;
  refreshClients: () => Promise<void>;
  loading: boolean;
}

const ClientContext = createContext<ClientContextValue>({
  clients: [],
  selectedClient: null,
  selectedClientId: null,
  setSelectedClient: () => {},
  refreshClients: async () => {},
  loading: true,
});

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClientState] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshClients = useCallback(async () => {
    try {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      const list: Client[] = data.clients ?? [];
      setClients(list);

      const storedId =
        typeof window !== "undefined"
          ? localStorage.getItem("ott_selected_client_id")
          : null;

      if (storedId) {
        const found = list.find((c) => c.id === storedId);
        setSelectedClientState(found ?? list[0] ?? null);
        if (!found && list[0]) {
          localStorage.setItem("ott_selected_client_id", list[0].id);
        }
      } else if (list.length > 0) {
        setSelectedClientState(list[0]);
        localStorage.setItem("ott_selected_client_id", list[0].id);
      }
    } catch {
      // Supabase tables may not exist yet — silently ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshClients();
  }, [refreshClients]);

  const setSelectedClient = useCallback((c: Client | null) => {
    setSelectedClientState(c);
    if (c) localStorage.setItem("ott_selected_client_id", c.id);
    else localStorage.removeItem("ott_selected_client_id");
  }, []);

  return (
    <ClientContext.Provider
      value={{
        clients,
        selectedClient,
        selectedClientId: selectedClient?.id ?? null,
        setSelectedClient,
        refreshClients,
        loading,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export function useClientContext() {
  return useContext(ClientContext);
}
