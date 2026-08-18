import { create } from 'zustand'

export type WizardStep = 'driver' | 'vehicle' | 'review'

interface DispatchWizardState {
  isOpen: boolean
  step: WizardStep
  deliveryId: string | null
  driverId: string | null
  vehicleId: string | null
  open: (deliveryId: string) => void
  close: () => void
  selectDriver: (driverId: string) => void
  selectVehicle: (vehicleId: string) => void
  goToStep: (step: WizardStep) => void
}

const initialState = {
  isOpen: false,
  step: 'driver' as WizardStep,
  deliveryId: null,
  driverId: null,
  vehicleId: null,
}

/** Backs the Dispatch assignment wizard (select delivery -> driver -> vehicle -> review -> confirm). */
export const useDispatchWizard = create<DispatchWizardState>((set) => ({
  ...initialState,
  open: (deliveryId) => set({ ...initialState, isOpen: true, deliveryId }),
  close: () => set({ ...initialState }),
  selectDriver: (driverId) => set({ driverId, step: 'vehicle' }),
  selectVehicle: (vehicleId) => set({ vehicleId, step: 'review' }),
  goToStep: (step) => set({ step }),
}))
