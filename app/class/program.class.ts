import type {DefaultIntervalType} from "~/utils/helper";
import {getCustomerLimit, updateCustomerLimit} from "~/server/server.customer";

export type ProgramType = {
    id: string,
    store_id: string
    name: string,
    status: boolean,
    limitUsage: number,
    limitResetInterval: DefaultIntervalType,
    limitResetValue: number,
    customerEligibility: string,
}
export default class Program {
    protected readonly _id: string;
    protected readonly _store_id: string;
    protected _name: string;
    protected _status: boolean;
    protected _limitUsage: number;
    protected _limitResetInterval: DefaultIntervalType;
    protected _limitResetValue: number;
    protected _customerEligibility: string;

    constructor(data: ProgramType) {
        this._id = data.id;
        this._store_id = data.store_id
        this._name = data.name;
        this._status = data.status ?? true;
        this._limitUsage = data.limitUsage;
        this._limitResetInterval = data.limitResetInterval;
        this._limitResetValue = data.limitResetValue;
        this._customerEligibility = data.customerEligibility;
    }

    get status() {
        return this._status
    }

    set status(status: boolean) {
        this._status = status;
    }

    get id() {
        return this._id
    }

    get store_id() {
        return this._store_id;
    }

    get name() {
        return this._name
    }

    set name(name: string) {
        this._name = name;
    }

    get limitUsage() {
        return this._limitUsage;
    }

    set limitUsage(limitUsage: number) {
        this._limitUsage = limitUsage;
    }

    get limitResetValue() {
        return this._limitResetValue;
    }

    set limitResetValue(value: number) {
        this._limitResetValue = value;
    }

    get customerEligibility() {
        return this._customerEligibility;
    }

    set customerEligibility(value: string) {
        this._customerEligibility = value;
    }

    get limitResetInterval() {
        return this._limitResetInterval;
    }

    set limitResetInterval(value: DefaultIntervalType) {
        this._limitResetInterval = value;
    }

    async checkLimitUsage(customer_id: string) {
        const customerUsage = await getCustomerLimit(this.store_id, customer_id, this.id);
        if (customerUsage === null) {
            if (this.limitUsage !== -1) {
                updateCustomerLimit(this.store_id, customer_id, this.id, this.limitUsage - 1).then((r) =>
                    console.log(`--Update limit usage of program ${this.id} and customer ${customer_id}--\n--Usage left: ${this.limitUsage - 1}`)
                );
            }

            return true;
        } else if (customerUsage > 0) {
            updateCustomerLimit(this.store_id, customer_id, this.id, customerUsage - 1).then((r) =>
                console.log(`--Update limit usage of program ${this.id} and customer ${customer_id}--\n--Usage left: ${customerUsage - 1}`)
            );

            return true;
        } else {

            return false;
        }
    }

    checkCustomerEligibility(tier_id: string) {
        if (this.customerEligibility !== null && this.customerEligibility !== undefined) {
            const customerEligibility = this.customerEligibility.split('/');
            if (customerEligibility[0] === 'include' && tier_id === customerEligibility[1]) {
                return true;
            } else return customerEligibility[0] === 'exclude' && tier_id !== customerEligibility[1];
        } else {
            return true;
        }
    }
}
