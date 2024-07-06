import type {DefaultIntervalType} from "~/utils/helper"
import storeModel from "~/models/storeSetting"

export type CurrencyType = {
    plural: string,
    singular: string,
}

export type StoreType = {
    id: string,
    name: string,
    url: string,
    myshopifyDomain: string,
    orderCount: number;
    totalSale: number;
    totalEarn: number;
    pointTransaction: number;
    vipSetting: VIPSetting,
    pointSetting: PointSetting,
    status: boolean,
}

export type VIPSetting = {
    milestoneType: string,
    program_reset_time: number,
    program_reset_interval: DefaultIntervalType,
    program_start: Date,
    status: boolean,
}

export type PointSetting = {
    currency: CurrencyType,
    point_expiry_time: number,
    point_expiry_interval: DefaultIntervalType,
    status: boolean,
}

export default class Store {
    private readonly _id: string;
    private readonly _name: string;
    private readonly _url: string;
    private readonly _myshopifyDomain: string;
    private _orderCount: number;
    private _totalSale: number;
    private _pointTransaction: number;
    private _totalEarn: number;
    private _vipSetting: VIPSetting;
    private _pointSetting: PointSetting;
    private _status: boolean;


    constructor(data: StoreType) {
        this._id = data.id;
        this._name = data.name;
        this._url = data.url;
        this._myshopifyDomain = data.myshopifyDomain;
        this._orderCount = data.orderCount;
        this._totalSale = data.totalSale;
        this._totalEarn = data.totalEarn;
        this._pointTransaction = data.pointTransaction;
        this._vipSetting = data.vipSetting;
        this._pointSetting = data.pointSetting;
        this._status = data.status ?? true;
    }

    get status() {
        return this._status
    }

    set status(status: boolean) {
        this._status = status;
    }

    get vipSetting() {
        return this._vipSetting;
    }

    set vipSetting(vipSetting: VIPSetting) {
        this._vipSetting = vipSetting;
    }

    get pointSetting() {
        return this._pointSetting;
    }

    set pointSetting(pointSetting: PointSetting) {
        this._pointSetting = pointSetting;
    }

    get orderCount(): number {
        return this._orderCount;
    }

    set orderCount(value: number) {
        this._orderCount = value;
    }

    get totalSale(): number {
        return this._totalSale;
    }

    set totalSale(value: number) {
        this._totalSale = value;
    }

    get totalEarn(): number {
        return this._totalEarn;
    }

    set totalEarn(value: number) {
        this._totalEarn = value;
    }

    get pointTransaction(): number {
        return this._pointTransaction;
    }

    set pointTransaction(value: number) {
        this._pointTransaction = value;
    }

    get id() {
        return this._id
    }

    get name() {
        return this._name
    }

    get url() {
        return this._url
    }

    get myshopifyDomain() {
        return this._myshopifyDomain
    }

    async saveStore() {
        await storeModel.updateOne({id: this.id}, {
            order_count: this.orderCount,
            total_sale: this.totalSale,
            total_earn: this.totalEarn,
            point_transaction: this.pointTransaction,
            vip_program_setting: this.vipSetting,
            point_program_setting: this.pointSetting,
            status: this.status,
        })
    }

}
