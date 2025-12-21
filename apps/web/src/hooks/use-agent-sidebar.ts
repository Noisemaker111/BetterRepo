// Simple event-based global state for the Agent Sidebar.
// Actually, I can just use a custom event or a simple singleton with React.useSyncExternalStore.

type SidebarState = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    toggle: () => void;
};

let isOpen = false;
const listeners = new Set<() => void>();

export const agentSidebar = {
    isOpen: () => isOpen,
    setIsOpen: (open: boolean) => {
        isOpen = open;
        listeners.forEach((l) => l());
    },
    toggle: () => {
        isOpen = !isOpen;
        listeners.forEach((l) => l());
    },
    subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};

import { useSyncExternalStore } from "react";

export function useAgentSidebar() {
    const open = useSyncExternalStore(agentSidebar.subscribe, agentSidebar.isOpen);
    return {
        isOpen: open,
        setIsOpen: agentSidebar.setIsOpen,
        toggle: agentSidebar.toggle,
    };
}
