import { ProfileRepository } from "../repository/profileRepository";
import {
  Invoice,
  ParentProfile,
  ParentProfileBackend,
} from "../parentProfileBackend";

export class PaymentService {
  profileRepository: ProfileRepository;

  constructor(profileRepository: ProfileRepository) {
    this.profileRepository = profileRepository;
  }

  async deletePaymentMethod(parentId: number, methodId: number) {
    const initialParentProfileBackend = new ParentProfileBackend(
      [],
      [],
      await this.profileRepository.retrievePaymentMethods(parentId)
    );
    const paymentMethod = initialParentProfileBackend.paymentMethod(methodId);
    this.profileRepository.deletePaymentMethod(methodId)

    return paymentMethod;
  }

  async setActivePaymentMethod(parentId: number, methodId: number) {
    const parentProfileBackend = new ParentProfileBackend(
      [],
      [],
      await this.profileRepository.retrievePaymentMethods(parentId)
    ).setActivePaymentMethod(parentId, methodId);

    await this.profileRepository.setActivePaymentMethod(parentId, methodId);

    return parentProfileBackend.paymentMethod(methodId);
  }

  async addPaymentMethod(parentId: number, method: string) {
    const createPaymentArgs = {
      id: 0,
      parentId,
      method,
      isActive: false,
    };
    const paymentMethod = await this.profileRepository.createPaymentMethod(
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
  }
}
