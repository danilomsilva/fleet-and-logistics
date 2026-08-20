import { create } from 'zustand'

export type WizardStep = 'driver' | 'review'

interface DispatchWizardState {
  isOpen: boolean
  step: WizardStep
  deliveryId: string | null
  driverId: string | null
  vehicleId: string | null
  open: (deliveryId: string) => void
  close: () => void
  selectDriver: (driverId: string, vehicleId: string) => void
  goToStep: (step: WizardStep) => void
}

const initialState = {
  isOpen: false,
  step: 'driver' as WizardStep,
  deliveryId: null,
  driverId: null,
  vehicleId: null,
}

/** Backs the Dispatch assignment wizard (select delivery -> driver -> review ->
 * confirm). The vehicle isn't picked separately — every driver already has
 * one assigned vehicle, so its id is captured alongside the driver's at
 * selection time (not re-derived later, which would be vulnerable to the
 * underlying driver/vehicle queries refetching before confirmation). */
export const useDispatchWizard = create<DispatchWizardState>((set) => ({
  ...initialState,
  open: (deliveryId) => set({ ...initialState, isOpen: true, deliveryId }),
  close: () => set({ ...initialState }),
  selectDriver: (driverId, vehicleId) => set({ driverId, vehicleId, step: 'review' }),
  goToStep: (step) => set({ step }),
}))
