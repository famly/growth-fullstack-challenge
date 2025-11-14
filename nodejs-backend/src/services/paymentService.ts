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

  async deletePaymentMethod(parentId: number, method: string) {
    const initialParentProfileBackend = new ParentProfileBackend(
      [],
      [],
      await this.profileRepository.retrievePaymentMethods(parentId)
    );
    const parentProfileBackend =
      initialParentProfileBackend.deletePaymentMethod(parentId, method);

    await Promise.all(
      initialParentProfileBackend
        .paymentMethods(parentId)
        .filter(
          (paymentMethod) =>
            !parentProfileBackend
              .paymentMethods(parentId)
              .includes(paymentMethod)
        )
        .map((paymentMethod) =>
          this.profileRepository.deletePaymentMethod(paymentMethod.id)
        )
    );

    return true;
  }

  async setActivePaymentMethod(parentId: number, methodId: number) {
    const parentProfileBackend = new ParentProfileBackend(
      [],
      [],
      await this.profileRepository.retrievePaymentMethods(parentId)
    ).setActivePaymentMethod(parentId, methodId);

    await this.profileRepository.updatePaymentMethods(
      parentProfileBackend.paymentMethods(parentId)
    );

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
