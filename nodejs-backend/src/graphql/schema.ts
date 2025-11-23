import { gql } from "apollo-server-express";

export const typeDefs = gql`
  scalar Long

  type ParentProfile {
    id: Long!
    name: String!
    child: String!
  }

  type PaymentMethod {
    id: Long!
    parentId: Int!
    method: String!
    isActive: Boolean!
    createdAt: String!
  }

  type Invoice {
    id: Long!
    parentId: Int!
    amount: Float!
    date: String!
  }

  type PaymentMethodHistory {
    id: Long!
    paymentMethodId: Long!
    parentId: Int!
    method: String!
    isActive: Boolean!
    changedAt: String!
    changedByUserId: Int!
  }

  type Query {
    parentProfile(parentId: Long!): ParentProfile
    paymentMethods(parentId: Long!): [PaymentMethod]
    invoices(parentId: Long!): [Invoice]
    paymentMethodHistory(paymentMethodId: Long!): [PaymentMethodHistory]
  }

  type Mutation {
    addPaymentMethod(parentId: Long!, method: String!): PaymentMethod
    setActivePaymentMethod(parentId: Long!, methodId: Long!): PaymentMethod
    deletePaymentMethod(parentId: Long!, methodId: Long!): Boolean
  }
`;
