import { GraphQLLong } from "graphql-scalars";
import { ProfileRepository } from "../repository/profileRepository";
import { ParentProfileBackend } from "../parentProfileBackend";

const profileRepository = new ProfileRepository();

export const resolvers = {
  Long: GraphQLLong,
  Query: {
    parentProfile: async (_: any, { parentId }: { parentId: number }) => {
      return new ParentProfileBackend(await profileRepository.retrieveParentProfiles(parentId), [], []).parentProfile(parentId);
    },
    paymentMethods: async (_: any, { parentId }: { parentId: number }) => {
      return new ParentProfileBackend([], [], await profileRepository.retrievePaymentMethods(parentId)).paymentMethods(parentId);
    },
    invoices: async (_: any, { parentId }: { parentId: number }) => {
      return new ParentProfileBackend([], await profileRepository.retrieveInvoices(parentId), []).invoices(parentId);
    },
  },
  Mutation: {
    addPaymentMethod: async (
      _: any,
      { parentId, method }: { parentId: number; method: string },
    ) => {
      // Check if there are any active payment methods
      const existingMethods = await profileRepository.retrievePaymentMethods(parentId);
      const hasActiveMethod = existingMethods.some(pm => pm.isActive); 
      
      // Auto-activate if no active methods exist
      const isActive = !hasActiveMethod;
      
      const paymentMethod = await profileRepository.createPaymentMethod({ parentId, method, isActive });
      return new ParentProfileBackend([], [], [paymentMethod]).paymentMethod(paymentMethod.id);
    },
    setActivePaymentMethod: async (
      _: any,
      { parentId, methodId }: { parentId: number; methodId: number },
    ) => {
      const parentProfileBackend = new ParentProfileBackend([], [], await profileRepository.retrievePaymentMethods(parentId)).setActivePaymentMethod(parentId, methodId);

      await profileRepository.updatePaymentMethods(parentProfileBackend.paymentMethods(parentId))

      return parentProfileBackend.paymentMethod(methodId);
    },
    deletePaymentMethod: async (
      _: any,
      { parentId, methodId }: { parentId: number; methodId: number },
    ) => {
      const allMethods = await profileRepository.retrievePaymentMethods(parentId);
      const initialParentProfileBackend = new ParentProfileBackend([], [], allMethods);
      
      // Check if trying to delete the last active payment method
      const methodToDelete = allMethods.find(pm => pm.id === methodId);
      const activeMethods = allMethods.filter(pm => pm.isActive);
      
      if (methodToDelete?.isActive && activeMethods.length === 1) {
        throw new Error("Cannot delete the last active payment method. At least one active payment method must remain.");
      }
      
      const parentProfileBackend = initialParentProfileBackend.deletePaymentMethod(parentId, methodId);

      await Promise.all(initialParentProfileBackend.paymentMethods(parentId)
        .filter(paymentMethod => !parentProfileBackend.paymentMethods(parentId).includes(paymentMethod))
        .map(paymentMethod => profileRepository.deletePaymentMethod(paymentMethod.id)))

      return true;
    },
  },
};
