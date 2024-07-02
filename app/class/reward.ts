export type RewardDataType = {
    id: string,
    program_id: string,
    customer_id: string,
    code: string,
    type: string,
    title: string,
    value: number | undefined,
    endAt: Date | undefined,
    status: boolean,
}


export class Reward {
    private readonly _id: string;
    private readonly _programId: string;
    private readonly _customerId: string;
    private readonly _code: string;
    private readonly _type: string;
    private readonly _title: string;
    private readonly _value: number | undefined;
    private readonly _endAt: Date | undefined;
    private _status: boolean;

    constructor(data: RewardDataType) {
        this._id = data.id;
        this._programId = data.program_id;
        this._customerId = data.customer_id;
        this._code = data.code;
        this._type = data.type;
        this._title = data.title;
        this._value = data.value;
        this._endAt = data.endAt;
        this._status = data.status;
    }


    get id(): string {
        return this._id;
    }

    get programId(): string {
        return this._programId;
    }

    get customerId(): string {
        return this._customerId;
    }

    get code(): string {
        return this._code;
    }

    get type(): string {
        return this._type;
    }

    get title(): string {
        return this._title;
    }

    get value(): number | undefined {
        return this._value;
    }

    get endAt(): Date | undefined {
        return this._endAt;
    }

    get status(): boolean {
        return this._status;
    }

    set status(value: boolean) {
        this._status = value;
    }
}
