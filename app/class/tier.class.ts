import vipTier from "~/models/tier";

export type TierType = {
    id: string,
    store_id: string,
    name: string,
    icon: string,
    entryRequirement: number,
    reward: string[],
    bonusPointEarn: number,
    previousTier: string | undefined,
    nextTier: string | undefined,
    customerCount: number,
    status: boolean,
}

export class Tier {
    private readonly _id: string;
    private readonly _store_id: string;
    private _name: string;
    private _icon: string;
    private _entryRequirement: number;
    private _reward: string[];
    private _bonusPointEarn: number;
    private _previousTier: string | undefined;
    private _nextTier: string | undefined;
    private _customerCount: number;
    private _status: boolean;

    constructor(data: TierType) {
        this._id = data.id;
        this._store_id = data.store_id;
        this._name = data.name;
        this._icon = data.icon;
        this._entryRequirement = data.entryRequirement;
        this._reward = data.reward;
        this._bonusPointEarn = data.bonusPointEarn;
        this._previousTier = data.previousTier;
        this._nextTier = data.nextTier;
        this._customerCount = data.customerCount;
        this._status = data.status;
    }

    get id() {
        return this._id
    }

    get store_id() {
        return this._store_id
    }

    get name() {
        return this._name;
    }

    set name(value: string) {
        this._name = value
    }

    get icon() {
        return this._icon
    }

    set icon(value: string) {
        this._icon = value
    }

    get entryRequirement() {
        return this._entryRequirement
    }

    set entryRequirement(value: number) {
        this._entryRequirement = value;
    }

    get reward() {
        return this._reward
    }

    set reward(value: string[]) {
        this._reward = value
    }

    get bonusPointEarn() {
        return this._bonusPointEarn
    }

    set bonusPointEarn(value: number) {
        this._bonusPointEarn = value
    }

    get previousTier() {
        return this._previousTier
    }

    set previousTier(value: string | undefined) {
        this._previousTier = value
    }

    get nextTier() {
        return this._nextTier
    }

    set nextTier(value: string | undefined) {
        this._nextTier = value
    }

    get customerCount() {
        return this._customerCount
    }

    set customerCount(value: number) {
        this._customerCount = value
    }

    get status() {
        return this._status
    }

    set status(value: boolean) {
        this._status = value
    }

    async saveTier() {
        return vipTier.findOneAndUpdate({id: this.id, store_id: this.store_id}, {
            id: this.id,
            store_id: this.store_id,
            name: this.name,
            icon: this.icon,
            entry_requirement: this.entryRequirement,
            reward: this.reward,
            bonus_point_earn: this.bonusPointEarn,
            previousTier: this.previousTier,
            nextTier: this.nextTier,
            customer_count: this.customerCount,
            status: this.status,
        }, {
            returnDocument: "after",
            new: true,
            lean: true,
            upsert: true,
        });
    }
}
