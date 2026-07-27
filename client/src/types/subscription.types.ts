export enum SubscriptionPlan {
    Free = 0,
    Premium = 1
}

export enum SubscriptionStatus {
    Active = 0,
    Expired = 1,
    Canceled = 2,
    Pending = 3,
    Rejected = 4
}

export interface SubscriptionDto {
    id: number;
    userId: string;
    userFullName: string;
    userEmail: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    startDate: string;
    endDate: string;
}

export interface UpdateSubscriptionRequestDto {
    subscriptionId: number;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    endDate: string;
}
