import { GraphQLLong } from "graphql-scalars";
import { ProfileRepository } from "../repository/profileRepository";
import { ParentProfileBackend } from "../parentProfileBackend";
import { PaymentService } from "../services/paymentService";

const profileRepository = new ProfileRepository();
const paymentService = new PaymentService(profileRepository);

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
      return await paymentService.addPaymentMethod(parentId, method);
    },
    setActivePaymentMethod: async (
      _: any,
      { parentId, methodId }: { parentId: number; methodId: number }
    ) => {
      return await paymentService.setActivePaymentMethod(parentId, methodId);
    },
    deletePaymentMethod: async (
      _: any,
      { parentId, methodId }: { parentId: number; methodId: number }
    ) => {
      return await paymentService.deletePaymentMethod(parentId, methodId);
    },
  },
};
