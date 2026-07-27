export enum DeliveryStatus {
    Pending = 0,
    Dispatched = 1,
    Delivered = 2,
    Canceled = 3
}

export interface DeliveryRequestDto {
    id: number;
    borrowingId: number;
    userFullName: string;
    bookTitle: string;
    deliveryAddress: string;
    latitude: number;
    longitude: number;
    branchId: number;
    branchName: string;
    status: DeliveryStatus;
    requestedAt: string;
    deliveredAt?: string;
}

export interface UpdateDeliveryStatusDto {
    status: DeliveryStatus;
}
