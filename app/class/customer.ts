import CustomerModel from "~/models/customer";

export type VipPointType = {
    point: number,
    money_spent: number,
}

export type CustomerType = {
    id: string,
    store_id: string,
    name: string,
    email: string,
    phone: string | undefined,
    address: string | undefined,
    image: string,
    vipTierId: string | undefined | null,
    dob: Date | undefined,
    pointBalance: number,
    pointEarn: number,
    pointSpent: number,
    lastEarnPoint: Date,
    lastUsedPoint: Date,
    vipPoint: VipPointType,
    status: boolean,
}

export default class Customer {
    private readonly _id: string;
    private readonly _store_id: string;
    private _name: string;
    private _email: string;
    private _phone: string | undefined;
    private _address: string | undefined;
    private _image: string;
    private _vipTierId: string | undefined | null;
    private _dob: Date | undefined;
    private _pointBalance: number;
    private _pointEarn: number;
    private _pointSpent: number;
    private _lastEarnPoint: Date;
    private _lastUsedPoint: Date;
    private _vipPoint: VipPointType;
    private _status: boolean;

    constructor(data: CustomerType) {
        this._id = data.id;
        this._store_id = data.store_id
        this._name = data.name;
        this._email = data.email;
        this._phone = data.phone;
        this._address = data.address;
        this._image = data.image;
        this._vipTierId = data.vipTierId;
        this._dob = data.dob;
        this._pointBalance = data.pointBalance;
        this._pointEarn = data.pointEarn;
        this._pointSpent = data.pointSpent;
        this._lastEarnPoint = data.lastEarnPoint;
        this._lastUsedPoint = data.lastUsedPoint;
        this._vipPoint = data.vipPoint;
        this._status = data.status;
    }


    get id(): string {
        return this._id;
    }

    get store_id(): string {
        return this._store_id;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get email(): string {
        return this._email;
    }

    set email(value: string) {
        this._email = value;
    }

    get phone(): string | undefined {
        return this._phone;
    }

    set phone(value: string | undefined) {
        this._phone = value;
    }

    get address(): string | undefined {
        return this._address;
    }

    set address(value: string | undefined) {
        this._address = value;
    }

    get image(): string {
        return this._image;
    }

    set image(value: string) {
        this._image = value;
    }

    get vipTierId(): string | undefined | null {
        return this._vipTierId;
    }

    set vipTierId(value: string) {
        this._vipTierId = value;
    }

    get dob(): Date | undefined {
        return this._dob;
    }

    set dob(value: Date | undefined) {
        this._dob = value;
    }

    get pointBalance(): number {
        return this._pointBalance;
    }

    set pointBalance(value: number) {
        this._pointBalance = value;
    }

    get pointEarn(): number {
        return this._pointEarn;
    }

    set pointEarn(value: number) {
        this._pointEarn = value;
    }

    get pointSpent(): number {
        return this._pointSpent;
    }

    set pointSpent(value: number) {
        this._pointSpent = value;
    }

    get lastEarnPoint(): Date {
        return this._lastEarnPoint;
    }

    set lastEarnPoint(value: Date) {
        this._lastEarnPoint = value;
    }

    get lastUsedPoint(): Date {
        return this._lastUsedPoint;
    }

    set lastUsedPoint(value: Date) {
        this._lastUsedPoint = value;
    }

    get vipPoint(): VipPointType {
        return this._vipPoint;
    }

    set vipPoint(value: VipPointType) {
        this._vipPoint = value;
    }

    get status(): boolean {
        return this._status;
    }

    set status(value: boolean) {
        this._status = value;
    }

    addPoint(order_price: number, perk: number, earn_point_value: number, type: string, vipType: string | null = null) {
        let pointEarn = 0;
        if (type === 'money_spent') {
            pointEarn = parseInt((order_price * earn_point_value * (perk + 100) / 100).toFixed(2));
        } else {
            pointEarn = parseInt((earn_point_value * (perk + 100) / 100).toFixed(2));
        }

        this.pointBalance = this.pointBalance + pointEarn;
        this.pointEarn = this.pointEarn + pointEarn;
        if (vipType === 'money_spent') {
            this.vipPoint = {
                point: this.vipPoint.point,
                money_spent: this.vipPoint.money_spent + pointEarn,
            } as VipPointType;
        } else if (vipType === 'point') {
            this.vipPoint = {
                money_spent: this.vipPoint.money_spent,
                point: this.vipPoint.point + pointEarn,
            } as VipPointType;
        }

        this.save().then((r) => {
            console.log(r);
            console.log(`--Update Customer ${this.id} successfully!--`);
        });
    }

    async save() {
        return CustomerModel.findOneAndUpdate({
            id: this.id,
            store_id: this.store_id,
        }, {
            id: this.id,
            store_id: this.store_id,
            vip_tier_id: this.vipTierId,
            dob: this.dob,
            point_balance: this.pointBalance,
            point_earn: this.pointEarn,
            point_spent: this.pointSpent,
            last_earn_point: this.lastEarnPoint,
            last_used_point: this.lastUsedPoint,
            vip_point: this.vipPoint,
            status: this.status,
        }, {
            returnDocument: "after",
            new: true,
            lean: true,
            upsert: true,
        });
    }
}
