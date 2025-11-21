import { GraphQLLong } from "graphql-scalars";
import { ProfileRepository } from "../repository/profileRepository";
import {
  Invoice,
  ParentProfile,
  ParentProfileBackend,
} from "../parentProfileBackend";

const profileRepository = new ProfileRepository();

export const resolvers = {
  Long: GraphQLLong,
  Query: {
    parentProfile: async (_: any, { parentId }: { parentId: number }) => {
      return new ParentProfileBackend(
        await profileRepository.retrieveParentProfiles(parentId),
        [],
        []
      ).parentProfile(parentId);
    },
    paymentMethods: async (_: any, { parentId }: { parentId: number }) => {
      return new ParentProfileBackend(
        [],
        [],
        await profileRepository.retrievePaymentMethods(parentId)
      ).paymentMethods(parentId);
    },
    invoices: async (_: any, { parentId }: { parentId: number }) => {
      return new ParentProfileBackend(
        [],
        await profileRepository.retrieveInvoices(parentId),
        []
      ).invoices(parentId);
    },
  },
  Mutation: {
    addPaymentMethod: async (
      _: any,
      { parentId, method }: { parentId: number; method: string }
    ) => {
      const createPaymentArgs = {
        id: 0,
        parentId,
        method,
        isActive: false,
      };
      const paymentMethod = await profileRepository.createPaymentMethod(
        createPaymentArgs
      );
      const parentProfiles: ParentProfile[] = [];
      const invoices: Invoice[] = [];
      const parentProfileBackend = new ParentProfileBackend(
        parentProfiles,
        invoices,
        [paymentMethod]
      );
      return parentProfileBackend.paymentMethod(paymentMethod.id);
    },
    setActivePaymentMethod: async (
      _: any,
      { parentId, methodId }: { parentId: number; methodId: number }
    ) => {
      const parentProfileBackend = new ParentProfileBackend(
        [],
        [],
        await profileRepository.retrievePaymentMethods(parentId)
      ).setActivePaymentMethod(parentId, methodId);

      await profileRepository.setActivePaymentMethod(parentId, methodId);

      return parentProfileBackend.paymentMethod(methodId);
    },
    deletePaymentMethod: async (
      _: any,
      { parentId, methodId }: { parentId: number; methodId: number }
    ) => {
      const backend = new ParentProfileBackend(
        [],
        [],
        await profileRepository.retrievePaymentMethods(parentId)
      );
      const paymentMethod = backend.paymentMethod(methodId);
      await profileRepository.deletePaymentMethod(methodId);

      console.log("Deleted payment method:", paymentMethod);

      return paymentMethod;
    },
  },
};
